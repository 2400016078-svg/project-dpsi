import { useState, useEffect, useCallback } from "react";
import { Card, Badge } from "../../components/UI";
import { getSupabaseUsers } from "../../services/supabaseAuth";
import { getSiswaProfiles, getOrtuProfiles } from "../../services/supabaseData";
import { Users, Shield, BookOpen, GraduationCap, UserCheck, Heart, RefreshCw, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [siswas, setSiswas] = useState([]);
  const [ortus, setOrtus] = useState([]);
  const [counts, setCounts] = useState({ admin: 0, guru_bk: 0, siswa: 0, orang_tua: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [users, allSiswas, allOrtus] = await Promise.all([
        getSupabaseUsers(),
        getSiswaProfiles(),
        getOrtuProfiles(),
      ]);
      setSiswas(allSiswas);
      setOrtus(allOrtus);
      const c = { admin: 0, guru_bk: 0, siswa: 0, orang_tua: 0 };
      users.forEach((u) => { if (c[u.role] !== undefined) c[u.role]++; });
      setCounts(c);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("fetchData error:", err.message);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, []);

  useEffect(() => { fetchData(false); }, [fetchData]);

  if (loading) return null;

  const enrichedOrtus = ortus.map((o) => {
    const siswa = siswas.find((s) => s.id === o.id_siswa);
    return { ...o, anak_nama: siswa ? siswa.nama_siswa : "-" };
  });

  const metrics = [
    { label: "Total Akun", value: Object.values(counts).reduce((a, b) => a + b, 0), icon: Users, color: "text-primary-dark", bg: "bg-blue-50" },
    { label: "Admin", value: counts.admin, icon: Shield, color: "text-error", bg: "bg-error-light" },
    { label: "Guru BK", value: counts.guru_bk, icon: BookOpen, color: "text-accent-teal", bg: "bg-accent-teal-light" },
    { label: "Siswa", value: counts.siswa, icon: GraduationCap, color: "text-primary-medium", bg: "bg-blue-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h2">Beranda Admin</h1>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-sm text-primary-medium hover:text-primary-dark disabled:text-gray-300 transition font-medium"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Memuat Ulang..." : "Muat Ulang"}
        </button>
      </div>
      {lastUpdated && (
        <p className="text-caption text-gray-400 flex items-center gap-1 -mt-2">
          <Clock size={12} />
          Terakhir diperbarui: {lastUpdated.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
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
        <h2 className="text-h3 font-semibold mb-3">Ringkasan Sistem</h2>
        <div className="text-sm space-y-2">
          <p className="flex items-center gap-2">
            <GraduationCap size={16} className="text-primary-medium" />
            Total profil siswa: <strong>{siswas.length}</strong>
          </p>
          <p className="flex items-center gap-2">
            <UserCheck size={16} className="text-success" />
            Siswa sudah selesai kuesioner: <strong>{siswas.filter((s) => s.status_kuesioner === "selesai").length}</strong>
          </p>
          <p className="flex items-center gap-2">
            <Users size={16} className="text-accent-teal" />
            Orang Tua terdaftar: <strong>{ortus.length}</strong>
          </p>
        </div>
      </Card>

      {siswas.length > 0 && (
        <Card>
          <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
            <GraduationCap size={20} className="text-primary-medium" />
            Siswa Terdaftar
          </h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b text-left text-caption text-gray-500">
                  <th className="py-2 px-2">No</th>
                  <th className="py-2 px-2">Nama</th>
                  <th className="py-2 px-2">NISN</th>
                  <th className="py-2 px-2">Angkatan</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {siswas.map((s, i) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                    <td className="py-2 px-2 font-medium">{s.nama_siswa}</td>
                    <td className="py-2 px-2 text-gray-500 font-mono text-xs">{s.nisn}</td>
                    <td className="py-2 px-2">{s.angkatan_tahun}</td>
                    <td className="py-2 px-2">
                      <Badge color={s.status_kuesioner === "selesai" ? "green" : "yellow"}>
                        {s.status_kuesioner === "selesai" ? "Selesai" : "Belum"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </Card>
      )}

      {ortus.length > 0 && (
        <Card>
          <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
            <Heart size={20} className="text-accent-teal" />
            Orang Tua Terdaftar
          </h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b text-left text-caption text-gray-500">
                  <th className="py-2 px-2">No</th>
                  <th className="py-2 px-2">Nama</th>
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">Anak</th>
                </tr>
              </thead>
              <tbody>
                {enrichedOrtus.map((o, i) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                    <td className="py-2 px-2 font-medium">{o.nama_orang_tua}</td>
                    <td className="py-2 px-2 text-gray-500">{o.email_orang_tua}</td>
                    <td className="py-2 px-2">{o.anak_nama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
