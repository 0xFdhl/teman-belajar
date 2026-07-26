import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, X, Trash2, Loader2, Check, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "../lib/ToastContext.jsx";
import { Card, Spinner, ErrorState, EmptyState, Button, Badge } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

function formatDateParts(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  return { day, month };
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

function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm animate-pop">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} className="text-rose-500" />
        </div>
        <h3 className="text-sm font-semibold text-center text-slate-800 dark:text-white mb-1">{title}</h3>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-sm font-medium text-white transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tugas() {
  const toast = useToast();
  const [tab, setTab] = useState("pending");
  const [tasks, setTasks] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject_id: "", due_date: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  function loadTasks() {
    setError(null);
    api.getTasks().then(setTasks).catch((e) => setError(e.message));
  }

  useEffect(() => {
    loadTasks();
    api.getSubjects().then(setSubjects).catch(() => {});
  }, []);

  async function handleCreate() {
    if (!form.title || !form.due_date) {
      setError("Judul dan tanggal deadline wajib diisi.");
      toast.warning("Judul dan tanggal deadline wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      await api.createTask(form);
      setForm({ title: "", subject_id: "", due_date: "", description: "" });
      setShowForm(false);
      loadTasks();
      toast.success("Tugas berhasil ditambahkan!");
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDone(task) {
    const next = task.status === "done" ? "pending" : "done";
    try {
      await api.updateTaskStatus(task.id, next);
      loadTasks();
      toast.success(next === "done" ? "Tugas selesai!" : "Tugas dikembalikan ke daftar pending.");
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function removeTask(id) {
    setConfirmDelete(null);
    try {
      await api.deleteTask(id);
      loadTasks();
      toast.success("Tugas dihapus.");
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (error && !tasks) return <ErrorState message={error} onRetry={loadTasks} />;
  if (!tasks) return <Spinner label="Memuat tugas..." />;

  const visible = tab === "done" ? tasks.filter((t) => t.status === "done") : tasks.filter((t) => t.status !== "done");
  const pendingCount = tasks.filter((t) => t.status !== "done").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="max-w-3xl relative pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Tugas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{pendingCount} pending · {doneCount} selesai</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} /> Tugas Baru
        </Button>
      </div>

      <div className={`flex gap-1 p-1 rounded-xl w-fit mb-4 bg-slate-100 dark:bg-slate-800`}>
        {[
          { key: "pending", label: "Belum Selesai", count: pendingCount },
          { key: "done", label: "Selesai", count: doneCount },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {t.label} {t.count > 0 && <span className="ml-1 text-[10px] bg-slate-200 dark:bg-slate-600 px-1.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {error && <div className="mb-4"><ErrorState message={error} onRetry={() => setError(null)} /></div>}

      {showForm && (
        <Card className="mb-4 animate-fade">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Tugas Baru</span>
            <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Judul tugas"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <option value="">Mata pelajaran</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              />
            </div>
            <textarea
              placeholder="Deskripsi (opsional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm outline-none resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              rows={2}
            />
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : "Simpan Tugas"}
            </Button>
          </div>
        </Card>
      )}

      {visible.length === 0 && (
        <EmptyState
          icon={tab === "done" ? <CheckCircle2 size={24} /> : <FileText size={24} />}
          title={tab === "done" ? "Belum ada tugas selesai" : "Tidak ada tugas pending"}
          description={tab === "done" ? "Selesaikan tugas untuk melihatnya di sini." : "Yuk tambahkan tugas baru supaya tidak terlewat!"}
          action={
            tab !== "done" && (
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus size={16} /> Tambah Tugas
              </Button>
            )
          }
        />
      )}

      {visible.length > 0 && (
        <Card className="!p-0 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
          {visible.map((t) => {
            const { day, month } = formatDateParts(t.due_date);
            const isDone = t.status === "done";
            return (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <button onClick={() => toggleDone(t)} className="w-12 text-center shrink-0 group">
                  <div className={`text-base font-bold transition-colors ${isDone ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}`}>{day}</div>
                  <div className="text-[10px] text-slate-400">{month}</div>
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isDone ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                    {t.title}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {t.subject_name && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${colorForSubjectName(t.subject_name)}`}>
                        {t.subject_name}
                      </span>
                    )}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      daysUntil(t.due_date) === "Terlewat" ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10" : "text-slate-500 bg-slate-100 dark:bg-slate-700"
                    }`}>
                      {daysUntil(t.due_date)}
                    </span>
                  </div>
                  {t.description && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <FileText size={12} /> {t.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(t.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Hapus tugas"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => toggleDone(t)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                      isDone
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-300 hover:border-teal-400 hover:text-teal-500"
                    }`}
                  >
                    {isDone ? <Check size={16} /> : <div className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={24} />
      </button>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Tugas"
        message="Yakin ingin menghapus tugas ini? Tindakan ini tidak bisa dibatalkan."
        onConfirm={() => removeTask(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
