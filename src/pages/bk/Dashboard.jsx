import { useState, useEffect, useCallback } from "react";
import { Card, EmptyState } from "../../components/UI";
import { useAuth } from "../../store/AuthContext";
import { getSiswaByGuruBk, getResults, getBkNotes, getJurusan } from "../../services/supabaseData";
import { getJurusanColor } from "../../utils/jurusanColors";
import { Users, ClipboardCheck, Clock, GraduationCap, RefreshCw } from "lucide-react";

export default function BkDashboard() {
  const { user } = useAuth();
  const [siswas, setSiswas] = useState([]);
  const [results, setResults] = useState([]);
  const [notes, setNotes] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [s, r, n, jur] = await Promise.all([getSiswaByGuruBk(user?.id), getResults(), getBkNotes(), getJurusan()]);
      setSiswas(s || []);
      setResults(r);
      setNotes(n);
      setJurusanList(jur);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("fetchData error:", err.message);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchData(false); }, [fetchData]);

  if (loading) return null;

  const totalSiswa = siswas.length;
  const sudahMengerjakan = siswas.filter((s) => s.status_kuesioner === "selesai").length;
  const belumMengerjakan = totalSiswa - sudahMengerjakan;
  // getResults()/getBkNotes() return data for ALL Guru BK, not just this one — every
  // metric below must only ever count this Guru BK's own students (siswas, already
  // scoped via getSiswaByGuruBk), otherwise counts leak across Guru BK accounts
  const siswaIds = new Set(siswas.map((s) => s.id));
  const myResults = results.filter((r) => siswaIds.has(r.id_siswa));
  const siswaDenganNote = myResults.filter((r) => notes.some((n) => n.id_result === r.id)).length;
  const rekomendasiPerJurusan = jurusanList.map((j) => ({
    id: j.id,
    nama: j.nama,
    count: myResults.filter((r) => r.rekomendasi_final === j.nama).length,
  }));

  const metrics = [
    { label: "Total Siswa", value: totalSiswa, icon: Users, color: "text-primary-dark", bg: "bg-blue-50" },
    { label: "Sudah Kuesioner", value: sudahMengerjakan, icon: ClipboardCheck, color: "text-success", bg: "bg-success-light" },
    { label: "Belum Kuesioner", value: belumMengerjakan, icon: Clock, color: "text-warning", bg: "bg-warning-light" },
    ...rekomendasiPerJurusan.map((r, i) => {
      const color = getJurusanColor(i);
      return { label: `Rekom. ${r.nama}`, value: r.count, icon: GraduationCap, color: color.text, bg: color.bg };
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h2 font-heading">Beranda BK</h1>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-sm text-primary-medium hover:text-primary-dark disabled:text-gray-300 transition font-medium"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Memuat Ulang..." : "Muat Ulang"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <Icon size={20} className={m.color} />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">{m.value}</p>
              <p className="text-caption text-gray-500 mt-0.5">{m.label}</p>
            </Card>
          );
        })}
      </div>
      {lastUpdated && (
        <p className="text-caption text-gray-400 flex items-center gap-1 -mt-2">
          <Clock size={12} />
          Terakhir diperbarui: {lastUpdated.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
      {sudahMengerjakan > 0 && (
        <Card>
          <h2 className="text-h3 font-semibold mb-3">Rekomendasi Minat</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {rekomendasiPerJurusan.map((r, i) => {
              const color = getJurusanColor(i);
              return (
                <span key={r.id} className="flex items-center gap-1.5">
                  <GraduationCap size={16} className={color.text} />
                  {r.nama}: <strong>{r.count}</strong> siswa
                </span>
              );
            })}
            <span className="text-gray-400">|</span>
            <span className="text-success font-medium">{sudahMengerjakan} total sudah kuesioner</span>
          </div>
        </Card>
      )}
      <Card>
        <h2 className="text-h3 font-semibold mb-2">Ringkasan Catatan</h2>
        <p className="text-sm">Siswa sudah diberi catatan: <strong>{siswaDenganNote}</strong> dari <strong>{myResults.length}</strong> yang sudah mengerjakan.</p>
        <p className="text-sm text-gray-500 mt-1">Belum diberi catatan: <strong>{myResults.length - siswaDenganNote}</strong></p>
      </Card>
    </div>
  );
}
