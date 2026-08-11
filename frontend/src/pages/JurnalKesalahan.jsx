import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";
import { Card, Spinner, ErrorState } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

export default function JurnalKesalahan() {
  const { dark } = useTheme();
  const [tab, setTab] = useState("semua");
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.getJournal().then(setEntries).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!entries) return <Spinner label="Memuat jurnal kesalahan..." />;

  const subjects = [...new Set(entries.map((e) => e.subject))];
  const visible = tab === "semua" ? entries : entries.filter((e) => e.subject === tab);

  return (
    <div className="max-w-2xl">
      <h1 className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-slate-800"}`}>Jurnal Kesalahan</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setTab("semua")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            tab === "semua" ? "bg-teal-500 text-white" : dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-500"
          }`}
        >
          Semua Mapel
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              tab === s ? "bg-teal-500 text-white" : dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-500"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <Card className="mb-4">
          <div className={`text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
            Belum ada catatan kesalahan di sini. Kerjakan kuis untuk mulai melacak progresmu! 🎯
          </div>
        </Card>
      )}

      <Card className="mb-4 !p-0 divide-y divide-slate-100">
        {visible.map((j) => (
          <div key={j.attempt_id}>
            <button
              onClick={() => setOpenId(openId === j.attempt_id ? null : j.attempt_id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${colorForSubjectName(j.subject)}`}>
                    {j.subject}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(j.attempted_at).toLocaleDateString("id-ID")}</span>
                </div>
                <div className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-700"}`}>{j.question_text}</div>
                <div className="text-xs text-slate-400">{j.quiz_title}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-full">Salah</span>
                <ChevronRight
                  size={16}
                  className={`text-slate-300 transition-transform ${openId === j.attempt_id ? "rotate-90" : ""}`}
                />
              </div>
            </button>
            {openId === j.attempt_id && (
              <div className={`px-5 pb-4 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                <div className="mb-1">
                  Kamu menjawab <strong>{j.selected_option}</strong>, jawaban benar adalah{" "}
                  <strong className="text-emerald-500">{j.correct_option}</strong>.
                </div>
                <div className="mb-1">{j.explanation}</div>
                {j.source_reference && <div className="italic">Referensi: {j.source_reference}</div>}
              </div>
            )}
          </div>
        ))}
      </Card>
      {visible.length > 0 && (
        <button className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2.5 rounded-lg">
          Mulai Review ({visible.length})
        </button>
      )}
    </div>
  );
}
