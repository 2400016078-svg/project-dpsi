import { v4 as uuid } from "uuid";

function hash(pw) { return btoa(pw); }

export const SEED_USERS = [
  { id: uuid(), username: "admin", password: hash("admin123"), role: "admin" },
  { id: uuid(), username: "gurubk", password: hash("bk123"), role: "guru_bk" },
  { id: uuid(), username: "budi.permana", password: hash("siswa123"), role: "siswa" },
  { id: uuid(), username: "riyan.hidayat", password: hash("siswa123"), role: "siswa" },
  { id: uuid(), username: "doni.prasetyo", password: hash("siswa123"), role: "siswa" },
  { id: uuid(), username: "siti.nurhaliza", password: hash("siswa123"), role: "siswa" },
  { id: uuid(), username: "agus.wibowo", password: hash("siswa123"), role: "siswa" },
  { id: uuid(), username: "rina.kusuma", password: hash("siswa123"), role: "siswa" },
];

export const SEED_SISWA_PROFILES = [
  { id: uuid(), id_user: SEED_USERS[2].id, nisn: "0061234567", nama_siswa: "Budi Permana", angkatan_tahun: 2026, status_kuesioner: "belum_dikerjakan" },
  { id: uuid(), id_user: SEED_USERS[3].id, nisn: "0067654321", nama_siswa: "Riyan Hidayat", angkatan_tahun: 2026, status_kuesioner: "belum_dikerjakan" },
  { id: uuid(), id_user: SEED_USERS[4].id, nisn: "0061122334", nama_siswa: "Doni Prasetyo", angkatan_tahun: 2026, status_kuesioner: "selesai" },
  { id: uuid(), id_user: SEED_USERS[5].id, nisn: "0065566778", nama_siswa: "Siti Nurhaliza", angkatan_tahun: 2026, status_kuesioner: "selesai" },
  { id: uuid(), id_user: SEED_USERS[6].id, nisn: "0069988776", nama_siswa: "Agus Wibowo", angkatan_tahun: 2025, status_kuesioner: "selesai" },
  { id: uuid(), id_user: SEED_USERS[7].id, nisn: "0064433221", nama_siswa: "Rina Kusuma", angkatan_tahun: 2025, status_kuesioner: "selesai" },
];

export const MASTER_NISN = [
  { nisn: "0061234567", nama: "Budi Permana", angkatan_tahun: 2026 },
  { nisn: "0067654321", nama: "Riyan Hidayat", angkatan_tahun: 2026 },
  { nisn: "0061122334", nama: "Doni Prasetyo", angkatan_tahun: 2026 },
  { nisn: "0065566778", nama: "Siti Nurhaliza", angkatan_tahun: 2026 },
  { nisn: "0069988776", nama: "Agus Wibowo", angkatan_tahun: 2025 },
  { nisn: "0064433221", nama: "Rina Kusuma", angkatan_tahun: 2025 },
  { nisn: "0069876543", nama: "Ahmad Fauzi", angkatan_tahun: 2026 },
  { nisn: "0068765432", nama: "Dewi Sartika", angkatan_tahun: 2026 },
  { nisn: "0061111001", nama: "Fitriani Rahmawati", angkatan_tahun: 2026 },
  { nisn: "0061111002", nama: "Hendra Gunawan", angkatan_tahun: 2026 },
  { nisn: "0061111003", nama: "Indah Permata Sari", angkatan_tahun: 2026 },
];

export const SEED_QUESTIONS = [
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

const siswaIds = SEED_SISWA_PROFILES.map((s) => s.id);

export const SEED_KUESIONER_RESULTS = [
  {
    id: uuid(),
    id_siswa: siswaIds[2],
    skor_multimedia: 75.93,
    skor_tbsm: 24.07,
    rekomendasi_final: "Multimedia / DKV",
  },
  {
    id: uuid(),
    id_siswa: siswaIds[3],
    skor_multimedia: 28.57,
    skor_tbsm: 71.43,
    rekomendasi_final: "TBSM",
  },
  {
    id: uuid(),
    id_siswa: siswaIds[4],
    skor_multimedia: 46.43,
    skor_tbsm: 53.57,
    rekomendasi_final: "TBSM",
  },
  {
    id: uuid(),
    id_siswa: siswaIds[5],
    skor_multimedia: 80.70,
    skor_tbsm: 19.30,
    rekomendasi_final: "Multimedia / DKV",
  },
];

export const SEED_BK_NOTES = [
  {
    id: uuid(),
    id_result: SEED_KUESIONER_RESULTS[0].id,
    id_guru_bk: SEED_USERS[1].id,
    teks_catatan: "Siswa menunjukkan bakat kuat di industri visual kreatif.",
    created_at: "2026-06-17T21:00:00Z",
  },
];

export const SEED_LINK_CODES = [
  { id: uuid(), kode: "SMK-BUD-99AA", id_siswa: siswaIds[0], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: uuid(), kode: "SMK-RIY-77BB", id_siswa: siswaIds[1], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: uuid(), kode: "SMK-DON-55CC", id_siswa: siswaIds[2], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: uuid(), kode: "SMK-SIT-33DD", id_siswa: siswaIds[3], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: uuid(), kode: "SMK-AGU-11EE", id_siswa: siswaIds[4], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
  { id: uuid(), kode: "SMK-RIN-99FF", id_siswa: siswaIds[5], status: "aktif", id_ortu_pemakai: null, created_at: "2026-06-17T10:00:00Z", used_at: null, expires_at: "2027-06-17T10:00:00Z" },
];

export const SEED_RESPONSES_FOR_DONI = [
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 1, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 2, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 3, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 4, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 5, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 6, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 7, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 8, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 9, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 10, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 11, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 12, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 13, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 14, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 15, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 16, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 17, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 18, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 19, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[2], id_soal: 20, nilai_jawaban: 1 },
];

export const SEED_RESPONSES_FOR_SITI = [
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 1, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 2, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 3, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 4, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 5, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 6, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 7, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 8, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 9, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 10, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 11, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 12, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 13, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 14, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 15, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 16, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 17, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 18, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 19, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[3], id_soal: 20, nilai_jawaban: 4 },
];

export const SEED_RESPONSES_FOR_AGUS = [
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 1, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 2, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 3, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 4, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 5, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 6, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 7, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 8, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 9, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 10, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 11, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 12, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 13, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 14, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 15, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 16, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 17, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 18, nilai_jawaban: 3 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 19, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[4], id_soal: 20, nilai_jawaban: 3 },
];

export const SEED_RESPONSES_FOR_RINA = [
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 1, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 2, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 3, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 4, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 5, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 6, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 7, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 8, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 9, nilai_jawaban: 5 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 10, nilai_jawaban: 4 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 11, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 12, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 13, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 14, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 15, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 16, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 17, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 18, nilai_jawaban: 2 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 19, nilai_jawaban: 1 },
  { id: uuid(), id_siswa: siswaIds[5], id_soal: 20, nilai_jawaban: 1 },
];
