# Test Case Specification

Document Version: v1.0

Project: SAMI-SMK
Product: Sistem Analisis Minat Siswa SMK (Web-Based)

Status: Draft
Last Updated: 2026-07-05

---

# 1. INTRODUCTION

## 1.1 Purpose
Dokumen ini merinci seluruh test case untuk sistem SAMI-SMK, diturunkan dari SRS v3.0 dan User Flow v3.0. Setiap test case memuat prasyarat, langkah, dan hasil yang diharapkan.

## 1.2 Test Case ID Convention
`TC-{FeatureID}-{Sequence}` — contoh: `TC-F003-001` adalah test case pertama untuk fitur F003 (Modul Kuesioner).

## 1.3 Priority Definition
| Priority | Description |
| --- | --- |
| High | Alur inti; kegagalan menghentikan pemakaian sistem |
| Medium | Fitur penting; kegagalan mengganggu tetapi ada jalan lain |
| Low | Fitur pendukung; kegagalan berdampak kecil |

---

# 2. FEATURE F001: AUTENTIKASI & MANAJEMEN HAK AKSES

## 2.1 Autentikasi (Login & Sesi)

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F001-001 | Login berhasil (tiap peran) | High | Akun tiap peran tersedia | 1. Buka `/login`<br>2. Masukkan username & password yang benar<br>3. Klik "Masuk" | 1. Sistem mengarahkan ke dasbor sesuai peran<br>2. Sesi tersimpan dan menu sesuai peran tampil |
| TC-F001-002 | Login gagal — kredensial salah | High | Akun tersedia | 1. Masukkan username benar, password salah<br>2. Klik "Masuk" | 1. Pesan "Username atau password salah"<br>2. Pengguna tetap di halaman login |
| TC-F001-003 | Login gagal — input kosong | Medium | — | 1. Kosongkan username dan password<br>2. Klik "Masuk" | 1. Pesan validasi pada kolom kosong<br>2. Form tidak terkirim |
| TC-F001-004 | Sesi kedaluwarsa karena tidak aktif | Medium | Sudah login | 1. Biarkan tanpa aktivitas lebih dari 60 menit<br>2. Muat ulang halaman | 1. Sesi dihapus<br>2. Pengguna dialihkan ke `/login` |
| TC-F001-005 | Akses rute tanpa login | High | Belum login | 1. Akses langsung rute terlindungi (mis. dasbor admin) | 1. Sistem mengalihkan ke `/login` |
| TC-F001-006 | Akses rute lintas peran | High | Login sebagai Siswa | 1. Akses rute khusus Admin | 1. Akses ditolak<br>2. Dialihkan ke dasbor peran sendiri |
| TC-F001-007 | Logout | Medium | Sudah login | 1. Klik "Keluar" | 1. Sesi dihapus<br>2. Dialihkan ke `/login`<br>3. Rute terlindungi tidak dapat diakses lagi |

## 2.2 UC-001: Registrasi Siswa

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F001-008 | Registrasi siswa berhasil | High | NISN ada di data master, belum diklaim, sudah ditugaskan Guru BK | 1. Pilih "Daftar sebagai Siswa"<br>2. Masukkan NISN, klik "Cek NISN"<br>3. Isi username & password<br>4. Klik "Daftar Akun" | 1. Nama siswa tampil otomatis (read-only)<br>2. Akun tersimpan<br>3. Kode Tautan dihasilkan<br>4. NISN ditandai `is_claimed = true`<br>5. Siswa tertaut ke Guru BK pembimbing |
| TC-F001-009 | NISN tidak terdaftar | High | NISN tidak ada di data master | 1. Masukkan NISN acak<br>2. Klik "Cek NISN" | 1. Pesan "NISN tidak terdaftar. Mohon hubungi Admin Sekolah."<br>2. Form akun tetap terkunci |
| TC-F001-010 | Username sudah dipakai | Medium | Username sudah ada | 1. Verifikasi NISN valid<br>2. Isi username yang sudah ada<br>3. Klik "Daftar Akun" | 1. Pesan "Username sudah digunakan"<br>2. Akun tidak tersimpan |

---

# 3. FEATURE F002: PENGELOLAAN DATA MASTER NISN

## 3.1 UC-005: Data Master NISN

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F002-001 | Tambah NISN manual | Medium | Login Admin | 1. Buka "Data Master NISN"<br>2. Isi NISN, nama, angkatan<br>3. Klik "Simpan" | 1. Data tersimpan dan muncul di daftar<br>2. Status `is_claimed = false` |
| TC-F002-002 | NISN duplikat ditolak | Medium | NISN sudah ada | 1. Tambah NISN yang sama<br>2. Klik "Simpan" | 1. Pesan NISN sudah ada<br>2. Data tidak tersimpan ganda |
| TC-F002-003 | Unduh template NISN | Low | Login Admin | 1. Klik "Unduh Template" | 1. Berkas .xlsx terunduh<br>2. Header: nisn, nama_siswa, angkatan_tahun |
| TC-F002-004 | Impor NISN via Excel | High | Berkas sesuai template | 1. Klik "Impor Data"<br>2. Unggah berkas<br>3. Konfirmasi | 1. Seluruh baris valid tersimpan<br>2. Ringkasan menampilkan jumlah berhasil dan dilewati |
| TC-F002-005 | Impor dengan NISN duplikat | Medium | Berkas memuat NISN yang sudah ada | 1. Impor berkas | 1. Baris duplikat dilewati<br>2. Dilaporkan pada ringkasan |
| TC-F002-006 | Hapus siswa (bersih) | High | Siswa sudah mengisi kuesioner | 1. Hapus siswa dari daftar<br>2. Konfirmasi | 1. Akun & profil siswa terhapus<br>2. Jawaban, hasil, skor per jurusan, catatan BK, kode tautan, akun ortu ikut terhapus<br>3. NISN kembali `is_claimed = false`<br>4. Tidak ada galat foreign key |
| TC-F002-007 | Kosongkan semua data siswa | High | Terdapat beberapa siswa | 1. Klik "Kosongkan Semua Data Siswa"<br>2. Ketik konfirmasi | 1. Seluruh data siswa terhapus bersih<br>2. Verifikasi di Supabase: `kuesioner_result_scores`, `kuesioner_responses`, `kuesioner_results` kosong<br>3. Seluruh NISN kembali dapat dipakai |

## 3.2 UC-006: Penugasan Guru BK

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F002-008 | Penugasan Guru BK diturunkan ke siswa | High | 2 akun Guru BK, NISN sudah ditugaskan | 1. Tetapkan Guru BK A pada sebuah NISN<br>2. Siswa mendaftar dengan NISN tersebut<br>3. Login sebagai Guru BK A dan B | 1. Siswa muncul pada daftar bimbingan Guru BK A<br>2. Siswa **tidak** muncul pada daftar Guru BK B |

---

# 4. FEATURE F003: MODUL KUESIONER SISWA

## 4.1 UC-003: Pengisian Kuesioner & Perhitungan Skor

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F003-001 | Kuesioner memuat soal jurusan aktif | High | 3 jurusan aktif, masing-masing punya soal | 1. Login siswa (belum mengisi)<br>2. Buka Kuesioner | 1. Seluruh soal dari ketiga jurusan tampil<br>2. Jumlah soal sesuai bank soal |
| TC-F003-002 | Submit gagal bila belum lengkap | High | Kuesioner terbuka | 1. Kosongkan minimal satu soal<br>2. Klik "Kirim Hasil Tes" | 1. Pesan "Mohon lengkapi semua pertanyaan."<br>2. Data tidak tersimpan |
| TC-F003-003 | Submit berhasil & hasil tampil | High | Semua soal terisi | 1. Isi seluruh soal (Likert 1–5)<br>2. Klik "Kirim Hasil Tes" | 1. Hasil tersimpan<br>2. Grafik "Persentase Kecocokan" tampil dengan satu batang per jurusan<br>3. Rekomendasi jurusan ditampilkan<br>4. Status berubah `selesai` |
| TC-F003-004 | **Ketepatan perhitungan skor** | High | Satu jurusan memiliki 5 soal | 1. Jawab 5 soal jurusan X dengan nilai 5,4,5,4,4<br>2. Submit<br>3. Amati persentase jurusan X | 1. Rata-rata = 4.4<br>2. Persentase = (4.4 ÷ 5) × 100 = **88%**<br>3. Nilai sesuai perhitungan manual |
| TC-F003-005 | Rekomendasi = skor tertinggi | High | 3 jurusan bersoal | 1. Jawab tinggi (4–5) untuk jurusan A, rendah (1–2) untuk jurusan lain<br>2. Submit | 1. Jurusan A memiliki persentase tertinggi<br>2. Rekomendasi final = jurusan A |
| TC-F003-006 | Skor independen (tidak dibagi 100) | High | 4+ jurusan bersoal | 1. Isi kuesioner dengan jawaban tinggi merata<br>2. Amati persentase | 1. Beberapa jurusan dapat bernilai tinggi bersamaan<br>2. Total persentase **tidak wajib** 100<br>3. Tiap nilai berada pada rentang 0–100 |
| TC-F003-007 | Kuesioner hanya sekali isi | High | Siswa sudah `selesai` | 1. Akses ulang rute kuesioner | 1. Dialihkan ke dasbor<br>2. Pesan bahwa formulir telah terkunci |
| TC-F003-008 | Jurusan tanpa soal tidak merusak | Medium | Terdapat 1 jurusan aktif tanpa soal | 1. Isi dan submit kuesioner | 1. Tidak terjadi galat (pembagian dengan nol)<br>2. Jurusan tersebut dilewati atau ditampilkan 0% |

---

# 5. FEATURE F004: DASBOR & KONSELING GURU BK

## 5.1 UC-004: Konseling & Analisis Minat

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F004-001 | Daftar siswa bimbingan terfilter | High | 2 Guru BK, siswa terbagi | 1. Login Guru BK A<br>2. Buka "Daftar Siswa Bimbingan" | 1. Hanya siswa bimbingan Guru BK A yang tampil |
| TC-F004-002 | **Kartu rekapitulasi terfilter** | High | Guru BK B tanpa siswa bimbingan | 1. Login Guru BK B<br>2. Amati kartu dasbor | 1. Total Siswa = 0<br>2. **Seluruh** kartu "Rekom. {jurusan}" juga = 0<br>3. Tidak ada angka dari siswa Guru BK lain |
| TC-F004-003 | Grafik hasil dinamis | High | Siswa memiliki hasil dengan 3+ jurusan | 1. Buka detail siswa | 1. Grafik menampilkan satu batang untuk tiap jurusan<br>2. Label memakai nama jurusan<br>3. Bersifat hanya-baca |
| TC-F004-004 | **Kartu Analisis Minat tampil** | High | Siswa memiliki hasil | 1. Buka detail siswa | 1. Kartu "Analisis Minat" tampil<br>2. Menyebut jurusan tertinggi berdasarkan data<br>3. Interpretasi sesuai (jelas condong / cenderung / seimbang) |
| TC-F004-005 | Analisis Minat untuk jurusan baru | High | Jurusan baru ditambahkan dan menjadi skor tertinggi seorang siswa | 1. Tambah jurusan baru + soalnya<br>2. Siswa baru mengisi dengan jawaban tinggi pada jurusan tersebut<br>3. Guru BK membuka detail siswa | 1. Analisis Minat **otomatis** menyebut jurusan baru itu<br>2. Tidak perlu perubahan kode |
| TC-F004-006 | Simpan catatan konseling | Medium | Siswa memiliki hasil | 1. Isi kolom "Catatan Konseling"<br>2. Klik "Simpan Catatan" | 1. Catatan tersimpan<br>2. Status catatan berubah<br>3. Grafik dan persentase tetap utuh |
| TC-F004-007 | Analisis Minat hanya untuk Guru BK | High | Siswa & orang tua memiliki akses hasil | 1. Login sebagai Siswa, buka hasil<br>2. Login sebagai Orang Tua, buka hasil anak | 1. Kartu "Analisis Minat" **tidak** tampil pada kedua tampilan |

---

# 6. FEATURE F005: LAPORAN & PEMANTAUAN ORANG TUA

## 6.1 UC-002: Registrasi & Pemantauan Orang Tua

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F005-001 | Registrasi orang tua berhasil | High | Siswa memiliki Kode Tautan aktif | 1. Pilih "Daftar sebagai Orang Tua"<br>2. Isi data diri<br>3. Masukkan Kode Tautan, klik "Verifikasi"<br>4. Konfirmasi pendaftaran | 1. Nama anak tampil sebagai konfirmasi<br>2. Akun tersimpan dan tertaut ke siswa<br>3. Kode berubah status `terpakai` |
| TC-F005-002 | Kode tautan tidak valid | Medium | Kode salah/terpakai/kedaluwarsa | 1. Masukkan kode tersebut<br>2. Klik "Verifikasi" | 1. Pesan "Kode Tautan tidak valid, sudah kedaluwarsa, atau sudah terpakai."<br>2. Akun tidak dibuat |
| TC-F005-003 | Orang tua melihat hasil anak | Medium | Anak sudah mengisi kuesioner | 1. Login sebagai Orang Tua<br>2. Buka dasbor | 1. Grafik hasil anak tampil (satu batang per jurusan)<br>2. Rekomendasi tampil<br>3. Bersifat hanya-baca |

---

# 7. FEATURE F006: PENGELOLAAN JURUSAN DINAMIS

## 7.1 UC-007: Kelola Jurusan

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F006-001 | Tambah jurusan baru | High | Login Admin | 1. Buka "Kelola Jurusan"<br>2. Isi kode, nama, deskripsi<br>3. Klik "Simpan" | 1. Jurusan tersimpan dengan status aktif<br>2. Muncul di daftar |
| TC-F006-002 | Kode jurusan duplikat ditolak | Medium | Kode sudah ada | 1. Tambah jurusan dengan kode yang sama | 1. Pesan kode sudah dipakai<br>2. Data tidak tersimpan |
| TC-F006-003 | Impor jurusan via Excel | Medium | Berkas sesuai template | 1. Unduh template<br>2. Isi beberapa jurusan<br>3. Unggah berkas | 1. Jurusan tersimpan<br>2. Ringkasan menampilkan jumlah berhasil dan dilewati |
| TC-F006-004 | **Hapus jurusan yang belum dipakai** | High | Jurusan tanpa soal & tanpa skor hasil | 1. Klik "Hapus"<br>2. Konfirmasi | 1. Jurusan **terhapus permanen** dari basis data<br>2. Pesan "Jurusan dihapus." |
| TC-F006-005 | **Hapus jurusan yang sudah dipakai (arsip)** | High | Jurusan memiliki soal dan/atau skor hasil siswa | 1. Klik "Hapus"<br>2. Konfirmasi | 1. Jurusan **diarsipkan** (`is_active = false`), tidak terhapus<br>2. Pesan bahwa data siswa tetap aman |
| TC-F006-006 | **Hasil lama tetap utuh setelah arsip** | High | Jurusan yang diarsipkan pernah dipakai siswa | 1. Login sebagai siswa/Guru BK/Orang Tua<br>2. Buka hasil siswa lama | 1. Grafik tetap menampilkan jurusan tersebut lengkap dengan namanya<br>2. Tidak ada galat |
| TC-F006-007 | Jurusan arsip hilang dari aktivitas baru | High | Terdapat jurusan arsip | 1. Login siswa baru, buka kuesioner<br>2. Login Admin, buka pilihan jurusan pada Kelola Soal | 1. Jurusan arsip **tidak** muncul di kuesioner<br>2. Tidak muncul pada pilihan jurusan untuk soal baru |

---

# 8. FEATURE F007: PENGELOLAAN BANK SOAL KUESIONER

## 8.1 UC-008: Kelola Soal

| TC ID | Test Scenario | Priority | Preconditions | Test Steps | Expected Result |
| --- | --- | --- | --- | --- | --- |
| TC-F007-001 | Tambah soal baru | High | Terdapat jurusan aktif | 1. Buka "Kelola Soal Kuesioner"<br>2. Klik "Tambah Soal"<br>3. Isi teks, pilih jurusan<br>4. Simpan | 1. Soal tersimpan tanpa galat<br>2. Muncul di daftar pada kelompok jurusan yang benar |
| TC-F007-002 | Soal baru muncul di kuesioner | High | Soal baru ditambahkan | 1. Login siswa yang belum mengisi<br>2. Buka Kuesioner | 1. Soal baru ikut tampil |
| TC-F007-003 | Edit soal | Medium | Soal tersedia | 1. Klik "Edit"<br>2. Ubah teks<br>3. Simpan | 1. Perubahan tersimpan dan tampil di daftar |
| TC-F007-004 | **Hapus soal yang sudah dijawab** | High | Soal sudah memiliki jawaban siswa | 1. Klik "Hapus"<br>2. Konfirmasi | 1. Jawaban terkait terhapus lebih dulu<br>2. Soal terhapus<br>3. **Tidak ada galat foreign key** |
| TC-F007-005 | **Hapus massal soal** | High | Beberapa soal tersedia | 1. Centang beberapa soal (atau "pilih semua")<br>2. Klik "Hapus Terpilih"<br>3. Konfirmasi | 1. Seluruh soal terpilih terhapus sekaligus<br>2. Ringkasan jumlah terhapus tampil<br>3. Daftar termuat ulang |
| TC-F007-006 | Unduh template soal | Low | Login Admin | 1. Klik "Unduh Template Soal" | 1. Berkas .xlsx terunduh<br>2. Header: teks_pertanyaan, kode_jurusan<br>3. Berisi 1–2 baris contoh |
| TC-F007-007 | Impor soal via Excel | High | Berkas sesuai template, kode jurusan valid | 1. Unggah berkas berisi beberapa soal<br>2. Konfirmasi | 1. Soal tersimpan pada jurusan yang benar<br>2. Baris dengan kode jurusan tidak dikenal dilewati dan dilaporkan<br>3. Ringkasan tampil |

---

# 9. TRACEABILITY MATRIX

| Requirement ID | Use Case | Test Cases | Total |
| --- | --- | --- | --- |
| F001 | UC-001, UC-002 | TC-F001-001 s/d TC-F001-010 | 10 |
| F002 | UC-005, UC-006 | TC-F002-001 s/d TC-F002-008 | 8 |
| F003 | UC-003 | TC-F003-001 s/d TC-F003-008 | 8 |
| F004 | UC-004 | TC-F004-001 s/d TC-F004-007 | 7 |
| F005 | UC-002 | TC-F005-001 s/d TC-F005-003 | 3 |
| F006 | UC-007 | TC-F006-001 s/d TC-F006-007 | 7 |
| F007 | UC-008 | TC-F007-001 s/d TC-F007-007 | 7 |
| **Total** | | | **50** |

---

# 10. REVISION HISTORY

| Version | Date | Description |
| --- | --- | --- |
| 1.0 | 2026-07-05 | Draf awal: 50 test case mencakup F001–F007, termasuk pengujian jurusan dinamis, ketepatan perhitungan skor, isolasi data Guru BK, dan integritas penghapusan |
