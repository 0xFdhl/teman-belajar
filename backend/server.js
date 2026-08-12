import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

import { seedIfEmpty, db } from "./db/index.js";
import authRoutes, { getToken } from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import subjectsRoutes from "./routes/subjects.js";
import notesRoutes from "./routes/notes.js";
import quizRoutes from "./routes/quiz.js";
import journalRoutes from "./routes/journal.js";
import tasksRoutes from "./routes/tasks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === "1";

// Di Vercel filesystem read-only kecuali /tmp -> folder upload pindah ke sana.
const uploadsDir = isVercel
  ? path.join(os.tmpdir(), "teman-belajar-uploads")
  : path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

// Seed data awal (idempotent). Di Vercel DB ada di /tmp, jadi seed jalan tiap cold start.
seedIfEmpty();

const app = express();

app.use(cors());
app.use(express.json());

// Proteksi semua endpoint /api kecuali auth & health.
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) return next();
  if (req.path === "/api/health" || req.path.startsWith("/api/auth")) return next();
  const token = getToken(req);
  const user = token
    ? db.prepare("SELECT * FROM students WHERE session_token = ?").get(token)
    : null;
  if (!user) return res.status(401).json({ error: "Silakan login terlebih dahulu." });
  req.user = user;
  next();
});

app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/tasks", tasksRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Error handler JSON supaya Vercel tidak menjadikan error sebagai crash function.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Mode self-contained (local / container): backend juga menyajikan frontend build.
// Di Vercel frontend disajikan oleh service "frontend", bukan oleh Express.
if (!isVercel) {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Jangan memanggil app.listen() di Vercel — Vercel memanggil default export (Express app).
// Hanya listener untuk local development / container (npm run dev, npm start).
if (!isVercel) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend Teman Belajar AI jalan di http://localhost:${PORT}`);
  });
}

export default app;
