import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

// Daftar soal yang pernah dijawab salah (attempt terakhir untuk tiap soal = salah)
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.id AS attempt_id, a.attempted_at, a.selected_option,
              qs.id AS question_id, qs.question_text, qs.correct_option,
              qs.explanation, qs.source_reference,
              quiz.title AS quiz_title,
              s.name AS subject
       FROM attempts a
       JOIN questions qs ON qs.id = a.question_id
       JOIN quizzes quiz ON quiz.id = qs.quiz_id
       LEFT JOIN subjects s ON s.id = quiz.subject_id
       WHERE a.is_correct = 0
       ORDER BY a.attempted_at DESC`
    )
    .all();
  res.json(rows);
});

export default router;
