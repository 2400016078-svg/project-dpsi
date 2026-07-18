# Software Requirements Specification (SRS)

- **Document Version:** v3.0
- **Project:** Sistem Analisis Minat Siswa SMK (SAMI-SMK)
- **Product:** Aplikasi Pemetaan Minat dan Kepribadian Jurusan SMK
- **Status:** Validated
- **Last Updated:** 5 Juli 2026
- **Source of Truth:** #1

---

## 1. INTRODUCTION

### 1.1 Purpose
Dokumen ini mendefinisikan seluruh kebutuhan fungsional dan non-fungsional untuk Aplikasi Pemetaan Minat Siswa SMK (SAMI-SMK). Dokumen ini berfungsi sebagai Source of Truth #1 (SoT-1) yang menjadi acuan tunggal untuk menurunkan dokumentasi tahap berikutnya: Information Architecture (SoT-2), Design System (SoT-3), dan Use Case (SoT-4).

### 1.2 Scope

**Business Goals**
- Membantu siswa baru SMK mengenali potensi, minat, dan kepribadian mereka secara terstruktur agar tidak salah memilih jurusan.
- Memfasilitasi Guru BK memantau, menganalisis, dan memberi arahan studi berbasis data sistem.
- Meningkatkan transparansi informasi potensi anak kepada Orang Tua.

**In Scope**
- Autentikasi berbasis peran (RBAC) untuk 4 pengguna: Siswa, Guru BK, Admin, Orang Tua.
- Registrasi mandiri siswa (verifikasi NISN) dan orang tua (kode tautan).
- Pengelolaan Data Master NISN oleh Admin, termasuk impor massal melalui berkas Excel/CSV.
- Pembagian beban pemantauan: penugasan siswa ke Guru BK pembimbing (dibagi merata antar-Guru BK).
- Modul pengisian kuesioner minat & kepribadian (satu kali pengisian per siswa).
- Pengelolaan jurusan secara dinamis oleh Admin (jumlah jurusan tidak dibatasi; awalnya Multimedia/DKV dan TBSM, dapat ditambah, diubah, atau diarsipkan).
- Pengelolaan bank soal kuesioner oleh Admin (tambah/edit/hapus manual, hapus massal, dan impor massal via Excel/CSV).
- Pemetaan rekomendasi otomatis ke jurusan dengan skor kecocokan tertinggi, untuk berapa pun jumlah jurusan yang aktif.
- Analisis minat otomatis berbasis aturan sebagai alat bantu Guru BK.
- Modul catatan konseling tambahan untuk Guru BK tanpa mengubah hasil kuesioner asli.
- Dasbor laporan potensi anak untuk Orang Tua (read-only) via akun login terpisah.

**Out of Scope**
- Instrumen psikologis klinis di luar kuesioner minat (aplikasi hanya memetakan minat, bukan diagnosis).
- Fitur Penerimaan Peserta Didik Baru (PPDB) eksternal.
- Pengisian ulang kuesioner berkali-kali dalam satu periode.
- Payment gateway dan sistem multi-sekolah.

### 1.3 Stakeholders
| Stakeholder | Role | Responsibility |
|---|---|---|
| Siswa | End-User (Primary) | Mengisi kuesioner, melihat hasil analisis, menerima arahan studi. |
| Guru BK | Validator & Konselor | Memantau siswa bimbingannya, menganalisis grafik minat (dibantu analisis otomatis), menginput catatan konseling. |
| Orang Tua | Monitor | Login untuk melihat laporan potensi anak (read-only). |
| Admin | System Administrator | Mengelola data master NISN (termasuk impor massal), mengatur penugasan Guru BK, mengelola akun & hak akses. |

### 1.4 Definitions
| Term | Definition |
|---|---|
| SAMI-SMK | Sistem Analisis Minat Siswa SMK (nama aplikasi). |
| Jurusan | Bidang keahlian yang dapat dikelola Admin secara dinamis (tambah/edit/arsip). Setiap jurusan punya kode, nama, dan deskripsi. |
| DKV / Multimedia | Contoh jurusan bawaan: industri kreatif, desain, dan komunikasi visual. |
| TBSM | Contoh jurusan bawaan: Teknik dan Bisnis Sepeda Motor (otomotif). |
| Arsip Jurusan | Status jurusan yang dinonaktifkan: tidak muncul untuk kuesioner/aktivitas baru, tetapi hasil siswa lama yang memakainya tetap utuh. |
| RBAC | Role-Based Access Control. |
| Angkatan | Pengelompokan siswa berdasarkan tahun masuk (mis. Angkatan 2026), bukan kelas. |
| Guru BK Pembimbing | Guru BK yang ditugaskan memantau seorang siswa. Bila Guru BK lebih dari satu, siswa dibagi merata antar-Guru BK. |
| Data Master NISN | Daftar NISN sah yang menjadi dasar verifikasi registrasi siswa. |

---

## 2. PRODUCT OVERVIEW

### 2.1 Product Summary
SAMI-SMK adalah aplikasi berbasis web responsif untuk mengidentifikasi dan mengarahkan minat serta kepribadian siswa baru SMK ke jurusan yang tepat melalui instrumen kuesioner digital. Jurusan dikelola secara dinamis oleh Admin (jumlahnya tidak dibatasi). Hasil akhir merekomendasikan jurusan dengan persentase kecocokan tertinggi bagi siswa.

### 2.2 User Types
| User Type | Description |
|---|---|
| Admin | Hak akses tertinggi untuk konfigurasi sistem, data master, dan manajemen akun. |
| Siswa | Objek analisis minat dan pengisi kuesioner utama (siswa baru tanpa kelas/jurusan). |
| Guru BK | Pendidik yang membimbing siswa. Bila lebih dari satu, beban siswa dibagi merata antar-Guru BK. |
| Orang Tua | Wali murid dengan akses baca (read-only) untuk data anaknya. |

### 2.3 Operating Environment
- **Frontend:** Web responsif (React + Vite + Tailwind CSS), optimal di HP, tablet, maupun laptop.
- **Persistence:** Basis data terpusat sehingga data dapat diakses bersama lintas pengguna dan perangkat.
- **Deployment:** Aplikasi web yang dapat diakses daring melalui tautan publik (HTTPS).

### 2.4 Assumptions
- Setiap siswa baru memiliki NISN unik dan telah dimasukkan Admin ke data master sebelum mendaftar.
- Instrumen kuesioner telah divalidasi keilmuan oleh tim BK sebelum diimplementasikan.

### 2.5 Constraints
- Siswa hanya memiliki 1 kali kesempatan submit kuesioner; setelah itu formulir terkunci permanen.
- Akses data Orang Tua terkunci relasional ketat: Orang Tua A tidak bisa melihat data Siswa B.
- Seorang Guru BK hanya melihat siswa yang ditugaskan kepadanya; Admin melihat seluruh siswa.

---

## 3. SYSTEM FEATURES

### F001 — Manajemen Autentikasi & Pengguna (RBAC)
**Description:** Mengatur hak akses login dan membedakan dasbor antara Admin, Siswa, Guru BK, dan Orang Tua.
**Requirements:**
- Halaman login tunggal yang mengarahkan ke dasbor sesuai role setelah verifikasi.
- Registrasi mandiri siswa (verifikasi NISN ke data master) dan orang tua (kode tautan).
- Username wajib unik; password boleh sama antar-pengguna.
- Reset password: Admin dapat mengatur ulang password pengguna (tanpa melihat password lama); pengguna dapat mengubah password sendiri di Pengaturan Akun.
- Nama tampilan (mis. nama Guru BK) dapat diubah oleh pemilik akun dan/atau Admin.
**Business Rules:** Sesi login tetap aktif lintas buka-tutup aplikasi, namun kedaluwarsa otomatis jika tidak aktif 60 menit. Catatan keamanan: password idealnya disimpan dengan hashing (mis. bcrypt) sebelum penggunaan nyata di sekolah.

### F002 — Pengelolaan Data Master NISN (Admin)
**Description:** Admin mengelola daftar master NISN yang menjadi dasar verifikasi registrasi siswa.
**Requirements:**
- Tambah NISN manual (NISN 10 digit, nama, angkatan).
- Impor massal melalui berkas Excel/CSV (kolom: nisn, nama_siswa, angkatan_tahun) untuk efisiensi input ratusan siswa.
- Saat impor, siswa dibagi merata secara otomatis ke Guru BK pembimbing yang tersedia (seimbang antar-Guru BK).
- Hapus satu entri atau kosongkan seluruh data master, dengan konfirmasi berlapis (ketik kata konfirmasi) untuk mencegah penghapusan tak sengaja.
**Business Rules:** NISN wajib unik dan tepat 10 digit. Siswa hanya dapat registrasi bila NISN ada di data master dan belum diklaim.

### F003 — Modul Pengisian Kuesioner Minat (Siswa)
**Description:** Fasilitas siswa mengisi kuesioner terstruktur untuk memetakan potensi ke seluruh jurusan aktif yang dikelola Admin.
**Requirements:**
- Kuesioner ditampilkan format langkah-demi-langkah (stepper); semua pertanyaan wajib terisi sebelum submit.
- Kuesioner memuat seluruh soal dari jurusan aktif secara dinamis (bukan daftar tetap).
- Sistem mengalkulasi skor tiap jurusan secara independen dari jawaban Likert 1–5: persentase = (rata-rata jawaban soal jurusan itu / 5) × 100. Skor tiap jurusan berdiri sendiri (0–100%), sehingga angkanya tetap bermakna berapa pun jumlah jurusan. Rekomendasi = jurusan dengan skor tertinggi.
**Business Rules:** Pengisian hanya 1 kali. Setelah submit, status menjadi `selesai` dan formulir terkunci permanen.

### F004 — Modul Dasbor & Konseling BK (Guru BK)
**Description:** Area kerja Guru BK memantau hasil minat siswa bimbingannya dan memberi catatan bimbingan.
**Requirements:**
- Menampilkan **hanya siswa yang ditugaskan** kepada Guru BK tersebut, dapat difilter berdasarkan Angkatan, lengkap status pengerjaan.
- Setiap baris menampilkan: Nama Siswa | Angkatan | Hasil Rekomendasi | Status Catatan, dengan penanda prioritas berdasarkan kategori minat.
- Grafik persentase minat pada profil detail siswa.
- Grafik hasil menyesuaikan jumlah jurusan aktif secara dinamis (satu batang per jurusan).
- **Analisis Minat otomatis (alat bantu Guru BK):** narasi berbasis aturan yang dihasilkan dinamis dari skor per jurusan siswa (bukan teks tetap). Sistem menentukan jurusan tertinggi dan selisih ke jurusan berikutnya, lalu memberi interpretasi 3 tingkat (jelas condong / cenderung / seimbang) beserta saran tindak lanjut. Berlaku otomatis untuk jurusan apa pun, termasuk jurusan yang baru ditambahkan. Hanya tampil untuk Guru BK.
- Form input teks catatan rekomendasi konseling dan riwayat catatan.
**Business Rules:** Guru BK dilarang mengubah/menghapus angka persentase hasil asli; hanya boleh menambah teks catatan. Keputusan akhir tetap pada penilaian Guru BK; analisis otomatis hanya alat bantu.

### F005 — Modul Laporan Potensi Mandiri (Orang Tua)
**Description:** Akses Orang Tua melihat rangkuman hasil tes anak (read-only).
**Requirements:** Dasbor ringkas berisi grafik minat anak dan catatan konseling Guru BK.
**Business Rules:** Seluruh dasbor Orang Tua read-only (tanpa tombol edit/hapus), terbatas pada satu anak tertaut.

---

### F006 — Pengelolaan Jurusan Dinamis (Admin)
**Description:** Admin mengelola daftar jurusan yang menjadi dasar pemetaan minat, tanpa batas jumlah.
**Requirements:**
- Tambah, ubah, dan kelola jurusan (kode, nama, deskripsi) secara manual.
- Impor massal jurusan via Excel/CSV (kolom: kode, nama, deskripsi) beserta unduh template.
- Hapus jurusan dengan perilaku aman: bila jurusan belum dipakai (tidak ada soal/hasil terkait) dihapus permanen; bila sudah dipakai, jurusan diarsipkan (dinonaktifkan) sehingga tidak muncul untuk aktivitas baru namun hasil siswa lama tetap utuh. Dapat diaktifkan kembali.
**Business Rules:** Kode jurusan unik. Menghapus/mengarsipkan tidak boleh merusak hasil kuesioner siswa yang sudah ada. Hanya jurusan aktif yang muncul di kuesioner, pilihan soal, dan penilaian baru.

### F007 — Pengelolaan Bank Soal Kuesioner (Admin)
**Description:** Admin mengelola soal kuesioner yang dikaitkan ke jurusan.
**Requirements:**
- Tambah, ubah, dan hapus soal (dengan konfirmasi); soal dikaitkan ke jurusan aktif.
- Hapus massal: memilih beberapa soal sekaligus lalu menghapusnya dalam satu tindakan (dengan konfirmasi).
- Impor massal soal via Excel/CSV (kolom: teks_pertanyaan, kode_jurusan) beserta unduh template.
- Menghapus soal yang sudah memiliki jawaban siswa menghapus jawaban terkait lebih dulu agar konsisten.
**Business Rules:** Soal yang ditamb/dihapus langsung memengaruhi kuesioner siswa. Perhitungan skor tetap benar berapa pun jumlah soal per jurusan.

## 4. DATA REQUIREMENTS

### 4.1 Core Business Objects
| Object | Description |
|---|---|
| User | Data dasar akun (ID, Username, Nama, Password, Role). |
| Siswa_Profile | Ekstensi siswa baru (NISN, Angkatan, Status Kuesioner, Guru BK Pembimbing). |
| Orang_Tua_Profile | Ekstensi orang tua (relasi 1:1 ke siswa). |
| Master_NISN | Daftar NISN sah (NISN, Nama, Angkatan, Status Klaim, Guru BK Pembimbing). |
| Question | Bank soal (Teks, Klaster Jurusan). |
| Kuesioner_Response | Jawaban Likert siswa (Nilai 1–5). |
| Jurusan | Data jurusan dinamis (kode, nama, deskripsi, status aktif/arsip). |
| Kuesioner_Result | Hasil kalkulasi kuesioner (rekomendasi final). |
| Kuesioner_Result_Score | Skor kecocokan per jurusan untuk sebuah hasil (mendukung N jurusan). |
| BK_Note | Catatan tambahan Guru BK. |
| Link_Code | Kode tautan keluarga (sekali pakai) untuk registrasi Orang Tua. |

### 4.2 Data Validation Rules
- NISN wajib unik dan terdiri dari **tepat 10 digit angka**.
- **Username wajib unik** (case-insensitive); password boleh sama antar-pengguna.
- Nilai jawaban kuesioner harus **integer 1–5** (Skala Likert).
- Relasi Orang Tua–Siswa bersifat **1:1**.
- Kode tautan bersifat **sekali pakai** dengan status: aktif, terpakai, kedaluwarsa, dicabut.
- Kolom catatan konseling tidak boleh kosong saat disimpan.

---

## 5. PERMISSIONS AND ACCESS CONTROL (RBAC MATRIX)
| Capability / Fitur | Admin | Siswa | Guru BK | Orang Tua |
|---|---|---|---|---|
| Kelola Data Master NISN & Impor | ✓ | - | - | - |
| Kelola Jurusan (tambah/impor/arsip) | ✓ | - | - | - |
| Kelola Bank Soal (tambah/impor/hapus massal) | ✓ | - | - | - |
| Atur Penugasan Guru BK | ✓ | - | - | - |
| Reset Password Pengguna | ✓ | - | - | - |
| Mengisi Kuesioner (1x) | - | ✓ | - | - |
| Melihat Hasil Analisis Diri | - | ✓ | ✓ (siswa bimbingannya) | ✓ (anak sendiri) |
| Melihat Analisis Minat Otomatis | - | - | ✓ | - |
| Menginput Catatan Konseling | - | - | ✓ | - |
| Konfigurasi Hak Akses Sistem | ✓ | - | - | - |

---

## 6. NON-FUNCTIONAL REQUIREMENTS
- **Performance:** Memuat dasbor/grafik ≤ 2 detik pada jaringan 3G/4G.
- **Security:** Parameter ID berupa UUID untuk mencegah IDOR. Catatan: pengetatan aturan akses basis data dan hashing password direncanakan sebelum penggunaan nyata.
- **Responsiveness:** Tampilan menyesuaikan rapi di HP, tablet, dan laptop.
- **Availability:** Diupayakan tetap dapat diakses saat periode pengisian massal.
- **Usability:** Kontras teks/tombol memenuhi WCAG 2.1 AA.

---

## 7. FEATURE INVENTORY
| Feature ID | Feature Name | Priority |
|---|---|---|
| F001 | Manajemen Autentikasi & Pengguna (RBAC) | High |
| F002 | Pengelolaan Data Master NISN (impor & penugasan Guru BK) | High |
| F003 | Modul Pengisian Kuesioner Minat (Siswa) | High |
| F004 | Dasbor & Konseling BK + Analisis Minat (Guru BK) | High |
| F006 | Pengelolaan Jurusan Dinamis (Admin) | High |
| F007 | Pengelolaan Bank Soal Kuesioner (Admin) | High |
| F005 | Modul Laporan Potensi Mandiri (Orang Tua) | Medium |

---

## 8. REVISION HISTORY
| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 17 Juni 2026 | System Analyst | Validated. Paradigma berbasis Angkatan (bukan kelas). |
| 2.0 | 28 Juni 2026 | System Analyst | Disinkronkan dengan aplikasi: penugasan Guru BK, impor Excel data master, analisis minat otomatis, basis data terpusat, username unik. |
| 3.0 | 5 Juli 2026 | System Analyst | Jurusan menjadi DINAMIS (tak terbatas 2): tambah F006 (Kelola Jurusan + impor + arsip aman) dan F007 (Kelola Bank Soal + hapus massal + impor). Penilaian diubah menjadi skor independen 0–100% per jurusan. Grafik & Analisis Minat menyesuaikan N jurusan secara dinamis. Struktur hasil memakai skor per jurusan (Kuesioner_Result_Score). |
