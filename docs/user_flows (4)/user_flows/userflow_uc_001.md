# User Flow Specification

Document Version: v2.0

Use Case ID: UC-001  
Use Case Name: Registrasi Mandiri Siswa Baru

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Siswa baru membuat akun secara mandiri dengan verifikasi NISN terhadap data master sekolah.

## 1.2 Goal
Siswa memperoleh akun login aktif dan Kode Tautan keluarga, serta otomatis tertaut ke Guru BK pembimbing.

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F001|Autentikasi & Manajemen Hak Akses|
|F002|Pengelolaan Data Master NISN (prasyarat)|

## 1.4 Primary Actor
Siswa Baru

## 1.5 Supporting Actors
Admin (penyedia data master NISN), Sistem Verifikasi NISN

---

# 2. TRIGGER
Siswa membuka halaman utama dan memilih "Daftar sebagai Siswa".

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Admin telah memasukkan data master NISN (NISN, nama, angkatan)|
|PRE-002|NISN belum pernah dipakai membuat akun (`is_claimed = false`)|
|PRE-003|NISN telah ditugaskan ke seorang Guru BK pembimbing|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa memasukkan 10 digit NISN dan menekan "Cek NISN"|Sistem memeriksa NISN ke tabel `master_nisn`|
|2||Sistem menemukan data, mengunci kolom NISN, menampilkan nama otomatis (read-only), membuka form akun|
|3|Siswa memasukkan username dan password|Sistem memvalidasi ketersediaan username (unik)|
|4|Siswa menekan "Daftar Akun"|Sistem menyimpan akun (role `siswa`), membuat profil siswa, menyalin `id_guru_bk` dari data master|
|5||Sistem menandai NISN `is_claimed = true` dan menghasilkan Kode Tautan keluarga|
|6||Sistem menampilkan pesan sukses dan mengarahkan ke halaman login|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Siswa Mengganti NISN Sebelum Mendaftar
### Condition
Siswa keliru memasukkan NISN dan ingin memperbaikinya setelah verifikasi.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan "Ubah NISN"|Sistem membuka kembali kolom NISN dan mengosongkan form akun|
|2|Siswa memasukkan NISN yang benar|Sistem kembali ke Step 1 pada Main Flow|

---

# 6. EXCEPTION FLOWS

## EF-001: NISN Tidak Terdaftar
### Condition
NISN tidak ditemukan pada data master.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan "Cek NISN"|Sistem tidak menemukan data|
|2||Sistem menampilkan "NISN tidak terdaftar. Mohon hubungi Admin Sekolah."; form akun tetap terkunci|

## EF-002: NISN Sudah Digunakan
### Condition
NISN sudah pernah dipakai membuat akun (`is_claimed = true`).
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan "Cek NISN"|Sistem mendeteksi NISN sudah diklaim|
|2||Sistem menampilkan "NISN ini sudah digunakan. Silakan login atau hubungi Guru BK."|

## EF-003: Username Sudah Dipakai
### Condition
Username yang dipilih sudah ada di sistem.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan "Daftar Akun"|Sistem mendeteksi username duplikat|
|2||Sistem menampilkan "Username sudah digunakan, silakan pilih yang lain."|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Akun siswa tersimpan dengan role `siswa`|
|POST-002|Profil siswa dibuat dengan `status_kuesioner = belum_dikerjakan`|
|POST-003|NISN ditandai `is_claimed = true` dan tidak dapat dipakai ulang|
|POST-004|Kode Tautan keluarga dihasilkan untuk pendaftaran orang tua|
|POST-005|Siswa tertaut ke Guru BK pembimbing sesuai data master|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|Hanya NISN yang terdaftar di data master dan belum diklaim yang dapat mendaftar|
|BR-002|Nama siswa bersifat read-only (diambil dari data master) agar tidak dipalsukan|
|BR-003|Username unik di seluruh sistem|
|BR-004|Guru BK pembimbing disalin dari data master ke profil siswa saat pendaftaran|
|BR-005|Data kelas/jurusan dikosongkan; siswa dikelompokkan per Angkatan Tahun Masuk|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-001|Halaman Utama / Login|
|PAGE-010|Registrasi Siswa|
|PAGE-003|Dasbor Siswa (setelah login)|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|MasterNISN|Memverifikasi NISN, mengambil nama, angkatan, dan Guru BK pembimbing|
|User|Memeriksa keunikan username|

## 10.2 Data Created
|Entity|Description|
|---|---|
|User|Akun siswa baru (role `siswa`)|
|SiswaProfile|Profil siswa (NISN, nama, angkatan, Guru BK, status kuesioner)|
|LinkCode|Kode Tautan keluarga (status `aktif`, memiliki `expires_at`)|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|MasterNISN|`is_claimed` diubah menjadi `true`|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|None|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS
|Role|Access|
|---|---|
|Guest (calon siswa)|ALLOWED|
|Siswa (sudah login)|REDIRECT ke dasbor|
|Guru BK / Orang Tua / Admin|N/A|

---

# 12. ACCEPTANCE CRITERIA
|AC ID|Description|
|---|---|
|AC-001|Nama siswa tampil otomatis hanya jika NISN terdaftar dan belum diklaim|
|AC-002|Form akun terkunci sebelum NISN berhasil diverifikasi|
|AC-003|Sistem menolak username yang sudah dipakai|
|AC-004|Akun baru otomatis tertaut ke Guru BK pembimbing sesuai data master|
|AC-005|Kode Tautan keluarga dihasilkan setelah pendaftaran berhasil|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F001|
|F002|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-001|
|PAGE-010|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-06-17|Draf awal|
|2.0|2026-07-05|Disinkronkan dengan aplikasi final: penugasan Guru BK langsung (bukan berdasarkan angkatan), validasi username unik, struktur dokumen mengikuti template baku|
