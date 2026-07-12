# UC-002 — Registrasi Mandiri Orang Tua (Kode Tautan)

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026

## 1. OVERVIEW
- **Summary:** Orang Tua membuat akun monitoring mandiri dan menautkannya ke akun anak via Kode Tautan unik.
- **Goal:** Orang Tua berhasil membuat akun yang terhubung presisi ke data anak (relasi 1:1).
- **Primary Actor:** Orang Tua.

## 2. TRIGGER
Orang Tua menekan "Daftar Akun" dan memilih "Daftar sebagai Orang Tua".

## 3. PRECONDITIONS
Siswa (anaknya) sudah teregistrasi (UC-001) sehingga punya Kode Tautan keluarga.

## 4. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Orang Tua memasukkan Nama, Email, Username, Password. | Sistem memvalidasi kelengkapan form. |
| 2 | Orang Tua menginput Kode Tautan dan menekan "Verifikasi". | Sistem memeriksa validitas token relasi anak. |
| 3 | - | Sistem menampilkan "Kode Valid. Akun Anda akan tertaut dengan Siswa: [Nama Anak]". |
| 4 | Orang Tua menekan "Konfirmasi Pendaftaran". | Sistem menyimpan akun, mengunci foreign key ke ID Siswa, mengubah status kode menjadi `terpakai`, menampilkan pesan sukses. |

## 5. EXCEPTION FLOWS
- **EF-001 (Kode salah/kedaluwarsa/terpakai):** pesan error merah "Kode Tautan tidak valid, sudah kedaluwarsa, atau sudah terpakai oleh pihak lain."

## 6. BUSINESS RULES
- Relasi Orang Tua–Siswa bersifat **1:1** (satu siswa maksimal satu akun orang tua).
- Kode tautan **sekali pakai**: setelah dipakai status → `terpakai` (disimpan untuk audit: id_ortu_pemakai, used_at). Kode punya `expires_at`; siswa bisa generate kode baru yang otomatis mencabut kode lama.

## 7. ACCEPTANCE CRITERIA
- **AC-001:** Akun gagal dibuat jika Kode Tautan kosong atau salah.
- **AC-002:** Akun yang sukses otomatis read-only dan terkunci hanya untuk satu ID Siswa terkait.
