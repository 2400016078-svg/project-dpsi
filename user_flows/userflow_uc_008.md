# UC-008 — Pengelolaan Bank Soal Kuesioner (Admin)

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026

## 1. OVERVIEW
- **Summary:** Admin menambah, mengubah, menghapus (satuan & massal), dan mengimpor soal kuesioner yang dikaitkan ke jurusan.
- **Goal:** Bank soal terkelola efisien; kuesioner siswa selalu mencerminkan soal terkini.
- **Primary Actor:** Admin.

## 2. TRIGGER
Admin membuka menu "Kelola Soal Kuesioner".

## 3. PRECONDITIONS
Admin sudah login; minimal ada satu jurusan aktif.

## 4. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin membuka "Kelola Soal Kuesioner". | Sistem menampilkan soal dikelompokkan per jurusan. |
| 2a | Tambah/edit soal (pilih jurusan dari daftar aktif). | Sistem menyimpan; kuesioner siswa langsung menyesuaikan. |
| 2b | Impor massal: unduh template lalu unggah Excel/CSV (teks_pertanyaan, kode_jurusan). | Sistem memvalidasi, mengaitkan ke jurusan berdasarkan kode, menyimpan, menampilkan ringkasan. |
| 3a | Hapus satuan (dengan konfirmasi). | Sistem menghapus soal; bila sudah dijawab siswa, jawaban terkait dihapus lebih dulu agar konsisten. |
| 3b | Hapus massal: centang beberapa soal (atau pilih semua), tekan "Hapus Terpilih" (dengan konfirmasi). | Sistem menghapus semua soal terpilih sekaligus (menangani jawaban terkait), menampilkan ringkasan, memperbarui daftar. |

## 5. EXCEPTION FLOWS
- **EF-001 (Kode jurusan tidak dikenal saat impor):** baris dilewati dan dilaporkan di ringkasan.
- **EF-002 (Hapus tanpa memilih):** tombol hapus massal nonaktif hingga ada soal tercentang.

## 6. BUSINESS RULES
- Perubahan soal langsung memengaruhi kuesioner siswa.
- Perhitungan skor tetap benar berapa pun jumlah soal per jurusan.
- Menghapus soal yang sudah dijawab tidak boleh menimbulkan error (jawaban terkait dihapus lebih dulu).

## 7. ACCEPTANCE CRITERIA
- **AC-001:** Tambah/edit/hapus (satuan & massal) berhasil; kuesioner siswa mencerminkan perubahan.
- **AC-002:** Impor menampilkan ringkasan berhasil/dilewati; soal masuk ke jurusan yang benar.
- **AC-003:** Menghapus soal yang sudah memiliki jawaban siswa tetap berhasil tanpa error.
