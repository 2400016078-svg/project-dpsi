import { useState, useEffect, useCallback } from "react";
import { Card, EmptyState } from "../../components/UI";
import { useAuth } from "../../store/AuthContext";
import { getSiswaByGuruBk, getResults, getBkNotes } from "../../services/supabaseData";
import { Users, ClipboardCheck, Clock, Monitor, Wrench, RefreshCw } from "lucide-react";

export default function BkDashboard() {
  const { user } = useAuth();
  const [siswas, setSiswas] = useState([]);
  const [results, setResults] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [s, r, n] = await Promise.all([getSiswaByGuruBk(user?.id), getResults(), getBkNotes()]);
      setSiswas(s || []);
      setResults(r);
      setNotes(n);
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
  const siswaDenganNote = results.filter((r) => notes.some((n) => n.id_result === r.id)).length;
  const rekomendasiMM = results.filter((r) => r.rekomendasi_final === "Multimedia / DKV").length;
  const rekomendasiTBSM = results.filter((r) => r.rekomendasi_final === "TBSM").length;

  const metrics = [
    { label: "Total Siswa", value: totalSiswa, icon: Users, color: "text-primary-dark", bg: "bg-blue-50" },
    { label: "Sudah Kuesioner", value: sudahMengerjakan, icon: ClipboardCheck, color: "text-success", bg: "bg-success-light" },
    { label: "Belum Kuesioner", value: belumMengerjakan, icon: Clock, color: "text-warning", bg: "bg-warning-light" },
    { label: "Rekom. Multimedia / DKV", value: rekomendasiMM, icon: Monitor, color: "text-info", bg: "bg-cyan-50" },
    { label: "Rekom. TBSM", value: rekomendasiTBSM, icon: Wrench, color: "text-accent-orange", bg: "bg-accent-orange-light" },
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
            <span className="flex items-center gap-1.5">
              <Monitor size={16} className="text-info" />
              Multimedia / DKV: <strong>{rekomendasiMM}</strong> siswa
            </span>
            <span className="flex items-center gap-1.5">
              <Wrench size={16} className="text-accent-orange" />
              TBSM: <strong>{rekomendasiTBSM}</strong> siswa
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-success font-medium">{sudahMengerjakan} total sudah kuesioner</span>
          </div>
        </Card>
      )}
      <Card>
        <h2 className="text-h3 font-semibold mb-2">Ringkasan Catatan</h2>
        <p className="text-sm">Siswa sudah diberi catatan: <strong>{siswaDenganNote}</strong> dari <strong>{results.length}</strong> yang sudah mengerjakan.</p>
        <p className="text-sm text-gray-500 mt-1">Belum diberi catatan: <strong>{results.length - siswaDenganNote}</strong></p>
      </Card>
    </div>
  );
}
