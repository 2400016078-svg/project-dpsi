import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button, Input } from "../components/UI";
import { verifyLinkCode, registerOrangTua, usernameTaken, suggestUsernames } from "../services/supabaseAuth";
import { ArrowLeft, CheckCircle, KeyRound, Mail, User, Lock, Search, Loader } from "lucide-react";

export default function RegisterOrangTua() {
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const checkUsername = useCallback(async (value) => {
    const v = value.trim();
    if (v.length < 3) { setUsernameStatus(null); setUsernameSuggestions([]); return; }
    setUsernameStatus("checking");
    const taken = await usernameTaken(v);
    if (taken) {
      setUsernameStatus("taken");
      const suggestions = await suggestUsernames(v);
      setUsernameSuggestions(suggestions);
    } else {
      setUsernameStatus("available");
      setUsernameSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (username.trim().length >= 3) {
      setUsernameStatus("checking");
      debounceRef.current = setTimeout(() => checkUsername(username), 400);
    } else {
      setUsernameStatus(null);
      setUsernameSuggestions([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, checkUsername]);

  const handleVerifikasi = async () => {
    setError("");
    setVerification(null);
    if (!linkCode.trim()) { setError("Masukkan Kode Tautan."); return; }
    const result = await verifyLinkCode(linkCode.trim());
    if (!result.success) { setError(result.message); return; }
    setVerification(result.link);
  };

  const handleDaftar = async () => {
    setError("");
    if (!nama || !email || !username || !password) { setError("Semua field harus diisi."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    const result = await registerOrangTua(nama, email, username, password, linkCode.trim());
    if (!result.success) {
      if (result.code === "USERNAME_TAKEN") { setError("Username sudah digunakan, silakan pilih yang lain."); return; }
      setError(result.message || "Gagal mendaftar. Silakan coba lagi.");
      return;
    }
    setSuccessMsg(`Akun Orang Tua berhasil dibuat dan tertaut ke siswa: ${result.data.anak_tertaut.nama_siswa}`);
  };

  const usernameAvailable = usernameStatus === "available";
  const usernameTakenStatus = usernameStatus === "taken";
  const usernameChecking = usernameStatus === "checking";
  const canSubmit = verification && username.trim().length >= 3 && usernameAvailable;

  if (successMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary-medium-light to-accent-teal px-4">
        <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl" />
        <Card className="w-full max-w-md text-center relative z-10">
          <CheckCircle size={48} className="text-success mx-auto mb-3" />
          <div className="p-4 bg-success-light text-success rounded-2xl">
            <p className="font-semibold">Registrasi Berhasil!</p>
            <p className="text-sm mt-1">{successMsg}</p>
          </div>
          <Button onClick={() => navigate("/login")} className="w-full mt-4">Ke Halaman Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary-medium-light to-accent-teal px-4 py-8 relative overflow-hidden">
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <Card className="w-full max-w-md relative z-10">
        <h1 className="text-h3 font-semibold text-primary-dark mb-4">Daftar sebagai Orang Tua</h1>
        <div className="space-y-4">
          <Input label="Nama Lengkap" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Hendra Permana" icon={User} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hendra@email.com" icon={Mail} />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="hendra.ortu" icon={User} />
          {username.trim().length >= 3 && (
            <div className="text-xs -mt-3">
              {usernameChecking && <span className="text-gray-400 flex items-center gap-1"><Loader size={12} className="animate-spin" /> Memeriksa...</span>}
              {usernameAvailable && <span className="text-success">Username tersedia</span>}
              {usernameTakenStatus && (
                <div>
                  <span className="text-error">Username sudah dipakai</span>
                  {usernameSuggestions.length > 0 && (
                    <div className="mt-1">
                      <span className="text-gray-500">Alternatif: </span>
                      {usernameSuggestions.map((s) => (
                        <button key={s} type="button" onClick={() => setUsername(s)} className="text-primary-medium hover:underline ml-1">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 karakter" icon={Lock} />
          <div className="border-t pt-4 border-gray-100">
            <Input label="Kode Tautan" value={linkCode} onChange={(e) => setLinkCode(e.target.value.toUpperCase())} placeholder="SMK-XXX-99AA" icon={KeyRound} />
            {!verification && (
              <Button onClick={handleVerifikasi} variant="secondary" className="mt-2" icon={Search}>Verifikasi Kode</Button>
            )}
          </div>
          {verification && (
            <div className="p-3 bg-success-light text-success rounded-xl text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              Kode Valid. Akun Anda akan tertaut dengan Siswa: <strong>{verification.siswa_nama}</strong>.
            </div>
          )}
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex gap-2">
            <Link to="/login" className="flex-1"><Button variant="secondary" className="w-full" icon={ArrowLeft}>Kembali</Button></Link>
            <Button onClick={handleDaftar} disabled={!canSubmit} className="flex-1" icon={CheckCircle}>Konfirmasi Pendaftaran</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
