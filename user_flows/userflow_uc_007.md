# UC-007 — Pengelolaan Jurusan Dinamis (Admin)

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026

## 1. OVERVIEW
- **Summary:** Admin menambah, mengubah, mengimpor, dan menghapus/mengarsipkan jurusan tanpa batas jumlah, tanpa merusak data siswa lama.
- **Goal:** Daftar jurusan sesuai kebutuhan sekolah; hasil kuesioner siswa yang sudah ada tetap aman.
- **Primary Actor:** Admin.

## 2. TRIGGER
Admin membuka menu "Kelola Jurusan".

## 3. PRECONDITIONS
Admin sudah login.

## 4. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin membuka "Kelola Jurusan". | Sistem menampilkan daftar jurusan (aktif dan arsip). |
| 2a | Tambah manual: isi kode, nama, deskripsi, simpan. | Sistem memvalidasi kode unik, menyimpan jurusan baru (aktif). |
| 2b | Impor massal: unduh template lalu unggah Excel/CSV (kode, nama, deskripsi). | Sistem memvalidasi tiap baris, melewati kode duplikat, menyimpan, menampilkan ringkasan (berhasil/dilewati). |
| 3 | Admin menekan "Hapus" pada sebuah jurusan (dengan konfirmasi). | Jika jurusan belum dipakai (tak ada soal/hasil): dihapus permanen. Jika sudah dipakai: diarsipkan (nonaktif); data siswa lama tetap tampil. |
| 4 | (Opsional) Admin menekan "Aktifkan" pada jurusan arsip. | Sistem mengaktifkan kembali jurusan tersebut. |

## 5. EXCEPTION FLOWS
- **EF-001 (Kode duplikat saat tambah/impor):** baris ditolak/dilewati dengan pesan/ringkasan.
- **EF-002 (Belum ada Guru BK saat penugasan terkait):** tidak menghalangi pengelolaan jurusan.

## 6. BUSINESS RULES
- Kode jurusan unik.
- Hanya jurusan **aktif** yang muncul di kuesioner, pilihan soal, penilaian, dan grafik baru.
- Menghapus/mengarsipkan tidak boleh merusak hasil kuesioner siswa yang sudah ada (hasil lama tetap menampilkan nama jurusan meski diarsipkan).

## 7. ACCEPTANCE CRITERIA
- **AC-001:** Jurusan yang belum dipakai terhapus bersih; yang sudah dipakai diarsipkan tanpa merusak hasil siswa.
- **AC-002:** Impor menampilkan ringkasan jumlah berhasil dan dilewati.
- **AC-003:** Menambah jurusan baru langsung membuatnya dapat dipilih untuk soal dan muncul di kuesioner setelah punya soal.
