import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { db } from "../db/index.js";
import { analyzeNoteAndGenerateQuiz } from "../services/gemini.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Di Vercel filesystem read-only kecuali /tmp -> upload disimpan ke sana (ephemeral).
const uploadDir = process.env.VERCEL === "1"
  ? path.join(os.tmpdir(), "teman-belajar-uploads")
  : path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Batas upload per user supaya request AI tidak langsung habis kena rate limit.
const UPLOAD_LIMIT = 5;          // maksimal ...
const UPLOAD_WINDOW_MS = 60_000; // ... dalam 1 menit
const uploadLog = new Map(); // key (userId/IP) -> [timestamps]

function checkUploadLimit(key) {
  const now = Date.now();
  const arr = (uploadLog.get(key) || []).filter((t) => now - t < UPLOAD_WINDOW_MS);
  if (arr.length >= UPLOAD_LIMIT) return false;
  arr.push(now);
  uploadLog.set(key, arr);
  return true;
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

const router = Router();

router.get("/", (req, res) => {
  const notes = db
    .prepare(
      `SELECT n.*, s.name AS subject_name
       FROM notes n LEFT JOIN subjects s ON s.id = n.subject_id
       ORDER BY n.uploaded_at DESC`
    )
    .all();
  res.json(notes);
});

// Upload a note, then kick off AI analysis + quiz generation.
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const key = req.user?.id ? `u${req.user.id}` : `ip${req.ip || "unknown"}`;
    if (!checkUploadLimit(key)) {
      return res.status(429).json({
        error: `Terlalu banyak upload (maks ${UPLOAD_LIMIT}/menit). Tunggu sebentar lalu coba lagi.`,
      });
    }

    const { subject_id, title } = req.body;
    if (!req.file) return res.status(400).json({ error: "File wajib diunggah." });
    if (!subject_id) return res.status(400).json({ error: "Mata pelajaran wajib dipilih." });

    const subject = db.prepare("SELECT * FROM subjects WHERE id = ?").get(subject_id);
    if (!subject) return res.status(400).json({ error: "Mata pelajaran tidak ditemukan." });

    const insert = db.prepare(`
      INSERT INTO notes (subject_id, title, file_path, mime_type, status)
      VALUES (?, ?, ?, ?, 'processing')
    `);
    const info = insert.run(
      subject_id,
      title || req.file.originalname,
      req.file.path,
      req.file.mimetype
    );
    const noteId = info.lastInsertRowid;

    res.status(202).json({ id: noteId, status: "processing" });

    // Proses AI di background supaya request upload tidak menunggu lama.
    processNoteWithAI(noteId, req.file.path, req.file.mimetype, subject.name, title || req.file.originalname)
      .catch((err) => {
        console.error("[notes] gagal memproses AI:", err.message);
        db.prepare("UPDATE notes SET status = 'failed' WHERE id = ?").run(noteId);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengunggah catatan." });
  }
});

router.get("/:id", (req, res) => {
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  if (!note) return res.status(404).json({ error: "Catatan tidak ditemukan." });
  const quiz = db.prepare("SELECT * FROM quizzes WHERE note_id = ?").get(req.params.id);
  res.json({ ...note, quiz_id: quiz?.id ?? null });
});

async function processNoteWithAI(noteId, filePath, mimeType, subjectName, title) {
  const result = await analyzeNoteAndGenerateQuiz({ filePath, mimeType, subjectName, title });

  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId);

  db.prepare("UPDATE notes SET ai_summary = ?, status = 'ready' WHERE id = ?").run(
    result.summary,
    noteId
  );

  const insertQuiz = db.prepare(`
    INSERT INTO quizzes (note_id, subject_id, title) VALUES (?, ?, ?)
  `);
  const quizInfo = insertQuiz.run(noteId, note.subject_id, `Kuis: ${title}`);
  const quizId = quizInfo.lastInsertRowid;

  const insertQ = db.prepare(`
    INSERT INTO questions
      (quiz_id, question_text, option_a, option_b, option_c, option_d,
       correct_option, explanation, source_reference, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  (result.questions || []).forEach((q, idx) => {
    insertQ.run(
      quizId,
      q.question,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      (q.correct_option || "A").toUpperCase(),
      q.explanation || "",
      q.source_reference || "",
      idx
    );
  });
}

export default router;
