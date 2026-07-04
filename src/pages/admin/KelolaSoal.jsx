import { useState, useEffect, useRef } from "react";
import { Card, Button, Input, Select, Table, Badge } from "../../components/UI";
import { getQuestions, addQuestion, updateQuestion, deleteQuestion, deleteQuestionsBulk, getJurusan, insertQuestionsBatch } from "../../services/supabaseData";
import { readSpreadsheetFile, downloadTemplate } from "../../utils/excelImport";
import { Plus, Pencil, Trash2, X, AlertTriangle, ListChecks, Save, RefreshCw, Clock, Upload, Download, FileSpreadsheet, Loader, CheckCircle } from "lucide-react";

const checkboxClass = "w-4 h-4 rounded border-gray-300 text-primary-dark focus:ring-primary-light cursor-pointer";

export default function KelolaSoal() {
  const [questions, setQuestions] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [teksPertanyaan, setTeksPertanyaan] = useState("");
  const [idJurusan, setIdJurusan] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Multi-select / bulk delete
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Bulk import state
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    const [qs, jur] = await Promise.all([getQuestions(), getJurusan()]);
    setQuestions(qs);
    setJurusanList(jur);
    setLastUpdated(new Date());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // New/edited questions may only be assigned to an active jurusan. If the question
  // being edited already points at a jurusan that has since been deactivated, that one
  // option is added back so saving doesn't silently reassign it to a different jurusan.
  const jurusanOptions = () => {
    const active = jurusanList.filter((j) => j.is_active);
    const options = active.map((j) => ({ value: j.id, label: j.nama }));
    const current = jurusanList.find((j) => j.id === idJurusan);
    if (current && !current.is_active && !options.some((o) => o.value === current.id)) {
      options.push({ value: current.id, label: `${current.nama} (Nonaktif)` });
    }
    return options;
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTeksPertanyaan("");
    setIdJurusan(jurusanList.find((j) => j.is_active)?.id || "");
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (q) => {
    setError(""); setSuccess("");
    setEditingId(q.id);
    setTeksPertanyaan(q.teks_pertanyaan);
    setIdJurusan(q.id_jurusan || jurusanList[0]?.id || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!teksPertanyaan.trim()) { setError("Teks pertanyaan harus diisi."); return; }
    if (!idJurusan) { setError("Jurusan harus dipilih."); return; }

    setSaving(true);
    const res = editingId
      ? await updateQuestion(editingId, teksPertanyaan.trim(), idJurusan)
      : await addQuestion(teksPertanyaan.trim(), idJurusan);

    if (!res.success) {
      setError(editingId ? "Gagal memperbarui soal. Silakan coba lagi." : "Gagal menambahkan soal. Silakan coba lagi.");
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
    const res = await deleteQuestion(confirmDelete.id);
    if (!res.success) {
      setError("Gagal menghapus soal. Kemungkinan soal ini sudah memiliki jawaban siswa yang tersimpan.");
      setDeleting(false);
      setConfirmDelete(null);
      return;
    }
    setSuccess(res.message);
    setDeleting(false);
    setSelectedIds((prev) => {
      if (!prev.has(confirmDelete.id)) return prev;
      const next = new Set(prev);
      next.delete(confirmDelete.id);
      return next;
    });
    setConfirmDelete(null);
    load();
  };

  /* ───────── Multi-select / Bulk Delete ───────── */

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectGroup = (items) => {
    const ids = items.map((q) => q.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const openBulkDeleteConfirm = () => {
    setConfirmDelete(null);
    setError(""); setSuccess("");
    setConfirmBulkDelete(true);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    setError(""); setSuccess("");
    const ids = Array.from(selectedIds);
    const res = await deleteQuestionsBulk(ids);
    if (!res.success) {
      setError("Gagal menghapus soal yang dipilih. Silakan coba lagi.");
      setBulkDeleting(false);
      setConfirmBulkDelete(false);
      return;
    }
    setSuccess(`${ids.length} soal berhasil dihapus.`);
    setBulkDeleting(false);
    setConfirmBulkDelete(false);
    clearSelection();
    load();
  };

  /* ───────── Bulk Import Soal ───────── */

  const handleDownloadTemplate = async () => {
    await downloadTemplate(
      "template_soal.xlsx",
      ["teks_pertanyaan", "kode_jurusan"],
      [
        { teks_pertanyaan: "Saya tertarik membuat program atau aplikasi menggunakan bahasa pemrograman.", kode_jurusan: "rpl" },
        { teks_pertanyaan: "Saya senang memasak dan mencoba resep makanan baru.", kode_jurusan: "kul" },
      ],
      [70, 20],
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
      if (!headers.includes("teks_pertanyaan") || !headers.includes("kode_jurusan")) {
        setError("Kolom file harus: teks_pertanyaan, kode_jurusan. Periksa header baris pertama."); setImportLoading(false); return;
      }

      const activeByKode = {};
      for (const j of jurusanList) {
        if (j.is_active) activeByKode[j.kode.toLowerCase()] = j;
      }

      const validRows = [];
      const skipped = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const teks = String(row.teks_pertanyaan || "").trim();
        const kodeJurusan = String(row.kode_jurusan || "").trim();

        if (!teks && !kodeJurusan) continue; // blank row

        if (!teks) { skipped.push({ baris: i + 2, kode_jurusan: kodeJurusan || "-", alasan: "Teks pertanyaan kosong" }); continue; }

        const jurusan = activeByKode[kodeJurusan.toLowerCase()];
        if (!jurusan) { skipped.push({ baris: i + 2, kode_jurusan: kodeJurusan || "-", alasan: "Kode jurusan tidak ditemukan atau tidak aktif" }); continue; }

        validRows.push({ teks_pertanyaan: teks, id_jurusan: jurusan.id });
      }

      if (validRows.length === 0) {
        setError("Tidak ada data valid untuk diimpor. Periksa file dan coba lagi."); setImportLoading(false); return;
      }

      const res = await insertQuestionsBatch(validRows);
      if (!res.success) { setError("Gagal menyimpan data ke database."); setImportLoading(false); return; }

      setImportReport({ total: validRows.length, skipped: skipped.length, skippedDetail: skipped });
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (err) {
      console.error("Import soal error:", err.message);
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

  const groupedQuestions = () => {
    return jurusanList
      .map((j) => ({ jurusan: j, items: questions.filter((q) => q.id_jurusan === j.id) }))
      .filter((g) => g.items.length > 0);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h2">Kelola Soal Kuesioner</h1>
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
            Unduh Template Soal
          </Button>
          <Button variant="secondary" onClick={() => setShowImport(true)} icon={Upload}>
            Impor Soal
          </Button>
          <Button onClick={showForm ? resetForm : openAddForm} icon={showForm ? X : Plus}>
            {showForm ? "Batal" : "Tambah Soal"}
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
          <h3 className="text-h3 font-semibold mb-3">{editingId ? "Edit Soal" : "Tambah Soal Baru"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Teks Pertanyaan"
                value={teksPertanyaan}
                onChange={(e) => setTeksPertanyaan(e.target.value)}
                placeholder="Contoh: Saya senang menggambar atau mendesain sesuatu secara visual."
              />
            </div>
            <Select label="Jurusan" value={idJurusan} onChange={(e) => setIdJurusan(e.target.value)} options={jurusanOptions()} />
          </div>
          {jurusanList.filter((j) => j.is_active).length === 0 && (
            <p className="text-sm text-warning mt-2">Belum ada jurusan aktif. Tambahkan atau aktifkan jurusan terlebih dahulu di menu Kelola Jurusan.</p>
          )}
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
                Impor Soal Kuesioner
              </h3>
              <button onClick={closeImport} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>

            {!importReport ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Unggah file <strong>.xlsx</strong> atau <strong>.csv</strong> dengan kolom: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">teks_pertanyaan, kode_jurusan</code>.
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
                  Hanya jurusan <strong>aktif</strong> yang dikenali. Kode jurusan yang tidak cocok akan dilewati dan dilaporkan. Belum yakin formatnya? Klik "Unduh Template Soal" di atas.
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
                      <strong>{importReport.total}</strong> soal berhasil ditambahkan
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
                          Baris {s.baris} (Kode: {s.kode_jurusan}) — {s.alasan}
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

      {selectedIds.size > 0 && (
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-medium text-primary-dark">{selectedIds.size} soal dipilih</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={clearSelection} disabled={bulkDeleting}>Batal</Button>
              <Button variant="danger" onClick={openBulkDeleteConfirm} disabled={bulkDeleting} icon={Trash2}>
                Hapus Terpilih
              </Button>
            </div>
          </div>
        </Card>
      )}

      {confirmBulkDelete && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-h3 mb-1">Apakah Anda yakin?</h3>
              <p className="text-sm text-gray-600 mb-2">
                Hapus <strong>{selectedIds.size}</strong> soal yang dipilih? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="danger" onClick={handleBulkDelete} disabled={bulkDeleting} icon={Trash2}>
                  {bulkDeleting ? "Menghapus..." : "Ya, Hapus"}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmBulkDelete(false)} disabled={bulkDeleting}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {confirmDelete && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-h3 mb-1">Apakah Anda yakin?</h3>
              <p className="text-sm text-gray-600 mb-1">
                Soal berikut akan dihapus secara permanen:
              </p>
              <p className="text-sm text-gray-800 font-medium bg-gray-50 rounded-lg p-2 mb-2">
                "{confirmDelete.teks_pertanyaan}"
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="danger" onClick={handleDelete} disabled={deleting} icon={Trash2}>
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {questions.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <ListChecks size={48} className="mb-3" />
            <p className="text-sm">Belum ada soal kuesioner. Tambahkan soal pertama.</p>
          </div>
        </Card>
      ) : (
        groupedQuestions().map(({ jurusan, items }) => {
          const groupIds = items.map((q) => q.id);
          const groupSelectedCount = groupIds.filter((id) => selectedIds.has(id)).length;
          const groupAllSelected = groupIds.length > 0 && groupSelectedCount === groupIds.length;
          const groupSomeSelected = groupSelectedCount > 0 && !groupAllSelected;
          return (
            <Card key={jurusan.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-h3 font-semibold flex items-center gap-2">
                  {jurusan.nama}
                  {!jurusan.is_active && <Badge color="gray">Nonaktif</Badge>}
                </h3>
                <span className="text-caption text-gray-400">{items.length} soal</span>
              </div>
              <Table
                headers={[
                  <input
                    type="checkbox"
                    checked={groupAllSelected}
                    ref={(el) => { if (el) el.indeterminate = groupSomeSelected; }}
                    onChange={() => toggleSelectGroup(items)}
                    aria-label={`Pilih semua soal di ${jurusan.nama}`}
                    className={checkboxClass}
                  />,
                  "ID", "Teks Pertanyaan", "Dibuat", "Aksi",
                ]}
                rows={items}
                renderRow={(q) => (
                  <tr key={q.id} className={`hover:bg-gray-50 transition ${selectedIds.has(q.id) ? "bg-blue-50/60" : ""}`}>
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(q.id)}
                        onChange={() => toggleSelect(q.id)}
                        aria-label={`Pilih soal ${q.id}`}
                        className={checkboxClass}
                      />
                    </td>
                    <td className="py-3 px-3 text-gray-500 font-mono text-xs">{q.id}</td>
                    <td className="py-3 px-3">{q.teks_pertanyaan}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                      {q.created_at ? new Date(q.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => openEditForm(q)} icon={Pencil}>Edit</Button>
                        <Button variant="danger" onClick={() => { setConfirmBulkDelete(false); setConfirmDelete(q); setError(""); setSuccess(""); }} icon={Trash2}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                )}
                renderMobileCard={(q) => (
                  <div key={q.id} className={`bg-white rounded-xl border shadow-soft p-4 space-y-3 ${selectedIds.has(q.id) ? "border-primary-light bg-blue-50/40" : "border-gray-100"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(q.id)}
                          onChange={() => toggleSelect(q.id)}
                          aria-label={`Pilih soal ${q.id}`}
                          className={`${checkboxClass} mt-0.5 shrink-0`}
                        />
                        <p className="text-sm flex-1">{q.teks_pertanyaan}</p>
                      </div>
                      <span className="text-xs text-gray-400 font-mono shrink-0">#{q.id}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openEditForm(q)} icon={Pencil} className="flex-1">Edit</Button>
                      <Button variant="danger" onClick={() => { setConfirmBulkDelete(false); setConfirmDelete(q); setError(""); setSuccess(""); }} icon={Trash2} className="flex-1">Hapus</Button>
                    </div>
                  </div>
                )}
              />
            </Card>
          );
        })
      )}
    </div>
  );
}
