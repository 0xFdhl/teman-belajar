import React from "react";
import { useTheme } from "../lib/ThemeContext.jsx";

export function Card({ children, className = "" }) {
  const { dark } = useTheme();
  return (
    <div
      className={`rounded-2xl p-5 border ${
        dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon }) {
  const { dark } = useTheme();
  return (
    <Card className="flex items-start justify-between">
      <div>
        <div className={`text-xs mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
        <div className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-800"}`}>{value}</div>
        <div className="text-xs text-teal-500 mt-1">{sub}</div>
      </div>
      <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500">{icon}</div>
    </Card>
  );
}

export function ProgressBar({ value }) {
  const { dark } = useTheme();
  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
      <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Spinner({ label = "Memuat..." }) {
  const { dark } = useTheme();
  return (
    <div className="flex items-center gap-2 py-8 justify-center">
      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <span className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-xl bg-rose-50 text-rose-600 text-sm px-4 py-3">
      ⚠ {message}
    </div>
  );
}

export function DataTable({ head = [], children, minWidth = "min-w-[560px]", className = "" }) {
  const { dark } = useTheme();
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={`w-full text-sm ${minWidth}`}>
        <thead>
          <tr className={`text-left text-xs uppercase tracking-wider ${
            dark ? "bg-slate-700/40 text-slate-300" : "bg-slate-50 text-slate-500"
          }`}>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap first:pl-5 last:pr-5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${dark ? "divide-slate-700" : "divide-slate-100"}`}>
          {children}
        </tbody>
      </table>
    </div>
  );
}
