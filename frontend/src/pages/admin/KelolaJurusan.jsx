import { useState, useEffect, useRef } from "react";
import { Card, Button, Input, Table, Badge } from "../../components/UI";
import { getJurusan, addJurusan, updateJurusan, deleteJurusan, activateJurusan, insertJurusanBatch } from "../../services/supabaseData";
import { readSpreadsheetFile, downloadTemplate } from "../../utils/excelImport";
import { Plus, Pencil, Trash2, Power, X, AlertTriangle, GraduationCap, Save, RefreshCw, Clock, Upload, Download, FileSpreadsheet, Loader, CheckCircle } from "lucide-react";

export default function KelolaJurusan() {
  const [jurusanList, setJurusanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Bulk import state
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    const data = await getJurusan();
    setJurusanList(data);
    setLastUpdated(new Date());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setKode("");
    setNama("");
    setDeskripsi("");
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (j) => {
    setError(""); setSuccess("");
    setEditingId(j.id);
    setKode(j.kode);
    setNama(j.nama);
    setDeskripsi(j.deskripsi || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!kode.trim()) { setError("Kode jurusan harus diisi."); return; }
    if (!nama.trim()) { setError("Nama jurusan harus diisi."); return; }

    setSaving(true);
    const res = editingId
      ? await updateJurusan(editingId, kode.trim(), nama.trim(), deskripsi.trim())
      : await addJurusan(kode.trim(), nama.trim(), deskripsi.trim());

    if (!res.success) {
      setError(
        res.code === "DUPLICATE_KODE"
          ? "Kode jurusan sudah digunakan. Gunakan kode lain."
          : editingId ? "Gagal memperbarui jurusan. Silakan coba lagi." : "Gagal menambahkan jurusan. Silakan coba lagi."
      );
      setSaving(false);
      return;
    }

    setSuccess(res.message);
    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setError(""); setSuccess("");
    const res = await deleteJurusan(confirmDelete.id);
    if (!res.success) {
      setError(res.message || "Gagal menghapus jurusan.");
      setDeleting(false);
      setConfirmDelete(null);
      return;
    }
    setSuccess(res.message);
    setDeleting(false);
    setConfirmDelete(null);
    load();
  };

  const handleActivate = async (j) => {
    setError(""); setSuccess("");
    const res = await activateJurusan(j.id);
    if (!res.success) {
      setError(res.message || "Gagal mengaktifkan jurusan.");
      return;
    }
    setSuccess(res.message);
    load();
  };

  /* ───────── Bulk Import Jurusan ───────── */

  const handleDownloadTemplate = async () => {
    await downloadTemplate(
      "template_jurusan.xlsx",
      ["kode", "nama", "deskripsi"],
      [
        { kode: "rpl", nama: "Rekayasa Perangkat Lunak", deskripsi: "Pemrograman, pengembangan aplikasi, basis data." },
        { kode: "akl", nama: "Akuntansi dan Keuangan Lembaga", deskripsi: "Pembukuan, laporan keuangan, perpajakan." },
      ],
      [12, 32, 55],
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImportFile(file);
  };

  const handleImport = async () => {
    if (!importFile) { setError("Pilih file terlebih dahulu."); return; }

    setImportLoading(true);
    setError("");
    setImportReport(null);

    try {
      const data = await readSpreadsheetFile(importFile);
      if (!data || data.length === 0) { setError("File kosong atau format tidak sesuai."); setImportLoading(false); return; }

      const headers = Object.keys(data[0]).map((h) => h.toLowerCase().trim());
      if (!headers.includes("kode") || !headers.includes("nama")) {
        setError("Kolom file harus: kode, nama, deskripsi (opsional). Periksa header baris pertama."); setImportLoading(false); return;
      }

      const existingKodes = new Set(jurusanList.map((j) => j.kode.toLowerCase()));
      const validRows = [];
      const skipped = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const kode = String(row.kode || "").trim();
        const nama = String(row.nama || "").trim();
        const deskripsi = String(row.deskripsi || "").trim();

        if (!kode && !nama) continue; // blank row

        if (!kode) { skipped.push({ baris: i + 2, kode: "-", alasan: "Kode kosong" }); continue; }
        if (!nama) { skipped.push({ baris: i + 2, kode, alasan: "Nama kosong" }); continue; }

        if (existingKodes.has(kode.toLowerCase())) {
          skipped.push({ baris: i + 2, kode, alasan: "Kode sudah terdaftar" });
          continue;
        }
        if (validRows.some((v) => v.kode.toLowerCase() === kode.toLowerCase())) {
          skipped.push({ baris: i + 2, kode, alasan: "Kode duplikat dalam file" });
          continue;
        }

        validRows.push({ kode, nama, deskripsi: deskripsi || null });
      }

      if (validRows.length === 0) {
        setError("Tidak ada data valid untuk diimpor. Periksa file dan coba lagi."); setImportLoading(false); return;
      }

      const res = await insertJurusanBatch(validRows);
      if (!res.success) { setError("Gagal menyimpan data ke database."); setImportLoading(false); return; }

      setImportReport({ total: validRows.length, skipped: skipped.length, skippedDetail: skipped });
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (err) {
      console.error("Import jurusan error:", err.message);
      setError("Gagal membaca file. Pastikan format .xlsx atau .csv benar.");
    }
    setImportLoading(false);
  };

  const closeImport = () => {
    setShowImport(false);
    setImportFile(null);
    setImportReport(null);
    setImportLoading(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h2">Kelola Jurusan</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-sm text-primary-medium hover:text-primary-dark disabled:text-gray-300 transition font-medium"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Memuat Ulang..." : "Muat Ulang"}
          </button>
          <Button variant="outline" onClick={handleDownloadTemplate} icon={Download}>
            Unduh Template Jurusan
          </Button>
          <Button variant="secondary" onClick={() => setShowImport(true)} icon={Upload}>
            Impor Jurusan
          </Button>
          <Button onClick={showForm ? resetForm : openAddForm} icon={showForm ? X : Plus}>
            {showForm ? "Batal" : "Tambah Jurusan"}
          </Button>
        </div>
      </div>
      {lastUpdated && (
        <p className="text-caption text-gray-400 flex items-center gap-1 -mt-2">
          <Clock size={12} />
          Terakhir diperbarui: {lastUpdated.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      {showForm && (
        <Card>
          <h3 className="text-h3 font-semibold mb-3">{editingId ? "Edit Jurusan" : "Tambah Jurusan Baru"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Kode"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="Contoh: tkj"
            />
            <Input
              label="Nama Jurusan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Teknik Komputer dan Jaringan"
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <label className="text-caption text-gray-700 font-medium">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi singkat jurusan yang akan ditampilkan ke siswa."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light min-h-[80px] transition"
            />
          </div>
          {error && <p className="text-sm text-error mt-2">{error}</p>}
          {success && !error && <p className="text-sm text-success mt-2">{success}</p>}
          <div className="flex gap-2 mt-3">
            <Button onClick={handleSave} disabled={saving} icon={Save}>
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan"}
            </Button>
            <Button variant="secondary" onClick={resetForm} disabled={saving}>Batal</Button>
          </div>
        </Card>
      )}

      {/* ───── Import Modal ───── */}
      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeImport(); }}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 font-semibold flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-primary-medium" />
                Impor Jurusan
              </h3>
              <button onClick={closeImport} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>

            {!importReport ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Unggah file <strong>.xlsx</strong> atau <strong>.csv</strong> dengan kolom: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">kode, nama, deskripsi</code> (deskripsi opsional).
                </p>

                <div className="space-y-1.5">
                  <label className="text-caption text-gray-700 font-medium">Pilih File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-dark file:text-white hover:file:bg-primary-medium transition cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  Kode yang sudah terdaftar (aktif maupun nonaktif) akan dilewati agar tidak duplikat. Belum yakin formatnya? Klik "Unduh Template Jurusan" di atas.
                </div>

                {error && <p className="text-sm text-error">{error}</p>}

                <div className="flex gap-2">
                  <Button variant="secondary" onClick={closeImport} className="flex-1">Batal</Button>
                  <Button onClick={handleImport} disabled={importLoading || !importFile} className="flex-1" icon={importLoading ? Loader : Upload}>
                    {importLoading ? "Memproses..." : "Impor"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-success-light text-success rounded-2xl flex items-start gap-3">
                  <CheckCircle size={24} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Impor Selesai</p>
                    <p className="text-sm mt-1">
                      <strong>{importReport.total}</strong> jurusan berhasil ditambahkan
                      {importReport.skipped > 0 && <span>, <strong>{importReport.skipped}</strong> dilewati</span>}.
                    </p>
                  </div>
                </div>

                {importReport.skippedDetail.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-warning mb-1">Baris Dilewati ({importReport.skipped}):</p>
                    <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                      {importReport.skippedDetail.map((s, i) => (
                        <p key={i} className="text-gray-500">
                          Baris {s.baris} (Kode: {s.kode}) — {s.alasan}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={closeImport} className="w-full">Selesai</Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {!showForm && error && <p className="text-sm text-error">{error}</p>}
      {!showForm && success && <p className="text-sm text-success">{success}</p>}

      {confirmDelete && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-h3 mb-1">Hapus jurusan ini?</h3>
              <p className="text-sm text-gray-600 mb-1">
                Jurusan berikut akan dihapus:
              </p>
              <p className="text-sm text-gray-800 font-medium bg-gray-50 rounded-lg p-2 mb-2">
                "{confirmDelete.nama}"
              </p>
              <p className="text-xs text-gray-500 mb-2">
                Jika jurusan ini sudah tidak dipakai soal maupun hasil kuesioner siswa manapun, jurusan akan dihapus permanen. Jika masih dipakai, jurusan akan diarsipkan (dinonaktifkan) saja agar data siswa tetap aman — tidak akan ada data yang hilang atau rusak.
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="danger" onClick={handleDelete} disabled={deleting} icon={Trash2}>
                  {deleting ? "Memproses..." : "Ya, Hapus"}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {jurusanList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <GraduationCap size={48} className="mb-3" />
            <p className="text-sm">Belum ada data jurusan. Tambahkan jurusan pertama.</p>
          </div>
        ) : (
          <Table
            headers={["Kode", "Nama Jurusan", "Deskripsi", "Status", "Aksi"]}
            rows={jurusanList}
            renderRow={(j) => (
              <tr key={j.id} className={`hover:bg-gray-50 transition ${!j.is_active ? "opacity-60" : ""}`}>
                <td className="py-3 px-3 text-gray-500 font-mono text-xs">{j.kode}</td>
                <td className="py-3 px-3 font-medium">{j.nama}</td>
                <td className="py-3 px-3 text-sm text-gray-600 max-w-xs">{j.deskripsi || "-"}</td>
                <td className="py-3 px-3">
                  <Badge color={j.is_active ? "green" : "gray"}>{j.is_active ? "Aktif" : "Nonaktif"}</Badge>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openEditForm(j)} icon={Pencil}>Edit</Button>
                    {!j.is_active && (
                      <Button variant="secondary" onClick={() => handleActivate(j)} icon={Power}>Aktifkan</Button>
                    )}
                    <Button variant="danger" onClick={() => { setConfirmDelete(j); setError(""); setSuccess(""); }} icon={Trash2}>Hapus</Button>
                  </div>
                </td>
              </tr>
            )}
            renderMobileCard={(j) => (
              <div key={j.id} className={`bg-white rounded-xl border border-gray-100 shadow-soft p-4 space-y-2 ${!j.is_active ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      {j.nama}
                      <Badge color={j.is_active ? "green" : "gray"}>{j.is_active ? "Aktif" : "Nonaktif"}</Badge>
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{j.kode}</p>
                  </div>
                </div>
                {j.deskripsi && <p className="text-xs text-gray-500">{j.deskripsi}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openEditForm(j)} icon={Pencil} className="flex-1">Edit</Button>
                  {!j.is_active && (
                    <Button variant="secondary" onClick={() => handleActivate(j)} icon={Power} className="flex-1">Aktifkan</Button>
                  )}
                  <Button variant="danger" onClick={() => { setConfirmDelete(j); setError(""); setSuccess(""); }} icon={Trash2} className="flex-1">Hapus</Button>
                </div>
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
}
