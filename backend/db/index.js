import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "teman-belajar.sqlite3");

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
