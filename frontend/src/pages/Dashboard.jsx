import React, { useEffect, useState } from "react";
import { TrendingUp, ClipboardList, Calendar as CalendarIcon, Flame, FileText } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";
import { Card, StatCard, ProgressBar, Spinner, ErrorState } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

function MiniCalendar() {
  const { dark } = useTheme();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ d: daysInPrevMonth - i, other: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, other: false });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length, other: true });

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
          {monthNames[month]} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {days.map((d) => (
          <div key={d} className="text-[11px] text-slate-400 font-medium">{d}</div>
        ))}
        {cells.map((c, i) => {
          const isToday = !c.other && c.d === today.getDate();
          return (
            <div
              key={i}
              className={`text-xs w-7 h-7 mx-auto flex items-center justify-center rounded-full ${
                isToday
                  ? "bg-teal-500 text-white font-semibold"
                  : c.other
                  ? "text-slate-300"
                  : dark
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              {c.d}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Terlewat";
  if (diff === 0) return "Hari ini";
  return `${diff} hari lagi`;
}

export default function Dashboard() {
  const { dark } = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Spinner label="Memuat dashboard..." />;

  const { student, stats, progressPerSubject, upcomingTasks } = data;

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-1 ${dark ? "text-white" : "text-slate-800"}`}>
        Halo, {student.name}! 👋
      </h1>
      <p className={`text-sm mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>Semangat belajar hari ini!</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Skor Terakhir" value={`${stats.lastScore}%`} sub="Dari 10 soal terakhir" icon={<TrendingUp size={18} />} />
        <StatCard label="Soal Dikerjakan" value={stats.totalQuestionsAnswered} sub="Total soal" icon={<ClipboardList size={18} />} />
        <StatCard label="Tugas Mendatang" value={stats.upcomingTasksCount} sub="Belum selesai" icon={<CalendarIcon size={18} />} />
        <StatCard label="Streak Belajar" value={stats.streakDays} sub="Hari berturut-turut 🔥" icon={<Flame size={18} />} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="col-span-2">
          <div className={`text-sm font-semibold mb-4 ${dark ? "text-white" : "text-slate-800"}`}>Progres per Mapel</div>
          <div className="flex flex-col gap-4">
            {progressPerSubject.map((m) => (
              <div key={m.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${colorForSubjectName(m.subject)}`}>
                      {m.subject[0]}
                    </span>
                    <span className={`text-sm ${dark ? "text-slate-200" : "text-slate-700"}`}>{m.subject}</span>
                  </div>
                  <span className={`text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>{m.value}%</span>
                </div>
                <ProgressBar value={m.value} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Tugas Mendatang</span>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingTasks.length === 0 && (
              <div className="text-xs text-slate-400">Tidak ada tugas mendatang. 🎉</div>
            )}
            {upcomingTasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 shrink-0">
                  <FileText size={15} />
                </div>
                <div>
                  <div className={`text-sm font-medium leading-tight ${dark ? "text-slate-200" : "text-slate-700"}`}>{t.title}</div>
                  <div className="text-xs text-slate-400">{t.subject} · {daysUntil(t.due_date)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <MiniCalendar />
        <Card className="col-span-2">
          <div className={`text-sm font-semibold mb-3 ${dark ? "text-white" : "text-slate-800"}`}>Deadline Mendatang</div>
          <div className="flex flex-col gap-2">
            {upcomingTasks.map((d) => (
              <div key={d.id} className={`flex items-center justify-between rounded-xl p-3 ${dark ? "bg-slate-700/40" : "bg-slate-50"}`}>
                <div>
                  <div className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-700"}`}>{d.title}</div>
                  <div className="text-xs text-slate-400">{d.subject} • {d.due_date}</div>
                </div>
                <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-full">{daysUntil(d.due_date)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
