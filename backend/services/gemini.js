import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn(
    "[gemini] GEMINI_API_KEY belum diisi di file .env — fitur AI tidak akan berfungsi."
  );
}

const ai = new GoogleGenAI({ apiKey });
const MODEL = "gemini-2.5-flash";

// ---------------------------------------------------------------------------
// Throttle & queue untuk API Gemini
// ---------------------------------------------------------------------------
// Antrian request AI: maksimal MAX_CONCURRENCY berjalan bersamaan, dan ada
// jeda MIN_GAP_MS antar request supaya tidak kena rate limit Gemini.
const MAX_CONCURRENCY = 2;
const MIN_GAP_MS = 2500;

let active = 0;
let queue = [];
let lastCallAt = 0;

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    pump();
  });
}

function pump() {
  if (active >= MAX_CONCURRENCY) return;
  const wait = Math.max(0, lastCallAt + MIN_GAP_MS - Date.now());
  setTimeout(() => {
    while (active < MAX_CONCURRENCY && queue.length > 0) {
      const job = queue.shift();
      active++;
      lastCallAt = Date.now();
      job.fn()
        .then(job.resolve)
        .catch(job.reject)
        .finally(() => {
          active--;
          pump();
        });
    }
  }, wait);
}

// Coba ulang dengan backoff kalau kena rate limit / quota habis.
async function callWithRetry(fn, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await enqueue(fn);
    } catch (err) {
      const message = err?.message || "";
      const isRateLimit = /429|RESOURCE_EXHAUSTED|rate.?limit|quota|too many/i.test(message);
      if (i === attempts - 1) throw err;
      const backoff = (i + 1) * 5000 * (isRateLimit ? 2 : 1);
      console.warn(
        `[gemini] request gagal (${message}) — coba lagi dalam ${backoff}ms (${i + 1}/${attempts})`
      );
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
}

/**
 * Membaca file catatan (gambar/PDF/teks) dan meminta Gemini untuk:
 * 1. Mengekstrak isi penting (ringkasan)
 * 2. Membuat 5 soal pilihan ganda beserta jawaban & penjelasan
 *
 * File dikirim langsung sebagai inline data (multimodal) supaya Gemini
 * bisa "membaca" foto catatan tulisan tangan / PDF, mirip OCR.
 */
export async function analyzeNoteAndGenerateQuiz({ filePath, mimeType, subjectName, title }) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  const prompt = `
Kamu adalah asisten belajar AI untuk siswa SMK bernama "Teman Belajar AI".
Berikut ini adalah catatan pelajaran "${subjectName}" berjudul "${title}".

Tugas kamu:
1. Baca dan pahami isi catatan (baik berupa teks, tulisan tangan yang difoto, maupun PDF).
2. Buat ringkasan singkat (maksimal 3 kalimat) tentang isi catatan tersebut.
3. Buat 5 soal pilihan ganda (A/B/C/D) berdasarkan isi catatan untuk menguji pemahaman siswa.
   Setiap soal harus punya penjelasan jawaban yang jelas dan singkat, serta referensi
   bagian mana dari catatan yang menjadi sumber soal tersebut.

Balas HANYA dalam format JSON valid, tanpa markdown, tanpa backticks, dengan struktur persis seperti ini:
{
  "summary": "ringkasan singkat isi catatan",
  "questions": [
    {
      "question": "teks pertanyaan",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_option": "A",
      "explanation": "penjelasan singkat kenapa jawaban itu benar",
      "source_reference": "misal: Paragraf 2 tentang rumus luas"
    }
  ]
}
`.trim();

  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: mimeType || "application/octet-stream" } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    })
  );

  const raw = response.text;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error("Gagal parsing hasil AI menjadi JSON: " + err.message);
  }
  return parsed;
}

export default ai;
