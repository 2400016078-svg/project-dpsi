# Test Execution Sheet

Document Version: v1.0

Project: SAMI-SMK
Product: Sistem Analisis Minat Siswa SMK (Web-Based)

Status: Draft
Last Updated: 2026-07-05

---

# 1. INSTRUCTIONS

1. Buka berkas ini dalam mode dapat disunting (atau cetak).
2. Eksekusi test case secara berurutan sesuai tabel di bawah.
3. Pada kolom **Actual Result**, catat hasil aktual yang terjadi saat pengujian.
4. Pada kolom **Status**, isi **PASS** bila hasil sesuai harapan, **FAIL** bila tidak sesuai, atau **N/A** bila tidak dapat diuji.
5. Pada kolom **Notes**, tulis keterangan tambahan (mis. ID defect, tangkapan layar, pesan galat konsol).
6. Gunakan lembar ini sebagai bukti eksekusi pengujian.

**Prasyarat data uji:** 1 akun Admin, 2 akun Guru BK, minimal 3 jurusan aktif bersoal, beberapa NISN di data master, minimal 1 siswa yang sudah mengisi dan 1 yang belum, serta 1 akun Orang Tua.

---

# 2. FEATURE F001: AUTENTIKASI & MANAJEMEN HAK AKSES

| TC ID | Test Scenario | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| TC-F001-001 | Login berhasil (tiap peran) | Diarahkan ke dasbor sesuai peran; menu sesuai peran | | | |
| TC-F001-002 | Login gagal — kredensial salah | Pesan "Username atau password salah"; tetap di halaman login | | | |
| TC-F001-003 | Login gagal — input kosong | Pesan validasi pada kolom kosong; form tidak terkirim | | | |
| TC-F001-004 | Sesi kedaluwarsa (60 menit tanpa aktivitas) | Sesi dihapus; dialihkan ke `/login` | | | |
| TC-F001-005 | Akses rute tanpa login | Dialihkan ke `/login` | | | |
| TC-F001-006 | Akses rute lintas peran | Akses ditolak; dialihkan ke dasbor peran sendiri | | | |
| TC-F001-007 | Logout | Sesi dihapus; rute terlindungi tidak dapat diakses | | | |
| TC-F001-008 | Registrasi siswa berhasil | Nama tampil otomatis; akun tersimpan; Kode Tautan dihasilkan; NISN diklaim; tertaut Guru BK | | | |
| TC-F001-009 | NISN tidak terdaftar | Pesan "NISN tidak terdaftar"; form akun terkunci | | | |
| TC-F001-010 | Username sudah dipakai | Pesan username sudah digunakan; akun tidak tersimpan | | | |

---

# 3. FEATURE F002: PENGELOLAAN DATA MASTER NISN

| TC ID | Test Scenario | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| TC-F002-001 | Tambah NISN manual | Data tersimpan; `is_claimed = false` | | | |
| TC-F002-002 | NISN duplikat ditolak | Pesan NISN sudah ada; tidak tersimpan ganda | | | |
| TC-F002-003 | Unduh template NISN | Berkas .xlsx terunduh dengan header yang benar | | | |
| TC-F002-004 | Impor NISN via Excel | Baris valid tersimpan; ringkasan berhasil/dilewati tampil | | | |
| TC-F002-005 | Impor dengan NISN duplikat | Baris duplikat dilewati dan dilaporkan | | | |
| TC-F002-006 | Hapus siswa (bersih) | Seluruh data turunan ikut terhapus; NISN dibebaskan; tanpa galat FK | | | |
| TC-F002-007 | Kosongkan semua data siswa | Semua data siswa bersih; tabel skor/jawaban/hasil kosong; NISN dibebaskan | | | |
| TC-F002-008 | Penugasan Guru BK diturunkan ke siswa | Siswa muncul hanya pada daftar Guru BK yang ditugaskan | | | |

---

# 4. FEATURE F003: MODUL KUESIONER SISWA

| TC ID | Test Scenario | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| TC-F003-001 | Kuesioner memuat soal jurusan aktif | Seluruh soal dari jurusan aktif tampil | | | |
| TC-F003-002 | Submit gagal bila belum lengkap | Pesan "Mohon lengkapi semua pertanyaan"; tidak tersimpan | | | |
| TC-F003-003 | Submit berhasil & hasil tampil | Grafik satu batang per jurusan; rekomendasi tampil; status `selesai` | | | |
| TC-F003-004 | **Ketepatan perhitungan skor** (5,4,5,4,4 → 88%) | Persentase = (rata-rata ÷ 5) × 100, sesuai hitungan manual | | | |
| TC-F003-005 | Rekomendasi = skor tertinggi | Jurusan dengan jawaban tertinggi menjadi rekomendasi | | | |
| TC-F003-006 | Skor independen (tidak dibagi 100) | Nilai tiap jurusan 0–100; total tidak wajib 100 | | | |
| TC-F003-007 | Kuesioner hanya sekali isi | Akses ulang dialihkan ke dasbor; formulir terkunci | | | |
| TC-F003-008 | Jurusan tanpa soal tidak merusak | Tidak ada galat; jurusan dilewati atau 0% | | | |

---

# 5. FEATURE F004: DASBOR & KONSELING GURU BK

| TC ID | Test Scenario | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| TC-F004-001 | Daftar siswa bimbingan terfilter | Hanya siswa bimbingan Guru BK yang login | | | |
| TC-F004-002 | **Kartu rekapitulasi terfilter** | Guru BK tanpa siswa: Total = 0 dan seluruh kartu Rekom. = 0 | | | |
| TC-F004-003 | Grafik hasil dinamis | Satu batang per jurusan; label dari nama jurusan; hanya-baca | | | |
| TC-F004-004 | **Kartu Analisis Minat tampil** | Kartu muncul; menyebut jurusan tertinggi; interpretasi sesuai | | | |
| TC-F004-005 | Analisis Minat untuk jurusan baru | Otomatis menyebut jurusan yang baru ditambahkan | | | |
| TC-F004-006 | Simpan catatan konseling | Catatan tersimpan; grafik dan persentase tetap utuh | | | |
| TC-F004-007 | Analisis Minat hanya untuk Guru BK | Tidak tampil pada tampilan Siswa maupun Orang Tua | | | |

---

# 6. FEATURE F005: LAPORAN & PEMANTAUAN ORANG TUA

| TC ID | Test Scenario | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| TC-F005-001 | Registrasi orang tua berhasil | Nama anak dikonfirmasi; akun tertaut; kode `terpakai` | | | |
| TC-F005-002 | Kode tautan tidak valid | Pesan kode tidak valid; akun tidak dibuat | | | |
| TC-F005-003 | Orang tua melihat hasil anak | Grafik dan rekomendasi anak tampil; hanya-baca | | | |

---

# 7. FEATURE F006: PENGELOLAAN JURUSAN DINAMIS

| TC ID | Test Scenario | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| TC-F006-001 | Tambah jurusan baru | Jurusan tersimpan (aktif) dan muncul di daftar | | | |
| TC-F006-002 | Kode jurusan duplikat ditolak | Pesan kode sudah dipakai; tidak tersimpan | | | |
| TC-F006-003 | Impor jurusan via Excel | Jurusan tersimpan; ringkasan berhasil/dilewati tampil | | | |
| TC-F006-004 | **Hapus jurusan yang belum dipakai** | Terhapus permanen; pesan "Jurusan dihapus." | | | |
| TC-F006-005 | **Hapus jurusan yang sudah dipakai (arsip)** | Diarsipkan (`is_active = false`); pesan data siswa tetap aman | | | |
| TC-F006-006 | **Hasil lama tetap utuh setelah arsip** | Grafik siswa lama tetap menampilkan jurusan tersebut | | | |
| TC-F006-007 | Jurusan arsip hilang dari aktivitas baru | Tidak muncul di kuesioner maupun pilihan soal | | | |

---

# 8. FEATURE F007: PENGELOLAAN BANK SOAL KUESIONER

| TC ID | Test Scenario | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| TC-F007-001 | Tambah soal baru | Soal tersimpan tanpa galat; muncul pada jurusan yang benar | | | |
| TC-F007-002 | Soal baru muncul di kuesioner | Soal baru ikut tampil bagi siswa | | | |
| TC-F007-003 | Edit soal | Perubahan tersimpan dan tampil | | | |
| TC-F007-004 | **Hapus soal yang sudah dijawab** | Jawaban terkait terhapus lebih dulu; tanpa galat foreign key | | | |
| TC-F007-005 | **Hapus massal soal** | Seluruh soal terpilih terhapus sekaligus; ringkasan tampil | | | |
| TC-F007-006 | Unduh template soal | Berkas .xlsx dengan header benar dan contoh baris | | | |
| TC-F007-007 | Impor soal via Excel | Soal masuk ke jurusan yang benar; baris tak dikenal dilewati | | | |

---

# 9. EXECUTION SUMMARY

| Feature | Total TC | PASS | FAIL | N/A | Pass Rate |
| --- | --- | --- | --- | --- | --- |
| F001: Autentikasi & Hak Akses | 10 | | | | |
| F002: Data Master NISN | 8 | | | | |
| F003: Modul Kuesioner | 8 | | | | |
| F004: Dasbor & Konseling BK | 7 | | | | |
| F005: Laporan Orang Tua | 3 | | | | |
| F006: Pengelolaan Jurusan | 7 | | | | |
| F007: Pengelolaan Bank Soal | 7 | | | | |
| **Total** | **50** | | | | |

**Tester Name:** ____________________

**Execution Date:** ____________________

**Environment:** ☐ Localhost  ☐ Netlify (produksi)

**Signature:** ____________________

---

# 10. DEFECT LOG

| Defect ID | TC ID | Description | Severity | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| | | | | | |
| | | | | | |
| | | | | | |

**Severity:** Critical / Major / Minor / Trivial  
**Status:** Open / In Progress / Fixed / Closed / Known Issue

---

# 11. REVISION HISTORY

| Version | Date | Description |
| --- | --- | --- |
| 1.0 | 2026-07-05 | Draf awal: lembar eksekusi untuk 50 test case (F001–F007) |
