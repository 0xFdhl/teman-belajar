import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Lightbulb, Calendar as CalendarIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";
import { Card, ErrorState } from "../components/ui.jsx";
import { api } from "../lib/api.js";

export default function UploadCatatan() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [phase, setPhase] = useState("idle"); // idle | uploading | processing | ready | error
  const [error, setError] = useState(null);
  const [noteId, setNoteId] = useState(null);

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch((e) => setError(e.message));
  }, []);

  // Polling untuk cek status AI selesai memproses catatan
  useEffect(() => {
    if (phase !== "processing" || !noteId) return;
    const interval = setInterval(async () => {
      try {
        const note = await api.getNote(noteId);
        if (note.status === "ready") {
          setPhase("ready");
          clearInterval(interval);
        } else if (note.status === "failed") {
          setPhase("error");
          setError("AI gagal memproses catatan ini. Coba unggah ulang.");
          clearInterval(interval);
        }
      } catch (e) {
        // abaikan, coba lagi di polling berikutnya
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [phase, noteId]);

  function handleFilePick(f) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  }

  async function handleSubmit() {
    if (!file || !subjectId) {
      setError("File dan mata pelajaran wajib diisi.");
      return;
    }
    setError(null);
    setPhase("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject_id", subjectId);
      formData.append("title", title || file.name);
      const result = await api.uploadNote(formData);
      setNoteId(result.id);
      setPhase("processing");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className={`text-2xl font-bold mb-1 ${dark ? "text-white" : "text-slate-800"}`}>Upload Catatan</h1>
      <p className={`text-sm mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>
        Unggah catatan, modul, atau lembar tugas untuk dianalisis oleh AI (Gemini)
      </p>

      {error && <div className="mb-4"><ErrorState message={error} /></div>}

      {phase === "processing" && (
        <Card className="mb-4 flex items-center gap-3 bg-teal-50 border-teal-100">
          <Sparkles size={18} className="text-teal-500 animate-pulse" />
          <div>
            <div className="text-sm font-medium text-teal-700">AI sedang membaca catatan kamu...</div>
            <div className="text-xs text-teal-600">Gemini sedang membuat ringkasan & soal kuis otomatis. Ini bisa memakan waktu beberapa detik.</div>
          </div>
        </Card>
      )}

      {phase === "ready" && (
        <Card className="mb-4 flex items-center justify-between gap-3 bg-emerald-50 border-emerald-100">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <div>
              <div className="text-sm font-medium text-emerald-700">Catatan berhasil diproses!</div>
              <div className="text-xs text-emerald-600">Kuis otomatis sudah siap dikerjakan.</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/kuis")}
            className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-4 py-2 rounded-lg"
          >
            Kerjakan Kuis
          </button>
        </Card>
      )}

      <Card className="mb-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFilePick(e.dataTransfer.files?.[0]);
          }}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-14 transition-colors ${
            dragOver ? "border-teal-400 bg-teal-50/40" : dark ? "border-slate-600" : "border-slate-200"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 mb-3">
            <UploadCloud size={26} />
          </div>
          {file ? (
            <div className={`text-sm font-medium mb-1 ${dark ? "text-slate-200" : "text-slate-700"}`}>{file.name}</div>
          ) : (
            <div className={`text-sm font-medium mb-1 ${dark ? "text-slate-200" : "text-slate-700"}`}>Drag & drop file di sini</div>
          )}
          <div className="text-xs text-slate-400 mb-4">atau</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.heic,.mp4,.mov"
            className="hidden"
            onChange={(e) => handleFilePick(e.target.files?.[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2 rounded-lg"
          >
            Pilih File
          </button>
          <div className="text-xs text-slate-400 mt-4">Format: PDF, JPG, PNG, HEIC, MP4, MOV • Maks. 100MB</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`text-xs font-medium mb-1 block ${dark ? "text-slate-300" : "text-slate-600"}`}>Pilih Mata Pelajaran</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${
              dark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            <option value="">Pilih mata pelajaran</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`text-xs font-medium mb-1 block ${dark ? "text-slate-300" : "text-slate-600"}`}>Judul Catatan</label>
          <div className={`w-full border rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
            dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          }`}>
            <CalendarIcon size={14} className="text-slate-400 shrink-0" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul catatan (opsional)"
              className={`bg-transparent outline-none text-sm w-full ${dark ? "text-slate-300" : "text-slate-600"}`}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={phase === "uploading" || phase === "processing"}
        className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg mb-4"
      >
        {phase === "uploading" ? "Mengunggah..." : phase === "processing" ? "AI sedang memproses..." : "Upload & Proses"}
      </button>

      <Card className="flex items-start gap-3">
        <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-700"}`}>Tips</div>
          <div className="text-xs text-slate-400">
            Pastikan foto jelas dan tidak terpotong agar AI bisa membaca isi catatan dan membuat soal kuis dengan akurat.
          </div>
        </div>
      </Card>
    </div>
  );
}
