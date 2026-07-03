# SAMI-SMK — Sistem Analisis Minat Siswa SMK

Aplikasi web responsif untuk memetakan minat dan kepribadian siswa baru SMK ke jurusan Multimedia/DKV atau TBSM.

## Tech Stack

- React 19 + Vite
- Tailwind CSS 3
- React Router v6
- localStorage (persistence dummy)

## Instalasi & Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## Login untuk Setiap Role

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Guru BK | `gurubk` | `bk123` |
| Siswa (Budi) | `budi.permana` | `siswa123` |
| Siswa (Riyan) | `riyan.hidayat` | `siswa123` |
| Siswa (Doni) | `doni.prasetyo` | `siswa123` |
| Siswa (Siti) | `siti.nurhaliza` | `siswa123` |

### Untuk Orang Tua

Orang Tua harus registrasi mandiri lewat halaman "Daftar sebagai Orang Tua" menggunakan kode tautan. Kode tautan diperoleh saat registrasi siswa. **Kode tautan seeder yang tersedia:**

| Kode Tautan | Tertaut ke Siswa |
|-------------|------------------|
| `SMK-BUD-99AA` | Budi Permana |
| `SMK-RIY-77BB` | Riyan Hidayat |

## Skenario Demo Lengkap

### 1. Admin
- Login: `admin` / `admin123`
- Lihat ringkasan total akun di Beranda Admin
- Tambah/Hapus pengguna di Manajemen Pengguna

### 2. Guru BK
- Login: `gurubk` / `bk123`
- Lihat statistik di Beranda BK
- Filter daftar siswa per Angkatan (2025 / 2026)
- Klik "Detail" pada siswa yang sudah selesai kuesioner
- Lihat grafik minat read-only
- Tambah catatan konseling
- Lihat riwayat catatan

### 3. Siswa (belum kuesioner)
- Login: `budi.permana` / `siswa123`
- Lihat sapaan personal + status "Belum Dikerjakan"
- Klik "Mulai Isi Kuesioner" → isi 10 soal (stepper, Likert 1-5)
- Submit → lihat grafik hasil + rekomendasi jurusan
- Kembali ke dashboard → status berubah "Selesai"
- Coba akses /siswa/kuesioner lagi → notifikasi terkunci

### 4. Siswa (sudah kuesioner)
- Login: `doni.prasetyo` / `siswa123`
- Dashboard menunjukkan status "Selesai"
- Buka menu Kuesioner → lihat hasil (grafik + rekomendasi)

### 5. Orang Tua
- Buka "Daftar sebagai Orang Tua" dari halaman login
- Isi Nama, Email, Username, Password
- Masukkan kode tautan: **SMK-BUD-99AA** (tertaut ke Budi Permana)
- Klik "Verifikasi Kode" → muncul nama anak
- Klik "Konfirmasi Pendaftaran" → sukses
- Login dengan akun Orang Tua yang baru dibuat
- Lihat dasbor read-only: data anak, grafik minat (jika sudah kuesioner), catatan BK

### 6. Registrasi Siswa Baru
- Buka "Daftar sebagai Siswa" dari halaman login
- Masukkan NISN: `0069876543` (Ahmad Fauzi — dari master NISN, belum diklaim)
- Klik "Cek NISN" → nama muncul otomatis
- Isi Username & Password → Daftar
- Simpan Kode Tautan yang muncul
- Login sebagai siswa baru

## Reset Data

Hapus localStorage atau jalankan di console browser:

```javascript
localStorage.clear(); window.location.reload();
```

Semua data akan di-seed ulang secara otomatis saat halaman dimuat ulang.
