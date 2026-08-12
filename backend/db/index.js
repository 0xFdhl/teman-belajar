import Database from "better-sqlite3";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { hashPassword } from "../lib/password.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vercel Functions have a READ-ONLY filesystem except /tmp.
// Di Vercel database ditempatkan di /tmp supaya bisa dibuat & di-seed,
// tapi ingat: data di /tmp bersifat ephemeral (hilang saat instance cold start).
const isVercel = process.env.VERCEL === "1";
const dbPath = isVercel
  ? path.join(os.tmpdir(), "teman-belajar.sqlite3")
  : path.join(__dirname, "teman-belajar.sqlite3");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  streak_days INTEGER NOT NULL DEFAULT 0,
  email TEXT,
  password_hash TEXT,
  session_token TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color_key TEXT NOT NULL DEFAULT 'slate'
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER REFERENCES subjects(id),
  title TEXT NOT NULL,
  file_path TEXT,
  mime_type TEXT,
  extracted_text TEXT,
  ai_summary TEXT,
  status TEXT NOT NULL DEFAULT 'processing', -- processing | ready | failed
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER REFERENCES notes(id),
  subject_id INTEGER REFERENCES subjects(id),
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER REFERENCES quizzes(id),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL, -- 'A' | 'B' | 'C' | 'D'
  explanation TEXT,
  source_reference TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER REFERENCES questions(id),
  selected_option TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER REFERENCES subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | done
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Migrasi: tambah kolom auth kalau tabel students sudah terlanjur dibuat tanpa kolom ini.
const studentCols = db.prepare("PRAGMA table_info(students)").all().map((c) => c.name);
if (!studentCols.includes("email")) db.exec("ALTER TABLE students ADD COLUMN email TEXT");
if (!studentCols.includes("password_hash")) db.exec("ALTER TABLE students ADD COLUMN password_hash TEXT");
if (!studentCols.includes("session_token")) db.exec("ALTER TABLE students ADD COLUMN session_token TEXT");

// Akun default supaya aplikasi langsung bisa dipakai setelah seed.
// Berlaku juga saat DB /tmp di Vercel di-seed ulang tiap cold start.
export const DEFAULT_ACCOUNT = { email: "yogi@temanbelajar.app", password: "123456" };

export function ensureDefaultAccount() {
  const studentWithEmail = db
    .prepare("SELECT COUNT(*) c FROM students WHERE email IS NOT NULL")
    .get().c;
  if (studentWithEmail > 0) return;
  const yogi = db.prepare("SELECT id FROM students WHERE name = 'Yogi' LIMIT 1").get();
  if (!yogi) return;
  db.prepare("UPDATE students SET email = ?, password_hash = ? WHERE id = ?").run(
    DEFAULT_ACCOUNT.email,
    hashPassword(DEFAULT_ACCOUNT.password),
    yogi.id
  );
}

ensureDefaultAccount();

export function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM subjects").get().c;
  if (count > 0) return;

  const insertSubject = db.prepare(
    "INSERT INTO subjects (name, color_key) VALUES (?, ?)"
  );
  const subjects = [
    ["Matematika", "indigo"],
    ["Bahasa Indonesia", "sky"],
    ["Fisika", "amber"],
    ["RPL", "emerald"],
    ["PKL", "rose"],
  ];
  const subjectIds = {};
  for (const [name, color] of subjects) {
    const info = insertSubject.run(name, color);
    subjectIds[name] = info.lastInsertRowid;
  }

  db.prepare("INSERT INTO students (name, streak_days) VALUES (?, ?)").run(
    "Yogi",
    12
  );

  ensureDefaultAccount();

  const insertTask = db.prepare(`
    INSERT INTO tasks (subject_id, title, description, due_date, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);
  insertTask.run(
    subjectIds["RPL"],
    "Praktikum Jaringan - Laporan",
    "Laporan hasil praktikum konfigurasi jaringan",
    "2025-07-17"
  );
  insertTask.run(
    subjectIds["Bahasa Indonesia"],
    "Teks Eksplanasi",
    "Menulis teks eksplanasi tentang fenomena alam",
    "2025-07-22"
  );
  insertTask.run(
    subjectIds["PKL"],
    "Laporan PKL Minggu 2",
    "Dokumentasi kegiatan PKL minggu ke-2",
    "2025-07-20"
  );
}
