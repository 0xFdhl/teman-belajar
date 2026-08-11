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

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/tasks", tasksRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend Teman Belajar AI jalan di http://localhost:${PORT}`);
});
