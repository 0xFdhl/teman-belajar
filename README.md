# Teman Belajar AI

Aplikasi web belajar dengan AI, terdiri dari:

- **`frontend/`** — React (Vite) + Tailwind CSS, dipecah per komponen & halaman
- **`backend/`** — Node.js + Express + SQLite (better-sqlite3)
- **AI**: Google Gemini API (`gemini-2.5-flash`) untuk membaca catatan yang diunggah
  (PDF/foto) dan otomatis membuat ringkasan + soal kuis pilihan ganda

## Struktur Folder

```
teman-belajar-ai/
├── backend/
│   ├── db/              # koneksi & skema SQLite + seed data
│   ├── routes/           # endpoint API (dashboard, notes, quiz, journal, tasks)
│   ├── services/gemini.js  # integrasi Gemini API
│   ├── uploads/           # file catatan yang diunggah user
│   └── server.js
└── frontend/
    └── src/
        ├── components/    # Sidebar, Topbar, Card, dll (reusable)
        ├── pages/         # Dashboard, UploadCatatan, Kuis, JurnalKesalahan, Tugas
        ├── lib/           # api.js (client fetch), ThemeContext, subjectColors
        └── App.jsx / main.jsx
```

## Cara Menjalankan

### 1. Siapkan API key Gemini

Ambil API key gratis di https://aistudio.google.com/apikey

```bash
cd backend
cp .env.example .env
# lalu edit .env dan isi GEMINI_API_KEY=xxxxxxxx
```

### 2. Jalankan Backend

```bash
cd backend
npm install
npm run dev
```

Backend akan jalan di `http://localhost:4000`, otomatis membuat file database
`backend/db/teman-belajar.sqlite3` dan mengisi data awal (mata pelajaran, tugas contoh).

### 3. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend jalan di `http://localhost:5173` dan otomatis mem-proxy request `/api`
ke backend di port 4000 (lihat `vite.config.js`).

Buka `http://localhost:5173` di browser.

## Alur Fitur AI

1. User membuka halaman **Upload Catatan**, memilih mata pelajaran, lalu
   mengunggah foto/PDF catatan.
2. Backend menyimpan file & metadata ke SQLite, lalu mengirim file tersebut
   (sebagai data multimodal) ke Gemini API dengan prompt yang meminta:
   - Ringkasan singkat isi catatan
   - 5 soal pilihan ganda + jawaban benar + penjelasan + referensi bagian catatan
3. Hasil dari Gemini (JSON terstruktur) disimpan ke tabel `quizzes` dan
   `questions`.
4. Halaman **Kuis** mengambil kuis terbaru dari database dan menampilkannya.
   Jawaban yang salah otomatis masuk ke **Jurnal Kesalahan**.
5. **Dashboard** menghitung progres per mata pelajaran berdasarkan
   persentase jawaban benar dari seluruh percobaan (attempts) di database.

## Database (SQLite)

Tabel utama: `students`, `subjects`, `notes`, `quizzes`, `questions`,
`attempts`, `tasks`. Skema lengkap ada di `backend/db/index.js`.

Untuk reset database, cukup hapus file:
```bash
rm backend/db/teman-belajar.sqlite3*
```
lalu jalankan ulang backend (`npm run dev`) — skema & data awal akan dibuat otomatis.

## Build untuk Production

```bash
cd frontend
npm run build   # hasil ada di frontend/dist

cd ../backend
npm start        # jalankan server Express (bisa disajikan bersama frontend/dist via reverse proxy / express.static)
```

## Catatan

- Endpoint upload menerima PDF, JPG, PNG, HEIC, MP4, MOV maks. 100MB.
- Proses AI berjalan asinkron di background setelah upload (polling status
  di frontend setiap 2 detik), supaya request upload tidak nge-block lama.
- Jangan commit file `.env` (sudah ada di `.gitignore`).
