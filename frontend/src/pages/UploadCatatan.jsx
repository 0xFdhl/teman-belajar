import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Lightbulb, Calendar as CalendarIcon, Sparkles, CheckCircle2, FileText, Image, X, Loader2 } from "lucide-react";
import { useToast } from "../lib/ToastContext.jsx";
import { Card, ErrorState, Button } from "../components/ui.jsx";
import { api } from "../lib/api.js";

export default function UploadCatatan() {
  const toast = useToast();
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
  const [quizId, setQuizId] = useState(null);

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (phase !== "processing" || !noteId) return;
    const interval = setInterval(async () => {
      try {
        const note = await api.getNote(noteId);
        if (note.status === "ready") {
          setPhase("ready");
          setQuizId(note.quiz_id);
          toast.success("Catatan berhasil diproses! Kuis siap dikerjakan.");
          clearInterval(interval);
        } else if (note.status === "failed") {
          setPhase("error");
          setError(note.error_message || "AI gagal memproses catatan ini. Coba unggah ulang dengan foto yang lebih jelas.");
          toast.error("AI gagal memproses catatan.");
          clearInterval(interval);
        }
      } catch (e) {
        // abaikan, coba lagi di polling berikutnya
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [phase, noteId, toast]);

  function handleFilePick(f) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!file || !subjectId) {
      setError("File dan mata pelajaran wajib diisi.");
      toast.warning("File dan mata pelajaran wajib diisi.");
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
      toast.info("Catatan sedang diproses AI. Tunggu sebentar ya!");
    } catch (e) {
      setError(e.message);
      setPhase("error");
      toast.error(e.message);
    }
  }

  function goToQuiz() {
    if (quizId) navigate(`/kuis/${quizId}`);
    else navigate("/kuis");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Upload Catatan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Unggah catatan, modul, atau lembar tugas untuk dianalisis oleh AI (Gemini)
        </p>
      </div>

      {error && <div className="mb-4"><ErrorState message={error} onRetry={() => setError(null)} /></div>}

      {phase === "processing" && (
        <Card className="mb-4 flex items-center gap-4 bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-800 animate-slide-down">
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center">
            <Sparkles size={18} className="text-teal-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-teal-700 dark:text-teal-300">AI sedang membaca catatan kamu...</div>
            <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">Gemini sedang membuat ringkasan & soal kuis otomatis. Ini bisa memakan waktu beberapa detik.</div>
          </div>
          <Loader2 size={18} className="text-teal-500 animate-spin" />
        </Card>
      )}

      {phase === "ready" && (
        <Card className="mb-4 flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Catatan berhasil diproses!</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Kuis otomatis sudah siap dikerjakan.</div>
            </div>
          </div>
          <Button onClick={goToQuiz} size="sm">
            Kerjakan Kuis
          </Button>
        </Card>
      )}

      <Card className="mb-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFilePick(f);
          }}
          className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-12 transition-colors ${
            dragOver
              ? "border-teal-400 bg-teal-50/40 dark:bg-teal-500/10"
              : "border-slate-200 dark:border-slate-700"
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-3">
              {file.type.startsWith("image/") && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500">
                  {file.type.startsWith("image/") ? <Image size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</div>
                  <div className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="ml-2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500 mb-3">
                <UploadCloud size={28} />
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Drag & drop file di sini</div>
              <div className="text-xs text-slate-400 mb-4">atau</div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.heic,.mp4,.mov"
            className="hidden"
            onChange={(e) => handleFilePick(e.target.files?.[0])}
          />
          {!file && (
            <Button onClick={() => fileInputRef.current?.click()} size="sm">
              Pilih File
            </Button>
          )}
          <div className="text-xs text-slate-400 mt-4">Format: PDF, JPG, PNG, HEIC, MP4, MOV • Maks. 100MB</div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium mb-1 block text-slate-600 dark:text-slate-300">Pilih Mata Pelajaran</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            <option value="">Pilih mata pelajaran</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block text-slate-600 dark:text-slate-300">Judul Catatan</label>
          <div className="w-full border rounded-lg px-3 py-2 text-sm flex items-center gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CalendarIcon size={14} className="text-slate-400 shrink-0" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul catatan (opsional)"
              className="bg-transparent outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={phase === "uploading" || phase === "processing"}
        className="w-full mb-4"
        size="lg"
      >
        {phase === "uploading" ? (
          <><Loader2 size={16} className="animate-spin" /> Mengunggah...</>
        ) : phase === "processing" ? (
          "AI sedang memproses..."
        ) : (
          "Upload & Proses"
        )}
      </Button>

      <Card className="flex items-start gap-3 bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-900/30">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
          <Lightbulb size={18} className="text-amber-500" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Tips</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Pastikan foto jelas dan tidak terpotong agar AI bisa membaca isi catatan dan membuat soal kuis dengan akurat.
          </div>
        </div>
      </Card>
    </div>
  );
}
