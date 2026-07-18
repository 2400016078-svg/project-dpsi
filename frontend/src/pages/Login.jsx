import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { Card, Button, Input } from "../components/UI";
import { User, Lock, AlertCircle } from "lucide-react";
import { hasSessionExpiredFlag, clearSessionExpiredFlag } from "../services/supabaseAuth";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [expired, setExpired] = useState(hasSessionExpiredFlag());

  useEffect(() => {
    if (!expired && hasSessionExpiredFlag()) {
      setExpired(true);
    }
    clearSessionExpiredFlag();
  }, [expired]);

  if (user) {
    const routes = { siswa: "/siswa/dashboard", guru_bk: "/bk/dashboard", orang_tua: "/orang-tua/dashboard", admin: "/admin/dashboard" };
    return <Navigate to={routes[user.role] || "/login"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const u = await login(username, password);
    if (!u) { setError("Username atau password salah."); return; }
    const routes = { siswa: "/siswa/dashboard", guru_bk: "/bk/dashboard", orang_tua: "/orang-tua/dashboard", admin: "/admin/dashboard" };
    navigate(routes[u.role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary-medium-light to-accent-teal px-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <Card className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-dark text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="font-heading font-bold text-xl">S</span>
          </div>
          <h1 className="text-h1 text-primary-dark">SAMI-SMK</h1>
          <p className="text-sm text-gray-500 mt-1">Sistem Analisis Minat Siswa SMK</p>
        </div>
        {expired && (
          <div className="flex items-start gap-3 p-3 mb-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-orange-500" />
            <span>Sesi Anda telah berakhir karena tidak aktif. Silakan masuk kembali.</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" icon={User} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" icon={Lock} />
          {error && <p className="text-sm text-error text-center">{error}</p>}
          <Button type="submit" className="w-full">Masuk</Button>
        </form>
        <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-400 text-center">Belum punya akun?</p>
          <Link
            to="/daftar/siswa"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition w-full bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-blue-50"
          >
            Daftar sebagai Siswa
          </Link>
          <Link
            to="/daftar/orang-tua"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition w-full bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-blue-50"
          >
            Daftar sebagai Orang Tua
          </Link>
        </div>
      </Card>
    </div>
  );
}
