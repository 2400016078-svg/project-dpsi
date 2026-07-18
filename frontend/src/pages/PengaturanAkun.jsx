import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { Card, Button, Input } from "../components/UI";
import { getAvatar, setAvatar, removeAvatar } from "../utils/data";
import { changePassword, getGuruBkName, updateUserNama } from "../services/supabaseAuth";
import { ArrowLeft, Camera, Trash2, User, KeyRound, CheckCircle, Shield, GraduationCap, Heart, BookOpen, Save } from "lucide-react";

export default function PengaturanAkun() {
  const { user, siswaProfile, ortuProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState(() => getAvatar(user.id));
  const [uploadError, setUploadError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [nama, setNama] = useState(user.nama || "");
  const [namaError, setNamaError] = useState("");
  const [namaSuccess, setNamaSuccess] = useState("");
  const [guruBkNama, setGuruBkNama] = useState("");
  const [guruBkLoaded, setGuruBkLoaded] = useState(false);

  useEffect(() => {
    if (user?.role === "siswa" && siswaProfile?.id_guru_bk) {
      getGuruBkName(siswaProfile.id_guru_bk).then((n) => {
        if (n) setGuruBkNama(n);
        setGuruBkLoaded(true);
      }).catch(() => setGuruBkLoaded(true));
    } else if (user?.role === "siswa") {
      setGuruBkLoaded(true);
    }
  }, [user?.id, siswaProfile?.id_guru_bk]);

  const role = user.role;
  const dashboardRoute = role === "siswa" ? "/siswa/dashboard" : role === "guru_bk" ? "/bk/dashboard" : "/orang-tua/dashboard";

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Hanya file gambar yang diperbolehkan (JPG, PNG, GIF, dll).");
      return;
    }
    if (file.size > 1_048_576) {
      setUploadError("Ukuran gambar maksimal 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatar(user.id, dataUrl);
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    removeAvatar(user.id);
    setAvatarUrl(null);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (!oldPassword) { setPasswordError("Password lama harus diisi."); return; }
    if (!newPassword || newPassword.length < 6) { setPasswordError("Password baru minimal 6 karakter."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Konfirmasi password baru tidak cocok."); return; }
    const result = await changePassword(user.id, oldPassword, newPassword);
    if (!result.success) {
      if (result.code === "WRONG_PASSWORD") { setPasswordError("Password lama salah."); return; }
      setPasswordError("Gagal mengubah password. Coba lagi.");
      return;
    }
    setPasswordSuccess("Password berhasil diubah.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveNama = async () => {
    setNamaError("");
    setNamaSuccess("");
    const trimmed = nama.trim();
    if (!trimmed) { setNamaError("Nama tidak boleh kosong."); return; }
    const res = await updateUserNama(user.id, trimmed);
    if (!res.success) { setNamaError("Gagal menyimpan nama."); return; }
    user.nama = trimmed;
    setNamaSuccess("Nama berhasil disimpan.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(dashboardRoute)} icon={ArrowLeft}>Kembali ke Dashboard</Button>

      {/* Section 1: Avatar */}
      <Card>
        <h2 className="text-h3 font-semibold text-primary-dark mb-4">Foto Profil</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 shadow-soft" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-medium to-primary-dark text-white flex items-center justify-center text-3xl font-bold shadow-soft">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" icon={Camera}>Ubah Foto</Button>
            {avatarUrl && (
              <Button onClick={handleRemoveAvatar} variant="danger" icon={Trash2}>Hapus Foto</Button>
            )}
          </div>
        </div>
        {uploadError && <p className="text-sm text-error mt-2">{uploadError}</p>}
        <p className="text-caption text-gray-400 mt-2">Format: JPG, PNG, GIF. Maksimal 1 MB.</p>
      </Card>

      {/* Section 2: Account Info */}
      <Card>
        <h2 className="text-h3 font-semibold text-primary-dark mb-4">Informasi Akun</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-caption text-gray-500 flex items-center gap-1"><User size={12} /> Username</p>
            <p className="font-medium mt-0.5">@{user.username}</p>
          </div>

          {role === "siswa" && siswaProfile && (
            <>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-caption text-gray-500">NISN</p>
                <p className="font-medium mt-0.5">{siswaProfile.nisn}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-caption text-gray-500">Nama Lengkap</p>
                <p className="font-medium mt-0.5">{siswaProfile.nama_siswa}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-caption text-gray-500">Angkatan</p>
                <p className="font-medium mt-0.5">{siswaProfile.angkatan_tahun}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-caption text-gray-500 flex items-center gap-1"><GraduationCap size={12} /> Guru BK Pembimbing</p>
                <p className="font-medium mt-0.5">{guruBkLoaded ? (guruBkNama || "Belum ditugaskan") : "Memuat..."}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-caption text-gray-500">Status Kuesioner</p>
                <p className="font-medium mt-0.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${siswaProfile.status_kuesioner === "selesai" ? "bg-success" : "bg-warning"}`} />
                  {siswaProfile.status_kuesioner === "selesai" ? "Sudah dikerjakan" : "Belum dikerjakan"}
                </p>
              </div>
            </>
          )}

          {role === "guru_bk" && (
            <>
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-caption text-gray-500 flex items-center gap-1"><Shield size={12} /> Nama</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light transition"
                    placeholder="Nama lengkap Anda"
                  />
                  <Button onClick={handleSaveNama} icon={Save}>Simpan</Button>
                </div>
                {namaError && <p className="text-sm text-error mt-1">{namaError}</p>}
                {namaSuccess && <p className="text-sm text-success mt-1 flex items-center gap-1"><CheckCircle size={14} />{namaSuccess}</p>}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-caption text-gray-500 flex items-center gap-1"><BookOpen size={12} /> Peran</p>
                <p className="font-medium mt-0.5">Guru Bimbingan Konseling (BK)</p>
              </div>
            </>
          )}

          {role === "admin" && (
            <>
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-caption text-gray-500 flex items-center gap-1"><Shield size={12} /> Nama</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light transition"
                    placeholder="Nama lengkap Anda"
                  />
                  <Button onClick={handleSaveNama} icon={Save}>Simpan</Button>
                </div>
                {namaError && <p className="text-sm text-error mt-1">{namaError}</p>}
                {namaSuccess && <p className="text-sm text-success mt-1 flex items-center gap-1"><CheckCircle size={14} />{namaSuccess}</p>}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-caption text-gray-500 flex items-center gap-1"><Shield size={12} /> Peran</p>
                <p className="font-medium mt-0.5">Administrator</p>
              </div>
            </>
          )}

          {role === "orang_tua" && ortuProfile && (
            <>
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-caption text-gray-500 flex items-center gap-1"><Heart size={12} /> Nama Lengkap</p>
                <p className="font-medium mt-0.5">{ortuProfile.nama_orang_tua}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-caption text-gray-500 flex items-center gap-1"><GraduationCap size={12} /> Anak Terdaftar</p>
                <p className="font-medium mt-0.5">{ortuProfile.linked_nama_siswa || "-"}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Section 3: Change Password */}
      <Card>
        <h2 className="text-h3 font-semibold text-primary-dark mb-4 flex items-center gap-2">
          <KeyRound size={20} className="text-primary-medium" />
          Ubah Password
        </h2>
        <div className="space-y-3">
          <Input label="Password Lama" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Masukkan password saat ini" icon={KeyRound} />
          <Input label="Password Baru" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
          <Input label="Konfirmasi Password Baru" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ketik ulang password baru" />
          {passwordError && <p className="text-sm text-error">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-success flex items-center gap-1"><CheckCircle size={14} />{passwordSuccess}</p>}
          <Button onClick={handleChangePassword} icon={KeyRound}>Simpan Password Baru</Button>
        </div>
      </Card>
    </div>
  );
}
