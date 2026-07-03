import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Card, Button, Input, Table, Badge, Select } from "../../components/UI";
import { getMasterNisnList, addMasterNisn, deleteMasterNisn, isMasterClaimed, deleteAllMasterAndStudents, getGuruBkUserList, getGuruBkName } from "../../services/supabaseAuth";
import { getGuruBkLoadForAngkatan, getSmallestGuruBk, insertMasterNisnBatch } from "../../services/supabaseData";
import { Plus, Trash2, BookOpen, X, AlertTriangle, AlertOctagon, Upload, FileSpreadsheet, Loader, CheckCircle, RefreshCw, Clock, UserCheck } from "lucide-react";

export default function MasterNisn() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [angkatan, setAngkatan] = useState(new Date().getFullYear().toString());
  const [idGuruBk, setIdGuruBk] = useState("__auto__");
  const [guruBkList, setGuruBkList] = useState([]);
  const [guruBkNamaMap, setGuruBkNamaMap] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Bulk delete master state
  const [showBulkDeleteMaster, setShowBulkDeleteMaster] = useState(false);
  const [bulkMasterConfirmText, setBulkMasterConfirmText] = useState("");
  const [bulkMasterDeleting, setBulkMasterDeleting] = useState(false);

  // Bulk import state
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [jumlahKelompok, setJumlahKelompok] = useState(2);
  const [importLoading, setImportLoading] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    const data = await getMasterNisnList();
    setList(data);
    setLastUpdated(new Date());
    const years = [...new Set(data.map((m) => m.angkatan_tahun))].sort((a, b) => b - a);
    if (!activeTab && years.length > 0) setActiveTab(years[0]);
    const gbs = await getGuruBkUserList();
    setGuruBkList(gbs);
    const map = {};
    for (const g of gbs) {
      const nama = await getGuruBkName(g.id);
      map[g.id] = nama || `@${g.username}`;
    }
    setGuruBkNamaMap(map);
  };
  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const years = [...new Set(list.map((m) => m.angkatan_tahun))].sort((a, b) => b - a);
  const filtered = list.filter((m) => m.angkatan_tahun === activeTab);

  const getGuruBkOptions = () => {
    const options = [{ value: "__auto__", label: "(Otomatis — paling sedikit bimbingan)" }];
    for (const g of guruBkList) {
      options.push({ value: g.id, label: guruBkNamaMap[g.id] || `@${g.username}` });
    }
    return options;
  };

  const resolveAutoGuruBk = async (angkatanTahun) => {
    if (guruBkList.length === 0) return null;
    const guruBkIds = guruBkList.map((g) => g.id);
    const loads = await getGuruBkLoadForAngkatan(parseInt(angkatanTahun));
    return getSmallestGuruBk(loads, guruBkIds);
  };

  const handleAdd = async () => {
    setError(""); setSuccess("");
    if (!/^\d{10}$/.test(nisn)) { setError("NISN harus 10 digit angka."); return; }
    if (!nama.trim()) { setError("Nama siswa harus diisi."); return; }
    const angk = parseInt(angkatan);
    if (isNaN(angk) || angk < 2000 || angk > 2100) { setError("Angkatan tidak valid."); return; }
    const finalGuruBk = idGuruBk === "__auto__" ? await resolveAutoGuruBk(angk) : idGuruBk;
    const res = await addMasterNisn(nisn, nama.trim(), angk, finalGuruBk);
    if (!res.success) {
      if (res.code === "NISN_EXISTS") setError("NISN sudah terdaftar di master.");
      else if (res.code === "NISN_ALREADY_CLAIMED") setError("NISN sudah diklaim oleh siswa.");
      else setError("Gagal menambahkan.");
      return;
    }
    const guruBkLabel = finalGuruBk ? (guruBkNamaMap[finalGuruBk] || "Guru BK") : "Guru BK (belum ditugaskan)";
    setSuccess(`Data master NISN berhasil ditambahkan. Pembimbing: ${guruBkLabel}.`);
    setNisn(""); setNama(""); setShowForm(false);
    setActiveTab(angk);
    load();
  };

  const handleDelete = async (n) => {
    if (await isMasterClaimed(n.nisn)) {
      setConfirmDelete(n);
      return;
    }
    deleteAndRefresh(n);
  };

  const deleteAndRefresh = async (n) => {
    setError(""); setSuccess("");
    await deleteMasterNisn(n.nisn);
    setSuccess(`NISN ${n.nisn} berhasil dihapus.`);
    setConfirmDelete(null);
    load();
  };

  /* ───────── Bulk Delete Master ───────── */

  const handleBulkDeleteMaster = async () => {
    if (bulkMasterConfirmText !== "KOSONGKAN") return;
    setBulkMasterDeleting(true);
    setError("");
    setSuccess("");
    const res = await deleteAllMasterAndStudents();
    if (!res.success) { setError(res.message || "Gagal menghapus semua data master."); setBulkMasterDeleting(false); return; }
    setSuccess(`Semua data master dan ${res.count} akun siswa berhasil dihapus. Sistem kembali ke kondisi awal.`);
    setBulkMasterDeleting(false);
    setShowBulkDeleteMaster(false);
    setBulkMasterConfirmText("");
    setShowForm(false);
    setActiveTab(null);
    load();
  };

  /* ───────── Bulk Import ───────── */

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
      const data = await readFile(importFile);
      if (!data || data.length === 0) { setError("File kosong atau format tidak sesuai."); setImportLoading(false); return; }

      const headers = Object.keys(data[0]).map((h) => h.toLowerCase().trim());
      if (!headers.includes("nisn") || !headers.includes("nama_siswa") || !headers.includes("angkatan_tahun")) {
        setError("Kolom file harus: nisn, nama_siswa, angkatan_tahun. Periksa header baris pertama."); setImportLoading(false); return;
      }

      const gbList = await getGuruBkUserList();
      const hasGuruBk = gbList.length > 0;
      const guruBkIds = gbList.map((g) => g.id);
      let counts = {};
      if (hasGuruBk) {
        counts = await getGuruBkLoadForAngkatan(parseInt(activeTab) || 2026);
      }

      const validRows = [];
      const skipped = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNisn = String(row.nisn || "").trim();
        const rowNama = String(row.nama_siswa || "").trim();
        const rowAngkatan = parseInt(row.angkatan_tahun);

        const reasons = [];
        if (!/^\d{10}$/.test(rowNisn)) reasons.push("NISN bukan 10 digit angka");
        if (!rowNama) reasons.push("Nama kosong");
        if (isNaN(rowAngkatan) || rowAngkatan < 2000 || rowAngkatan > 2100) reasons.push("Angkatan tidak valid");

        if (reasons.length > 0) {
          skipped.push({ baris: i + 2, nisn: rowNisn || "-", alasan: reasons.join("; ") });
          continue;
        }

        const dup = list.find((m) => m.nisn === rowNisn) || validRows.find((v) => v.nisn === rowNisn);
        if (dup) {
          skipped.push({ baris: i + 2, nisn: rowNisn, alasan: "NISN sudah terdaftar" });
          continue;
        }

        let idGb = null;
        if (hasGuruBk) {
          idGb = getSmallestGuruBk(counts, guruBkIds);
          counts[idGb] = (counts[idGb] || 0) + 1;
        }
        validRows.push({ nisn: rowNisn, nama_siswa: rowNama, angkatan_tahun: rowAngkatan, is_claimed: false, id_guru_bk: idGb });
      }

      if (validRows.length === 0) {
        setError("Tidak ada data valid untuk diimpor. Periksa file dan coba lagi."); setImportLoading(false); return;
      }

      const res = await insertMasterNisnBatch(validRows);
      if (!res.success) { setError("Gagal menyimpan data ke database."); setImportLoading(false); return; }

      const guruBkSummary = {};
      for (const v of validRows) {
        const key = v.id_guru_bk || "__unassigned__";
        guruBkSummary[key] = (guruBkSummary[key] || 0) + 1;
      }

      const nameMap = {};
      for (const g of gbList) {
        const nama = await getGuruBkName(g.id);
        nameMap[g.id] = nama || `@${g.username}`;
      }
      setImportReport({ total: validRows.length, skipped: skipped.length, skippedDetail: skipped, guruBkSummary, guruBkList: gbList, guruBkNamaMap: nameMap });
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (err) {
      console.error("Import error:", err.message);
      setError("Gagal membaca file. Pastikan format .xlsx atau .csv benar.");
    }
    setImportLoading(false);
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      if (file.name.endsWith(".csv")) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    });
  };

  const closeImport = () => {
    setShowImport(false);
    setImportFile(null);
    setImportReport(null);
    setImportLoading(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h2">Data Master NISN</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-sm text-primary-medium hover:text-primary-dark disabled:text-gray-300 transition font-medium"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Memuat Ulang..." : "Muat Ulang"}
          </button>
          <Button
            variant="danger"
            onClick={() => { setShowBulkDeleteMaster(true); setBulkMasterConfirmText(""); }}
            icon={Trash2}
          >
            Kosongkan Semua Data Master
          </Button>
          <Button onClick={() => setShowImport(true)} icon={Upload}>
            Impor Data
          </Button>
          <Button onClick={() => setShowForm(!showForm)} icon={showForm ? X : Plus}>
            {showForm ? "Batal" : "Tambah NISN"}
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
          <h3 className="text-h3 font-semibold mb-3">Tambah Data Master NISN Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input label="NISN (10 digit)" value={nisn} onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="0069876543" />
            <Input label="Nama Siswa" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Ahmad Fauzi" />
            <Input label="Angkatan Tahun" value={angkatan} onChange={(e) => setAngkatan(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2026" />
            <Select label="Guru BK Pembimbing" value={idGuruBk} onChange={(e) => setIdGuruBk(e.target.value)} options={getGuruBkOptions()} />
          </div>
          {error && <p className="text-sm text-error mt-2">{error}</p>}
          {success && <p className="text-sm text-success mt-2">{success}</p>}
          <Button onClick={handleAdd} className="mt-3">Simpan</Button>
        </Card>
      )}

      {/* ───── Import Modal ───── */}
      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeImport(); }}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 font-semibold flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-primary-medium" />
                Impor Data Master NISN
              </h3>
              <button onClick={closeImport} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>

            {!importReport ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Unggah file <strong>.xlsx</strong> atau <strong>.csv</strong> dengan kolom: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">nisn, nama_siswa, angkatan_tahun</code>.
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
                  {guruBkList.length > 0 ? (
                    <span>Didistribusikan merata ke <strong>{guruBkList.length}</strong> Guru BK: {guruBkList.map((g) => guruBkNamaMap[g.id] || `@${g.username}`).join(", ")}.</span>
                  ) : (
                    <span><strong>Belum ada akun Guru BK.</strong> Siswa tidak akan ditugaskan ke pembimbing. Tambahkan Guru BK di Manajemen Pengguna.</span>
                  )}
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
                    <p className="font-semibold">Impor Berhasil</p>
                    <p className="text-sm mt-1">
                      <strong>{importReport.total}</strong> data berhasil diimpor
                      {importReport.skipped > 0 && <span>, <strong>{importReport.skipped}</strong> dilewati</span>}.
                    </p>
                  </div>
                </div>

                <div className="text-sm space-y-1 p-3 bg-blue-50 rounded-xl">
                  <p className="font-medium text-blue-800 mb-1">Distribusi per Guru BK:</p>
                  {Object.entries(importReport.guruBkSummary).map(([key, count]) => (
                    <p key={key} className="text-blue-700">
                      {key === "__unassigned__"
                        ? "Belum ditugaskan"
                        : importReport.guruBkNamaMap[key] || `Guru BK (${key.slice(0, 8)}...)`
                      }: <strong>{count}</strong> siswa
                    </p>
                  ))}
                </div>

                {importReport.skippedDetail.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-warning mb-1">Data Dilewati ({importReport.skipped}):</p>
                    <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                      {importReport.skippedDetail.map((s, i) => (
                        <p key={i} className="text-gray-500">
                          Baris {s.baris} (NISN: {s.nisn}) — {s.alasan}
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

      {/* ───── Bulk Delete Master Modal ───── */}
      {showBulkDeleteMaster && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertOctagon size={28} className="text-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-h3 mb-1 text-error">Kosongkan Semua Data Master?</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>PERINGATAN:</strong> Tindakan ini akan menghapus{" "}
                <strong>SELURUH</strong> data master NISN{" "}
                <strong>DAN</strong> semua akun siswa yang sudah terdaftar
                (beserta jawaban, hasil, catatan BK, dan akun orang tua tertaut).
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Akun admin, guru BK, dan bank soal tetap aman.
              </p>
              <p className="text-sm text-error font-semibold mb-3">
                Tindakan ini PERMANEN dan tidak dapat dibatalkan.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ketik <span className="font-bold text-error">KOSONGKAN</span> untuk mengonfirmasi:
              </label>
              <Input
                value={bulkMasterConfirmText}
                onChange={(e) => setBulkMasterConfirmText(e.target.value)}
                placeholder="Ketik KOSONGKAN di sini..."
              />
              <div className="flex gap-2 mt-3">
                <Button
                  variant="danger"
                  onClick={handleBulkDeleteMaster}
                  disabled={bulkMasterConfirmText !== "KOSONGKAN" || bulkMasterDeleting}
                  icon={Trash2}
                >
                  {bulkMasterDeleting ? "Menghapus Semua..." : "Ya, Kosongkan Semua"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setShowBulkDeleteMaster(false); setBulkMasterConfirmText(""); }}
                  disabled={bulkMasterDeleting}
                >
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
              <h3 className="font-semibold text-h3 mb-1">Hapus Data Master NISN?</h3>
              <p className="text-sm text-gray-600 mb-1">
                NISN: <strong>{confirmDelete.nisn}</strong> — {confirmDelete.nama_siswa}
              </p>
              <p className="text-sm text-gray-600">
                Data master akan dihapus, namun <strong>akun siswa tetap aktif</strong> dan seluruh data siswa tidak akan terpengaruh.
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="danger" onClick={() => deleteAndRefresh(confirmDelete)} icon={Trash2}>
                  Ya, Hapus
                </Button>
                <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {years.length > 0 && (
        <div className="flex gap-1 border-b border-gray-200 pb-px overflow-x-auto">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setActiveTab(y)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition whitespace-nowrap ${
                activeTab === y
                  ? "bg-white border-gray-200 text-primary-dark"
                  : "bg-gray-100 border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Angkatan {y}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <Card>
          <Table
            headers={["No", "NISN", "Nama Siswa", "Guru BK", "Status", "Aksi"]}
            rows={filtered}
            renderRow={(m, i) => (
              <tr key={m.nisn} className="hover:bg-gray-50 transition">
                <td className="py-3 px-3 text-gray-500">{i + 1}</td>
                <td className="py-3 px-3 font-mono text-xs">{m.nisn}</td>
                <td className="py-3 px-3 font-medium">{m.nama_siswa}</td>
                <td className="py-3 px-3 text-sm">
                  {m.id_guru_bk ? (guruBkNamaMap[m.id_guru_bk] || <span className="text-gray-400">Memuat...</span>) : <span className="text-gray-300">-</span>}
                </td>
                <td className="py-3 px-3">
                  <Badge color={m.is_claimed ? "green" : "yellow"}>
                    {m.is_claimed ? "Sudah Diklaim" : "Belum Diklaim"}
                  </Badge>
                </td>
                <td className="py-3 px-3">
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(m)}
                    icon={Trash2}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            )}
            renderMobileCard={(m, i) => (
              <div key={m.nisn} className="bg-white rounded-xl border border-gray-100 shadow-soft p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{m.nama_siswa}</p>
                    <p className="text-xs text-gray-500 font-mono">{m.nisn}</p>
                  </div>
                  <Badge color={m.is_claimed ? "green" : "yellow"}>
                    {m.is_claimed ? "Diklaim" : "Tersedia"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Pembimbing: <strong>{m.id_guru_bk ? (guruBkNamaMap[m.id_guru_bk] || "Memuat...") : "—"}</strong></span>
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(m)}
                  icon={Trash2}
                  className="w-full"
                >
                  Hapus
                </Button>
              </div>
            )}
          />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <BookOpen size={48} className="mb-3" />
            <p className="text-sm">Belum ada data master NISN untuk angkatan ini.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
