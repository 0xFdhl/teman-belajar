export const SUBJECT_COLORS = {
  indigo: "bg-indigo-100 text-indigo-600",
  sky: "bg-sky-100 text-sky-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
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
