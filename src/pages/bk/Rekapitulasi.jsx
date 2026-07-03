import { useState, useEffect, useCallback } from "react";
import { Card, Chart, Select, EmptyState } from "../../components/UI";
import { useAuth } from "../../store/AuthContext";
import { getAllAngkatans, getStudentsBimbingan } from "../../services/supabaseData";
import { Users, ClipboardCheck, Monitor, Wrench, BarChart3, RefreshCw, Clock } from "lucide-react";

export default function Rekapitulasi() {
  const { user } = useAuth();
  const [angkatans, setAngkatans] = useState([]);
  const [selectedAngkatan, setSelectedAngkatan] = useState(2026);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    (async () => {
      const a = await getAllAngkatans();
      setAngkatans(a);
      if (a.length > 0) setSelectedAngkatan(a[0]);
    })();
  }, []);

  const fetchStudents = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const s = await getStudentsBimbingan(selectedAngkatan, user?.id);
      setStudents(s);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("fetchStudents error:", err.message);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, [selectedAngkatan, user?.id]);

  useEffect(() => { fetchStudents(false); }, [fetchStudents]);

  if (loading) return null;

  const doneStudents = students.filter((s) => s.status_kuesioner === "selesai");
  const avgMultimedia = doneStudents.length > 0
    ? Math.round(doneStudents.reduce((sum, s) => sum + s.skor_multimedia, 0) / doneStudents.length * 100) / 100
    : 0;
  const avgTbsm = doneStudents.length > 0
    ? Math.round(doneStudents.reduce((sum, s) => sum + s.skor_tbsm, 0) / doneStudents.length * 100) / 100
    : 0;
  const rekomendasiMM = doneStudents.filter((s) => s.rekomendasi_sistem === "Multimedia / DKV").length;
  const rekomendasiTBSM = doneStudents.filter((s) => s.rekomendasi_sistem === "TBSM").length;
  const belumCatatan = doneStudents.filter((s) => s.status_catatan_bk === "belum_diberikan").length;

  const metrics = [
    { label: "Total Siswa", value: students.length, icon: Users, color: "text-primary-dark", bg: "bg-blue-50" },
    { label: "Selesai Kuesioner", value: doneStudents.length, icon: ClipboardCheck, color: "text-success", bg: "bg-success-light" },
    { label: "Rekom. Multimedia/DKV", value: rekomendasiMM, icon: Monitor, color: "text-info", bg: "bg-cyan-50" },
    { label: "Rekom. TBSM", value: rekomendasiTBSM, icon: Wrench, color: "text-accent-orange", bg: "bg-accent-orange-light" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h2">Rekapitulasi Angkatan</h1>
        <button
          onClick={() => fetchStudents(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-sm text-primary-medium hover:text-primary-dark disabled:text-gray-300 transition font-medium"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Memuat Ulang..." : "Muat Ulang"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <label className="text-caption text-gray-600 font-medium">Angkatan:</label>
          <Select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(parseInt(e.target.value))}
            options={angkatans.map((a) => ({ value: a, label: `Angkatan ${a}` }))}
            className="w-44"
          />
        </div>
        {lastUpdated && (
          <span className="text-caption text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {lastUpdated.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <Card>
        <h3 className="text-h3 font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary-medium" />
          Rata-rata Persentase Minat Angkatan {selectedAngkatan}
        </h3>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
          <Chart skorMultimedia={avgMultimedia} skorTbsm={avgTbsm} />
        </div>
      </Card>
      <Card>
        <h3 className="text-h3 font-semibold mb-2">Ringkasan Lainnya</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Siswa belum diberi catatan BK: <strong>{belumCatatan}</strong>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-light" />
            Rata-rata skor Multimedia/DKV: <strong>{avgMultimedia}%</strong>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-teal" />
            Rata-rata skor TBSM: <strong>{avgTbsm}%</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
}
