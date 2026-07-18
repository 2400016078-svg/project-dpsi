import { useState, useEffect, useCallback } from "react";
import { Card, Button, Input, Table, Select, Badge } from "../../components/UI";
import { getSupabaseUsers, addSupabaseUser, deleteSupabaseUser, deleteStudentCompletely, deleteAllStudents, getStoredSession, resetUserPassword, getSiswaProfileByUserId, getGuruBkUserList, updateUserNama, reassignSiswaGuruBk, redistributeStudentsEqually } from "../../services/supabaseAuth";
import { getSiswaProfiles } from "../../services/supabaseData";
import { Plus, Trash2, Lightbulb, UserPlus, X, KeyRound, RefreshCw, Clock, AlertTriangle, AlertOctagon, RefreshCw as Shuffle, Save } from "lucide-react";

export default function ManajemenPengguna() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guru_bk");
  const [guruBkList, setGuruBkList] = useState([]);
  const [guruBkNamaMap, setGuruBkNamaMap] = useState({});
  const [siswaProfileMap, setSiswaProfileMap] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Reset password state
  const [resettingUserId, setResettingUserId] = useState(null);
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetConfirmPass, setResetConfirmPass] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk delete state
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkConfirmText, setBulkConfirmText] = useState("");
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Edit nama state
  const [editingNama, setEditingNama] = useState(null); // { userId, value }

  const loadUsers = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [data, gbList, allSiswaProfiles] = await Promise.all([
        getSupabaseUsers(),
        getGuruBkUserList(),
        getSiswaProfiles(),
      ]);
      setUsers(data);
      setGuruBkList(gbList);
      const map = {};
      for (const g of gbList) {
        map[g.id] = g.nama || `@${g.username}`;
      }
      setGuruBkNamaMap(map);
      const sMap = {};
      for (const s of allSiswaProfiles) {
        sMap[s.id_user] = s;
      }
      setSiswaProfileMap(sMap);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("loadUsers error:", err.message);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, []);
  useEffect(() => { loadUsers(false); }, [loadUsers]);

  const handleAdd = async () => {
    setError("");
    setSuccess("");
    if (!username || !password) { setError("Semua field harus diisi."); return; }
    const res = await addSupabaseUser(username, password, role);
    if (!res.success) { setError("Username sudah digunakan."); return; }
    setSuccess("Pengguna berhasil ditambahkan.");
    setUsername("");
    setPassword("");
    setShowForm(false);
    loadUsers();
  };

  const handleDeleteClick = async (user) => {
    setError("");
    setSuccess("");
    setResettingUserId(null);
    const currentUser = getStoredSession();
    if (currentUser && currentUser.id === user.id) { setError("Tidak dapat menghapus akun sendiri."); return; }
    if (user.role === "siswa") {
      const profile = await getSiswaProfileByUserId(user.id);
      setDeleteConfirm({
        userId: user.id,
        username: user.username,
        role: "siswa",
        nama_siswa: profile?.nama_siswa || user.username,
        nisn: profile?.nisn || "-",
      });
    } else {
      setDeleteConfirm({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    setError("");
    setSuccess("");
    if (deleteConfirm.role === "siswa") {
      const res = await deleteStudentCompletely(deleteConfirm.userId);
      if (!res.success) { setError(res.message || "Gagal menghapus siswa."); setDeleting(false); return; }
      setSuccess(`Siswa ${res.nama} (NISN ${res.nisn}) berhasil dihapus beserta seluruh data terkait.`);
    } else {
      const res = await deleteSupabaseUser(deleteConfirm.userId);
      if (!res.success) { setError("Gagal menghapus pengguna."); setDeleting(false); return; }
      const roleLabel = deleteConfirm.role.replace("_", " ");
      setSuccess(`Pengguna @${deleteConfirm.username} (${roleLabel}) berhasil dihapus.`);
    }
    setDeleting(false);
    setDeleteConfirm(null);
    loadUsers();
  };

  // Reassign Guru BK
  const [reassigningSiswaId, setReassigningSiswaId] = useState(null);
  const [reassigningValue, setReassigningValue] = useState("");

  const handleReassignStart = (siswaProfileId, currentGuruBkId) => {
    setReassigningSiswaId(siswaProfileId);
    setReassigningValue(currentGuruBkId || "");
  };

  const handleReassignSave = async () => {
    if (!reassigningSiswaId) return;
    const res = await reassignSiswaGuruBk(reassigningSiswaId, reassigningValue || null);
    if (!res.success) { setError("Gagal mengubah pembimbing."); return; }
    setSuccess("Pembimbing siswa berhasil diubah.");
    setReassigningSiswaId(null);
    setReassigningValue("");
    loadUsers();
  };

  // Bagi ulang merata
  const [showRedistribute, setShowRedistribute] = useState(false);
  const [redistribusiAngkatan, setRedistribusiAngkatan] = useState(new Date().getFullYear());
  const [redistributing, setRedistributing] = useState(false);

  const handleRedistribute = async () => {
    setRedistributing(true);
    setError("");
    setSuccess("");
    const res = await redistributeStudentsEqually(redistribusiAngkatan);
    if (!res.success) { setError(res.message || "Gagal membagi ulang."); setRedistributing(false); return; }
    setSuccess(`${res.count} siswa berhasil dibagi ulang merata ke ${guruBkList.length} Guru BK.`);
    setRedistributing(false);
    setShowRedistribute(false);
    loadUsers();
  };

  const handleBulkDelete = async () => {
    if (bulkConfirmText !== "HAPUS") return;
    setBulkDeleting(true);
    setError("");
    setSuccess("");
    const res = await deleteAllStudents();
    if (!res.success) { setError(res.message || "Gagal menghapus semua data siswa."); setBulkDeleting(false); return; }
    setSuccess(`${res.count} siswa berhasil dihapus beserta seluruh data terkait. Semua NISN dikembalikan ke status tersedia.`);
    setBulkDeleting(false);
    setShowBulkDelete(false);
    setBulkConfirmText("");
    loadUsers();
  };

  const handleResetStart = (userId) => {
    setError("");
    setSuccess("");
    setResetError("");
    setResetSuccess("");
    setResettingUserId(userId);
  };

  const handleResetCancel = () => {
    setResettingUserId(null);
    setResetNewPass("");
    setResetConfirmPass("");
    setResetError("");
    setResetSuccess("");
  };

  const handleResetSubmit = async () => {
    setResetError("");
    setResetSuccess("");
    if (!resetNewPass || resetNewPass.length < 6) { setResetError("Password baru minimal 6 karakter."); return; }
    if (resetNewPass !== resetConfirmPass) { setResetError("Konfirmasi password tidak cocok."); return; }
    const currentUser = getStoredSession();
    const requesterRole = currentUser ? currentUser.role : "";
    const res = await resetUserPassword(resettingUserId, resetNewPass, requesterRole);
    if (!res.success) { setResetError(res.message); return; }
    setResetSuccess(res.message);
    setResetNewPass("");
    setResetConfirmPass("");
  };

  const handleSaveNama = async (userId) => {
    if (!editingNama || !editingNama.value.trim()) { setError("Nama tidak boleh kosong."); return; }
    const res = await updateUserNama(userId, editingNama.value.trim());
    if (!res.success) { setError("Gagal menyimpan nama."); return; }
    setSuccess("Nama berhasil disimpan.");
    setEditingNama(null);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h2">Manajemen Pengguna</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadUsers(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-sm text-primary-medium hover:text-primary-dark disabled:text-gray-300 transition font-medium"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Memuat Ulang..." : "Muat Ulang"}
          </button>
          <Button
            variant="outline"
            onClick={() => { setShowRedistribute(true); setRedistribusiAngkatan(new Date().getFullYear()); }}
            icon={Shuffle}
          >
            Bagi Ulang Merata
          </Button>
          <Button
            variant="danger"
            onClick={() => { setShowBulkDelete(true); setBulkConfirmText(""); }}
            icon={Trash2}
          >
            Kosongkan Semua Data Siswa
          </Button>
          <Button onClick={() => setShowForm(!showForm)} icon={showForm ? X : Plus}>
            {showForm ? "Batal" : "Tambah Pengguna"}
          </Button>
        </div>
      </div>
      {lastUpdated && (
        <p className="text-caption text-gray-400 flex items-center gap-1 -mt-2">
          <Clock size={12} />
          Terakhir diperbarui: {lastUpdated.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm flex items-start gap-2">
        <Lightbulb size={16} className="mt-0.5 shrink-0" />
        <span>
          Akun siswa dibuat melalui <strong>Data Master NISN → Registrasi Mandiri</strong>.
          Akun orang tua dibuat melalui <strong>Registrasi Mandiri dengan kode tautan</strong>.
          Kelola data master NISN di menu <strong>Data Master NISN</strong>.
        </span>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-h3 font-semibold mb-3">Tambah Pengguna Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "guru_bk", label: "Guru BK" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </div>
          {error && <p className="text-sm text-error mt-2">{error}</p>}
          {success && <p className="text-sm text-success mt-2">{success}</p>}
          <Button onClick={handleAdd} className="mt-3" icon={UserPlus}>Simpan</Button>
        </Card>
      )}

      {error && <p className="text-sm text-error p-3 bg-red-50 rounded-xl">{error}</p>}
      {success && <p className="text-sm text-success p-3 bg-green-50 rounded-xl">{success}</p>}

      {resettingUserId && (
        <Card>
          <h3 className="text-h3 font-semibold mb-3 flex items-center gap-2">
            <KeyRound size={20} className="text-primary-medium" />
            Reset Password
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Atur password baru untuk <strong>@{users.find((u) => u.id === resettingUserId)?.username}</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Input label="Password Baru" type="password" value={resetNewPass} onChange={(e) => setResetNewPass(e.target.value)} placeholder="Minimal 6 karakter" />
            <Input label="Konfirmasi Password" type="password" value={resetConfirmPass} onChange={(e) => setResetConfirmPass(e.target.value)} placeholder="Ketik ulang password baru" />
          </div>
          {resetError && <p className="text-sm text-error mb-2">{resetError}</p>}
          {resetSuccess && <p className="text-sm text-success mb-2">{resetSuccess}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleResetCancel} icon={X}>Batal</Button>
            <Button onClick={handleResetSubmit} icon={KeyRound}>Simpan Password Baru</Button>
          </div>
        </Card>
      )}

      {/* ─── Single-delete confirmation ─── */}
      {deleteConfirm && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              {deleteConfirm.role === "siswa" ? (
                <>
                  <h3 className="font-semibold text-h3 mb-1">Hapus Siswa?</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Apakah Anda yakin ingin menghapus siswa{" "}
                    <strong>{deleteConfirm.nama_siswa}</strong> (NISN{" "}
                    <strong>{deleteConfirm.nisn}</strong>)?
                  </p>
                  <p className="text-sm text-error font-medium">
                    Tindakan ini permanen dan tidak dapat dibatalkan.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-h3 mb-1">Hapus Pengguna?</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Apakah Anda yakin ingin menghapus pengguna{" "}
                    <strong>@{deleteConfirm.username}</strong>{" "}
                    ({deleteConfirm.role.replace("_", " ")})?
                  </p>
                  <p className="text-sm text-error font-medium">
                    Tindakan ini permanen dan tidak dapat dibatalkan.
                  </p>
                </>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  icon={Trash2}
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setDeleteConfirm(null); setDeleting(false); }}
                  disabled={deleting}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Redistribute modal ─── */}
      {showRedistribute && (
        <Card>
          <div className="flex items-start gap-3">
            <Shuffle size={24} className="text-primary-medium shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-h3 mb-1">Bagi Ulang Siswa Merata</h3>
              <p className="text-sm text-gray-600 mb-2">
                Bagikan seluruh siswa pada angkatan tertentu secara merata ke{" "}
                <strong>{guruBkList.length}</strong> Guru BK yang tersedia.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan:</label>
              <Input
                type="number"
                value={redistribusiAngkatan}
                onChange={(e) => setRedistribusiAngkatan(parseInt(e.target.value) || new Date().getFullYear())}
                placeholder="2026"
                className="w-32"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  onClick={handleRedistribute}
                  disabled={redistributing || guruBkList.length === 0}
                  icon={Shuffle}
                >
                  {redistributing ? "Memproses..." : "Bagi Ulang"}
                </Button>
                <Button variant="secondary" onClick={() => setShowRedistribute(false)} disabled={redistributing}>Batal</Button>
              </div>
              {guruBkList.length === 0 && <p className="text-sm text-warning mt-2">Belum ada akun Guru BK. Tambahkan Guru BK terlebih dahulu.</p>}
            </div>
          </div>
        </Card>
      )}

      {/* ─── Bulk-delete confirmation ─── */}
      {showBulkDelete && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertOctagon size={24} className="text-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-h3 mb-1 text-error">Kosongkan Semua Data Siswa?</h3>
              <p className="text-sm text-gray-600 mb-2">
                Tindakan ini akan menghapus <strong>SEMUA</strong> siswa beserta seluruh data terkait
                (hasil kuesioner, catatan BK, kode tautan, dan akun orang tua yang tertaut).
                Data admin, guru BK, soal kuesioner, dan data master NISN <strong>tidak</strong> akan dihapus.
                Semua NISN akan dikembalikan ke status tersedia.
              </p>
              <p className="text-sm text-error font-semibold mb-3">
                Tindakan ini permanen dan tidak dapat dibatalkan.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ketik <span className="font-bold text-error">HAPUS</span> untuk mengonfirmasi:
              </label>
              <Input
                value={bulkConfirmText}
                onChange={(e) => setBulkConfirmText(e.target.value)}
                placeholder="Ketik HAPUS di sini..."
              />
              <div className="flex gap-2 mt-3">
                <Button
                  variant="danger"
                  onClick={handleBulkDelete}
                  disabled={bulkConfirmText !== "HAPUS" || bulkDeleting}
                  icon={Trash2}
                >
                  {bulkDeleting ? "Menghapus Semua..." : "Ya, Hapus Semua"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setShowBulkDelete(false); setBulkConfirmText(""); }}
                  disabled={bulkDeleting}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {loading ? <p className="text-sm text-gray-400 p-4">Memuat data...</p> : (
        <Table
          headers={["No", "Username", "Role", "Nama", "Guru BK Pembimbing", "Aksi"]}
          rows={users}
          renderRow={(u, i) => (
            <tr key={u.id} className="hover:bg-gray-50 transition">
              <td className="py-3 px-3 text-gray-500">{i + 1}</td>
              <td className="py-3 px-3 font-medium">@{u.username}</td>
              <td className="py-3 px-3">
                <Badge color={u.role === "admin" ? "red" : u.role === "guru_bk" ? "teal" : u.role === "siswa" ? "green" : "blue"}>
                  {u.role.replace("_", " ")}
                </Badge>
              </td>
              <td className="py-3 px-3 text-sm">
                {u.role === "guru_bk" || u.role === "admin" ? (
                  editingNama?.userId === u.id ? (
                    <div className="flex gap-1 items-center">
                      <input
                        value={editingNama.value}
                        onChange={(e) => setEditingNama({ userId: u.id, value: e.target.value })}
                        className="w-32 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                        placeholder="Nama"
                      />
                      <button onClick={() => handleSaveNama(u.id)} className="text-xs text-success font-medium hover:underline flex items-center gap-0.5"><Save size={12} />Simpan</button>
                      <button onClick={() => setEditingNama(null)} className="text-xs text-gray-400 hover:underline">Batal</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1">
                      {u.nama || "—"}
                      <button
                        onClick={() => setEditingNama({ userId: u.id, value: u.nama || "" })}
                        className="text-xs text-primary-medium hover:text-primary-dark ml-1"
                        title="Ubah nama"
                      >✎</button>
                    </span>
                  )
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="py-3 px-3 text-sm">
                {u.role === "siswa" ? (
                  reassigningSiswaId === siswaProfileMap[u.id]?.id ? (
                    <div className="flex gap-1 items-center">
                      <Select
                        value={reassigningValue}
                        onChange={(e) => setReassigningValue(e.target.value)}
                        options={[
                          { value: "", label: "— Belum ditugaskan —" },
                          ...guruBkList.map((g) => ({ value: g.id, label: guruBkNamaMap[g.id] || `@${g.username}` })),
                        ]}
                        className="w-40"
                      />
                      <button onClick={handleReassignSave} className="text-xs text-success font-medium hover:underline">Simpan</button>
                      <button onClick={() => setReassigningSiswaId(null)} className="text-xs text-gray-400 hover:underline">Batal</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1">
                      {siswaProfileMap[u.id]?.id_guru_bk ? (
                        <span>{guruBkNamaMap[siswaProfileMap[u.id].id_guru_bk] || "Memuat..."}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                      <button
                        onClick={() => handleReassignStart(siswaProfileMap[u.id]?.id, siswaProfileMap[u.id]?.id_guru_bk)}
                        className="text-xs text-primary-medium hover:text-primary-dark ml-1"
                        title="Ubah pembimbing"
                      >
                        ✎
                      </button>
                    </span>
                  )
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              <td className="py-3 px-3 flex gap-1.5">
                {resettingUserId === u.id ? (
                  <Button variant="outline" onClick={handleResetCancel} icon={X} size="sm">Batal</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => handleResetStart(u.id)} icon={KeyRound} size="sm">Reset</Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(u)}
                      disabled={u.id === getStoredSession()?.id}
                      icon={Trash2}
                      size="sm"
                    >
                      Hapus
                    </Button>
                  </>
                )}
              </td>
            </tr>
          )}
          renderMobileCard={(u, i) => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-soft p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">@{u.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{u.role.replace("_", " ")}</p>
                </div>
                <Badge color={u.role === "admin" ? "red" : u.role === "guru_bk" ? "teal" : u.role === "siswa" ? "green" : "blue"}>
                  {u.role.replace("_", " ")}
                </Badge>
              </div>
              {(u.role === "guru_bk" || u.role === "admin") && (
                <div className="text-xs text-gray-600">
                  Nama: <span className="font-medium">{u.nama || "—"}</span>
                </div>
              )}
              {u.role === "siswa" && (
                <div className="text-xs text-gray-600">
                  Pembimbing: <span className="font-medium">{siswaProfileMap[u.id]?.id_guru_bk ? (guruBkNamaMap[siswaProfileMap[u.id].id_guru_bk] || "Memuat...") : "—"}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {resettingUserId === u.id ? (
                  <Button variant="outline" onClick={handleResetCancel} icon={X} size="sm">Batal</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => handleResetStart(u.id)} icon={KeyRound} size="sm">Reset</Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(u)}
                      disabled={u.id === getStoredSession()?.id}
                      icon={Trash2}
                      size="sm"
                    >
                      Hapus
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        />
        )}
      </Card>
    </div>
  );
}
