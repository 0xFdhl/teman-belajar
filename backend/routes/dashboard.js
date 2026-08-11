import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const student = db.prepare("SELECT * FROM students LIMIT 1").get();

  const totalAttempts = db.prepare("SELECT COUNT(*) c FROM attempts").get().c;
  const lastAttemptScore = db
    .prepare(
      `SELECT ROUND(AVG(is_correct) * 100) AS pct
       FROM attempts
       WHERE quiz_id IS NOT NULL
       ORDER BY attempted_at DESC LIMIT 10`
    )
    .get();

  const upcomingTasksCount = db
    .prepare("SELECT COUNT(*) c FROM tasks WHERE status = 'pending'")
    .get().c;

  // progress per subject = % soal benar dari semua attempt terkait soal subject itu
  const progressPerSubject = db
    .prepare(
      `SELECT s.name AS subject, s.color_key,
              COALESCE(ROUND(AVG(a.is_correct) * 100), 0) AS value
       FROM subjects s
       LEFT JOIN quizzes q ON q.subject_id = s.id
       LEFT JOIN questions qs ON qs.quiz_id = q.id
       LEFT JOIN attempts a ON a.question_id = qs.id
       GROUP BY s.id
       ORDER BY s.id`
    )
    .all();

  const upcomingTasks = db
    .prepare(
      `SELECT t.id, t.title, t.due_date, s.name AS subject
       FROM tasks t LEFT JOIN subjects s ON s.id = t.subject_id
       WHERE t.status = 'pending'
       ORDER BY t.due_date ASC LIMIT 5`
    )
    .all();

  res.json({
    student: student || { name: "Siswa", streak_days: 0 },
    stats: {
      lastScore: lastAttemptScore?.pct ?? 0,
      totalQuestionsAnswered: totalAttempts,
      upcomingTasksCount,
      streakDays: student?.streak_days ?? 0,
    },
    progressPerSubject,
    upcomingTasks,
  });
});

export default router;
