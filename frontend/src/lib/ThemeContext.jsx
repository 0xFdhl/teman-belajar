import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "teman-belajar-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
      window.localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      root.classList.remove("dark");
      window.localStorage.setItem(STORAGE_KEY, "light");
    }
  }, [dark, mounted]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      // Hanya terapkan preferensi sistem jika user belum pernah memilih manual
      if (window.localStorage.getItem(STORAGE_KEY) === null) {
        setDark(e.matches);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, setDark, toggle, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme harus dipakai di dalam ThemeProvider");
  return ctx;
}
