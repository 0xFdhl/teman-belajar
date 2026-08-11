import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./lib/ThemeContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadCatatan from "./pages/UploadCatatan.jsx";
import Kuis from "./pages/Kuis.jsx";
import JurnalKesalahan from "./pages/JurnalKesalahan.jsx";
import Tugas from "./pages/Tugas.jsx";

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

export default function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}
