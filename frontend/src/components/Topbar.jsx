import React from "react";
import { Search, Bell, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";

export default function Topbar() {
  const { dark, setDark } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg w-80 border ${
          dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        <Search size={16} className="text-slate-400" />
        <input
          placeholder="Cari sesuatu..."
          className={`bg-transparent outline-none text-sm flex-1 ${
            dark ? "text-slate-200 placeholder-slate-500" : "text-slate-600 placeholder-slate-400"
          }`}
        />
        <span className="text-[10px] text-slate-400 border rounded px-1">Ctrl K</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setDark(!dark)}
          className={`w-9 h-9 rounded-full flex items-center justify-center border ${
            dark ? "bg-slate-800 border-slate-700 text-amber-300" : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          className={`relative w-9 h-9 rounded-full flex items-center justify-center border ${
            dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          <Bell size={16} className="text-slate-400" />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
            Y
          </div>
          <span className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-700"}`}>Yogi</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}
