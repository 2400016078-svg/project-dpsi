# User Flow Specification

Document Version: v2.0

Use Case ID: UC-005  
Use Case Name: Pengelolaan Data Master NISN (Admin)

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Admin mengelola daftar NISN resmi sekolah: tambah manual, impor massal via Excel/CSV, hapus, serta mengosongkan seluruh data siswa secara bersih.

## 1.2 Goal
Data master NISN akurat sehingga hanya siswa terdaftar yang dapat membuat akun.

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F002|Pengelolaan Data Master NISN|
|F001|Autentikasi & Hak Akses (prasyarat)|

## 1.4 Primary Actor
Admin

## 1.5 Supporting Actors
Modul Impor Berkas (SheetJS)

---

# 2. TRIGGER
Admin membuka menu "Data Master NISN".

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Admin sudah login dengan role `admin`|
|PRE-002|Untuk impor: berkas mengikuti format template (nisn, nama_siswa, angkatan_tahun)|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin membuka "Data Master NISN"|Sistem menampilkan daftar NISN beserta nama, angkatan, status klaim, dan Guru BK pembimbing|
|2|Admin menekan "Unduh Template" (opsional)|Sistem mengunduh berkas .xlsx dengan header yang benar dan contoh baris|
|3|Admin menekan "Impor Data" dan mengunggah berkas Excel/CSV|Sistem mengurai berkas dan memvalidasi tiap baris|
|4||Sistem menyimpan baris yang valid, melewati NISN duplikat, dan menampilkan ringkasan (berhasil / dilewati beserta alasan)|
|5|Admin menekan "Hapus" pada satu data (opsional)|Sistem meminta konfirmasi, lalu menghapus data master tersebut|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Tambah NISN Secara Manual
### Condition
Admin hanya perlu menambahkan satu atau beberapa data.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin mengisi NISN, nama siswa, angkatan|Sistem memvalidasi NISN unik dan format 10 digit|
|2|Admin menekan "Simpan"|Sistem menyimpan data dan memperbarui daftar|

## AF-002: Kosongkan Seluruh Data Siswa
### Condition
Admin ingin mengembalikan aplikasi ke kondisi bersih (mis. sebelum demo atau tahun ajaran baru).
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menekan "Kosongkan Semua Data Siswa"|Sistem meminta konfirmasi ketik-untuk-yakin|
|2|Admin mengonfirmasi|Sistem menghapus seluruh data siswa berurutan sesuai foreign key (skor per jurusan → catatan BK → jawaban → hasil → kode tautan → akun orang tua → profil siswa → akun siswa)|
|3||Sistem mengembalikan `is_claimed = false` pada seluruh NISN dan menampilkan ringkasan|

---

# 6. EXCEPTION FLOWS

## EF-001: NISN Duplikat
### Condition
NISN yang ditambahkan/diimpor sudah ada di data master.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menyimpan/mengimpor|Sistem mendeteksi duplikat|
|2||Sistem menolak baris tersebut (manual) atau melewatinya dan melaporkannya pada ringkasan (impor)|

## EF-002: Format Berkas Tidak Sesuai
### Condition
Berkas yang diunggah tidak memiliki kolom yang diharapkan.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin mengunggah berkas|Sistem tidak menemukan kolom wajib|
|2||Sistem menolak berkas dan menyarankan memakai template yang disediakan|

## EF-003: Menghapus NISN yang Sudah Diklaim
### Condition
NISN yang akan dihapus sudah dipakai mendaftar oleh seorang siswa.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menekan "Hapus"|Sistem memperingatkan bahwa data siswa terkait akan terpengaruh|
|2|Admin membatalkan atau melanjutkan|Sistem menghentikan proses atau melanjutkan penghapusan berantai sesuai konfirmasi|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Data master NISN mencerminkan daftar siswa resmi sekolah|
|POST-002|NISN yang belum dipakai berstatus `is_claimed = false` dan siap dipakai mendaftar|
|POST-003|Setelah pengosongan data siswa, tidak tersisa data yatim pada tabel mana pun|
|POST-004|Setelah pengosongan, jurusan menjadi tidak terpakai sehingga dapat dihapus bersih (lihat UC-007)|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|NISN unik, 10 digit, dan menjadi satu-satunya kunci verifikasi pendaftaran siswa|
|BR-002|NISN yang sudah dipakai mendaftar ditandai `is_claimed = true` dan tidak dapat dipakai ulang|
|BR-003|Penghapusan siswa wajib bersih: seluruh data turunan ikut terhapus mengikuti urutan foreign key|
|BR-004|Setiap penghapusan wajib melalui konfirmasi; penghapusan massal memakai konfirmasi ketik-untuk-yakin|
|BR-005|Impor menampilkan ringkasan jumlah berhasil dan dilewati beserta alasannya|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-012|Data Master NISN|
|PAGE-013|Dasbor Admin|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|MasterNISN|Daftar NISN, status klaim, Guru BK pembimbing|
|User|Daftar Guru BK untuk penugasan|

## 10.2 Data Created
|Entity|Description|
|---|---|
|MasterNISN|Data NISN baru (manual atau impor massal)|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|MasterNISN|`is_claimed` dikembalikan ke `false` setelah data siswa dikosongkan|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|MasterNISN|Data NISN yang dihapus Admin|
|KuesionerResultScore, BKNote, KuesionerResponse, KuesionerResult, LinkCode, OrangTuaProfile, SiswaProfile, User|Seluruh data turunan siswa saat penghapusan siswa (berurutan sesuai foreign key)|

---

# 11. PERMISSIONS
|Role|Access|
|---|---|
|Admin|ALLOWED|
|Guru BK / Siswa / Orang Tua|DENIED|

---

# 12. ACCEPTANCE CRITERIA
|AC ID|Description|
|---|---|
|AC-001|Siswa hanya dapat mendaftar bila NISN ada di data master dan belum diklaim|
|AC-002|Impor menampilkan ringkasan jumlah berhasil dan dilewati|
|AC-003|Template yang diunduh, bila diisi dan diunggah kembali, langsung berhasil diimpor tanpa perubahan|
|AC-004|Setelah data siswa dikosongkan, NISN kembali dapat dipakai mendaftar|
|AC-005|Setelah pengosongan, tidak ada data sisa (mis. skor tanpa siswa) yang membuat angka rekapitulasi keliru|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F002|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-012|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-07-05|Ditambahkan sebagai user flow tersendiri|
|2.0|2026-07-05|Menambahkan penghapusan siswa yang bersih (termasuk tabel skor per jurusan); struktur dokumen mengikuti template baku|
