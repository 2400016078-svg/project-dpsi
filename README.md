# SAMI-SMK — Sistem Analisis Minat Siswa SMK

Aplikasi web responsif untuk memetakan minat siswa baru SMK ke jurusan yang sesuai melalui kuesioner digital. Digunakan oleh empat peran: Admin, Guru BK, Siswa, dan Orang Tua.

- **Aplikasi (deploy):** https://sistemanalisisminatsekolah.netlify.app
- **Repository GitHub:** https://github.com/2400016078-svg/project-dpsi
- **Supabase:** https://zwubwxgucokjtzxrrsvf.supabase.co/rest/v1/rpc/lihat_semua_data?apikey=sb_publishable_rqD_gw0yDFpEh3LfJ0u5ig_XSt9m8IS

---

## Deskripsi Singkat

SAMI-SMK membantu proses identifikasi minat siswa yang selama ini dilakukan manual menjadi terukur dan terdokumentasi. Siswa mengisi kuesioner berskala Likert 1–5, lalu sistem menghitung persentase kecocokan untuk **setiap jurusan secara mandiri (0–100%)** dan merekomendasikan jurusan dengan skor tertinggi. Jumlah jurusan bersifat **dinamis** — Admin dapat menambah, mengubah, atau menghapus jurusan beserta soalnya tanpa mengubah kode. Hasil kuesioner menjadi dasar konseling Guru BK dan dapat dipantau orang tua.

Proyek ini dikembangkan untuk mata kuliah **Desain dan Pengembangan Sistem Informasi**, Program Studi Sistem Informasi, Universitas Ahmad Dahlan.

## Nama Tim

**[DPFIVE]**

## Anggota Tim & Pembagian Peran

| Nama | NIM | Peran / Kontribusi |
|------|-----|---------------------|
| Yoga Wahyu Prabowo | [2400016035] | [ Frontend ] |
| Fikri Ilham | [2400016046] | [Frontend] |
| Rizka Maliza | [2400016063] | [Frontend] |
| Liviya Afriani Pratama | [2400016066] | [Frontend)] |
| Fiky Ramahdani | [2400016078] | [Project Lead, Basis Data (Supabase)] |


## Teknologi yang Digunakan

| Kategori | Teknologi |
|----------|-----------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Supabase (Backend-as-a-Service) |
| Basis Data | PostgreSQL (Supabase) |
| Perkakas | VS Code, Git, GitHub, Netlify |


## Cara Menjalankan Aplikasi (Lokal)

Prasyarat: **Node.js 18** atau lebih baru.

1. Klon repositori:
   ```bash
   git clone https://github.com/2400016078-svg/project-dpsi.git
   cd project-dpsi
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Buat berkas `.env` di folder utama:
   ```
   VITE_SUPABASE_URL=https://zwubwxgucokjtzxrrsvf.supabase.co
   
   VITE_SUPABASE_ANON_KEY=sb_publishable_rqD_gw0yDFpEh3LfJ0u5ig_XSt9m8IS
   ```

4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser.

## Membangun untuk Produksi

```bash
npm run build
```
Hasil build berada di folder `dist`, siap diunggah ke Netlify.

## Akun Demo untuk Setiap Peran

| Peran | Username | Password |
|-------|----------|----------|
| Admin | `admin` | `admin123` |
| Guru BK | `gurubk` | `bk123` |
||
| Siswa (Fajar Hidayat) | `Fajar` | `siswa123` |


### Untuk Orang Tua

Orang Tua mendaftar mandiri melalui halaman "Daftar sebagai Orang Tua" menggunakan kode tautan yang diperoleh saat registrasi siswa. Kode tautan contoh yang tersedia:

| Kode Tautan | Tertaut ke Siswa |
|-------------|------------------|
| `SMK-FAJ-F767` | Fajar Hidayat |

## Skenario Demo Singkat

**Admin** (`admin`/`admin123`) — kelola pengguna, kelola jurusan (dinamis), kelola bank soal, kelola data master NISN, impor Excel.

**Guru BK** (`gurubk`/`bk123`) — lihat statistik siswa bimbingan, buka detail siswa yang telah mengisi kuesioner, lihat grafik minat dan kartu Analisis Minat, tambah catatan konseling.

**Siswa belum mengisi** (`Fajar Hidayat`/`siswa123`) — isi kuesioner (Likert 1–5), submit, lihat grafik hasil dan rekomendasi jurusan; rute kuesioner terkunci setelah selesai.

**Siswa sudah mengisi** (`Fajar Hidayat`/`siswa123`) — buka menu Kuesioner untuk melihat hasil.

**Orang Tua** — daftar via kode `SMK-FAJ-F767`, verifikasi, konfirmasi, login, lihat dasbor hanya-baca hasil anak.

**Registrasi siswa baru** — masukkan NISN dari data master yang belum diklaim, cek NISN, isi akun, simpan kode tautan.

## Struktur Repository

```
project-dpsi/
├── src/                  # Kode frontend (React + Vite)
├── public/               # Aset statis
├── SoT_SAMI-SMK_v3/      # Source of Truth: SRS, use case, IA, design system
├── user_flows/           # Dokumentasi alur pengguna (UC-001 s/d UC-008)
├── system_logic/         # Dokumentasi logika sistem
├── testing/              # Test plan, test case, lembar eksekusi
├── docs/                 # Analisis kebutuhan, wawancara/observasi
├── data_model.md         # Desain basis data
├── PROMPTS.md            # Rekaman penggunaan AI
└── README.md
```

---

Program Studi Sistem Informasi — Fakultas Sains dan Teknologi Terapan — Universitas Ahmad Dahlan — 2026