# User Flow Specification

Document Version: v2.0

Use Case ID: UC-004  
Use Case Name: Pemberian Catatan Konseling & Analisis Minat (Guru BK)

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Guru BK meninjau hasil kuesioner siswa bimbingannya, dibantu kartu Analisis Minat otomatis, lalu menulis catatan konseling tanpa mengubah skor asli.

## 1.2 Goal
Catatan konseling tersimpan pada hasil siswa, dan Guru BK memperoleh alat bantu membaca kecenderungan minat siswa.

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F004|Dasbor & Konseling Guru BK|
|F003|Modul Kuesioner (prasyarat hasil)|

## 1.4 Primary Actor
Guru BK

## 1.5 Supporting Actors
Mesin Analisis Minat (berbasis aturan)

---

# 2. TRIGGER
Guru BK membuka "Daftar Siswa Bimbingan" dan memilih seorang siswa yang telah mengisi kuesioner.

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Guru BK sudah login dengan role `guru_bk`|
|PRE-002|Siswa terkait ditugaskan kepada Guru BK tersebut (`id_guru_bk` cocok)|
|PRE-003|Siswa sudah memiliki hasil kuesioner (`status_kuesioner = selesai`)|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Guru BK membuka Dasbor BK|Sistem menampilkan kartu ringkasan yang dihitung **hanya** dari siswa bimbingannya|
|2|Guru BK membuka "Daftar Siswa Bimbingan"|Sistem menampilkan tabel: Nama, Angkatan, Hasil Rekomendasi, Status Catatan|
|3|Guru BK memilih satu siswa|Sistem menampilkan grafik minat (satu batang per jurusan, hanya-baca)|
|4||Sistem menampilkan kartu "Analisis Minat" berisi interpretasi otomatis dan saran tindak lanjut|
|5|Guru BK menulis teks pada kolom "Catatan Konseling"|Sistem memvalidasi kolom tidak kosong|
|6|Guru BK menekan "Simpan Catatan"|Sistem menyimpan catatan dan mencatatnya pada riwayat kronologis|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Menambah Catatan Susulan
### Condition
Guru BK ingin menambah catatan baru pada siswa yang sudah pernah diberi catatan.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Guru BK menulis catatan baru|Sistem menyimpannya sebagai entri tambahan tanpa menimpa catatan sebelumnya|
|2||Sistem menampilkan seluruh catatan secara kronologis|

---

# 6. EXCEPTION FLOWS

## EF-001: Catatan Kosong
### Condition
Guru BK menekan simpan tanpa mengisi catatan.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Guru BK menekan "Simpan Catatan"|Sistem mendeteksi kolom kosong|
|2||Sistem menampilkan "Catatan tidak boleh kosong."|

## EF-002: Siswa Belum Mengisi Kuesioner
### Condition
Guru BK membuka detail siswa yang belum memiliki hasil.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Guru BK memilih siswa|Sistem mendeteksi belum ada hasil kuesioner|
|2||Sistem menampilkan status "Belum mengisi kuesioner"; grafik, Analisis Minat, dan kolom catatan tidak tersedia|

## EF-003: Mengakses Siswa Bimbingan Guru BK Lain
### Condition
Guru BK mencoba mengakses siswa yang bukan bimbingannya.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Guru BK mengakses rute detail siswa tersebut|Sistem mendeteksi `id_guru_bk` tidak cocok|
|2||Sistem menolak akses dan mengalihkan ke daftar siswa bimbingannya|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Catatan konseling tersimpan dan tertaut ke hasil kuesioner siswa|
|POST-002|Status catatan siswa berubah menjadi "sudah diberikan"|
|POST-003|Skor dan grafik hasil siswa tetap utuh (tidak berubah)|
|POST-004|Catatan dapat dilihat pada riwayat konseling|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|Guru BK hanya melihat dan memberi catatan pada siswa bimbingannya (`id_guru_bk` = dirinya)|
|BR-002|Seluruh kartu ringkasan pada dasbor BK (total siswa, status kuesioner, rekapitulasi rekomendasi per jurusan) dihitung hanya dari siswa bimbingannya|
|BR-003|Guru BK dilarang mengubah atau menghapus angka persentase hasil; hanya menambah catatan|
|BR-004|**Analisis Minat** dihasilkan dinamis dari skor per jurusan: menentukan jurusan tertinggi dan selisih ke jurusan berikutnya, lalu memberi interpretasi 3 tingkat (jelas condong / cenderung / seimbang)|
|BR-005|Analisis Minat berlaku otomatis untuk jurusan apa pun, termasuk jurusan yang baru ditambahkan (nama jurusan diambil dari data)|
|BR-006|Analisis Minat bersifat alat bantu; keputusan akhir tetap pada Guru BK|
|BR-007|Kartu Analisis Minat hanya tampil untuk role `guru_bk`|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-006|Dasbor Guru BK|
|PAGE-007|Daftar Siswa Bimbingan|
|PAGE-008|Detail Siswa (grafik, Analisis Minat, catatan konseling)|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|SiswaProfile|Daftar siswa bimbingan (difilter `id_guru_bk`)|
|KuesionerResult|Hasil dan rekomendasi final siswa|
|KuesionerResultScore|Skor per jurusan (untuk grafik dan Analisis Minat)|
|Jurusan|Nama jurusan untuk label grafik dan narasi analisis|
|BKNote|Riwayat catatan konseling yang sudah ada|

## 10.2 Data Created
|Entity|Description|
|---|---|
|BKNote|Catatan konseling baru (id_result, id_guru_bk, teks catatan)|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|None|Skor dan hasil kuesioner tidak diubah|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|None|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS
|Role|Access|
|---|---|
|Guru BK (pembimbing siswa terkait)|ALLOWED (baca hasil, tulis catatan)|
|Guru BK (bukan pembimbing)|DENIED|
|Siswa|DENIED (hanya melihat hasil sendiri, tanpa Analisis Minat)|
|Orang Tua|DENIED (hanya melihat hasil anak, tanpa Analisis Minat)|
|Admin|DENIED|

---

# 12. ACCEPTANCE CRITERIA
|AC ID|Description|
|---|---|
|AC-001|Guru BK hanya melihat siswa bimbingannya, termasuk pada angka rekapitulasi|
|AC-002|Grafik menampilkan satu batang untuk setiap jurusan yang dinilai|
|AC-003|Kartu Analisis Minat muncul untuk setiap siswa yang memiliki hasil, dan menyebut jurusan tertinggi berdasarkan data|
|AC-004|Catatan tersimpan dan status catatan berubah menjadi "sudah diberikan"|
|AC-005|Grafik dan persentase siswa tetap utuh setelah catatan disimpan|
|AC-006|Kartu Analisis Minat tidak tampil pada tampilan Siswa maupun Orang Tua|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F004|
|F003|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-006|
|PAGE-007|
|PAGE-008|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-06-17|Draf awal|
|2.0|2026-07-05|Menambahkan Analisis Minat dinamis (N jurusan), grafik dinamis, aturan isolasi data per Guru BK; struktur dokumen mengikuti template baku|
