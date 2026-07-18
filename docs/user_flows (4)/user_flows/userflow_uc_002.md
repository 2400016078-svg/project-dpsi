# User Flow Specification

Document Version: v2.0

Use Case ID: UC-002  
Use Case Name: Registrasi Mandiri Orang Tua (Kode Tautan)

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Orang Tua membuat akun pemantauan dan menautkannya ke akun anak melalui Kode Tautan unik sekali pakai.

## 1.2 Goal
Orang Tua memperoleh akun hanya-baca yang tertaut presisi ke satu siswa (relasi 1:1).

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F001|Autentikasi & Manajemen Hak Akses|
|F005|Laporan & Pemantauan Orang Tua|

## 1.4 Primary Actor
Orang Tua

## 1.5 Supporting Actors
Siswa (pemberi Kode Tautan)

---

# 2. TRIGGER
Orang Tua membuka halaman utama dan memilih "Daftar sebagai Orang Tua".

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Siswa (anak) sudah terdaftar dan memiliki Kode Tautan aktif|
|PRE-002|Kode Tautan belum kedaluwarsa dan belum dipakai pihak lain|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Orang Tua mengisi nama, email, username, dan password|Sistem memvalidasi kelengkapan form dan keunikan username|
|2|Orang Tua memasukkan Kode Tautan dan menekan "Verifikasi"|Sistem memeriksa validitas, status, dan masa berlaku kode|
|3||Sistem menampilkan "Kode Valid. Akun Anda akan tertaut dengan Siswa: [Nama Anak]"|
|4|Orang Tua menekan "Konfirmasi Pendaftaran"|Sistem menyimpan akun (role `orang_tua`) dan profil orang tua|
|5||Sistem mengunci relasi ke ID siswa, mengubah status kode menjadi `terpakai` (mencatat pemakai dan waktu)|
|6||Sistem menampilkan pesan sukses dan mengarahkan ke halaman login|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Siswa Membuat Kode Baru
### Condition
Kode lama hilang atau kedaluwarsa; siswa menghasilkan kode baru.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan "Buat Kode Baru" pada dasbornya|Sistem mencabut kode lama (status `dicabut`) dan menghasilkan kode baru|
|2|Orang Tua memakai kode baru|Sistem kembali ke Step 2 pada Main Flow|

---

# 6. EXCEPTION FLOWS

## EF-001: Kode Tautan Tidak Valid
### Condition
Kode salah, kedaluwarsa, sudah terpakai, atau dicabut.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Orang Tua menekan "Verifikasi"|Sistem tidak menemukan kode aktif yang cocok|
|2||Sistem menampilkan "Kode Tautan tidak valid, sudah kedaluwarsa, atau sudah terpakai oleh pihak lain."|

## EF-002: Username Sudah Dipakai
### Condition
Username yang dipilih sudah ada di sistem.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Orang Tua menekan "Konfirmasi Pendaftaran"|Sistem mendeteksi username duplikat|
|2||Sistem menampilkan "Username sudah digunakan, silakan pilih yang lain."|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Akun orang tua tersimpan dengan role `orang_tua`|
|POST-002|Profil orang tua tertaut ke satu siswa (relasi 1:1, foreign key terkunci)|
|POST-003|Kode Tautan berubah status menjadi `terpakai` dan tidak dapat dipakai lagi|
|POST-004|Audit tercatat: `id_ortu_pemakai` dan `used_at`|
|POST-005|Akun bersifat hanya-baca terhadap data anaknya|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|Relasi Orang Tua–Siswa bersifat 1:1 (satu siswa maksimal satu akun orang tua)|
|BR-002|Kode Tautan bersifat sekali pakai dan memiliki `expires_at`|
|BR-003|Siswa dapat membuat kode baru; kode lama otomatis dicabut|
|BR-004|Akun orang tua tidak dapat mengubah data apa pun (hanya-baca)|
|BR-005|Username unik di seluruh sistem|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-001|Halaman Utama / Login|
|PAGE-011|Registrasi Orang Tua|
|PAGE-009|Dasbor Orang Tua (setelah login)|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|LinkCode|Memverifikasi kode, status, dan masa berlaku|
|SiswaProfile|Mengambil nama anak untuk konfirmasi|
|User|Memeriksa keunikan username|

## 10.2 Data Created
|Entity|Description|
|---|---|
|User|Akun orang tua baru (role `orang_tua`)|
|OrangTuaProfile|Profil orang tua beserta relasi ke siswa|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|LinkCode|Status → `terpakai`; `id_ortu_pemakai` dan `used_at` diisi|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|None|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS
|Role|Access|
|---|---|
|Guest (calon orang tua)|ALLOWED|
|Orang Tua (sudah login)|REDIRECT ke dasbor|
|Siswa / Guru BK / Admin|N/A|

---

# 12. ACCEPTANCE CRITERIA
|AC ID|Description|
|---|---|
|AC-001|Akun gagal dibuat bila Kode Tautan kosong, salah, atau sudah terpakai|
|AC-002|Nama anak ditampilkan sebagai konfirmasi sebelum pendaftaran diselesaikan|
|AC-003|Akun yang berhasil dibuat bersifat hanya-baca dan terkunci pada satu ID siswa|
|AC-004|Kode Tautan tidak dapat dipakai dua kali|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F001|
|F005|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-011|
|PAGE-009|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-06-17|Draf awal|
|2.0|2026-07-05|Struktur dokumen mengikuti template baku; penambahan audit kode tautan|
