import React, { useEffect, useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";
import { Card, Spinner, ErrorState } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

function formatDateParts(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  return { day, month };
}

export default function Tugas() {
  const { dark } = useTheme();
  const [tab, setTab] = useState("timeline");
  const [tasks, setTasks] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject_id: "", due_date: "", description: "" });

  function loadTasks() {
    api.getTasks().then(setTasks).catch((e) => setError(e.message));
  }

  useEffect(() => {
    loadTasks();
    api.getSubjects().then(setSubjects).catch(() => {});
  }, []);

  async function handleCreate() {
    if (!form.title || !form.due_date) {
      setError("Judul dan tanggal deadline wajib diisi.");
      return;
    }
    try {
      await api.createTask(form);
      setForm({ title: "", subject_id: "", due_date: "", description: "" });
      setShowForm(false);
      loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleDone(task) {
    await api.updateTaskStatus(task.id, task.status === "done" ? "pending" : "done");
    loadTasks();
  }

  if (error && !tasks) return <ErrorState message={error} />;
  if (!tasks) return <Spinner label="Memuat tugas..." />;

  const visible = tab === "Selesai" ? tasks.filter((t) => t.status === "done") : tasks.filter((t) => t.status !== "done");

  return (
    <div className="max-w-2xl relative pb-16">
      <h1 className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-slate-800"}`}>Tugas</h1>
      <div className={`flex gap-1 p-1 rounded-lg w-fit mb-4 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
        {["timeline", "Selesai"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize ${
              tab === t ? "bg-teal-500 text-white" : "text-slate-400"
            }`}
          >
            {t === "timeline" ? "Belum Selesai" : t}
          </button>
        ))}
      </div>

      {error && <div className="mb-4"><ErrorState message={error} /></div>}

      {showForm && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Tugas Baru</span>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-slate-400" /></button>
          </div>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Judul tugas"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`border rounded-lg px-3 py-2 text-sm outline-none ${dark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200"}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className={`border rounded-lg px-3 py-2 text-sm outline-none ${dark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200"}`}
              >
                <option value="">Mata pelajaran</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className={`border rounded-lg px-3 py-2 text-sm outline-none ${dark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200"}`}
              />
            </div>
            <textarea
              placeholder="Deskripsi (opsional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`border rounded-lg px-3 py-2 text-sm outline-none resize-none ${dark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200"}`}
              rows={2}
            />
            <button onClick={handleCreate} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2 rounded-lg">
              Simpan Tugas
            </button>
          </div>
        </Card>
      )}

      <Card className="!p-0 divide-y divide-slate-100 relative">
        {visible.length === 0 && (
          <div className={`px-5 py-6 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Tidak ada tugas di sini.
          </div>
        )}
        {visible.map((t) => {
          const { day, month } = formatDateParts(t.due_date);
          return (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4">
              <button onClick={() => toggleDone(t)} className="w-12 text-center shrink-0">
                <div className={`text-base font-bold ${dark ? "text-slate-200" : "text-slate-700"}`}>{day}</div>
                <div className="text-[10px] text-slate-400">{month}</div>
              </button>
              <div className="flex-1">
                <div className={`text-sm font-medium ${t.status === "done" ? "line-through text-slate-400" : dark ? "text-slate-200" : "text-slate-700"}`}>
                  {t.title}
                </div>
                <div className="text-xs text-slate-400 mb-1">{t.subject_name || "Umum"}</div>
                {t.description && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <FileText size={12} /> {t.description}
                  </div>
                )}
              </div>
              <input
                type="checkbox"
                checked={t.status === "done"}
                onChange={() => toggleDone(t)}
                className="w-4 h-4 accent-teal-500"
              />
            </div>
          );
        })}
      </Card>
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-lg"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
