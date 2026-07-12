# UC-005 — Pengelolaan Data Master NISN (Admin)

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026

## 1. OVERVIEW
- **Summary:** Admin mengelola daftar NISN resmi sekolah yang menjadi dasar verifikasi pendaftaran siswa.
- **Goal:** Data master NISN akurat sehingga hanya siswa terdaftar yang dapat membuat akun.
- **Primary Actor:** Admin.

## 2. TRIGGER
Admin membuka menu "Data Master NISN".

## 3. PRECONDITIONS
Admin sudah login.

## 4. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin membuka "Data Master NISN". | Sistem menampilkan daftar NISN beserta nama, angkatan, status klaim, dan Guru BK pembimbing. |
| 2a | Tambah manual: isi NISN, nama siswa, angkatan. | Sistem memvalidasi NISN unik (10 digit) dan menyimpan data. |
| 2b | Impor massal: unduh template lalu unggah Excel/CSV (nisn, nama_siswa, angkatan_tahun). | Sistem memvalidasi tiap baris, melewati NISN duplikat, menyimpan, menampilkan ringkasan (berhasil/dilewati). |
| 3 | Hapus satu data NISN (dengan konfirmasi). | Sistem menghapus data master tersebut. |
| 4 | Kosongkan seluruh data siswa (dengan konfirmasi ketik-untuk-yakin). | Sistem menghapus akun siswa beserta seluruh data terkait (jawaban, hasil, skor per jurusan, catatan BK, kode tautan, akun orang tua tertaut), lalu mengembalikan status NISN menjadi belum diklaim. |

## 5. EXCEPTION FLOWS
- **EF-001 (NISN duplikat saat tambah/impor):** baris ditolak/dilewati dan dilaporkan pada ringkasan.
- **EF-002 (Format berkas tidak sesuai):** sistem menolak berkas dan menampilkan pesan agar memakai template.
- **EF-003 (Menghapus NISN yang sudah diklaim):** sistem memberi peringatan bahwa data terkait siswa akan terpengaruh.

## 6. BUSINESS RULES
- NISN unik dan menjadi satu-satunya kunci verifikasi pendaftaran siswa.
- NISN yang sudah dipakai mendaftar ditandai `is_claimed = true` dan tidak dapat dipakai ulang.
- Penghapusan siswa harus bersih: tidak menyisakan data yatim di tabel terkait.

## 7. ACCEPTANCE CRITERIA
- **AC-001:** Siswa hanya dapat mendaftar bila NISN-nya ada di data master dan belum diklaim.
- **AC-002:** Impor menampilkan ringkasan jumlah berhasil dan dilewati.
- **AC-003:** Setelah data siswa dikosongkan, NISN kembali dapat dipakai mendaftar dan tidak ada data sisa.
