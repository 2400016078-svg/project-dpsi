# Information Architecture (IA)

- **Document Version:** v3.0
- **Project:** Sistem Analisis Minat Siswa SMK (SAMI-SMK)
- **Status:** Validated
- **Last Updated:** 5 Juli 2026
- **Source of Truth:** #2

---

## 1. DOCUMENT OVERVIEW
Dokumen ini mendefinisikan struktur produk, hierarki modul, peta situs, inventori halaman, dan aturan routing aplikasi SAMI-SMK. Berfungsi sebagai SoT-2, diturunkan dari SRS (SoT-1) dan memandu struktur halaman, navigasi, serta routing pada prototype.

---

## 2. PRODUCT STRUCTURE

### 2.1 Product Modules
| Module ID | Module Name | Description |
|---|---|---|
| M001 | Authentication | Login, manajemen sesi, pembatasan peran. |
| M002 | Student Dashboard | Informasi personal siswa, pengerjaan kuesioner, hasil rekomendasi. |
| M003 | Counselor (BK) Dashboard | Pemantauan per angkatan, analisis, rekapitulasi, catatan konseling. |
| M004 | Parent Monitoring | Akses read-only Orang Tua untuk data anaknya. |
| M005 | Master Administration | Panel Admin: Data Master NISN (termasuk impor Excel/CSV & penugasan Guru BK), manajemen pengguna & hak akses. |

### 2.2 Module Hierarchy
```
SAMI-SMK Web Application
├── M001: Authentication (Login, Daftar Akun)
├── M002: Student Dashboard
│   ├── Beranda / Sapaan Personal
│   └── Instrumen Kuesioner (Stepper)
├── M003: Counselor (BK) Dashboard
│   ├── Beranda / Ringkasan BK
│   ├── Daftar Siswa Bimbingan (filter Angkatan)
│   ├── Rekapitulasi Angkatan
│   └── Riwayat Catatan Konseling
├── M004: Parent Monitoring Dashboard
│   └── Laporan Potensi Anak (Read-Only)
└── M005: Master Administration Panel
    └── Manajemen Pengguna
```

---

## 3. SITE MAP

### 3.1 Navigation Tree
- **PAGE-001:** Login Portal (akses publik, ada tombol "Daftar sebagai Siswa" dan "Daftar sebagai Orang Tua")
- **PAGE-001a:** Registrasi Siswa (publik — verifikasi NISN → username/password)
- **PAGE-001b:** Registrasi Orang Tua (publik — form + verifikasi kode tautan)
- **Modul Siswa**
  - PAGE-002: Beranda Siswa (sapaan personal Nama/NISN, kartu status kuesioner, tombol "Mulai Isi Kuesioner", peringatan 1 kali, info 2 klaster jurusan, nama Guru BK)
  - PAGE-003: Instrumen Kuesioner (stepper, validasi pengisian, submit final)
- **Modul Guru BK**
  - PAGE-004: Beranda BK (statistik jumlah siswa, status pengisian, jumlah belum diberi catatan)
  - PAGE-005: Daftar Siswa Bimbingan (hanya siswa bimbingan Guru BK terkait; filter Angkatan; kolom Nama | Angkatan | Rekomendasi | Status Catatan; penanda prioritas)
  - PAGE-006: Detail Siswa & Konseling (grafik minat read-only, kartu Analisis Minat otomatis untuk Guru BK, form input catatan)
  - PAGE-007: Rekapitulasi Angkatan (grafik agregat minat per angkatan)
  - PAGE-008: Riwayat Catatan (log kronologis catatan konseling)
- **Modul Orang Tua**
  - PAGE-009: Beranda Orang Tua (grafik minat anak, catatan BK — read-only)
- **Modul Admin**
  - PAGE-010: Beranda Admin (ringkasan total akun & sistem)
  - PAGE-011: Manajemen Pengguna (kelola akun, reset password, ubah nama)
  - PAGE-012: Data Master NISN (tambah manual, Impor Excel/CSV + template, hapus/kosongkan, penugasan Guru BK)
  - PAGE-014: Kelola Jurusan (tambah/edit, Impor + template, Hapus pintar/arsip, Aktifkan)
  - PAGE-015: Kelola Soal Kuesioner (tambah/edit/hapus, hapus massal, Impor + template)
- **Modul Umum (semua role)**
  - PAGE-013: Pengaturan Akun (ubah nama, foto profil, ubah password)

### 3.2 Navigation Type
| Navigation | Type | Responsive Behavior |
|---|---|---|
| Main Menu (Desktop) | Sidebar | Tetap di kiri, lebar 240px. |
| Main Menu (Mobile) | Bottom Nav / Hamburger | Bottom nav untuk Siswa/Orang Tua; hamburger untuk Guru BK/Admin. |
| User Profile Menu | Top Right Dropdown | "Pengaturan Akun" dan "Keluar (Logout)"; berfungsi di HP & laptop. |
| Breadcrumb | Top Header | Aktif di dasbor Guru BK dan Admin. |

---

## 4. PAGE INVENTORY
| Page ID | Page Name | Module | Access Role |
|---|---|---|---|
| PAGE-001 | Login Portal | M001 | Public |
| PAGE-002 | Beranda Siswa | M002 | Siswa |
| PAGE-003 | Instrumen Kuesioner | M002 | Siswa |
| PAGE-004 | Beranda BK | M003 | Guru BK |
| PAGE-005 | Daftar Siswa Bimbingan | M003 | Guru BK |
| PAGE-006 | Detail Siswa & Konseling | M003 | Guru BK |
| PAGE-007 | Rekapitulasi Angkatan | M003 | Guru BK |
| PAGE-008 | Riwayat Catatan | M003 | Guru BK |
| PAGE-009 | Beranda Orang Tua | M004 | Orang Tua |
| PAGE-010 | Beranda Admin | M005 | Admin |
| PAGE-011 | Manajemen Pengguna | M005 | Admin |
| PAGE-012 | Data Master NISN | M005 | Admin |
| PAGE-014 | Kelola Jurusan | M005 | Admin |
| PAGE-015 | Kelola Soal Kuesioner | M005 | Admin |
| PAGE-013 | Pengaturan Akun | Umum | Semua role |
| PAGE-001a | Registrasi Siswa | M001 | Public |
| PAGE-001b | Registrasi Orang Tua | M001 | Public |

---

## 5. ROUTING CONVENTIONS
| Page ID | Route | Route Type |
|---|---|---|
| PAGE-001 | /login | Public |
| PAGE-002 | /siswa/dashboard | Protected (Siswa) |
| PAGE-003 | /siswa/kuesioner | Protected (Siswa) — diblokir jika status `selesai` |
| PAGE-004 | /bk/dashboard | Protected (Guru BK) |
| PAGE-005 | /bk/siswa | Protected (Guru BK) |
| PAGE-006 | /bk/siswa/:uuid/konseling | Protected (Guru BK) |
| PAGE-007 | /bk/rekapitulasi-angkatan | Protected (Guru BK) |
| PAGE-008 | /bk/catatan-riwayat | Protected (Guru BK) |
| PAGE-009 | /orang-tua/dashboard | Protected (Orang Tua) |
| PAGE-010 | /admin/dashboard | Protected (Admin) |
| PAGE-011 | /admin/pengguna | Protected (Admin) |
| PAGE-012 | /admin/master-nisn | Protected (Admin) |
| PAGE-014 | /admin/kelola-jurusan | Protected (Admin) |
| PAGE-015 | /admin/kelola-soal | Protected (Admin) |
| PAGE-013 | /pengaturan-akun | Protected (Semua role) |
| PAGE-001a | /daftar/siswa | Public |
| PAGE-001b | /daftar/orang-tua | Public |

**Rules:** URL lowercase, parameter ID berupa UUID, penamaan rute bersarang memakai kebab-case.

---

## 6. ACCESS STRUCTURE
| Page Range | Admin | Guru BK | Siswa | Orang Tua |
|---|---|---|---|---|
| PAGE-001 (Login) | ✓ | ✓ | ✓ | ✓ |
| PAGE-002–003 (Siswa) | - | - | ✓ | - |
| PAGE-004–008 (BK) | - | ✓ | - | - |
| PAGE-009 (Orang Tua) | - | - | - | ✓ |
| PAGE-010–011 (Admin) | ✓ | - | - | - |

---

## 7. TRACEABILITY (SRS → IA)
| Requirement | Page ID | Module | Status |
|---|---|---|---|
| F001 (Autentikasi) | PAGE-001 | M001 | Covered |
| F002 (Kuesioner) | PAGE-002, PAGE-003 | M002 | Covered |
| F003 (Dasbor & Konseling BK) | PAGE-004–008 | M003 | Covered |
| F004 (Laporan Orang Tua) | PAGE-009 | M004 | Covered |

---

## 8. REVISION HISTORY
| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 17 Juni 2026 | System Analyst | Validated. Menu BK berbasis Angkatan. |
| 2.0 | 28 Juni 2026 | System Analyst | Registrasi publik, Data Master NISN, Pengaturan Akun; Daftar Siswa BK per Guru BK; Analisis Minat; responsif HP. |
| 3.0 | 5 Juli 2026 | System Analyst | Tambah halaman Admin: Kelola Jurusan (PAGE-014) & Kelola Soal Kuesioner (PAGE-015). Grafik hasil & kartu dashboard BK menyesuaikan jumlah jurusan dinamis. |
