import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { seedIfEmpty } from "./db/index.js";
import dashboardRoutes from "./routes/dashboard.js";
import subjectsRoutes from "./routes/subjects.js";
import notesRoutes from "./routes/notes.js";
import quizRoutes from "./routes/quiz.js";
import journalRoutes from "./routes/journal.js";
import tasksRoutes from "./routes/tasks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log setiap request untuk debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/tasks", tasksRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// Tangani 404 endpoint yang tidak dikenal
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

// Middleware error handling terpusat
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan pada server.";

  // Jangan bocorkan detail error asli ke client untuk error 500
  if (status >= 500) {
    console.error("[server error]", err);
  }

  res.status(status).json({
    error: status >= 500 ? "Terjadi kesalahan pada server." : message,
    ...(process.env.NODE_ENV === "development" && { detail: err.message }),
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend Teman Belajar AI jalan di http://localhost:${PORT}`);
});
