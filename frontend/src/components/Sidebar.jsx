import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Upload, ClipboardList, BookOpen, ListChecks,
  Settings, HelpCircle, LogOut, Moon,
} from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/upload", label: "Upload Catatan", icon: Upload },
  { to: "/kuis", label: "Kuis", icon: ClipboardList },
  { to: "/jurnal", label: "Jurnal Kesalahan", icon: BookOpen },
  { to: "/tugas", label: "Tugas", icon: ListChecks },
];

export default function Sidebar() {
  const { dark } = useTheme();

  return (
    <aside
      className={`w-56 shrink-0 h-full flex flex-col justify-between border-r px-3 py-5 ${
        dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      <div>
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold">
            T
          </div>
          <div>
            <div className={`text-sm font-semibold leading-tight ${dark ? "text-white" : "text-slate-800"}`}>
              Teman Belajar AI
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">Siang belajar, malam review</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-600"
                      : dark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-500 hover:bg-slate-50"
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div>
        <div className="flex flex-col gap-1 mb-4">
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
              dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <HelpCircle size={17} /> Bantuan
          </button>
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
              dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <LogOut size={17} /> Keluar
          </button>
        </div>
        <div className={`rounded-xl p-3 flex items-center gap-2 ${dark ? "bg-slate-800" : "bg-sky-50"}`}>
          <Moon size={16} className="text-sky-400" />
          <span className={`text-xs ${dark ? "text-slate-300" : "text-slate-500"}`}>
            Siang hari untuk belajar & bertumbuh!
          </span>
        </div>
      </div>
    </aside>
  );
}
