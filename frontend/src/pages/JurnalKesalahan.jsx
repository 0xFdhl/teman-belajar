import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, BookOpen, RefreshCcw } from "lucide-react";
import { useToast } from "../lib/ToastContext.jsx";
import { Card, Spinner, ErrorState, EmptyState, Button, Badge } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

export default function JurnalKesalahan() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("semua");
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  function load() {
    setError(null);
    api.getJournal().then(setEntries).catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!entries) return <Spinner label="Memuat jurnal kesalahan..." />;

  const subjects = [...new Set(entries.map((e) => e.subject))].filter(Boolean);
  const visible = tab === "semua" ? entries : entries.filter((e) => e.subject === tab);

  function startReview() {
    if (visible.length === 0) {
      toast.info("Tidak ada kesalahan untuk direview.");
      return;
    }
    // Buka kuis dari kesalahan pertama
    const first = visible[0];
    navigate(`/kuis/${first.quiz_id || ""}`);
    toast.info("Membuka kuis untuk review kesalahan.");
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Jurnal Kesalahan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pelajari kesalahanmu dan tingkatkan pemahaman.</p>
        </div>
        <Button variant="secondary" onClick={load} size="sm">
          <RefreshCcw size={14} /> Muat Ulang
        </Button>
      </div>

      <div className="flex gap-1.5 p-1 mb-4 w-fit rounded-xl bg-slate-100 dark:bg-slate-800 flex-wrap">
        <button
          onClick={() => setTab("semua")}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "semua" ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Semua
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === s ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="Belum ada catatan kesalahan"
          description="Kerjakan kuis untuk mulai melacak progresmu!"
          action={
            <Button onClick={() => navigate("/kuis")} size="sm">
              Kerjakan Kuis
            </Button>
          }
        />
      )}

      {visible.length > 0 && (
        <Card className="mb-4 !p-0 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
          {visible.map((j) => (
            <div key={j.attempt_id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <button
                onClick={() => setOpenId(openId === j.attempt_id ? null : j.attempt_id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${colorForSubjectName(j.subject)}`}>
                      {j.subject}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(j.attempted_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{j.question_text}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{j.quiz_title}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge color="rose">Salah</Badge>
                  <ChevronRight
                    size={16}
                    className={`text-slate-300 dark:text-slate-600 transition-transform ${openId === j.attempt_id ? "rotate-90" : ""}`}
                  />
                </div>
              </button>
              {openId === j.attempt_id && (
                <div className="px-5 pb-4 text-xs text-slate-500 dark:text-slate-400 animate-fade">
                  <div className="mb-2">
                    Kamu menjawab <strong className="text-rose-500">{j.selected_option}</strong>, jawaban benar adalah{" "}
                    <strong className="text-emerald-500">{j.correct_option}</strong>.
                  </div>
                  <div className="mb-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 leading-relaxed">{j.explanation || "Tidak ada penjelasan."}</div>
                  {j.source_reference && <div className="italic text-slate-400 dark:text-slate-500">Referensi: {j.source_reference}</div>}
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {visible.length > 0 && (
        <Button onClick={startReview} className="w-full">
          Mulai Review ({visible.length})
        </Button>
      )}
    </div>
  );
}
