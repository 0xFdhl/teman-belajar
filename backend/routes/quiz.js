import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

// Kuis paling baru yang siap dikerjakan (dipakai halaman Kuis default)
router.get("/latest", (req, res) => {
  const quiz = db
    .prepare(
      `SELECT q.*, s.name AS subject_name
       FROM quizzes q LEFT JOIN subjects s ON s.id = q.subject_id
       ORDER BY q.created_at DESC LIMIT 1`
    )
    .get();
  if (!quiz) return res.json(null);
  const questions = db
    .prepare("SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index")
    .all(quiz.id);
  res.json({ ...quiz, questions });
});

router.get("/:id", (req, res) => {
  const quiz = db
    .prepare(
      `SELECT q.*, s.name AS subject_name
       FROM quizzes q LEFT JOIN subjects s ON s.id = q.subject_id
       WHERE q.id = ?`
    )
    .get(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Kuis tidak ditemukan." });
  const questions = db
    .prepare("SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index")
    .all(req.params.id);
  res.json({ ...quiz, questions });
});

// Submit jawaban satu soal -> otomatis masuk Jurnal Kesalahan kalau salah
router.post("/questions/:questionId/answer", (req, res) => {
  const { selected_option } = req.body;
  const question = db
    .prepare("SELECT * FROM questions WHERE id = ?")
    .get(req.params.questionId);
  if (!question) return res.status(404).json({ error: "Soal tidak ditemukan." });

  const isCorrect = selected_option?.toUpperCase() === question.correct_option ? 1 : 0;

  db.prepare(
    `INSERT INTO attempts (question_id, selected_option, is_correct) VALUES (?, ?, ?)`
  ).run(question.id, selected_option?.toUpperCase(), isCorrect);

  res.json({
    is_correct: !!isCorrect,
    correct_option: question.correct_option,
    explanation: question.explanation,
    source_reference: question.source_reference,
  });
});

export default router;
