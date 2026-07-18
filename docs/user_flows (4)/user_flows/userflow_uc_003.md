# User Flow Specification

Document Version: v2.0

Use Case ID: UC-003  
Use Case Name: Pengisian Kuesioner Minat (Siswa)

Status: Validated  
Last Updated: 2026-07-05  
Project: SAMI-SMK

---

# 1. OVERVIEW

## 1.1 Summary
Siswa mengisi kuesioner Skala Likert (1–5) yang menghasilkan persentase kecocokan untuk setiap jurusan aktif, beserta rekomendasi jurusan.

## 1.2 Goal
Siswa memperoleh hasil rekomendasi jurusan berdasarkan minatnya, dan status kuesionernya terkunci.

## 1.3 Requirement References
|Requirement ID|Requirement Name|
|---|---|
|F003|Modul Kuesioner Siswa|
|F006|Pengelolaan Jurusan Dinamis (prasyarat)|
|F007|Pengelolaan Bank Soal (prasyarat)|

## 1.4 Primary Actor
Siswa

## 1.5 Supporting Actors
Admin (penyedia jurusan dan bank soal), Mesin Perhitungan Skor

---

# 2. TRIGGER
Siswa membuka menu "Kuesioner" dari dasbor, dengan status `belum_dikerjakan`.

---

# 3. PRECONDITIONS
|ID|Condition|
|---|---|
|PRE-001|Siswa sudah login dengan role `siswa`|
|PRE-002|Status kuesioner siswa masih `belum_dikerjakan`|
|PRE-003|Terdapat minimal satu jurusan aktif yang memiliki soal|

---

# 4. MAIN FLOW
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa membuka halaman Kuesioner|Sistem memuat seluruh soal dari jurusan aktif secara dinamis dan menampilkannya dalam format stepper|
|2|Siswa menjawab pertanyaan (Skala Likert 1–5)|Sistem menyimpan jawaban sementara per langkah dan menampilkan indikator kemajuan|
|3|Siswa menekan "Kirim Hasil Tes (Submit)"|Sistem memvalidasi kelengkapan jawaban (tidak ada soal terlewat)|
|4||Sistem membersihkan sisa jawaban lama siswa, lalu menyimpan seluruh jawaban baru|
|5||Sistem menghitung skor tiap jurusan secara independen (0–100%) dan menentukan rekomendasi (skor tertinggi)|
|6||Sistem menyimpan hasil beserta skor per jurusan, mengubah status menjadi `selesai`, dan mengunci formulir|
|7||Sistem menampilkan grafik "Persentase Kecocokan" (satu batang per jurusan) beserta rekomendasi jurusan|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Siswa Kembali ke Langkah Sebelumnya
### Condition
Siswa ingin memeriksa atau mengubah jawaban sebelum submit.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan "Sebelumnya"|Sistem menampilkan langkah sebelumnya dengan jawaban yang sudah terisi|
|2|Siswa mengubah jawaban|Sistem memperbarui jawaban sementara; kembali ke Step 2 pada Main Flow|

---

# 6. EXCEPTION FLOWS

## EF-001: Jawaban Belum Lengkap
### Condition
Siswa menekan submit sementara masih ada soal yang belum dijawab.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan "Kirim Hasil Tes"|Sistem mendeteksi soal yang belum terisi|
|2||Sistem menampilkan "Mohon lengkapi semua pertanyaan." dan tidak menyimpan|

## EF-002: Akses Berulang Setelah Selesai
### Condition
Siswa yang sudah menyelesaikan kuesioner mencoba mengaksesnya kembali.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa membuka rute kuesioner|Sistem mendeteksi `status_kuesioner = selesai`|
|2||Sistem mengalihkan ke dasbor dengan notifikasi "Anda telah mengisi kuesioner. Formulir telah terkunci."|

## EF-003: Jawaban Tersimpan Sebagian dari Percobaan Sebelumnya
### Condition
Terdapat sisa jawaban dari percobaan submit yang gagal di tengah jalan.
### Flow
|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa menekan submit|Sistem menghapus jawaban lama siswa terlebih dahulu (mencegah pelanggaran constraint `unique_siswa_soal`)|
|2||Sistem menyimpan jawaban baru secara utuh dan melanjutkan perhitungan|

---

# 7. POSTCONDITIONS
|ID|Condition|
|---|---|
|POST-001|Seluruh jawaban siswa tersimpan (satu jawaban per soal)|
|POST-002|Hasil kuesioner tersimpan beserta skor untuk setiap jurusan|
|POST-003|`rekomendasi_final` terisi jurusan dengan skor tertinggi|
|POST-004|`status_kuesioner` berubah menjadi `selesai` dan rute kuesioner terkunci permanen|
|POST-005|Hasil dapat dilihat siswa, Guru BK pembimbing, dan orang tua yang tertaut|

---

# 8. BUSINESS RULES
|Rule ID|Description|
|---|---|
|BR-001|Kuesioner hanya dapat diisi satu kali per siswa|
|BR-002|Nilai jawaban wajib integer 1–5 (Skala Likert)|
|BR-003|Constraint `unique_siswa_soal` memastikan satu jawaban per soal per siswa|
|BR-004|**Penilaian independen per jurusan:** skor = (rata-rata jawaban soal jurusan tersebut ÷ 5) × 100, menghasilkan 0–100% yang berdiri sendiri (tidak dinormalisasi menjadi total 100)|
|BR-005|Rekomendasi final adalah jurusan dengan persentase tertinggi|
|BR-006|Hanya jurusan aktif yang dimuat dan dinilai; jurusan tanpa soal dilewati|
|BR-007|Menambah jurusan/soal langsung memengaruhi kuesioner berikutnya tanpa perubahan kode|

---

# 9. RELATED PAGES
|Page ID|Page Name|
|---|---|
|PAGE-003|Dasbor Siswa|
|PAGE-004|Instrumen Kuesioner Minat|
|PAGE-005|Hasil Kuesioner (Persentase Kecocokan)|

---

# 10. DATA USAGE

## 10.1 Data Read
|Entity|Description|
|---|---|
|Jurusan|Mengambil seluruh jurusan aktif (`is_active = true`)|
|Question|Mengambil soal milik jurusan aktif beserta `id_jurusan`|
|SiswaProfile|Memeriksa status kuesioner siswa|

## 10.2 Data Created
|Entity|Description|
|---|---|
|KuesionerResponse|Jawaban siswa untuk tiap soal (nilai 1–5)|
|KuesionerResult|Header hasil kuesioner beserta rekomendasi final|
|KuesionerResultScore|Skor persentase untuk setiap jurusan (satu baris per jurusan)|

## 10.3 Data Updated
|Entity|Description|
|---|---|
|SiswaProfile|`status_kuesioner` diubah menjadi `selesai`|

## 10.4 Data Deleted
|Entity|Description|
|---|---|
|KuesionerResponse|Sisa jawaban lama siswa dihapus sebelum penyimpanan jawaban baru|

---

# 11. PERMISSIONS
|Role|Access|
|---|---|
|Siswa (belum mengisi)|ALLOWED|
|Siswa (sudah mengisi)|DENIED (dialihkan ke dasbor)|
|Guru BK|DENIED (hanya melihat hasil)|
|Orang Tua|DENIED (hanya melihat hasil)|
|Admin|DENIED|

---

# 12. ACCEPTANCE CRITERIA
|AC ID|Description|
|---|---|
|AC-001|Kuesioner memuat soal dari seluruh jurusan aktif secara dinamis|
|AC-002|Submit hanya berhasil bila semua soal terisi|
|AC-003|Setelah submit, status menjadi `selesai` dan rute kuesioner terblokir permanen|
|AC-004|Grafik hasil menampilkan satu batang untuk setiap jurusan yang dinilai|
|AC-005|Jurusan dengan skor tertinggi ditandai sebagai rekomendasi|
|AC-006|Persentase tiap jurusan berada pada rentang 0–100% dan mencerminkan rata-rata jawaban|

---

# 13. TRACEABILITY

## Requirement Traceability
|Requirement ID|
|---|
|F003|
|F006|
|F007|

## Information Architecture Traceability
|Page ID|
|---|
|PAGE-004|
|PAGE-005|

---

# 15. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-06-17|Draf awal (dua jurusan tetap: Multimedia/DKV dan TBSM)|
|2.0|2026-07-05|Jurusan menjadi dinamis (N jurusan); penilaian diubah menjadi skor independen 0–100% per jurusan; struktur dokumen mengikuti template baku|
