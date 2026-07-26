import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";
import { Card } from "../components/ui.jsx";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto mt-12">
      <Card className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Halaman tidak ditemukan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Sepertinya kamu tersesat. Yuk kembali ke dashboard untuk belajar lagi.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <Home size={16} />
          Kembali ke Dashboard
        </Link>
      </Card>
    </div>
  );
}
