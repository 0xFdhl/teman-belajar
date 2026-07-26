export const SUBJECT_COLORS = {
  indigo: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  sky: "bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300",
  amber: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300",
  emerald: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  rose: "bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300",
  slate: "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

export function colorForSubjectName(name) {
  const map = {
    Matematika: "indigo",
    "Bahasa Indonesia": "sky",
    Fisika: "amber",
    RPL: "emerald",
    PKL: "rose",
  };
  return SUBJECT_COLORS[map[name]] || SUBJECT_COLORS.slate;
}
