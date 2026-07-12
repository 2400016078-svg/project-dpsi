# User Flow Specification

Document Version: v2.0

Use Case ID: UC-007  
Use Case Name: Pengelolaan Jurusan Dinamis (Admin)

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Admin menambah, mengimpor, dan menghapus jurusan tanpa batas jumlah. Penghapusan bersifat pintar: jurusan yang belum terpakai dihapus permanen, sedangkan jurusan yang sudah terpakai diarsipkan agar data siswa lama tetap utuh.

## 1.2 Goal
Daftar jurusan sesuai kebutuhan sekolah, tanpa merusak hasil kuesioner siswa yang sudah ada.

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F006|Pengelolaan Jurusan Dinamis|
|F003|Modul Kuesioner (terdampak)|

## 1.4 Primary Actor
Admin

## 1.5 Supporting Actors
Modul Impor Berkas (SheetJS)

---

# 2. TRIGGER
Admin membuka menu "Kelola Jurusan".

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Admin sudah login dengan role `admin`|
|PRE-002|Untuk impor: berkas mengikuti format template (kode, nama, deskripsi)|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin membuka "Kelola Jurusan"|Sistem menampilkan daftar jurusan beserta status (aktif / arsip)|
|2|Admin menekan "Tambah Jurusan" dan mengisi kode, nama, deskripsi|Sistem memvalidasi kode unik dan menyimpan jurusan baru (aktif)|
|3|Admin menekan "Hapus" pada sebuah jurusan|Sistem meminta konfirmasi|
|4|Admin mengonfirmasi|Sistem memeriksa keterpakaian jurusan (jumlah soal dan jumlah skor hasil yang merujuk padanya)|
|5||Bila **tidak terpakai**: sistem menghapus jurusan secara permanen dan menampilkan "Jurusan dihapus."|
|6||Bila **masih terpakai**: sistem mengarsipkan jurusan (`is_active = false`) dan menampilkan "Jurusan diarsipkan; data siswa tetap aman."|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Impor Jurusan Massal
### Condition
Admin ingin menambahkan banyak jurusan sekaligus.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menekan "Unduh Template Jurusan"|Sistem mengunduh berkas .xlsx berisi header (kode, nama, deskripsi) dan contoh baris|
|2|Admin mengunggah berkas yang sudah diisi|Sistem mengurai berkas, melewati kode duplikat, menyimpan sisanya|
|3||Sistem menampilkan ringkasan: N jurusan ditambahkan, M dilewati|

## AF-002: Mengaktifkan Kembali Jurusan Arsip
### Condition
Jurusan yang diarsipkan hendak digunakan kembali.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menekan "Aktifkan" pada jurusan arsip|Sistem mengubah `is_active = true`|
|2||Jurusan kembali muncul pada kuesioner, pilihan soal, dan penilaian baru|

---

# 6. EXCEPTION FLOWS

## EF-001: Kode Jurusan Duplikat
### Condition
Kode jurusan yang ditambahkan/diimpor sudah ada.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menyimpan/mengimpor|Sistem mendeteksi kode duplikat|
|2||Sistem menolak baris tersebut (manual) atau melewatinya dan melaporkannya pada ringkasan (impor)|

## EF-002: Kode Jurusan Tidak Dikenal pada Impor Soal
### Condition
Berkas impor soal memuat kode jurusan yang tidak ada atau sudah diarsipkan.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin mengimpor soal|Sistem tidak menemukan jurusan aktif yang cocok|
|2||Sistem melewati baris tersebut dan melaporkannya pada ringkasan|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Daftar jurusan mencerminkan bidang keahlian yang ditawarkan sekolah|
|POST-002|Jurusan yang diarsipkan tidak muncul pada kuesioner, pilihan soal, dan penilaian baru|
|POST-003|Hasil kuesioner siswa yang merujuk jurusan arsip tetap ditampilkan lengkap dengan nama jurusannya|
|POST-004|Jurusan yang dihapus permanen tidak lagi ada di basis data|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|Kode jurusan unik|
|BR-002|Jumlah jurusan tidak dibatasi (sistem mendukung N jurusan)|
|BR-003|Hanya jurusan `is_active = true` yang dipakai untuk kuesioner, pilihan soal, penilaian, dan grafik baru|
|BR-004|**Penghapusan pintar:** jurusan tanpa referensi (tidak ada soal maupun skor hasil) dihapus permanen; jurusan yang masih direferensikan diarsipkan|
|BR-005|Mengarsipkan tidak boleh merusak hasil kuesioner siswa yang sudah ada|
|BR-006|Tombol tetap berlabel "Hapus"; pemilihan perilaku (hapus atau arsip) dilakukan sistem secara otomatis|
|BR-007|Setelah seluruh data siswa dikosongkan (UC-005), jurusan menjadi tidak terpakai sehingga dapat dihapus bersih|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-014|Kelola Jurusan|
|PAGE-015|Kelola Soal Kuesioner (terdampak: pilihan jurusan)|
|PAGE-004|Instrumen Kuesioner (terdampak: soal yang dimuat)|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|Jurusan|Daftar jurusan beserta status aktif/arsip|
|Question|Menghitung jumlah soal yang merujuk jurusan (uji keterpakaian)|
|KuesionerResultScore|Menghitung jumlah skor hasil yang merujuk jurusan (uji keterpakaian)|

## 10.2 Data Created
|Entity|Description|
|---|---|
|Jurusan|Jurusan baru (manual atau impor massal)|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|Jurusan|`is_active` diubah menjadi `false` (arsip) atau `true` (aktifkan kembali); atau pembaruan kode/nama/deskripsi|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|Jurusan|Jurusan yang tidak direferensikan data apa pun dihapus permanen|

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
|AC-001|Jurusan yang belum dipakai terhapus bersih dari basis data|
|AC-002|Jurusan yang sudah dipakai diarsipkan tanpa merusak hasil siswa|
|AC-003|Hasil siswa lama tetap menampilkan nama jurusan meskipun jurusan tersebut diarsipkan|
|AC-004|Jurusan arsip tidak muncul pada kuesioner maupun pilihan soal|
|AC-005|Menambah jurusan baru langsung membuatnya dapat dipilih untuk soal dan muncul di kuesioner setelah memiliki soal|
|AC-006|Impor menampilkan ringkasan jumlah berhasil dan dilewati|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F006|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-014|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-07-05|Ditambahkan seiring fitur jurusan dinamis|
|2.0|2026-07-05|Menambahkan penghapusan pintar (hapus permanen vs arsip) dan impor massal; struktur dokumen mengikuti template baku|
