import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Card, Button, Chart, Badge } from "../../components/UI";
import { getSiswaProfileById, resetUserPassword, getGuruBkName } from "../../services/supabaseAuth";
import { getResultBySiswaId, getNotesByResultId, addBkNote } from "../../services/supabaseData";
import { ArrowLeft, Save, MessageSquareText, Target, KeyRound, BookOpen } from "lucide-react";
import { analisisMinat } from "../../utils/analisisMinat";

export default function DetailSiswa() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetConfirmPass, setResetConfirmPass] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const [guruBkNama, setGuruBkNama] = useState("");

  useEffect(() => {
    (async () => {
      const p = await getSiswaProfileById(uuid);
      if (p && user?.role === "guru_bk" && p.id_guru_bk !== user.id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(p);
      if (!p) { setLoading(false); return; }
      if (p.id_guru_bk) {
        const nama = await getGuruBkName(p.id_guru_bk);
        if (nama) setGuruBkNama(nama);
      }
      const r = await getResultBySiswaId(p.id);
      setResult(r);
      if (r?.id) {
        const ns = await getNotesByResultId(r.id);
        setNotes(ns);
      }
      setLoading(false);
    })();
  }, [uuid, user?.id]);

  if (loading) return null;

  if (!profile || !result) {
    return (
      <Card>
        <p className="text-error">Siswa tidak ditemukan atau bukan bimbingan Anda.</p>
        <Button variant="secondary" onClick={() => navigate("/bk/siswa")} className="mt-4">Kembali</Button>
      </Card>
    );
  }

  const handleResetSubmit = async () => {
    setResetError("");
    setResetSuccess("");
    if (!resetNewPass || resetNewPass.length < 6) { setResetError("Password baru minimal 6 karakter."); return; }
    if (resetNewPass !== resetConfirmPass) { setResetError("Konfirmasi password tidak cocok."); return; }
    const res = await resetUserPassword(profile.id_user, resetNewPass, user.role);
    if (!res.success) { setResetError(res.message); return; }
    setResetSuccess(res.message);
    setResetNewPass("");
    setResetConfirmPass("");
  };

  const handleSaveNote = async () => {
    setError("");
    setSuccess("");
    if (!note.trim()) { setError("Catatan tidak boleh kosong."); return; }
    const res = await addBkNote(result.id, user.id, note);
    if (!res.success) { setError(res.code === "CATATAN_KOSONG" ? "Catatan tidak boleh kosong." : "Gagal menyimpan."); return; }
    setNotes([...notes, res.data]);
    setNote("");
    setSuccess("Catatan berhasil disimpan.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/bk/siswa")} icon={ArrowLeft}>Kembali ke Daftar Siswa</Button>

      <Card>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-medium to-primary-dark text-white flex items-center justify-center text-lg font-bold">
            {profile.nama_siswa.charAt(0)}
          </div>
          <div>
            <h2 className="text-h3 font-semibold text-primary-dark">{profile.nama_siswa}</h2>
            <p className="text-sm text-gray-500">NISN: {profile.nisn} &middot; Angkatan {profile.angkatan_tahun}</p>
            {guruBkNama && <p className="text-xs text-gray-400 mt-0.5">Guru BK Pembimbing: {guruBkNama}</p>}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-h3 font-semibold mb-4 flex items-center gap-2">
          <Target size={20} className="text-primary-medium" />
          Grafik Minat
        </h3>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
          <Chart skorMultimedia={result.skor_multimedia} skorTbsm={result.skor_tbsm} />
        </div>
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-sm">
          <strong>Rekomendasi Sistem:</strong> {result.rekomendasi_final}
        </div>
      </Card>

      {user?.role === "guru_bk" && (() => {
        const analysis = result ? analisisMinat(result.skor_multimedia, result.skor_tbsm) : null;
        return (
          <Card>
            <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
              <BookOpen size={20} className="text-purple-600" />
              Analisis Minat <span className="text-xs text-gray-400 font-normal">(untuk Guru BK)</span>
            </h3>
            {!analysis ? (
              <p className="text-sm text-gray-400">Siswa belum mengerjakan kuesioner.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <Badge color={analysis.badgeColor}>{analysis.badgeLabel}</Badge>
                  <span className="ml-2 text-xs font-semibold text-gray-500 uppercase">{analysis.label}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.text}</p>
                <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">
                  Analisis ini bersifat indikatif berdasarkan hasil kuesioner. Keputusan dan konseling tetap sepenuhnya berdasarkan penilaian Guru BK.
                </p>
              </div>
            )}
          </Card>
        );
      })()}

      <Card>
        <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
          <MessageSquareText size={20} className="text-primary-medium" />
          Catatan Konseling
        </h3>
        <div className="space-y-2 mb-4">
          {notes.length === 0 && <p className="text-sm text-gray-400">Belum ada catatan konseling.</p>}
          {notes.map((n) => (
            <div key={n.id} className="p-3 bg-gray-50 rounded-xl text-sm">
              <p className="text-gray-500 text-xs">{new Date(n.created_at).toLocaleString("id-ID")}</p>
              <p className="mt-1">{n.teks_catatan}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tulis catatan konseling..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light min-h-[80px] transition"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}
          <Button onClick={handleSaveNote} icon={Save}>Simpan Catatan</Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
          <KeyRound size={20} className="text-primary-medium" />
          Reset Password Siswa
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Atur password baru untuk akun <strong>{profile.nama_siswa}</strong>. Password lama tidak dapat dilihat.
        </p>
        {showReset ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                placeholder="Password baru (min. 6 karakter)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light transition"
              />
              <input
                type="password"
                value={resetConfirmPass}
                onChange={(e) => setResetConfirmPass(e.target.value)}
                placeholder="Ketik ulang password baru"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light transition"
              />
            </div>
            {resetError && <p className="text-sm text-error">{resetError}</p>}
            {resetSuccess && <p className="text-sm text-success">{resetSuccess}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setShowReset(false); setResetNewPass(""); setResetConfirmPass(""); setResetError(""); setResetSuccess(""); }} icon={KeyRound}>Batal</Button>
              <Button onClick={handleResetSubmit} icon={KeyRound}>Simpan Password Baru</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => { setShowReset(true); setResetError(""); setResetSuccess(""); }} icon={KeyRound}>Reset Password Siswa</Button>
        )}
      </Card>
    </div>
  );
}
