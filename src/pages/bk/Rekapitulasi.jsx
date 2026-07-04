import { useState, useEffect, useCallback } from "react";
import { Card, Chart, Select, EmptyState } from "../../components/UI";
import { useAuth } from "../../store/AuthContext";
import { getAllAngkatans, getStudentsBimbingan, getJurusan } from "../../services/supabaseData";
import { getJurusanColor } from "../../utils/jurusanColors";
import { Users, ClipboardCheck, GraduationCap, BarChart3, RefreshCw, Clock } from "lucide-react";

export default function Rekapitulasi() {
  const { user } = useAuth();
  const [angkatans, setAngkatans] = useState([]);
  const [selectedAngkatan, setSelectedAngkatan] = useState(2026);
  const [students, setStudents] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
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
      const [s, jur] = await Promise.all([getStudentsBimbingan(selectedAngkatan, user?.id), getJurusan()]);
      setStudents(s);
      setJurusanList(jur);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("fetchStudents error:", err.message);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, [selectedAngkatan, user?.id]);

  useEffect(() => { fetchStudents(false); }, [fetchStudents]);

  if (loading) return null;

  const doneStudents = students.filter((s) => s.status_kuesioner === "selesai");
  const jurusanAverages = jurusanList.map((j) => {
    const nilai = doneStudents
      .map((s) => s.scores.find((sc) => sc.id_jurusan === j.id)?.skor)
      .filter((v) => v != null);
    const avg = nilai.length > 0 ? Math.round((nilai.reduce((a, b) => a + b, 0) / nilai.length) * 100) / 100 : 0;
    return { id_jurusan: j.id, nama: j.nama, skor: avg };
  });
  const rekomendasiPerJurusan = jurusanList.map((j) => ({
    id: j.id,
    nama: j.nama,
    count: doneStudents.filter((s) => s.rekomendasi_sistem === j.nama).length,
  }));
  const belumCatatan = doneStudents.filter((s) => s.status_catatan_bk === "belum_diberikan").length;

  const metrics = [
    { label: "Total Siswa", value: students.length, icon: Users, color: "text-primary-dark", bg: "bg-blue-50" },
    { label: "Selesai Kuesioner", value: doneStudents.length, icon: ClipboardCheck, color: "text-success", bg: "bg-success-light" },
    ...rekomendasiPerJurusan.map((r, i) => {
      const color = getJurusanColor(i);
      return { label: `Rekom. ${r.nama}`, value: r.count, icon: GraduationCap, color: color.text, bg: color.bg };
    }),
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
          <Chart scores={jurusanAverages} />
        </div>
      </Card>
      <Card>
        <h3 className="text-h3 font-semibold mb-2">Ringkasan Lainnya</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Siswa belum diberi catatan BK: <strong>{belumCatatan}</strong>
          </li>
          {jurusanAverages.map((j, i) => {
            const color = getJurusanColor(i);
            return (
              <li key={j.id_jurusan} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: color.hex }} />
                Rata-rata skor {j.nama}: <strong>{j.skor}%</strong>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
