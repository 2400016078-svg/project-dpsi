import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Table, Select, EmptyState } from "../../components/UI";
import { useAuth } from "../../store/AuthContext";
import { getAllAngkatans, getStudentsBimbingan } from "../../services/supabaseData";
import { Eye, Users, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { analisisMinat } from "../../utils/analisisMinat";

export default function DaftarSiswa() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [angkatans, setAngkatans] = useState([]);
  const [selectedAngkatan, setSelectedAngkatan] = useState(2026);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterPrioritas, setFilterPrioritas] = useState("semua");

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

  useEffect(() => {
    fetchStudents(false);
  }, [fetchStudents]);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-h2">Daftar Siswa Bimbingan</h1>
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
        <div className="flex items-center gap-3">
          <label className="text-caption text-gray-600 font-medium flex items-center gap-1">
            <AlertTriangle size={14} /> Prioritas:
          </label>
          <Select
            value={filterPrioritas}
            onChange={(e) => setFilterPrioritas(e.target.value)}
            options={[
              { value: "semua", label: "Semua" },
              { value: "seimbang", label: "Perlu Perhatian" },
              { value: "cenderung", label: "Cenderung" },
              { value: "jelas_condong", label: "Jelas Condong" },
              { value: "belum", label: "Belum Mengisi" },
            ]}
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
      <Card>
        {(() => {
          const withAnalysis = students.map((s) => ({
            ...s,
            analisis: s.status_kuesioner === "selesai" ? analisisMinat(s.skor_multimedia, s.skor_tbsm) : null,
          }));

          const filtered = filterPrioritas === "semua"
            ? withAnalysis
            : filterPrioritas === "belum"
              ? withAnalysis.filter((s) => !s.analisis)
              : withAnalysis.filter((s) => s.analisis?.category === filterPrioritas);

          const sorted = [...filtered].sort((a, b) => {
            const pa = a.analisis ? a.analisis.priority : 3;
            const pb = b.analisis ? b.analisis.priority : 3;
            return pa - pb;
          });

          return (
            <Table
              headers={["No", "Nama Siswa", "NISN", "Analisis Minat", "Status", "Rekomendasi", "Catatan BK", "Aksi"]}
              rows={sorted}
              renderRow={(s, i) => (
                <tr key={s.siswa_id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-3 text-gray-500">{i + 1}</td>
                  <td className="py-3 px-3 font-medium">{s.nama_siswa}</td>
                  <td className="py-3 px-3 text-gray-500 font-mono text-xs">{s.nisn}</td>
                  <td className="py-3 px-3">
                    {s.analisis ? (
                      <Badge color={s.analisis.badgeColor}>{s.analisis.badgeLabel}</Badge>
                    ) : (
                      <Badge color="gray">Belum mengisi</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <Badge color={s.status_kuesioner === "selesai" ? "green" : "yellow"}>
                      {s.status_kuesioner === "selesai" ? "Selesai" : "Belum"}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-sm">{s.rekomendasi_sistem || "-"}</td>
                  <td className="py-3 px-3">
                    <Badge color={s.status_catatan_bk === "sudah_diberikan" ? "green" : "gray"}>
                      {s.status_catatan_bk === "sudah_diberikan" ? "Sudah" : "Belum"}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => navigate(`/bk/siswa/${s.siswa_id}/konseling`)}
                      disabled={s.status_kuesioner !== "selesai"}
                      className="inline-flex items-center gap-1 text-sm text-primary-medium hover:text-primary-dark disabled:text-gray-300 disabled:cursor-not-allowed transition font-medium min-h-[44px]"
                    >
                      <Eye size={14} />
                      Detail
                    </button>
                  </td>
                </tr>
              )}
              renderMobileCard={(s, i) => (
                <div key={s.siswa_id} className="bg-white rounded-xl border border-gray-100 shadow-soft p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.nama_siswa}</p>
                      <p className="text-xs text-gray-500 font-mono">{s.nisn}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                      {s.analisis ? (
                        <Badge color={s.analisis.badgeColor}>{s.analisis.badgeLabel}</Badge>
                      ) : (
                        <Badge color="gray">Belum mengisi</Badge>
                      )}
                      <Badge color={s.status_kuesioner === "selesai" ? "green" : "yellow"}>
                        {s.status_kuesioner === "selesai" ? "Selesai" : "Belum"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Rekomendasi: <strong>{s.rekomendasi_sistem || "-"}</strong></span>
                    <Badge color={s.status_catatan_bk === "sudah_diberikan" ? "green" : "gray"}>
                      Catatan: {s.status_catatan_bk === "sudah_diberikan" ? "Ada" : "Belum"}
                    </Badge>
                  </div>
                  <button
                    onClick={() => navigate(`/bk/siswa/${s.siswa_id}/konseling`)}
                    disabled={s.status_kuesioner !== "selesai"}
                    className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm rounded-xl font-medium transition bg-primary-dark text-white hover:bg-primary-medium disabled:bg-gray-200 disabled:text-gray-400 min-h-[44px]"
                  >
                    <Eye size={16} />
                    Detail
                  </button>
                </div>
              )}
            />
          );
        })()}
        {students.length === 0 && <EmptyState icon={Users} message="Belum ada siswa di angkatan ini." />}
      </Card>
    </div>
  );
}
