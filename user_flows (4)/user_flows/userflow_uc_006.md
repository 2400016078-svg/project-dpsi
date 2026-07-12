# User Flow Specification

Document Version: v2.0

Use Case ID: UC-006  
Use Case Name: Penugasan Siswa ke Guru BK Pembimbing (Admin)

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Admin menetapkan Guru BK pembimbing bagi tiap siswa melalui data master, sehingga setiap Guru BK hanya menangani siswa bimbingannya.

## 1.2 Goal
Setiap siswa memiliki satu Guru BK pembimbing, dan data antar-Guru BK terisolasi.

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F002|Pengelolaan Data Master NISN|
|F004|Dasbor & Konseling Guru BK|

## 1.4 Primary Actor
Admin

## 1.5 Supporting Actors
Guru BK (penerima penugasan), Siswa (pihak yang ditugaskan)

---

# 2. TRIGGER
Admin membuka "Data Master NISN" dan mengatur penugasan Guru BK.

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Admin sudah login dengan role `admin`|
|PRE-002|Terdapat minimal satu akun Guru BK|
|PRE-003|Data master NISN sudah terisi|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin membuka daftar Data Master NISN|Sistem menampilkan tiap NISN beserta Guru BK pembimbingnya (bila sudah ditetapkan)|
|2|Admin menetapkan Guru BK untuk seorang siswa|Sistem menyimpan `id_guru_bk` pada data master|
|3|Siswa mendaftar memakai NISN tersebut (UC-001)|Sistem menyalin Guru BK pembimbing dari data master ke profil siswa|
|4|Guru BK login dan membuka "Daftar Siswa Bimbingan"|Sistem menampilkan hanya siswa yang ditugaskan kepadanya|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Pembagian Merata Otomatis
### Condition
Admin ingin membagi siswa secara merata ke seluruh Guru BK.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin menekan "Bagi Merata"|Sistem membagi NISN yang belum ditugaskan secara merata ke seluruh Guru BK|
|2||Sistem menampilkan ringkasan pembagian|

## AF-002: Memindahkan Siswa ke Guru BK Lain
### Condition
Admin ingin mengganti Guru BK pembimbing seorang siswa.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin memilih Guru BK yang berbeda|Sistem memperbarui `id_guru_bk` pada data master dan profil siswa|
|2||Siswa tersebut berpindah ke daftar bimbingan Guru BK yang baru|

---

# 6. EXCEPTION FLOWS

## EF-001: Belum Ada Akun Guru BK
### Condition
Tidak ada akun dengan role `guru_bk` di sistem.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Admin membuka pengaturan penugasan|Sistem mendeteksi tidak ada Guru BK|
|2||Sistem memberi tahu bahwa penugasan belum dapat dilakukan sebelum akun Guru BK dibuat|

## EF-002: Siswa Belum Ditugaskan
### Condition
Siswa mendaftar dengan NISN yang belum memiliki Guru BK pembimbing.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa mendaftar|Sistem menyimpan profil dengan `id_guru_bk` kosong|
|2||Siswa tidak muncul pada daftar bimbingan Guru BK mana pun hingga Admin menetapkan pembimbing|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Data master NISN memuat `id_guru_bk` untuk tiap siswa|
|POST-002|Profil siswa yang mendaftar tertaut ke Guru BK pembimbing|
|POST-003|Daftar dan rekapitulasi Guru BK hanya memuat siswa bimbingannya|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|Satu siswa memiliki tepat satu Guru BK pembimbing|
|BR-002|Penugasan disimpan pada data master, lalu diturunkan ke profil siswa saat pendaftaran|
|BR-003|Seluruh kueri pada tampilan Guru BK wajib difilter `id_guru_bk` = Guru BK yang login|
|BR-004|Kartu ringkasan pada dasbor BK (total siswa, status kuesioner, rekapitulasi rekomendasi per jurusan) juga wajib difilter; bila tidak ada siswa bimbingan, seluruh kartu bernilai nol|
|BR-005|Guru BK tidak dapat melihat siswa bimbingan Guru BK lain|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-012|Data Master NISN (pengaturan penugasan)|
|PAGE-006|Dasbor Guru BK|
|PAGE-007|Daftar Siswa Bimbingan|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|User|Daftar akun dengan role `guru_bk`|
|MasterNISN|Data NISN dan penugasan yang sudah ada|
|SiswaProfile|Daftar siswa untuk verifikasi penugasan|

## 10.2 Data Created
|Entity|Description|
|---|---|
|None|Tidak ada entitas baru|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|MasterNISN|`id_guru_bk` ditetapkan atau diubah|
|SiswaProfile|`id_guru_bk` disalin saat pendaftaran, atau diperbarui bila Admin memindahkan siswa|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|None|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS
|Role|Access|
|---|---|
|Admin|ALLOWED (menetapkan penugasan)|
|Guru BK|READ-ONLY (melihat siswa bimbingannya)|
|Siswa / Orang Tua|DENIED|

---

# 12. ACCEPTANCE CRITERIA
|AC ID|Description|
|---|---|
|AC-001|Siswa yang mendaftar otomatis tertaut ke Guru BK sesuai penugasan pada data master|
|AC-002|Guru BK A tidak melihat siswa bimbingan Guru BK B|
|AC-003|Angka rekapitulasi pada dasbor Guru BK hanya menghitung siswa bimbingannya|
|AC-004|Bila seorang Guru BK tidak memiliki siswa bimbingan, seluruh kartu ringkasannya bernilai nol secara konsisten|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F002|
|F004|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-012|
|PAGE-006|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-07-05|Ditambahkan sebagai user flow tersendiri|
|2.0|2026-07-05|Menegaskan isolasi data pada seluruh kartu rekapitulasi; struktur dokumen mengikuti template baku|
