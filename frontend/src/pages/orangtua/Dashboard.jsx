import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { Card, Chart, Badge } from "../../components/UI";
import { getSiswaProfileById } from "../../services/supabaseAuth";
import { getResultBySiswaId, getNotesByResultId } from "../../services/supabaseData";
import { User, Target, MessageSquareText, BookOpen, Heart } from "lucide-react";

export default function OrtuDashboard() {
  const { user, ortuProfile: ortu } = useAuth();
  const [siswa, setSiswa] = useState(null);
  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ortu) { setLoading(false); return; }
    (async () => {
      const s = await getSiswaProfileById(ortu.id_siswa);
      setSiswa(s);
      if (s) {
        const r = await getResultBySiswaId(s.id);
        setResult(r);
        if (r) {
          const ns = await getNotesByResultId(r.id);
          setNotes(ns);
        }
      }
      setLoading(false);
    })();
  }, [ortu?.id_siswa]);

  if (!ortu) return <Card><p className="text-error">Profil Orang Tua tidak ditemukan.</p></Card>;
  if (loading) return null;
  if (!siswa) return <Card><p className="text-error">Data siswa tidak ditemukan.</p></Card>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-teal to-teal-600 text-white flex items-center justify-center">
            <Heart size={24} />
          </div>
          <div>
            <h2 className="text-h3 font-semibold text-primary-dark">Laporan Potensi Anak</h2>
            <p className="text-sm text-gray-500">Selamat datang, {ortu.nama_orang_tua}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
          <User size={20} className="text-primary-medium" />
          Data Siswa
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500">Nama</span>
            <p className="font-medium">{siswa.nama_siswa}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500">NISN</span>
            <p className="font-medium">{siswa.nisn}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500">Angkatan</span>
            <p className="font-medium">{siswa.angkatan_tahun}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500">Status Kuesioner</span>
            <div className="mt-1">
              <Badge color={siswa.status_kuesioner === "selesai" ? "green" : "yellow"}>
                {siswa.status_kuesioner === "selesai" ? "Selesai" : "Belum Dikerjakan"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {result ? (
        <>
          <Card>
            <h3 className="text-h3 font-semibold mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary-medium" />
              Hasil Analisis Minat
            </h3>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <Chart scores={result.scores} />
            </div>
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-sm">
              <strong>Rekomendasi Jurusan:</strong> {result.rekomendasi_final}
            </div>
          </Card>
          <Card>
            <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
              <MessageSquareText size={20} className="text-primary-medium" />
              Catatan Konseling Guru BK
            </h3>
            {notes.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada catatan konseling dari Guru BK.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-xl text-sm">
                    <p className="text-gray-500 text-xs">{new Date(n.created_at).toLocaleString("id-ID")}</p>
                    <p className="mt-1">{n.teks_catatan}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-gray-400" />
            <p className="text-sm text-gray-500">Siswa belum mengisi kuesioner. Hasil akan muncul setelah kuesioner dikerjakan.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
