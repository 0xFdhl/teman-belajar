import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./lib/ThemeContext.jsx";
import { ToastProvider } from "./lib/ToastContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadCatatan from "./pages/UploadCatatan.jsx";
import Kuis from "./pages/Kuis.jsx";
import JurnalKesalahan from "./pages/JurnalKesalahan.jsx";
import Tugas from "./pages/Tugas.jsx";
import NotFound from "./pages/NotFound.jsx";

function Layout() {
  const { mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hindari flash tema salah saat hydrate
  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto min-w-0">
        <Topbar onOpenMobile={() => setMobileMenuOpen(true)} />
        <div className="p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadCatatan />} />
            <Route path="/kuis" element={<Kuis />} />
            <Route path="/kuis/:id" element={<Kuis />} />
            <Route path="/jurnal" element={<JurnalKesalahan />} />
            <Route path="/tugas" element={<Tugas />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </ThemeProvider>
  );
}
