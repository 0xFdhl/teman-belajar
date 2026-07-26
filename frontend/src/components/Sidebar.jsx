import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, ClipboardList, BookOpen, ListChecks,
  HelpCircle, LogOut, Moon, Sun, X, Menu, Sparkles,
} from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/upload", label: "Upload Catatan", icon: Upload },
  { to: "/kuis", label: "Kuis", icon: ClipboardList },
  { to: "/jurnal", label: "Jurnal Kesalahan", icon: BookOpen },
  { to: "/tugas", label: "Tugas", icon: ListChecks },
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { dark, toggle } = useTheme();
  const location = useLocation();

  const navList = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20">
          T
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight text-slate-800 dark:text-white">
            Teman Belajar AI
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">Siang belajar, malam review</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
          Menu
        </div>
        {navList}
      </div>

      <div className="mt-auto">
        <div className="flex flex-col gap-1 mb-4">
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {dark ? <Moon size={18} /> : <Sun size={18} />}
            {dark ? "Mode Gelap" : "Mode Terang"}
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-not-allowed" disabled title="Segera hadir">
            <HelpCircle size={18} /> Bantuan
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-not-allowed" disabled title="Segera hadir">
            <LogOut size={18} /> Keluar
          </button>
        </div>
        <div className="rounded-2xl p-4 flex items-center gap-3 bg-gradient-to-br from-sky-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-sky-500 shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Semangat!</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Setiap hari adalah kesempatan untuk tumbuh.</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-full flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-5">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-4 py-5 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold">T</div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Teman Belajar AI</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
