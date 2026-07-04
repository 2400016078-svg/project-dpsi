import { v4 as uuid } from "uuid";
import { supabase } from "../lib/supabaseClient";
// TODO: Password hashing must be added before production (currently stored as base64)

function hash(pw) {
  return btoa(pw);
}

/* ─────────────── Session ─────────────── */

const SESSION_KEY = "sami_current_user";
const ACTIVITY_KEY = "sami_last_activity";
const EXPIRED_KEY = "sami_session_expired";
const INACTIVITY_MS = 60 * 60 * 1000; // 60 minutes

export function getStoredSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function storeSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
  localStorage.removeItem(EXPIRED_KEY);
}

/* ─────────────── Activity tracking ─────────────── */

let _lastTouch = 0;

export function touchActivity() {
  const now = Date.now();
  if (now - _lastTouch < 1000) return;
  _lastTouch = now;
  localStorage.setItem(ACTIVITY_KEY, now.toString());
}

export function getLastActivity() {
  const raw = localStorage.getItem(ACTIVITY_KEY);
  return raw ? parseInt(raw, 10) : null;
}

export function isSessionExpired() {
  const last = getLastActivity();
  if (!last) return true;
  return Date.now() - last > INACTIVITY_MS;
}

export function setSessionExpiredFlag() {
  localStorage.setItem(EXPIRED_KEY, "1");
}

export function clearSessionExpiredFlag() {
  localStorage.removeItem(EXPIRED_KEY);
}

export function hasSessionExpiredFlag() {
  return localStorage.getItem(EXPIRED_KEY) === "1";
}

/* ─────────────── Login ─────────────── */

export async function login(username, password) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (error || !data) return null;
  if (hash(password) !== data.password) return null;

  storeSession(data);
  touchActivity();
  return data;
}

/* ─────────────── Logout ─────────────── */

export function logout() {
  clearSession();
}

/* ─────────────── Verify session ─────────────── */

export async function verifySession(sessionUser) {
  if (!sessionUser || !sessionUser.id) return false;
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", sessionUser.id)
    .maybeSingle();
  return !error && !!data;
}

/* ─────────────── Username check (case-insensitive) ─────────────── */

export async function usernameTaken(username) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  return !error && !!data;
}

export async function suggestUsernames(base, count = 3) {
  const candidates = [];
  for (let i = 1; i <= count + 3; i++) {
    candidates.push(`${base}${i}`);
  }
  const results = await Promise.all(
    candidates.map(async (c) => {
      const taken = await usernameTaken(c);
      return { username: c, available: !taken };
    })
  );
  return results.filter((r) => r.available).slice(0, count).map((r) => r.username);
}

/* ─────────────── Master NISN CRUD (Admin) ─────────────── */

export async function getMasterNisnList() {
  const { data: master, error } = await supabase
    .from("master_nisn")
    .select("*")
    .order("nisn");
  if (error) {
    console.error("getMasterNisnList error:", error.message, error.details, error.hint);
    return [];
  }
  return master || [];
}

export async function addMasterNisn(nisn, namaSiswa, angkatanTahun, idGuruBk) {
  const { data: existing } = await supabase
    .from("master_nisn")
    .select("nisn")
    .eq("nisn", nisn)
    .maybeSingle();
  if (existing) return { success: false, code: "NISN_EXISTS" };
  if (await nisnAlreadyClaimed(nisn)) return { success: false, code: "NISN_ALREADY_CLAIMED" };
  const insertData = { nisn, nama_siswa: namaSiswa, angkatan_tahun: parseInt(angkatanTahun) };
  if (idGuruBk) insertData.id_guru_bk = idGuruBk;
  const { error } = await supabase
    .from("master_nisn")
    .insert(insertData);
  if (error) {
    console.error("addMasterNisn error:", error.message, error.details, error.hint);
    return { success: false, code: "INSERT_FAILED" };
  }
  return { success: true };
}

export async function deleteMasterNisn(nisn) {
  const { error } = await supabase
    .from("master_nisn")
    .delete()
    .eq("nisn", nisn);
  if (error) {
    console.error("deleteMasterNisn error:", error.message, error.details, error.hint);
    return { success: false, code: "DELETE_FAILED" };
  }
  return { success: true };
}

export async function isMasterClaimed(nisn) {
  const { data, error } = await supabase
    .from("master_nisn")
    .select("is_claimed")
    .eq("nisn", nisn)
    .maybeSingle();
  if (error || !data) return false;
  return data.is_claimed === true;
}

/* ─────────────── NISN helpers ─────────────── */

export async function checkNisn(nisn) {
  const { data, error } = await supabase
    .from("master_nisn")
    .select("*")
    .eq("nisn", nisn)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function nisnAlreadyClaimed(nisn) {
  const { data, error } = await supabase
    .from("master_nisn")
    .select("is_claimed")
    .eq("nisn", nisn)
    .maybeSingle();
  if (error || !data) return false;
  return data.is_claimed === true;
}

/* ─────────────── Profile reads ─────────────── */

export async function getSiswaProfileByUserId(userId) {
  const { data, error } = await supabase
    .from("siswa_profiles")
    .select("*")
    .eq("id_user", userId)
    .maybeSingle();
  if (error) {
    console.error("getSiswaProfileByUserId error:", error.message, error.details, error.hint);
    return null;
  }
  return data || null;
}

export async function getOrtuProfileByUserId(userId) {
  const { data, error } = await supabase
    .from("orang_tua_profiles")
    .select("*")
    .eq("id_user", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function getSiswaProfileById(id) {
  const { data, error } = await supabase
    .from("siswa_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

/* ─────────────── Link code helpers ─────────────── */

export async function verifyLinkCode(kode) {
  const { data: link, error } = await supabase
    .from("link_codes")
    .select("*")
    .eq("kode", kode)
    .maybeSingle();
  if (error) {
    console.error("verifyLinkCode error:", error.message, error.details, error.hint);
    return { success: false, code: "ERROR", message: "Terjadi kesalahan sistem. Silakan coba lagi." };
  }
  if (!link) {
    return { success: false, code: "NOT_FOUND", message: "Kode tidak ditemukan. Periksa kembali kode yang dimasukkan." };
  }
  if (link.status === "terpakai") {
    return { success: false, code: "TERPAKAI", message: "Kode ini sudah digunakan oleh orang tua lain." };
  }
  if (link.status === "dicabut") {
    return { success: false, code: "DICABUT", message: "Kode ini telah dicabut oleh siswa. Minta kode baru dari siswa." };
  }
  if (link.status !== "aktif") {
    return { success: false, code: "TIDAK_AKTIF", message: "Kode tidak aktif. Hubungi siswa untuk mendapatkan kode baru." };
  }
  if (new Date(link.expires_at) < new Date()) {
    return { success: false, code: "KEDALUWARSA", message: "Kode ini sudah kedaluwarsa. Minta kode baru dari siswa." };
  }

  const { data: siswa } = await supabase
    .from("siswa_profiles")
    .select("nama_siswa")
    .eq("id", link.id_siswa)
    .maybeSingle();

  return { success: true, link: { ...link, siswa_nama: siswa ? siswa.nama_siswa : "Unknown" } };
}

export async function getActiveLinkCode(idSiswa) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("link_codes")
    .select("*")
    .eq("id_siswa", idSiswa)
    .eq("status", "aktif")
    .gte("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getActiveLinkCode error:", error.message, error.details, error.hint);
    return null;
  }
  return data || null;
}

async function generateUniqueKode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let attempt = 0; attempt < 30; attempt++) {
    const len = 8 + Math.floor(Math.random() * 5);
    let kode = "";
    for (let i = 0; i < len; i++) {
      kode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const { data: existing } = await supabase
      .from("link_codes")
      .select("kode")
      .eq("kode", kode)
      .maybeSingle();
    if (!existing) return kode;
  }
  return uuid().substring(0, 10).toUpperCase();
}

export async function revokeActiveLinkCodes(idSiswa) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("link_codes")
    .update({ status: "dicabut" })
    .eq("id_siswa", idSiswa)
    .eq("status", "aktif");
  if (error) {
    console.error("revokeActiveLinkCodes error:", error.message, error.details, error.hint);
    return { success: false };
  }
  return { success: true };
}

export async function createLinkCode(idSiswa) {
  const kode = await generateUniqueKode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 86400000).toISOString();
  const newLink = {
    id: uuid(),
    kode,
    id_siswa: idSiswa,
    status: "aktif",
    id_ortu_pemakai: null,
    created_at: now.toISOString(),
    used_at: null,
    expires_at: expiresAt,
  };
  const { error } = await supabase.from("link_codes").insert(newLink);
  if (error) {
    console.error("createLinkCode error:", error.message, error.details, error.hint);
    return { success: false, code: "INSERT_FAILED", message: "Gagal membuat kode tautan." };
  }
  return { success: true, data: newLink };
}

/* ─────────────── Student registration ─────────────── */

export async function registerSiswa(nisn, username, password) {
  const normalized = username.toLowerCase().trim();
  if (await usernameTaken(normalized)) return { success: false, code: "USERNAME_TAKEN" };

  const master = await checkNisn(nisn);
  if (!master) return { success: false, code: "NISN_NOT_FOUND" };
  if (await nisnAlreadyClaimed(nisn)) return { success: false, code: "NISN_ALREADY_CLAIMED" };

  const userId = uuid();
  const siswaId = uuid();
  const linkId = uuid();
  const angkatan = master.angkatan_tahun;

  const newUser = { id: userId, username: normalized, password: hash(password), role: "siswa" };
  const newSiswa = { id: siswaId, id_user: userId, nisn, nama_siswa: master.nama_siswa, angkatan_tahun: angkatan, status_kuesioner: "belum_dikerjakan", id_guru_bk: master.id_guru_bk || null };
  const linkCode = `SMK-${master.nama_siswa.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 4).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
  const newLink = { id: linkId, kode: linkCode, id_siswa: siswaId, status: "aktif", id_ortu_pemakai: null, created_at: new Date().toISOString(), used_at: null, expires_at: new Date(Date.now() + 365 * 86400000).toISOString() };

  const { error: userErr } = await supabase.from("users").insert(newUser);
  if (userErr) {
    console.error("registerSiswa user insert error:", userErr.message, userErr.details, userErr.hint);
    if (userErr.code === "23505") return { success: false, code: "USERNAME_TAKEN" };
    return { success: false, code: "INSERT_FAILED" };
  }

  const { error: siswaErr } = await supabase.from("siswa_profiles").insert(newSiswa);
  if (siswaErr) {
    console.error("registerSiswa siswa insert error:", siswaErr.message, siswaErr.details, siswaErr.hint);
    await supabase.from("users").delete().eq("id", userId);
    return { success: false, code: "INSERT_FAILED" };
  }

  const { error: linkErr } = await supabase.from("link_codes").insert(newLink);
  if (linkErr) {
    console.error("registerSiswa link insert error:", linkErr.message, linkErr.details, linkErr.hint);
    await supabase.from("siswa_profiles").delete().eq("id", siswaId);
    await supabase.from("users").delete().eq("id", userId);
    return { success: false, code: "INSERT_FAILED" };
  }

  await supabase.from("master_nisn").update({ is_claimed: true }).eq("nisn", nisn);

  storeSession(newUser);
  return {
    success: true,
    message: "Registrasi mandiri siswa baru berhasil dilakukan.",
    data: { user_id: userId, nisn, nama_siswa: master.nama_siswa, angkatan_tahun: angkatan, role: "siswa", status_kuesioner: "belum_dikerjakan", link_code: linkCode },
  };
}

/* ─────────────── Users CRUD (Admin) ─────────────── */

export async function getSupabaseUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("username");
  if (error) {
    console.error("getSupabaseUsers error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function addSupabaseUser(username, password, role) {
  const normalized = username.toLowerCase().trim();
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .ilike("username", normalized)
    .maybeSingle();
  if (existing) return { success: false, code: "USERNAME_TAKEN" };

  const userId = uuid();
  const newUser = { id: userId, username: normalized, password: hash(password), role, nama: "" };

  const { error: userErr } = await supabase.from("users").insert(newUser);
  if (userErr) {
    console.error("addSupabaseUser error:", userErr.message, userErr.details, userErr.hint);
    if (userErr.code === "23505") return { success: false, code: "USERNAME_TAKEN" };
    return { success: false, code: "INSERT_FAILED" };
  }

  // If role is siswa, also create a siswa_profile (auto-assign unclaimed NISN)
  if (role === "siswa") {
    const { data: unclaimed } = await supabase
      .from("master_nisn")
      .select("*")
      .eq("is_claimed", false)
      .limit(1)
      .maybeSingle();
    if (unclaimed) {
      const siswaId = uuid();
      const newSiswa = {
        id: siswaId,
        id_user: userId,
        nisn: unclaimed.nisn,
        nama_siswa: unclaimed.nama_siswa,
        angkatan_tahun: unclaimed.angkatan_tahun,
        status_kuesioner: "belum_dikerjakan",
        id_guru_bk: unclaimed.id_guru_bk || null,
      };
      const { error: siswaErr } = await supabase.from("siswa_profiles").insert(newSiswa);
      if (siswaErr) {
        console.error("addSupabaseUser siswa_profile error:", siswaErr.message, siswaErr.details, siswaErr.hint);
      } else {
        await supabase.from("master_nisn").update({ is_claimed: true }).eq("nisn", unclaimed.nisn);
      }
    }
  }

  return { success: true };
}

export async function deleteSupabaseUser(userId) {
  const { data: user } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  if (!user) return { success: false, code: "USER_NOT_FOUND" };

  // Remove linked profile if exists
  if (user.role === "siswa") {
    const { data: siswa } = await supabase
      .from("siswa_profiles")
      .select("id, nisn")
      .eq("id_user", userId)
      .maybeSingle();
    if (siswa) {
      await supabase.from("master_nisn").update({ is_claimed: false }).eq("nisn", siswa.nisn);
      await supabase.from("siswa_profiles").delete().eq("id_user", userId);
    }
  } else if (user.role === "orang_tua") {
    await supabase.from("orang_tua_profiles").delete().eq("id_user", userId);
  }

  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    console.error("deleteSupabaseUser error:", error.message, error.details, error.hint);
    return { success: false, code: "DELETE_FAILED" };
  }
  return { success: true };
}

/* ─────────────── Student deletion (Admin) ─────────────── */

export async function deleteStudentCompletely(studentUserId) {
  const { data: user } = await supabase
    .from("users")
    .select("id, role, username")
    .eq("id", studentUserId)
    .maybeSingle();
  if (!user) return { success: false, code: "USER_NOT_FOUND", message: "Pengguna tidak ditemukan." };
  if (user.role !== "siswa") return { success: false, code: "NOT_A_STUDENT", message: "Bukan akun siswa." };

  const { data: siswa } = await supabase
    .from("siswa_profiles")
    .select("id, nisn, nama_siswa")
    .eq("id_user", studentUserId)
    .maybeSingle();

  try {
    if (siswa) {
      const siswaId = siswa.id;
      const nisn = siswa.nisn;
      const nama = siswa.nama_siswa;

      const { data: results } = await supabase
        .from("kuesioner_results")
        .select("id")
        .eq("id_siswa", siswaId);
      const resultIds = results ? results.map((r) => r.id) : [];

      if (resultIds.length > 0) {
        await supabase.from("kuesioner_result_scores").delete().in("id_result", resultIds);
        await supabase.from("bk_notes").delete().in("id_result", resultIds);
        await supabase.from("kuesioner_results").delete().eq("id_siswa", siswaId);
      }
      await supabase.from("kuesioner_responses").delete().eq("id_siswa", siswaId);
      await supabase.from("link_codes").delete().eq("id_siswa", siswaId);

      const { data: ortu } = await supabase
        .from("orang_tua_profiles")
        .select("id, id_user")
        .eq("id_siswa", siswaId)
        .maybeSingle();
      if (ortu) {
        await supabase.from("users").delete().eq("id", ortu.id_user);
        await supabase.from("orang_tua_profiles").delete().eq("id", ortu.id);
      }

      await supabase.from("siswa_profiles").delete().eq("id_user", studentUserId);
      await supabase.from("master_nisn").update({ is_claimed: false }).eq("nisn", nisn);
    }

    await supabase.from("users").delete().eq("id", studentUserId);

    return { success: true, nama: siswa ? siswa.nama_siswa : user.username, nisn: siswa ? siswa.nisn : null };
  } catch (err) {
    console.error("deleteStudentCompletely error:", err.message, err.details, err.hint);
    return { success: false, code: "DELETE_FAILED", message: "Gagal menghapus data siswa." };
  }
}

export async function deleteAllStudents() {
  const { data: studentUsers } = await supabase
    .from("users")
    .select("id")
    .eq("role", "siswa");

  if (!studentUsers || studentUsers.length === 0) {
    return { success: true, count: 0 };
  }

  const studentUserIds = studentUsers.map((u) => u.id);

  try {
    const { data: allSiswa } = await supabase
      .from("siswa_profiles")
      .select("id")
      .in("id_user", studentUserIds);

    const siswaIds = allSiswa ? allSiswa.map((s) => s.id) : [];

    if (siswaIds.length > 0) {
      const { data: allResults } = await supabase
        .from("kuesioner_results")
        .select("id")
        .in("id_siswa", siswaIds);
      const resultIds = allResults ? allResults.map((r) => r.id) : [];

      if (resultIds.length > 0) {
        await supabase.from("kuesioner_result_scores").delete().in("id_result", resultIds);
        await supabase.from("bk_notes").delete().in("id_result", resultIds);
        await supabase.from("kuesioner_results").delete().in("id_siswa", siswaIds);
      }
      await supabase.from("kuesioner_responses").delete().in("id_siswa", siswaIds);
      await supabase.from("link_codes").delete().in("id_siswa", siswaIds);

      const { data: allOrtu } = await supabase
        .from("orang_tua_profiles")
        .select("id, id_user")
        .in("id_siswa", siswaIds);
      const ortuUserIds = allOrtu ? allOrtu.map((o) => o.id_user) : [];
      const ortuIds = allOrtu ? allOrtu.map((o) => o.id) : [];

      if (ortuUserIds.length > 0) {
        await supabase.from("users").delete().in("id", ortuUserIds);
      }
      if (ortuIds.length > 0) {
        await supabase.from("orang_tua_profiles").delete().in("id", ortuIds);
      }

      await supabase.from("siswa_profiles").delete().in("id_user", studentUserIds);
    }

    await supabase.from("users").delete().in("id", studentUserIds);
    await supabase.from("master_nisn").update({ is_claimed: false }).eq("is_claimed", true);

    return { success: true, count: studentUsers.length };
  } catch (err) {
    console.error("deleteAllStudents error:", err.message, err.details, err.hint);
    return { success: false, code: "DELETE_FAILED", message: "Gagal menghapus semua data siswa." };
  }
}

export async function deleteAllMasterAndStudents() {
  try {
    const { data: allSiswaBefore } = await supabase
      .from("siswa_profiles")
      .select("id");
    const count = allSiswaBefore ? allSiswaBefore.length : 0;

    const { data: allSiswa } = await supabase
      .from("siswa_profiles")
      .select("id");
    const siswaIds = allSiswa ? allSiswa.map((s) => s.id) : [];

    if (siswaIds.length > 0) {
      const { data: allResults } = await supabase
        .from("kuesioner_results")
        .select("id")
        .in("id_siswa", siswaIds);
      const resultIds = allResults ? allResults.map((r) => r.id) : [];

      if (resultIds.length > 0) {
        await supabase.from("kuesioner_result_scores").delete().in("id_result", resultIds);
        await supabase.from("bk_notes").delete().in("id_result", resultIds);
        await supabase.from("kuesioner_results").delete().in("id_siswa", siswaIds);
      }
      await supabase.from("kuesioner_responses").delete().in("id_siswa", siswaIds);
      await supabase.from("link_codes").delete().in("id_siswa", siswaIds);

      const { data: allOrtu } = await supabase
        .from("orang_tua_profiles")
        .select("id, id_user")
        .in("id_siswa", siswaIds);
      const ortuUserIds = allOrtu ? allOrtu.map((o) => o.id_user) : [];
      const ortuIds = allOrtu ? allOrtu.map((o) => o.id) : [];

      if (ortuUserIds.length > 0) {
        await supabase.from("users").delete().in("id", ortuUserIds);
      }
      if (ortuIds.length > 0) {
        await supabase.from("orang_tua_profiles").delete().in("id", ortuIds);
      }

      await supabase.from("siswa_profiles").delete().in("id", siswaIds);

      const { data: studentUsers } = await supabase
        .from("users")
        .select("id")
        .eq("role", "siswa");
      const studentUserIds = studentUsers ? studentUsers.map((u) => u.id) : [];
      if (studentUserIds.length > 0) {
        await supabase.from("users").delete().in("id", studentUserIds);
      }
    }

    await supabase.from("master_nisn").delete().neq("nisn", "");

    return { success: true, count };
  } catch (err) {
    console.error("deleteAllMasterAndStudents error:", err.message, err.details, err.hint);
    return { success: false, code: "DELETE_FAILED", message: "Gagal menghapus semua data." };
  }
}

/* ─────────────── Guru BK assignment ─────────────── */

export async function getGuruBkUserList() {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, nama")
    .eq("role", "guru_bk")
    .order("username");
  if (error) {
    console.error("getGuruBkUserList error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function getGuruBkName(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("nama, username")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("getGuruBkName error:", error.message, error.details, error.hint);
    return null;
  }
  return data ? (data.nama || `@${data.username}`) : null;
}

export async function updateUserNama(userId, nama) {
  const { error } = await supabase
    .from("users")
    .update({ nama: nama || "" })
    .eq("id", userId);
  if (error) {
    console.error("updateUserNama error:", error.message, error.details, error.hint);
    return { success: false, code: "UPDATE_FAILED" };
  }
  return { success: true };
}

export async function reassignSiswaGuruBk(siswaProfileId, newGuruBkUserId) {
  const { error } = await supabase
    .from("siswa_profiles")
    .update({ id_guru_bk: newGuruBkUserId || null })
    .eq("id", siswaProfileId);
  if (error) {
    console.error("reassignSiswaGuruBk error:", error.message, error.details, error.hint);
    return { success: false, code: "UPDATE_FAILED" };
  }
  return { success: true };
}

export async function getMasterNisnByAngkatan(angkatan) {
  const { data, error } = await supabase
    .from("master_nisn")
    .select("*")
    .eq("angkatan_tahun", angkatan)
    .order("nisn");
  if (error) {
    console.error("getMasterNisnByAngkatan error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function redistributeStudentsEqually(angkatan) {
  const guruBkList = await getGuruBkUserList();
  if (guruBkList.length === 0) return { success: false, code: "NO_GURU_BK", message: "Belum ada akun Guru BK. Tambahkan Guru BK terlebih dahulu." };

  const guruBkIds = guruBkList.map((g) => g.id);
  const { data: students } = await supabase
    .from("siswa_profiles")
    .select("id")
    .eq("angkatan_tahun", angkatan);

  if (!students || students.length === 0) return { success: true, count: 0 };

  try {
    const { data: masterRows } = await supabase
      .from("master_nisn")
      .select("nisn, id_guru_bk")
      .eq("angkatan_tahun", angkatan);

    const loads = {};
    for (const gId of guruBkIds) loads[gId] = 0;
    for (const row of masterRows || []) {
      if (row.id_guru_bk && loads[row.id_guru_bk] !== undefined) {
        loads[row.id_guru_bk]++;
      }
    }

    for (const s of students) {
      let min = Infinity;
      let best = guruBkIds[0];
      for (const gId of guruBkIds) {
        if ((loads[gId] || 0) < min) { min = loads[gId] || 0; best = gId; }
      }
      loads[best] = (loads[best] || 0) + 1;
      await supabase.from("siswa_profiles").update({ id_guru_bk: best }).eq("id", s.id);
    }

    return { success: true, count: students.length };
  } catch (err) {
    console.error("redistributeStudentsEqually error:", err.message, err.details, err.hint);
    return { success: false, code: "UPDATE_FAILED", message: "Gagal membagi ulang siswa." };
  }
}

/* ─────────────── Change password ─────────────── */

export async function changePassword(userId, oldPassword, newPassword) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !user) return { success: false, code: "USER_NOT_FOUND" };
  if (hash(oldPassword) !== user.password) return { success: false, code: "WRONG_PASSWORD" };
  if (!newPassword || newPassword.length < 6) return { success: false, code: "PASSWORD_TOO_SHORT" };

  const hashed = hash(newPassword);
  const { error: updateErr } = await supabase
    .from("users")
    .update({ password: hashed })
    .eq("id", userId);
  if (updateErr) return { success: false, code: "UPDATE_FAILED" };

  const stored = getStoredSession();
  if (stored && stored.id === userId) {
    stored.password = hashed;
    storeSession(stored);
  }
  return { success: true };
}

/* ─────────────── Parent registration ─────────────── */

export async function registerOrangTua(nama, email, username, password, linkCode) {
  const normalized = username.toLowerCase().trim();
  if (await usernameTaken(normalized)) return { success: false, code: "USERNAME_TAKEN" };

  const verification = await verifyLinkCode(linkCode);
  if (!verification.success) return { success: false, code: verification.code, message: verification.message };

  const link = verification.link;

  // Check if this student already has a parent linked
  const { data: existingOrtu } = await supabase
    .from("orang_tua_profiles")
    .select("id")
    .eq("id_siswa", link.id_siswa)
    .maybeSingle();
  if (existingOrtu) {
    return { success: false, code: "SUDAH_TERKAIT", message: "Siswa ini sudah memiliki akun orang tua yang terdaftar." };
  }

  const ortuId = uuid();
  const userId = uuid();

  const newUser = { id: userId, username: normalized, password: hash(password), role: "orang_tua" };
  const newOrtu = { id: ortuId, id_user: userId, id_siswa: link.id_siswa, nama_orang_tua: nama, email_orang_tua: email };

  const { error: userErr } = await supabase.from("users").insert(newUser);
  if (userErr) {
    console.error("registerOrangTua user error:", userErr.message, userErr.details, userErr.hint);
    if (userErr.code === "23505") return { success: false, code: "USERNAME_TAKEN", message: "Username sudah digunakan, silakan pilih yang lain." };
    return { success: false, code: "INSERT_FAILED", message: "Gagal membuat akun. Silakan coba lagi." };
  }

  const { error: ortuErr } = await supabase.from("orang_tua_profiles").insert(newOrtu);
  if (ortuErr) {
    console.error("registerOrangTua ortu error:", ortuErr.message, ortuErr.details, ortuErr.hint);
    await supabase.from("users").delete().eq("id", userId);
    return { success: false, code: "INSERT_FAILED", message: "Gagal membuat akun. Silakan coba lagi." };
  }

  const { error: linkErr } = await supabase
    .from("link_codes")
    .update({ status: "terpakai", id_ortu_pemakai: ortuId, used_at: new Date().toISOString() })
    .eq("id", link.id);
  if (linkErr) {
    console.error("registerOrangTua link error:", linkErr.message, linkErr.details, linkErr.hint);
    await supabase.from("orang_tua_profiles").delete().eq("id", ortuId);
    await supabase.from("users").delete().eq("id", userId);
    return { success: false, code: "INSERT_FAILED", message: "Gagal membuat akun. Silakan coba lagi." };
  }

  storeSession(newUser);
  return {
    success: true,
    message: "Akun Orang Tua berhasil dibuat dan ditautkan ke akun siswa.",
    data: { orang_tua_id: ortuId, nama_orang_tua: nama, anak_tertaut: { siswa_id: link.id_siswa, nama_siswa: link.siswa_nama } },
  };
}

/* ─────────────── Password reset (role-based) ─────────────── */

// TODO: Passwords are stored as base64 (plain-text equivalent).
//       MUST be hashed with bcrypt (or similar) before any real-school deployment.
//       The hash() function below and all callers must switch to use the hashing
//       library. The reset and change-password flows must hash the new password
//       once hashing is added.

export async function resetUserPassword(targetUserId, newPassword, requesterRole) {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, code: "PASSWORD_TOO_SHORT", message: "Password baru minimal 6 karakter." };
  }

  // Guru BK: can only reset siswa passwords
  if (requesterRole === "guru_bk") {
    const { data: target, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", targetUserId)
      .maybeSingle();
    if (error) {
      console.error("resetUserPassword target check error:", error.message, error.details, error.hint);
      return { success: false, code: "ERROR", message: "Terjadi kesalahan sistem." };
    }
    if (!target || target.role !== "siswa") {
      return { success: false, code: "FORBIDDEN", message: "Anda hanya dapat mereset password siswa." };
    }
  }

  // Admin: unrestricted (can reset any role including other admins)

  const { error } = await supabase
    .from("users")
    .update({ password: hash(newPassword) })
    .eq("id", targetUserId);

  if (error) {
    console.error("resetUserPassword error:", error.message, error.details, error.hint);
    return { success: false, code: "UPDATE_FAILED", message: "Gagal mereset password." };
  }

  return { success: true, message: "Password berhasil direset. Bagikan password baru kepada pengguna." };
}
