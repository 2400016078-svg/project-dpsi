import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Card, Button, Badge, Chart } from "../../components/UI";
import { getResultBySiswaId, getNotesByResultId } from "../../services/supabaseData";
import { getActiveLinkCode, createLinkCode, revokeActiveLinkCodes, getGuruBkName, getSiswaProfileByUserId } from "../../services/supabaseAuth";
import { ClipboardList, Target, MessageSquareText, BookOpen, AlertTriangle, KeyRound, Copy, RefreshCw, Check, Clock } from "lucide-react";

export default function SiswaDashboard() {
  const { user, siswaProfile: profile } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [guruBkNama, setGuruBkNama] = useState("");
  const [guruBkLoaded, setGuruBkLoaded] = useState(false);

  const loadLinkCode = async (siswaId) => {
    const active = await getActiveLinkCode(siswaId);
    setLinkCode(active);
  };

  const loadData = useCallback(async (isRefresh) => {
    if (!profile) { if (!isRefresh) setLoading(false); return; }
    if (isRefresh) setRefreshing(true);
    try {
      const freshProfile = await getSiswaProfileByUserId(user.id);
      console.log("SiswaDashboard freshProfile:", freshProfile);
      const p = freshProfile || profile;
      const sudahSelesai = p.status_kuesioner === "selesai";
      if (sudahSelesai) {
        const r = await getResultBySiswaId(p.id);
        setResult(r);
        if (r) {
          const ns = await getNotesByResultId(r.id);
          setNotes(ns);
        }
      }
      await loadLinkCode(p.id);
      if (p.id_guru_bk) {
        try {
          console.log("SiswaDashboard id_guru_bk:", p.id_guru_bk);
          const nama = await getGuruBkName(p.id_guru_bk);
          console.log("SiswaDashboard guruBkNama result:", nama);
          if (nama) setGuruBkNama(nama);
        } catch (err) {
          console.error("getGuruBkName error:", err.message);
        } finally {
          setGuruBkLoaded(true);
        }
      } else {
        console.log("SiswaDashboard id_guru_bk is null — showing Belum ditugaskan");
        setGuruBkLoaded(true);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("loadData error:", err.message);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, [profile?.id, user?.id]);

  useEffect(() => { loadData(false); }, [loadData]);

  const handleCopy = () => {
    if (!linkCode) return;
    navigator.clipboard.writeText(linkCode.kode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!profile) return;
    setGenerating(true);
    await revokeActiveLinkCodes(profile.id);
    const result = await createLinkCode(profile.id);
    if (result.success) {
      setLinkCode(result.data);
    }
    setCopied(false);
    setGenerating(false);
  };

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center mx-auto">
              <AlertTriangle size={28} className="text-error" />
            </div>
            <p className="text-lg font-semibold text-error">Profil siswa tidak ditemukan.</p>
            <p className="text-sm text-gray-500">
              Akun Anda belum memiliki data profil siswa. Silakan gunakan menu <strong>Daftar Akun</strong> untuk mendaftar ulang dengan NISN Anda.
            </p>
            <Link to="/register/siswa">
              <Button>Daftar Ulang dengan NISN</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) return null;
  const sudahSelesai = profile.status_kuesioner === "selesai";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-h3 font-semibold text-primary-dark">Selamat Datang, {profile.nama_siswa}!</h2>
            <p className="text-sm text-gray-500 mt-1">NISN: {profile.nisn} &middot; Angkatan {profile.angkatan_tahun}</p>
            <p className="text-sm text-gray-500 mt-1">Guru BK Pembimbing: <strong>{guruBkNama || (guruBkLoaded ? "Belum ditugaskan" : "Memuat...")}</strong></p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1 text-xs text-primary-medium hover:text-primary-dark disabled:text-gray-300 transition font-medium"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memuat..." : "Muat Ulang"}
            </button>
            {lastUpdated && (
              <span className="text-caption text-gray-400 flex items-center gap-1">
                <Clock size={10} />
                {lastUpdated.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
          <KeyRound size={20} className="text-accent-teal" />
          Kode Tautan Orang Tua
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Berikan kode ini ke orang tua Anda agar mereka dapat mendaftar dan memantau hasil kuesioner Anda.
        </p>
        {linkCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-accent-teal-light rounded-xl">
              <span className="text-lg font-mono font-bold tracking-wider text-accent-teal select-all">{linkCode.kode}</span>
              <button
                onClick={handleCopy}
                className="ml-auto p-2 rounded-lg hover:bg-accent-teal/10 transition"
                title="Salin kode"
              >
                {copied ? <Check size={18} className="text-success" /> : <Copy size={18} className="text-accent-teal" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Berlaku hingga: {new Date(linkCode.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <Button
              onClick={handleRegenerate}
              disabled={generating}
              variant="secondary"
              icon={RefreshCw}
              className="w-full"
            >
              {generating ? "Memproses..." : "Buat Kode Baru"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Belum ada kode tautan aktif.</p>
            <Button onClick={handleRegenerate} disabled={generating} icon={KeyRound} className="w-full">
              {generating ? "Memproses..." : "Buat Kode Tautan"}
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-h3 font-semibold mb-2">Status Kuesioner</h3>
        <div className="flex items-center gap-3 mb-4">
          <Badge color={sudahSelesai ? "green" : "yellow"}>{sudahSelesai ? "Selesai" : "Belum Dikerjakan"}</Badge>
        </div>
        {sudahSelesai ? (
          <div className="p-3 bg-warning-light text-warning rounded-xl text-sm flex items-center gap-2">
            <ClipboardList size={16} />
            Anda telah mengisi kuesioner. Formulir telah terkunci permanen.
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Silakan mengisi kuesioner minat dan kepribadian untuk mengetahui kecocokan Anda terhadap jurusan <strong>Multimedia/DKV</strong> dan <strong>TBSM</strong>.
            </p>
            <div className="p-3 bg-warning-light text-warning rounded-xl text-sm mb-4 flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span><strong>Perhatian:</strong> Kuesioner hanya dapat diisi <strong>1 (satu) kali</strong>. Pastikan Anda menjawab dengan jujur dan teliti.</span>
            </div>
            <Button onClick={() => navigate("/siswa/kuesioner")} icon={ClipboardList}>Mulai Isi Kuesioner</Button>
          </>
        )}
      </Card>

      {result && (
        <Card>
          <h3 className="text-h3 font-semibold mb-4 flex items-center gap-2">
            <Target size={20} className="text-primary-medium" />
            Hasil Analisis Minat
          </h3>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <Chart skorMultimedia={result.skor_multimedia} skorTbsm={result.skor_tbsm} />
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-sm">
            <strong>Rekomendasi Jurusan:</strong> {result.rekomendasi_final}
          </div>
        </Card>
      )}

      {result && (
        <Card>
          <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
            <MessageSquareText size={20} className="text-primary-medium" />
            Catatan dari Guru BK
          </h3>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada catatan dari Guru BK.</p>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="p-3 bg-gray-50 rounded-xl text-sm">
                  <p className="text-xs text-gray-500 mb-1">{new Date(n.created_at).toLocaleString("id-ID")}</p>
                  <p>{n.teks_catatan}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <h3 className="text-h3 font-semibold mb-2">Informasi Jurusan</h3>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl flex items-start gap-2">
            <BookOpen size={16} className="mt-0.5 shrink-0" />
            <span><strong>Multimedia / DKV:</strong> Desain grafis, animasi, fotografi, videografi, dan industri kreatif digital.</span>
          </div>
          <div className="p-3 bg-accent-teal-light text-accent-teal rounded-xl flex items-start gap-2">
            <BookOpen size={16} className="mt-0.5 shrink-0" />
            <span><strong>TBSM (Teknik dan Bisnis Sepeda Motor):</strong> Otomotif, perbaikan mesin, bisnis sparepart, dan kewirausahaan teknik.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
