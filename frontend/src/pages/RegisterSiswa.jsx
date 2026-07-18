import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button, Input } from "../components/UI";
import { checkNisn, nisnAlreadyClaimed, registerSiswa, usernameTaken, suggestUsernames } from "../services/supabaseAuth";
import { ArrowLeft, ArrowRight, CheckCircle, Copy, User, Lock, Search, KeyRound, Loader } from "lucide-react";

export default function RegisterSiswa() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [nisnError, setNisnError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
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

  const handleCekNisn = async () => {
    setNisnError("");
    if (!/^\d{10}$/.test(nisn)) { setNisnError("NISN harus 10 digit angka."); return; }
    if (await nisnAlreadyClaimed(nisn)) { setNisnError("NISN ini sudah digunakan. Silakan login atau hubungi Guru BK."); return; }
    const master = await checkNisn(nisn);
    if (!master) { setNisnError("NISN tidak terdaftar. Mohon hubungi Admin Sekolah."); return; }
    setNama(master.nama_siswa);
    setStep(2);
  };

  const handleDaftar = async () => {
    setUsernameError("");
    if (password.length < 6) { setUsernameError("Password minimal 6 karakter."); return; }
    const result = await registerSiswa(nisn, username, password);
    if (!result.success) {
      if (result.code === "USERNAME_TAKEN") { setUsernameError("Username sudah digunakan, silakan pilih yang lain."); return; }
      setUsernameError("Registrasi gagal. Coba lagi."); return;
    }
    setLinkCode(result.data.link_code);
    setStep(3);
  };

  const usernameAvailable = usernameStatus === "available";
  const usernameTakenStatus = usernameStatus === "taken";
  const usernameChecking = usernameStatus === "checking";
  const canSubmit = username.trim().length >= 3 && usernameAvailable && password.length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary-medium-light to-accent-teal px-4 py-8 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <Card className="w-full max-w-md relative z-10">
        <h1 className="text-h3 font-semibold text-primary-dark mb-1">Daftar sebagai Siswa</h1>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition ${
                s <= step ? "bg-primary-dark" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Masukkan NISN Anda untuk verifikasi data master sekolah.</p>
            <Input label="NISN (10 digit)" value={nisn} onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="0061234567" error={nisnError} icon={Search} />
            <Button onClick={handleCekNisn} className="w-full" icon={ArrowRight}>Cek NISN</Button>
            <p className="text-center text-sm"><Link to="/login" className="text-primary-medium hover:underline">Kembali ke Login</Link></p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-success-light text-success rounded-xl text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              <span>NISN terverifikasi. Nama: <strong>{nama}</strong></span>
            </div>
            <Input label="Nama (dari data master)" value={nama} readOnly />
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="contoh: budi.permana" error={usernameError} icon={User} />
            {username.trim().length >= 3 && (
              <div className="text-xs -mt-2">
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
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1" icon={ArrowLeft}>Kembali</Button>
              <Button onClick={handleDaftar} disabled={!canSubmit} className="flex-1" icon={CheckCircle}>Daftar Akun</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-success-light text-success rounded-2xl">
              <CheckCircle size={32} className="mx-auto mb-2" />
              <p className="font-semibold">Registrasi Berhasil!</p>
              <p className="text-sm mt-1">Akun siswa atas nama <strong>{nama}</strong> telah dibuat.</p>
            </div>
            <div className="p-4 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100">
              <p className="text-sm font-medium flex items-center justify-center gap-1">
                <KeyRound size={14} />
                Kode Tautan Keluarga:
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-lg font-bold font-mono tracking-wider bg-white px-4 py-1.5 rounded-xl border border-blue-200">{linkCode}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(linkCode)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                  title="Salin kode"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-xs mt-2 text-blue-600">Bagikan kode ini kepada Orang Tua/Wali untuk membuat akun monitoring.</p>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full">Ke Halaman Login</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
