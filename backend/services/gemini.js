import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "[gemini] GEMINI_API_KEY belum diisi di file .env — fitur AI tidak akan berfungsi."
  );
}

const MODEL = "gemini-2.0-flash";

/**
 * Membaca file catatan (gambar/PDF/teks) dan meminta Gemini untuk:
 * 1. Mengekstrak isi penting (ringkasan)
 * 2. Membuat 5 soal pilihan ganda beserta jawaban & penjelasan
 *
 * File dikirim langsung sebagai inline data (multimodal) supaya Gemini
 * bisa "membaca" foto catatan tulisan tangan / PDF, mirip OCR.
 */
export async function analyzeNoteAndGenerateQuiz({ filePath, mimeType, subjectName, title }) {
  if (!apiKey) {
    throw new Error(
      "API key Gemini belum dikonfigurasi. Buat file .env dari .env.example dan isi GEMINI_API_KEY. " +
      "Dapatkan API key gratis di https://aistudio.google.com/apikey"
    );
  }

  const ai = new GoogleGenAI({ apiKey });
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

  const response = await ai.models.generateContent({
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
  });

  const raw = response.text;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error("Gagal parsing hasil AI menjadi JSON: " + err.message);
  }
  return parsed;
}
