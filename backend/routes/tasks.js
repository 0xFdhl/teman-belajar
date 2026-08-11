import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const tasks = db
    .prepare(
      `SELECT t.*, s.name AS subject_name
       FROM tasks t LEFT JOIN subjects s ON s.id = t.subject_id
       ORDER BY t.due_date ASC`
    )
    .all();
  res.json(tasks);
});

router.post("/", (req, res) => {
  const { subject_id, title, description, due_date } = req.body;
  if (!title || !due_date) {
    return res.status(400).json({ error: "Judul dan tanggal deadline wajib diisi." });
  }
  const info = db
    .prepare(
      `INSERT INTO tasks (subject_id, title, description, due_date, status)
       VALUES (?, ?, ?, ?, 'pending')`
    )
    .run(subject_id || null, title, description || "", due_date);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(task);
});

router.patch("/:id", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  res.json(task);
});

export default router;
