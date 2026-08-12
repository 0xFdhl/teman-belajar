import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, BookOpen, Sparkles } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Login() {
  const { dark } = useTheme();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (isRegister && !name.trim()) return setError("Nama wajib diisi.");
    if (!email.trim() || !password) return setError("Email dan password wajib diisi.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (isRegister && password !== confirm) return setError("Konfirmasi password tidak cocok.");

    setLoading(true);
    try {
      if (isRegister) await register({ name: name.trim(), email, password });
      else await login({ email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    dark
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-teal-500"
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-500"
  }`;

  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center p-4 ${
        dark ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold">
            T
          </div>
          <div>
            <div className={`text-lg font-bold leading-tight ${dark ? "text-white" : "text-slate-800"}`}>
              Teman Belajar AI
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-teal-500" /> Siang belajar, malam review
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl p-6 border shadow-sm ${
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <h1 className={`text-xl font-bold mb-1 ${dark ? "text-white" : "text-slate-800"}`}>
            {isRegister ? "Daftar Akun" : "Selamat Datang!"}
          </h1>
          <p className={`text-sm mb-5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {isRegister ? "Buat akun untuk mulai belajar" : "Masuk untuk melanjutkan belajar"}
          </p>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-5 bg-slate-100 dark:bg-slate-800">
            {[
              { key: "login", label: "Masuk" },
              { key: "register", label: "Daftar" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => switchMode(t.key)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === t.key
                    ? "bg-teal-500 text-white shadow-sm"
                    : dark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  Nama
                </label>
                <div className="relative">
                  <User size={16} className={iconClass} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className={iconClass} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className={iconClass} />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock size={16} className={iconClass} />
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Ulangi password"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-50 text-rose-600 text-sm px-4 py-3">⚠ {error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <BookOpen size={16} />
                  {isRegister ? "Daftar" : "Masuk"}
                </>
              )}
            </button>
          </form>

          <p className={`text-center text-xs mt-5 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            Akun contoh: <span className="font-medium">yogi@temanbelajar.app</span> /{" "}
            <span className="font-medium">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
