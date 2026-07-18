import { v4 as uuid } from "uuid";
import {
  SEED_USERS, SEED_SISWA_PROFILES, MASTER_NISN, SEED_QUESTIONS,
  SEED_KUESIONER_RESULTS, SEED_BK_NOTES, SEED_LINK_CODES,
  SEED_RESPONSES_FOR_DONI, SEED_RESPONSES_FOR_SITI, SEED_RESPONSES_FOR_AGUS, SEED_RESPONSES_FOR_RINA,
} from "./seed";

const APP_VERSION = "5";
const KEYS = {
  version: "sami_version",
  users: "sami_users",
  siswa: "sami_siswa_profiles",
  ortu: "sami_orang_tua_profiles",
  questions: "sami_questions",
  responses: "sami_kuesioner_responses",
  results: "sami_kuesioner_results",
  notes: "sami_bk_notes",
  links: "sami_link_codes",
  masterNisn: "sami_master_nisn",
  currentUser: "sami_current_user",
  avatars: "sami_avatars",
};

function get(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function seedData() {
  const ver = get(KEYS.version);
  if (ver !== APP_VERSION) {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  }
  if (get(KEYS.users)) return;
  set(KEYS.version, APP_VERSION);
  set(KEYS.users, SEED_USERS);
  set(KEYS.siswa, SEED_SISWA_PROFILES);
  set(KEYS.masterNisn, MASTER_NISN);
  set(KEYS.questions, SEED_QUESTIONS);
  set(KEYS.results, SEED_KUESIONER_RESULTS);
  set(KEYS.notes, SEED_BK_NOTES);
  set(KEYS.links, SEED_LINK_CODES);
  const allResponses = [...SEED_RESPONSES_FOR_DONI, ...SEED_RESPONSES_FOR_SITI, ...SEED_RESPONSES_FOR_AGUS, ...SEED_RESPONSES_FOR_RINA];
  set(KEYS.responses, allResponses);
  set(KEYS.ortu, []);
}

function hash(pw) {
  return btoa(pw);
}

function verifyHash(pw, hashed) {
  return btoa(pw) === hashed;
}

export function loginUser(username, password) {
  const users = get(KEYS.users) || [];
  const user = users.find((u) => u.username === username && verifyHash(password, u.password));
  if (!user) return null;
  set(KEYS.currentUser, user);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(KEYS.currentUser);
}

export function getCurrentUser() {
  return get(KEYS.currentUser);
}

export function isLoggedIn() {
  return !!get(KEYS.currentUser);
}

export function getUsers() {
  return get(KEYS.users) || [];
}

export function getSiswaProfiles() {
  return get(KEYS.siswa) || [];
}

export function getOrtuProfiles() {
  return get(KEYS.ortu) || [];
}

export function getQuestions() {
  return get(KEYS.questions) || [];
}

export function getResults() {
  return get(KEYS.results) || [];
}

export function getNotes() {
  return get(KEYS.notes) || [];
}

export function getLinks() {
  return get(KEYS.links) || [];
}

export function getMasterNisn() {
  return get(KEYS.masterNisn) || [];
}

export function getResponses() {
  return get(KEYS.responses) || [];
}

export function getSiswaProfileByUserId(userId) {
  return (get(KEYS.siswa) || []).find((s) => s.id_user === userId) || null;
}

export function getSiswaProfileById(id) {
  return (get(KEYS.siswa) || []).find((s) => s.id === id) || null;
}

export function getUserById(id) {
  return (get(KEYS.users) || []).find((u) => u.id === id) || null;
}

export function getResultBySiswaId(siswaId) {
  return (get(KEYS.results) || []).find((r) => r.id_siswa === siswaId) || null;
}

export function getNotesByResultId(resultId) {
  return (get(KEYS.notes) || []).filter((n) => n.id_result === resultId);
}

export function checkNisn(nisn) {
  const master = get(KEYS.masterNisn) || [];
  return master.find((m) => m.nisn === nisn) || null;
}

export function nisnAlreadyClaimed(nisn) {
  const siswas = get(KEYS.siswa) || [];
  return siswas.some((s) => s.nisn === nisn);
}

export function getMasterNisnList() {
  const master = get(KEYS.masterNisn) || [];
  const siswas = get(KEYS.siswa) || [];
  const claimedNisns = new Set(siswas.map((s) => s.nisn));
  return master.map((m) => ({ ...m, status: claimedNisns.has(m.nisn) ? "sudah_diklaim" : "belum_diklaim" }));
}

export function addMasterNisn(nisn, nama, angkatanTahun) {
  const master = get(KEYS.masterNisn) || [];
  if (master.some((m) => m.nisn === nisn)) return { success: false, code: "NISN_EXISTS" };
  if (nisnAlreadyClaimed(nisn)) return { success: false, code: "NISN_ALREADY_CLAIMED" };
  master.push({ nisn, nama, angkatan_tahun: parseInt(angkatanTahun) });
  set(KEYS.masterNisn, master);
  return { success: true };
}

export function deleteMasterNisn(nisn) {
  let master = get(KEYS.masterNisn) || [];
  master = master.filter((m) => m.nisn !== nisn);
  set(KEYS.masterNisn, master);
  return { success: true };
}

export function isMasterClaimed(nisn) {
  return nisnAlreadyClaimed(nisn);
}

export function usernameTaken(username) {
  const users = get(KEYS.users) || [];
  return users.some((u) => u.username === username);
}

export function registerSiswa(nisn, username, password) {
  const master = checkNisn(nisn);
  if (!master) return { success: false, code: "NISN_NOT_FOUND" };
  if (nisnAlreadyClaimed(nisn)) return { success: false, code: "NISN_ALREADY_CLAIMED" };
  if (usernameTaken(username)) return { success: false, code: "USERNAME_TAKEN" };

  const users = get(KEYS.users) || [];
  const siswas = get(KEYS.siswa) || [];
  const links = get(KEYS.links) || [];

  const userId = uuid();
  const siswaId = uuid();
  const angkatan = master.angkatan_tahun;

  const newUser = { id: userId, username, password: hash(password), role: "siswa" };
  const newSiswa = { id: siswaId, id_user: userId, nisn, nama_siswa: master.nama, angkatan_tahun: angkatan, status_kuesioner: "belum_dikerjakan" };

  const linkCode = generateLinkCode(master.nama);
  const newLink = { id: uuid(), kode: linkCode, id_siswa: siswaId, status: "aktif", id_ortu_pemakai: null, created_at: new Date().toISOString(), used_at: null, expires_at: new Date(Date.now() + 365 * 86400000).toISOString() };

  users.push(newUser);
  siswas.push(newSiswa);
  links.push(newLink);

  set(KEYS.users, users);
  set(KEYS.siswa, siswas);
  set(KEYS.links, links);

  return {
    success: true,
    message: "Registrasi mandiri siswa baru berhasil dilakukan.",
    data: { user_id: userId, nisn, nama_siswa: master.nama, angkatan_tahun: angkatan, role: "siswa", status_kuesioner: "belum_dikerjakan", link_code: linkCode },
  };
}

function generateLinkCode(nama) {
  const prefix = nama.substring(0, 3).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `SMK-${prefix}-${rand}${Math.floor(10 + Math.random() * 90)}`;
}

export function verifyLinkCode(kode) {
  const links = get(KEYS.links) || [];
  const link = links.find((l) => l.kode === kode);
  if (!link) return null;
  if (link.status !== "aktif") return null;
  if (new Date(link.expires_at) < new Date()) return null;
  const siswa = (get(KEYS.siswa) || []).find((s) => s.id === link.id_siswa);
  return { ...link, siswa_nama: siswa ? siswa.nama_siswa : "Unknown" };
}

export function registerOrangTua(nama, email, username, password, linkCode) {
  if (usernameTaken(username)) return { success: false, code: "USERNAME_TAKEN" };

  const link = verifyLinkCode(linkCode);
  if (!link) return { success: false, code: "INVALID_LINK_CODE" };

  const users = get(KEYS.users) || [];
  const ortus = get(KEYS.ortu) || [];
  const links = get(KEYS.links) || [];

  const ortuId = uuid();
  const userId = uuid();

  const newUser = { id: userId, username, password: hash(password), role: "orang_tua" };
  const newOrtu = { id: ortuId, id_user: userId, id_siswa: link.id_siswa, nama_orang_tua: nama, email_orang_tua: email };

  const linkIdx = links.findIndex((l) => l.id === link.id);
  links[linkIdx] = { ...links[linkIdx], status: "terpakai", id_ortu_pemakai: ortuId, used_at: new Date().toISOString() };

  users.push(newUser);
  ortus.push(newOrtu);

  set(KEYS.users, users);
  set(KEYS.ortu, ortus);
  set(KEYS.links, links);

  return {
    success: true,
    message: "Akun Orang Tua berhasil dibuat dan ditautkan ke akun siswa.",
    data: { orang_tua_id: ortuId, nama_orang_tua: nama, anak_tertaut: { siswa_id: link.id_siswa, nama_siswa: link.siswa_nama } },
  };
}

export function getOrtuByUserId(userId) {
  return (get(KEYS.ortu) || []).find((o) => o.id_user === userId) || null;
}

export function submitKuesioner(siswaId, responses) {
  const results = get(KEYS.results) || [];
  const existing = results.find((r) => r.id_siswa === siswaId);
  if (existing) return { success: false, code: "QUESTIONNAIRE_ALREADY_SUBMITTED" };

  if (!responses || responses.length === 0) return { success: false, code: "INCOMPLETE" };

  const questions = get(KEYS.questions) || [];
  const multimediaQuestions = questions.filter((q) => q.klaster_jurusan === "multimedia_dkv");
  const tbsmQuestions = questions.filter((q) => q.klaster_jurusan === "tbsm");

  let totalMultimedia = 0;
  let totalTbsm = 0;

  const savedResponses = get(KEYS.responses) || [];
  const newResponses = responses.map((r) => {
    const q = questions.find((qq) => qq.id === r.id_soal);
    if (q && q.klaster_jurusan === "multimedia_dkv") totalMultimedia += r.nilai_jawaban;
    else if (q && q.klaster_jurusan === "tbsm") totalTbsm += r.nilai_jawaban;
    return { id: uuid(), id_siswa: siswaId, id_soal: r.id_soal, nilai_jawaban: r.nilai_jawaban };
  });

  savedResponses.push(...newResponses);
  set(KEYS.responses, savedResponses);

  const totalPoints = totalMultimedia + totalTbsm;
  const skorMultimedia = totalPoints > 0 ? Math.round((totalMultimedia / totalPoints) * 100 * 100) / 100 : 0;
  const skorTbsm = totalPoints > 0 ? Math.round((totalTbsm / totalPoints) * 100 * 100) / 100 : 0;

  const rekomendasi = skorMultimedia >= skorTbsm ? "Multimedia / DKV" : "TBSM";
  const newResult = {
    id: uuid(),
    id_siswa: siswaId,
    skor_multimedia: skorMultimedia,
    skor_tbsm: skorTbsm,
    rekomendasi_final: rekomendasi,
  };
  results.push(newResult);
  set(KEYS.results, results);

  const siswas = get(KEYS.siswa) || [];
  const idx = siswas.findIndex((s) => s.id === siswaId);
  if (idx >= 0) {
    siswas[idx].status_kuesioner = "selesai";
    set(KEYS.siswa, siswas);
  }

  return {
    success: true,
    message: "Kuesioner berhasil dikalkulasi dan status Anda telah dikunci.",
    data: { id_hasil: newResult.id, id_siswa: newResult.id_siswa, skor_multimedia: newResult.skor_multimedia, skor_tbsm: newResult.skor_tbsm, rekomendasi_final: newResult.rekomendasi_final },
  };
}

export function getBkNotes() {
  return get(KEYS.notes) || [];
}

export function addBkNote(idResult, idGuruBk, teks) {
  if (!teks || teks.trim() === "") return { success: false, code: "CATATAN_KOSONG" };
  const notes = get(KEYS.notes) || [];
  const newNote = { id: uuid(), id_result: idResult, id_guru_bk: idGuruBk, teks_catatan: teks.trim(), created_at: new Date().toISOString() };
  notes.push(newNote);
  set(KEYS.notes, notes);
  return {
    success: true,
    message: "Catatan intervensi konseling Guru BK berhasil disimpan.",
    data: { catatan_id: newNote.id, id_result: newNote.id_result, id_guru_bk: newNote.id_guru_bk, teks_catatan: newNote.teks_catatan, created_at: newNote.created_at },
  };
}

export function getSiswaByAngkatan(angkatan) {
  const siswas = get(KEYS.siswa) || [];
  return siswas.filter((s) => s.angkatan_tahun === angkatan);
}

export function getAllAngkatans() {
  const siswas = get(KEYS.siswa) || [];
  return [...new Set(siswas.map((s) => s.angkatan_tahun))].sort((a, b) => b - a);
}

export function getStudentsBimbingan(angkatan) {
  const siswas = getSiswaByAngkatan(angkatan);
  const results = get(KEYS.results) || [];
  const notes = get(KEYS.notes) || [];

  return siswas.map((s) => {
    const result = results.find((r) => r.id_siswa === s.id);
    const hasNote = result ? notes.some((n) => n.id_result === result.id) : false;
    return {
      siswa_id: s.id,
      nisn: s.nisn,
      nama_siswa: s.nama_siswa,
      angkatan: s.angkatan_tahun,
      status_kuesioner: s.status_kuesioner,
      rekomendasi_sistem: result ? result.rekomendasi_final : "-",
      status_catatan_bk: hasNote ? "sudah_diberikan" : "belum_diberikan",
      skor_multimedia: result ? result.skor_multimedia : 0,
      skor_tbsm: result ? result.skor_tbsm : 0,
      id_result: result ? result.id : null,
    };
  });
}

export function addUser(username, password, role) {
  if (usernameTaken(username)) return { success: false, code: "USERNAME_TAKEN" };
  const users = get(KEYS.users) || [];
  const newUser = { id: uuid(), username, password: hash(password), role };
  users.push(newUser);
  set(KEYS.users, users);

  if (role === "siswa") {
    const master = get(KEYS.masterNisn) || [];
    const siswas = get(KEYS.siswa) || [];
    const claimed = new Set(siswas.map((s) => s.nisn));
    const available = master.find((m) => !claimed.has(m.nisn));
    if (available) {
      const newSiswa = {
        id: uuid(),
        id_user: newUser.id,
        nisn: available.nisn,
        nama_siswa: available.nama,
        angkatan_tahun: available.angkatan_tahun,
        status_kuesioner: "belum_dikerjakan",
      };
      siswas.push(newSiswa);
      set(KEYS.siswa, siswas);
    }
  }

  return { success: true };
}

export function deleteUser(userId) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) return { success: false, code: "CANNOT_DELETE_SELF" };
  let users = get(KEYS.users) || [];
  users = users.filter((u) => u.id !== userId);
  set(KEYS.users, users);

  let siswas = get(KEYS.siswa) || [];
  siswas = siswas.filter((s) => s.id_user !== userId);
  set(KEYS.siswa, siswas);

  return { success: true };
}

export function getAvatar(userId) {
  const avatars = JSON.parse(localStorage.getItem(KEYS.avatars) || "{}");
  return avatars[userId] || null;
}

export function setAvatar(userId, base64) {
  const avatars = JSON.parse(localStorage.getItem(KEYS.avatars) || "{}");
  avatars[userId] = base64;
  localStorage.setItem(KEYS.avatars, JSON.stringify(avatars));
}

export function removeAvatar(userId) {
  const avatars = JSON.parse(localStorage.getItem(KEYS.avatars) || "{}");
  delete avatars[userId];
  localStorage.setItem(KEYS.avatars, JSON.stringify(avatars));
}

export function changePassword(userId, oldPassword, newPassword) {
  const users = get(KEYS.users) || [];
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, code: "USER_NOT_FOUND" };
  if (!verifyHash(oldPassword, users[idx].password)) return { success: false, code: "WRONG_PASSWORD" };
  if (!newPassword || newPassword.length < 6) return { success: false, code: "PASSWORD_TOO_SHORT" };
  users[idx].password = hash(newPassword);
  set(KEYS.users, users);
  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.password = users[idx].password;
    set(KEYS.currentUser, current);
  }
  return { success: true };
}

export function resetData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  seedData();
}

export function clearSession() {
  localStorage.removeItem(KEYS.currentUser);
}
