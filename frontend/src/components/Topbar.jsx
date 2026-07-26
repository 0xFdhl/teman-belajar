import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, Sun, Moon, Command } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";

const SHORTCUTS = [
  { label: "Dashboard", path: "/" },
  { label: "Upload Catatan", path: "/upload" },
  { label: "Kuis", path: "/kuis" },
  { label: "Jurnal Kesalahan", path: "/jurnal" },
  { label: "Tugas", path: "/tugas" },
];

export default function Topbar({ onOpenMobile }) {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  // Ctrl / Cmd + K untuk buka pencarian
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [open]);

  const filtered = query.trim()
    ? SHORTCUTS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : SHORTCUTS;

  function handleSelect(path) {
    navigate(path);
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onOpenMobile}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
          >
            <Menu size={18} />
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl w-80 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-left group hover:border-teal-300 dark:hover:border-teal-700 focus-visible:border-teal-500 transition-colors"
        >
          <Search size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400 flex-1">Cari menu...</span>
          <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 flex items-center gap-0.5">
            <Command size={10} /> K
          </span>
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-amber-500 transition-colors"
            aria-label="Toggle tema"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="relative w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 cursor-not-allowed transition-colors"
            disabled
            title="Notifikasi (segera hadir)"
          >
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 font-semibold text-sm">
              Y
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">Yogi</span>
          </div>
        </div>
      </div>

      {/* Search modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 sm:pt-32 px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pop">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <Search size={18} className="text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari menu..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered[0]) {
                    handleSelect(filtered[0].path);
                  }
                }}
              />
              <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">Esc</span>
            </div>
            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-slate-500">Tidak ditemukan</div>
              )}
              {filtered.map((s) => (
                <button
                  key={s.path}
                  onClick={() => handleSelect(s.path)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  {s.label}
                  <span className="text-[10px] text-slate-400">Pergi ke halaman</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
