import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, trend }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <div className="text-xs mb-2 text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
        <div className="text-xs text-teal-500 mt-1 flex items-center gap-1">
          {trend}
          {sub}
        </div>
      </div>
      <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500">
        {icon}
      </div>
    </Card>
  );
}

export function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
      <div
        className="h-full bg-teal-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Spinner({ label = "Memuat..." }) {
  return (
    <div className="flex items-center gap-2 py-8 justify-center">
      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm px-4 py-3 flex items-center justify-between">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold underline hover:no-underline"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`}
    />
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <Card className="text-center py-10">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{description}</p>
      {action}
    </Card>
  );
}

export function Button({ children, variant = "primary", size = "md", className = "", disabled = false, ...props }) {
  const variants = {
    primary: "bg-teal-500 hover:bg-teal-600 text-white disabled:bg-teal-300 dark:disabled:bg-teal-800",
    secondary: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
    ghost: "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-rose-500 hover:bg-rose-600 text-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    teal: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${colors[color]}`}>
      {children}
    </span>
  );
}
