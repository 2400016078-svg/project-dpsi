import { useState, useEffect } from "react";
import { Card, EmptyState } from "../../components/UI";
import { getBkNotes, getSiswaProfiles, getResults } from "../../services/supabaseData";
import { MessageSquareText, NotebookPen } from "lucide-react";

export default function RiwayatCatatan() {
  const [enriched, setEnriched] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [notes, siswas, results] = await Promise.all([getBkNotes(), getSiswaProfiles(), getResults()]);
      const e = notes.map((n) => {
        const result = results.find((r) => r.id === n.id_result);
        const siswa = result ? siswas.find((s) => s.id === result.id_siswa) : null;
        return { ...n, nama_siswa: siswa ? siswa.nama_siswa : "-" };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setEnriched(e);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-h2">Riwayat Catatan Konseling</h1>
      <Card>
        {enriched.length === 0 ? (
          <EmptyState icon={NotebookPen} message="Belum ada catatan konseling." />
        ) : (
          <div className="space-y-3">
            {enriched.map((n) => (
              <div key={n.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-medium to-primary-dark text-white flex items-center justify-center text-xs font-bold">
                    {n.nama_siswa.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800">{n.nama_siswa}</span>
                  </div>
                  <span className="text-caption text-gray-400">{new Date(n.created_at).toLocaleString("id-ID")}</span>
                </div>
                <p className="text-sm text-gray-600 ml-11">{n.teks_catatan}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
