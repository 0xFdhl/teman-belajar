import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ClipboardList, Calendar as CalendarIcon, Flame, FileText, Plus, ArrowRight } from "lucide-react";
import { Card, StatCard, ProgressBar, Spinner, ErrorState, Skeleton, EmptyState, Badge } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

function MiniCalendar() {
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
  let nextDay = 1;
  while (cells.length % 7 !== 0) cells.push({ d: nextDay++, other: true });

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-800 dark:text-white">
          {monthNames[month]} {year}
        </span>
        <Badge>{today.toLocaleDateString("id-ID", { weekday: "long" })}</Badge>
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
                  ? "text-slate-300 dark:text-slate-600"
                  : "text-slate-600 dark:text-slate-300"
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
  if (diff === 1) return "Besok";
  return `${diff} hari lagi`;
}

function DashboardSkeleton() {
  return (
    <div className="animate-fade">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-56 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    api
      .getDashboard()
      .then(setData)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <DashboardSkeleton />;

  const { student, stats, progressPerSubject, upcomingTasks } = data;

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Halo, {student.name}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Semangat belajar hari ini!</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Upload Catatan
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="animate-fade-up-1"><StatCard label="Skor Terakhir" value={`${stats.lastScore}%`} sub="Dari 10 soal terakhir" trend={<TrendingUp size={12} />} icon={<TrendingUp size={18} />} /></div>
        <div className="animate-fade-up-2"><StatCard label="Soal Dikerjakan" value={stats.totalQuestionsAnswered} sub="Total soal" icon={<ClipboardList size={18} />} /></div>
        <div className="animate-fade-up-3"><StatCard label="Tugas Mendatang" value={stats.upcomingTasksCount} sub="Belum selesai" icon={<CalendarIcon size={18} />} /></div>
        <div className="animate-fade-up-4"><StatCard label="Streak Belajar" value={stats.streakDays} sub="Hari berturut-turut" trend={<Flame size={12} />} icon={<Flame size={18} />} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Progres per Mapel</div>
          <div className="flex flex-col gap-4">
            {progressPerSubject.length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">Belum ada data progres.</div>
            )}
            {progressPerSubject.map((m) => (
              <div key={m.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${colorForSubjectName(m.subject)}`}>
                      {m.subject[0]}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">{m.subject}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{m.value}%</span>
                </div>
                <ProgressBar value={m.value} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Tugas Mendatang</span>
            <Link to="/tugas" className="text-xs text-teal-500 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingTasks.length === 0 && (
              <div className="text-xs text-slate-400 dark:text-slate-500">Tidak ada tugas mendatang.</div>
            )}
            {upcomingTasks.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                  <FileText size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight text-slate-700 dark:text-slate-200 truncate">{t.title}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{t.subject} &middot; {daysUntil(t.due_date)}</div>
                </div>
              </div>
            ))}
            {upcomingTasks.length > 4 && (
              <Link to="/tugas" className="text-xs text-teal-500 hover:underline flex items-center gap-1 mt-1">
                Lihat semua <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniCalendar />
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-800 dark:text-white">Deadline Mendatang</div>
            <Link to="/tugas" className="text-xs text-teal-500 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingTasks.length === 0 ? (
              <EmptyState
                title="Tidak ada deadline"
                description="Kamu bebas dari tugas mendatang."
                icon={<CalendarIcon size={20} />}
              />
            ) : (
              upcomingTasks.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-xl p-3 bg-slate-50 dark:bg-slate-700/40"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{d.title}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{d.subject} &bull; {d.due_date}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                    daysUntil(d.due_date) === "Hari ini" || daysUntil(d.due_date) === "Besok"
                      ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                      : "text-teal-500 bg-teal-50 dark:bg-teal-500/10"
                  }`}>
                    {daysUntil(d.due_date)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
