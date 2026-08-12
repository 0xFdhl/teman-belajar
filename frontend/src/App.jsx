import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./lib/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./lib/AuthContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadCatatan from "./pages/UploadCatatan.jsx";
import Kuis from "./pages/Kuis.jsx";
import JurnalKesalahan from "./pages/JurnalKesalahan.jsx";
import Tugas from "./pages/Tugas.jsx";
import Login from "./pages/Login.jsx";

function Splash() {
  const { dark } = useTheme();
  return (
    <div className={`w-full h-screen flex items-center justify-center ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>Memuat...</span>
      </div>
    </div>
  );
}

function Layout() {
  const { dark } = useTheme();
  return (
    <div className={`w-full h-screen flex font-sans ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadCatatan />} />
          <Route path="/kuis" element={<Kuis />} />
          <Route path="/jurnal" element={<JurnalKesalahan />} />
          <Route path="/tugas" element={<Tugas />} />
        </Routes>
      </main>
    </div>
  );
}

function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Layout /> : <Login />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}
