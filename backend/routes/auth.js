import { Router } from "express";
import crypto from "crypto";
import { db } from "../db/index.js";
import { hashPassword, verifyPassword } from "../lib/password.js";

const router = Router();

export function getToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function sanitize(user) {
  return { id: user.id, name: user.name, email: user.email, streak_days: user.streak_days };
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Semua kolom wajib diisi." });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM students WHERE email = ?").get(normalizedEmail);
  if (existing) return res.status(409).json({ error: "Email sudah terdaftar." });

  const token = crypto.randomBytes(32).toString("hex");
  const info = db
    .prepare(
      "INSERT INTO students (name, email, password_hash, session_token) VALUES (?, ?, ?, ?)"
    )
    .run(String(name).trim(), normalizedEmail, hashPassword(password), token);

  const user = db.prepare("SELECT * FROM students WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ token, user: sanitize(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM students WHERE email = ?").get(normalizedEmail);
  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Email atau password salah." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("UPDATE students SET session_token = ? WHERE id = ?").run(token, user.id);
  res.json({ token, user: sanitize(user) });
});

router.post("/logout", (req, res) => {
  const token = getToken(req);
  if (token) {
    db.prepare("UPDATE students SET session_token = NULL WHERE session_token = ?").run(token);
  }
  res.status(204).end();
});

router.get("/me", (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Tidak terautentikasi." });
  const user = db.prepare("SELECT * FROM students WHERE session_token = ?").get(token);
  if (!user) return res.status(401).json({ error: "Sesi tidak valid." });
  res.json({ user: sanitize(user) });
});

export default router;
