import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/UI";
import Login from "./pages/Login";
import RegisterSiswa from "./pages/RegisterSiswa";
import RegisterOrangTua from "./pages/RegisterOrangTua";
import SiswaDashboard from "./pages/siswa/Dashboard";
import SiswaKuesioner from "./pages/siswa/Kuesioner";
import BkDashboard from "./pages/bk/Dashboard";
import DaftarSiswa from "./pages/bk/DaftarSiswa";
import DetailSiswa from "./pages/bk/DetailSiswa";
import Rekapitulasi from "./pages/bk/Rekapitulasi";
import RiwayatCatatan from "./pages/bk/RiwayatCatatan";
import OrtuDashboard from "./pages/orangtua/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ManajemenPengguna from "./pages/admin/ManajemenPengguna";
import MasterNisn from "./pages/admin/MasterNisn";
import PengaturanAkun from "./pages/PengaturanAkun";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = { siswa: "/siswa/dashboard", guru_bk: "/bk/dashboard", orang_tua: "/orang-tua/dashboard", admin: "/admin/dashboard" };
  return <Navigate to={routes[user.role] || "/login"} replace />;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/daftar/siswa" element={<RegisterSiswa />} />
        <Route path="/daftar/orang-tua" element={<RegisterOrangTua />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/siswa/dashboard" element={<ProtectedRoute allowedRoles={["siswa"]}><SiswaDashboard /></ProtectedRoute>} />
        <Route path="/siswa/kuesioner" element={<ProtectedRoute allowedRoles={["siswa"]}><SiswaKuesioner /></ProtectedRoute>} />

        <Route path="/bk/dashboard" element={<ProtectedRoute allowedRoles={["guru_bk"]}><BkDashboard /></ProtectedRoute>} />
        <Route path="/bk/siswa" element={<ProtectedRoute allowedRoles={["guru_bk"]}><DaftarSiswa /></ProtectedRoute>} />
        <Route path="/bk/siswa/:uuid/konseling" element={<ProtectedRoute allowedRoles={["guru_bk"]}><DetailSiswa /></ProtectedRoute>} />
        <Route path="/bk/rekapitulasi-angkatan" element={<ProtectedRoute allowedRoles={["guru_bk"]}><Rekapitulasi /></ProtectedRoute>} />
        <Route path="/bk/catatan-riwayat" element={<ProtectedRoute allowedRoles={["guru_bk"]}><RiwayatCatatan /></ProtectedRoute>} />

        <Route path="/orang-tua/dashboard" element={<ProtectedRoute allowedRoles={["orang_tua"]}><OrtuDashboard /></ProtectedRoute>} />

        <Route path="/pengaturan-akun" element={<ProtectedRoute allowedRoles={["siswa", "guru_bk", "orang_tua"]}><PengaturanAkun /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/pengguna" element={<ProtectedRoute allowedRoles={["admin"]}><ManajemenPengguna /></ProtectedRoute>} />
        <Route path="/admin/master-nisn" element={<ProtectedRoute allowedRoles={["admin"]}><MasterNisn /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
