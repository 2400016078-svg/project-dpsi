import { supabase } from "../lib/supabaseClient";
import { v4 as uuid } from "uuid";

// TODO: Password hashing must be added before production (currently stored as base64)
function hash(pw) { return btoa(pw); }

const FIXED = {
  adminId: "a0000000-0000-4000-8000-000000000001",
  gurubkId: "a0000000-0000-4000-8000-000000000002",
  siswaUserIds: [
    "a0000000-0000-4000-8000-000000000003",
    "a0000000-0000-4000-8000-000000000004",
    "a0000000-0000-4000-8000-000000000005",
    "a0000000-0000-4000-8000-000000000006",
    "a0000000-0000-4000-8000-000000000007",
    "a0000000-0000-4000-8000-000000000008",
  ],
  siswaProfileIds: [
    "b0000000-0000-4000-8000-000000000001",
    "b0000000-0000-4000-8000-000000000002",
    "b0000000-0000-4000-8000-000000000003",
    "b0000000-0000-4000-8000-000000000004",
    "b0000000-0000-4000-8000-000000000005",
    "b0000000-0000-4000-8000-000000000006",
  ],
  resultIds: [
    "c0000000-0000-4000-8000-000000000001",
    "c0000000-0000-4000-8000-000000000002",
    "c0000000-0000-4000-8000-000000000003",
    "c0000000-0000-4000-8000-000000000004",
  ],
  noteId: "d0000000-0000-4000-8000-000000000001",
  linkIds: [
    "e0000000-0000-4000-8000-000000000001",
    "e0000000-0000-4000-8000-000000000002",
    "e0000000-0000-4000-8000-000000000003",
    "e0000000-0000-4000-8000-000000000004",
    "e0000000-0000-4000-8000-000000000005",
    "e0000000-0000-4000-8000-000000000006",
  ],
};

const USERS = [
  { id: FIXED.adminId, username: "admin", password: hash("admin123"), role: "admin", nama: "Administrator" },
  { id: FIXED.gurubkId, username: "gurubk", password: hash("bk123"), role: "guru_bk", nama: "Sari Wulandari, S.Pd.", kelompok: "A" },
  { id: FIXED.siswaUserIds[0], username: "budi.permana", password: hash("siswa123"), role: "siswa" },
  { id: FIXED.siswaUserIds[1], username: "riyan.hidayat", password: hash("siswa123"), role: "siswa" },
  { id: FIXED.siswaUserIds[2], username: "doni.prasetyo", password: hash("siswa123"), role: "siswa" },
  { id: FIXED.siswaUserIds[3], username: "siti.nurhaliza", password: hash("siswa123"), role: "siswa" },
  { id: FIXED.siswaUserIds[4], username: "agus.wibowo", password: hash("siswa123"), role: "siswa" },
  { id: FIXED.siswaUserIds[5], username: "rina.kusuma", password: hash("siswa123"), role: "siswa" },
];

const SISWA_PROFILES = [
  { id: FIXED.siswaProfileIds[0], id_user: FIXED.siswaUserIds[0], nisn: "0061234567", nama_siswa: "Budi Permana", angkatan_tahun: 2026, status_kuesioner: "belum_dikerjakan", kelompok: "A" },
  { id: FIXED.siswaProfileIds[1], id_user: FIXED.siswaUserIds[1], nisn: "0067654321", nama_siswa: "Riyan Hidayat", angkatan_tahun: 2026, status_kuesioner: "belum_dikerjakan", kelompok: "A" },
  { id: FIXED.siswaProfileIds[2], id_user: FIXED.siswaUserIds[2], nisn: "0061122334", nama_siswa: "Doni Prasetyo", angkatan_tahun: 2026, status_kuesioner: "selesai", kelompok: "B" },
  { id: FIXED.siswaProfileIds[3], id_user: FIXED.siswaUserIds[3], nisn: "0065566778", nama_siswa: "Siti Nurhaliza", angkatan_tahun: 2026, status_kuesioner: "selesai", kelompok: "B" },
  { id: FIXED.siswaProfileIds[4], id_user: FIXED.siswaUserIds[4], nisn: "0069988776", nama_siswa: "Agus Wibowo", angkatan_tahun: 2025, status_kuesioner: "selesai", kelompok: "A" },
  { id: FIXED.siswaProfileIds[5], id_user: FIXED.siswaUserIds[5], nisn: "0064433221", nama_siswa: "Rina Kusuma", angkatan_tahun: 2025, status_kuesioner: "selesai", kelompok: "B" },
];

const MASTER_NISN = [
  { nisn: "0061234567", nama_siswa: "Budi Permana", angkatan_tahun: 2026, is_claimed: true, kelompok: "A" },
  { nisn: "0067654321", nama_siswa: "Riyan Hidayat", angkatan_tahun: 2026, is_claimed: true, kelompok: "A" },
  { nisn: "0061122334", nama_siswa: "Doni Prasetyo", angkatan_tahun: 2026, is_claimed: true, kelompok: "B" },
  { nisn: "0065566778", nama_siswa: "Siti Nurhaliza", angkatan_tahun: 2026, is_claimed: true, kelompok: "B" },
  { nisn: "0069988776", nama_siswa: "Agus Wibowo", angkatan_tahun: 2025, is_claimed: true, kelompok: "A" },
  { nisn: "0064433221", nama_siswa: "Rina Kusuma", angkatan_tahun: 2025, is_claimed: true, kelompok: "B" },
  { nisn: "0069876543", nama_siswa: "Ahmad Fauzi", angkatan_tahun: 2026, is_claimed: false, kelompok: "A" },
  { nisn: "0068765432", nama_siswa: "Dewi Sartika", angkatan_tahun: 2026, is_claimed: false, kelompok: "A" },
  { nisn: "0061111001", nama_siswa: "Fitriani Rahmawati", angkatan_tahun: 2026, is_claimed: false, kelompok: "B" },
  { nisn: "0061111002", nama_siswa: "Hendra Gunawan", angkatan_tahun: 2026, is_claimed: false, kelompok: "B" },
  { nisn: "0061111003", nama_siswa: "Indah Permata Sari", angkatan_tahun: 2026, is_claimed: false, kelompok: "A" },
  { nisn: "0698765439", nama_siswa: "Fiky Ramahdani", angkatan_tahun: 2026, is_claimed: false, kelompok: "B" },
];

const QUESTIONS = [
  { id: 1, teks_pertanyaan: "Saya senang menggambar, membuat sketsa, atau mendesain sesuatu secara visual.", klaster_jurusan: "multimedia_dkv" },
  { id: 2, teks_pertanyaan: "Saya tertarik mengedit foto atau video menggunakan aplikasi di komputer atau HP.", klaster_jurusan: "multimedia_dkv" },
  { id: 3, teks_pertanyaan: "Saya suka memperhatikan warna, tata letak, dan tampilan desain di poster atau media sosial.", klaster_jurusan: "multimedia_dkv" },
  { id: 4, teks_pertanyaan: "Saya senang membuat konten kreatif seperti ilustrasi, animasi, atau desain grafis.", klaster_jurusan: "multimedia_dkv" },
  { id: 5, teks_pertanyaan: "Saya tertarik belajar software desain seperti Photoshop, CorelDRAW, atau Canva.", klaster_jurusan: "multimedia_dkv" },
  { id: 6, teks_pertanyaan: "Saya suka mengekspresikan ide melalui gambar atau karya visual daripada tulisan panjang.", klaster_jurusan: "multimedia_dkv" },
  { id: 7, teks_pertanyaan: "Saya tertarik dengan dunia fotografi dan pengambilan gambar yang menarik.", klaster_jurusan: "multimedia_dkv" },
  { id: 8, teks_pertanyaan: "Saya senang membuat desain logo, banner, atau tampilan yang enak dilihat.", klaster_jurusan: "multimedia_dkv" },
  { id: 9, teks_pertanyaan: "Saya tertarik membuat video pendek, motion graphic, atau konten digital kreatif.", klaster_jurusan: "multimedia_dkv" },
  { id: 10, teks_pertanyaan: "Saya merasa puas ketika berhasil menciptakan sesuatu yang indah dan kreatif.", klaster_jurusan: "multimedia_dkv" },
  { id: 11, teks_pertanyaan: "Saya tertarik dengan mesin sepeda motor dan cara kerjanya.", klaster_jurusan: "tbsm" },
  { id: 12, teks_pertanyaan: "Saya senang membongkar, memperbaiki, atau merakit barang yang berhubungan dengan mesin.", klaster_jurusan: "tbsm" },
  { id: 13, teks_pertanyaan: "Saya tidak masalah bekerja dengan tangan dan alat-alat teknik (kunci, obeng, dll).", klaster_jurusan: "tbsm" },
  { id: 14, teks_pertanyaan: "Saya tertarik mempelajari komponen otomotif seperti rem, kelistrikan, atau bahan bakar.", klaster_jurusan: "tbsm" },
  { id: 15, teks_pertanyaan: "Saya senang memahami penyebab kerusakan mesin dan cara memperbaikinya.", klaster_jurusan: "tbsm" },
  { id: 16, teks_pertanyaan: "Saya tertarik dengan dunia perbengkelan dan servis sepeda motor.", klaster_jurusan: "tbsm" },
  { id: 17, teks_pertanyaan: "Saya ingin bisa melakukan perawatan rutin (ganti oli, setel mesin) pada kendaraan.", klaster_jurusan: "tbsm" },
  { id: 18, teks_pertanyaan: "Saya tertarik dengan bisnis jual-beli atau suku cadang sepeda motor.", klaster_jurusan: "tbsm" },
  { id: 19, teks_pertanyaan: "Saya merasa nyaman bekerja di lingkungan praktik/teknis dibanding pekerjaan di belakang meja.", klaster_jurusan: "tbsm" },
  { id: 20, teks_pertanyaan: "Saya merasa puas ketika berhasil memperbaiki atau membuat mesin berfungsi kembali.", klaster_jurusan: "tbsm" },
];

const KUESIONER_RESULTS = [
  { id: FIXED.resultIds[0], id_siswa: FIXED.siswaProfileIds[2], skor_multimedia: 75.93, skor_tbsm: 24.07, rekomendasi_final: "Multimedia / DKV" },
  { id: FIXED.resultIds[1], id_siswa: FIXED.siswaProfileIds[3], skor_multimedia: 28.57, skor_tbsm: 71.43, rekomendasi_final: "TBSM" },
  { id: FIXED.resultIds[2], id_siswa: FIXED.siswaProfileIds[4], skor_multimedia: 46.43, skor_tbsm: 53.57, rekomendasi_final: "TBSM" },
  { id: FIXED.resultIds[3], id_siswa: FIXED.siswaProfileIds[5], skor_multimedia: 80.70, skor_tbsm: 19.30, rekomendasi_final: "Multimedia / DKV" },
];

const BK_NOTES = [
  { id: FIXED.noteId, id_result: FIXED.resultIds[0], id_guru_bk: FIXED.gurubkId, teks_catatan: "Siswa menunjukkan bakat kuat di industri visual kreatif.", created_at: "2026-06-17T21:00:00Z" },
];

const LINK_CODES = [
  { id: FIXED.linkIds[0], kode: "SMK-BUD-99AA", id_siswa: FIXED.siswaProfileIds[0], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: FIXED.linkIds[1], kode: "SMK-RIY-77BB", id_siswa: FIXED.siswaProfileIds[1], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: FIXED.linkIds[2], kode: "SMK-DON-55CC", id_siswa: FIXED.siswaProfileIds[2], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: FIXED.linkIds[3], kode: "SMK-SIT-33DD", id_siswa: FIXED.siswaProfileIds[3], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: FIXED.linkIds[4], kode: "SMK-AGU-11EE", id_siswa: FIXED.siswaProfileIds[4], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: FIXED.linkIds[5], kode: "SMK-RIN-99FF", id_siswa: FIXED.siswaProfileIds[5], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
];

function makeResponses(siswaIdx, values) {
  return values.map((v, i) => ({
    id: uuid(),
    id_siswa: FIXED.siswaProfileIds[siswaIdx],
    id_soal: i + 1,
    nilai_jawaban: v,
  }));
}

const RESPONSES_DONI = makeResponses(2, [4,4,5,4,5,3,4,5,4,3,1,2,1,1,2,1,1,1,2,1]);
const RESPONSES_SITI = makeResponses(3, [2,1,2,1,3,1,2,1,1,2,4,5,4,3,4,5,4,4,3,4]);
const RESPONSES_AGUS = makeResponses(4, [3,2,3,2,4,2,2,3,2,3,3,4,3,2,3,3,4,3,2,3]);
const RESPONSES_RINA = makeResponses(5, [5,5,4,5,4,4,5,5,5,4,1,1,1,1,1,1,1,2,1,1]);

export async function seedSupabase() {
  const { count, error: countErr } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countErr) {
    console.warn("Seed check failed (Supabase not configured?)", countErr.message);
    return;
  }

  if (count && count > 0) {
    console.log("Supabase already seeded — skipping.");
    return;
  }

  console.log("Seeding Supabase...");

  await supabase.from("master_nisn").insert(MASTER_NISN);
  await supabase.from("users").insert(USERS);
  await supabase.from("siswa_profiles").insert(SISWA_PROFILES);
  await supabase.from("questions").insert(QUESTIONS);
  await supabase.from("kuesioner_results").insert(KUESIONER_RESULTS);
  await supabase.from("bk_notes").insert(BK_NOTES);
  await supabase.from("link_codes").insert(LINK_CODES);
  await supabase.from("kuesioner_responses").insert([
    ...RESPONSES_DONI, ...RESPONSES_SITI, ...RESPONSES_AGUS, ...RESPONSES_RINA,
  ]);

  console.log("Supabase seeded successfully.");
}
