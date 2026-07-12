# User Flow Specification

Document Version: v2.0

Use Case ID: UC-008  
Use Case Name: Pengelolaan Bank Soal Kuesioner (Admin)

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Admin mengelola bank soal kuesioner: tambah, ubah, impor massal via Excel, hapus satuan, dan hapus massal (memilih beberapa soal sekaligus).

## 1.2 Goal
Bank soal terkelola efisien, dan kuesioner siswa selalu mencerminkan soal terkini.

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F007|Pengelolaan Bank Soal Kuesioner|
|F006|Pengelolaan Jurusan Dinamis (prasyarat)|
|F003|Modul Kuesioner (terdampak)|

## 1.4 Primary Actor
Admin

## 1.5 Supporting Actors
Modul Impor Berkas (SheetJS)

---

# 2. TRIGGER
Admin membuka menu "Kelola Soal Kuesioner".

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Admin sudah login dengan role `admin`|
|PRE-002|Terdapat minimal satu jurusan aktif|
|PRE-003|Untuk impor: berkas mengikuti format template (teks_pertanyaan, kode_jurusan)|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin membuka "Kelola Soal Kuesioner"|Sistem menampilkan soal yang dikelompokkan per jurusan|
|2|Admin menekan "Tambah Soal", mengisi teks pertanyaan, dan memilih jurusan|Sistem menyimpan soal (id dihasilkan otomatis oleh basis data)|
|3|Admin menekan "Edit" pada sebuah soal|Sistem menampilkan form terisi; perubahan disimpan setelah dikonfirmasi|
|4|Admin mencentang beberapa soal dan menekan "Hapus Terpilih"|Sistem meminta konfirmasi ("Hapus N soal yang dipilih?")|
|5|Admin mengonfirmasi|Sistem menghapus jawaban siswa yang merujuk soal-soal tersebut, lalu menghapus soalnya|
|6||Sistem menampilkan ringkasan ("N soal berhasil dihapus"), mengosongkan pilihan, dan memuat ulang daftar|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Impor Soal Massal
### Condition
Admin ingin menambahkan banyak soal sekaligus.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menekan "Unduh Template Soal"|Sistem mengunduh berkas .xlsx berisi header (teks_pertanyaan, kode_jurusan) dan contoh baris|
|2|Admin mengunggah berkas yang sudah diisi|Sistem memetakan `kode_jurusan` ke jurusan aktif dan menyimpan soal yang valid|
|3||Sistem menampilkan ringkasan: N soal ditambahkan, M dilewati (kode jurusan tidak dikenal)|

## AF-002: Hapus Soal Satuan
### Condition
Admin hanya ingin menghapus satu soal.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menekan "Hapus" pada satu soal|Sistem meminta konfirmasi|
|2|Admin mengonfirmasi|Sistem menghapus jawaban terkait lebih dulu, lalu menghapus soal tersebut|

## AF-003: Pilih Semua
### Condition
Admin ingin memilih seluruh soal yang tampil.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin mencentang kotak "pilih semua"|Sistem menandai seluruh soal yang tampil sebagai terpilih|
|2|Admin menekan "Hapus Terpilih"|Sistem melanjutkan ke Step 4 pada Main Flow|

---

# 6. EXCEPTION FLOWS

## EF-001: Soal Memiliki Jawaban Siswa
### Condition
Soal yang akan dihapus sudah dijawab oleh siswa (direferensikan `kuesioner_responses`).
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin mengonfirmasi penghapusan|Sistem menghapus jawaban terkait terlebih dahulu (urutan foreign key)|
|2||Sistem kemudian menghapus soal tanpa menimbulkan galat integritas|

## EF-002: Kode Jurusan Tidak Dikenal pada Impor
### Condition
Berkas impor memuat kode jurusan yang tidak ada atau sudah diarsipkan.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin mengimpor berkas|Sistem tidak menemukan jurusan aktif yang cocok|
|2||Sistem melewati baris tersebut dan melaporkannya pada ringkasan|

## EF-003: Menekan Hapus Massal Tanpa Memilih
### Condition
Tidak ada soal yang tercentang.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin membuka halaman|Sistem menonaktifkan tombol "Hapus Terpilih" hingga ada soal yang dipilih|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Bank soal mencerminkan instrumen kuesioner terkini|
|POST-002|Setiap soal terkait tepat satu jurusan|
|POST-003|Perubahan soal langsung memengaruhi kuesioner siswa berikutnya|
|POST-004|Tidak tersisa jawaban yatim setelah penghapusan soal|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|Setiap soal dikaitkan ke satu jurusan aktif melalui `id_jurusan`|
|BR-002|Insert soal tidak boleh mengirim kolom `id` (dihasilkan otomatis oleh basis data)|
|BR-003|Menghapus soal yang sudah dijawab mensyaratkan penghapusan jawaban terkait terlebih dahulu|
|BR-004|Penghapusan satuan maupun massal wajib melalui dialog konfirmasi|
|BR-005|Perhitungan skor tetap sahih berapa pun jumlah soal per jurusan (memakai rata-rata jawaban)|
|BR-006|Impor menampilkan ringkasan jumlah berhasil dan dilewati|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-015|Kelola Soal Kuesioner|
|PAGE-014|Kelola Jurusan (sumber pilihan jurusan)|
|PAGE-004|Instrumen Kuesioner (terdampak)|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|Question|Daftar soal beserta jurusannya|
|Jurusan|Daftar jurusan aktif untuk pilihan dan pemetaan kode saat impor|

## 10.2 Data Created
|Entity|Description|
|---|---|
|Question|Soal baru (manual atau impor massal)|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|Question|Teks pertanyaan atau jurusan sebuah soal diperbarui|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|KuesionerResponse|Jawaban siswa yang merujuk soal yang dihapus (dihapus lebih dulu)|
|Question|Soal yang dihapus (satuan maupun massal)|

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
|AC-001|Tambah, ubah, dan hapus soal berhasil; kuesioner siswa mencerminkan perubahan|
|AC-002|Hapus massal menghapus seluruh soal terpilih dalam satu tindakan, setelah konfirmasi|
|AC-003|Menghapus soal yang sudah memiliki jawaban siswa tetap berhasil tanpa galat integritas|
|AC-004|Impor menempatkan soal pada jurusan yang benar dan menampilkan ringkasan|
|AC-005|Template yang diunduh, bila diisi dan diunggah kembali, langsung berhasil diimpor tanpa perubahan|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F007|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-015|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-07-05|Ditambahkan seiring fitur kelola soal|
|2.0|2026-07-05|Menambahkan hapus massal dan impor Excel; struktur dokumen mengikuti template baku|
