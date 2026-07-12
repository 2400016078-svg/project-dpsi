# UC-006 — Penugasan Siswa ke Guru BK Pembimbing (Admin)

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026

## 1. OVERVIEW
- **Summary:** Admin menetapkan Guru BK pembimbing bagi tiap siswa, sehingga setiap Guru BK hanya menangani siswa bimbingannya.
- **Goal:** Setiap siswa memiliki satu Guru BK pembimbing, dan beban bimbingan terbagi.
- **Primary Actor:** Admin.
- **Supporting Actor:** Guru BK (penerima penugasan).

## 2. TRIGGER
Admin membuka "Data Master NISN" dan mengatur penugasan Guru BK.

## 3. PRECONDITIONS
Admin sudah login; terdapat minimal satu akun Guru BK; data master NISN sudah terisi.

## 4. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin membuka daftar data master NISN. | Sistem menampilkan tiap NISN beserta Guru BK pembimbing (bila sudah ada). |
| 2 | Admin menetapkan Guru BK untuk seorang siswa (atau membagi otomatis/merata). | Sistem menyimpan penugasan pada data master (`id_guru_bk`). |
| 3 | Siswa mendaftar memakai NISN tersebut (UC-001). | Sistem menyalin Guru BK pembimbing dari data master ke profil siswa. |
| 4 | Guru BK login dan membuka "Daftar Siswa Bimbingan". | Sistem menampilkan HANYA siswa yang ditugaskan kepada Guru BK tersebut, termasuk seluruh kartu ringkasan pada dasbornya. |

## 5. EXCEPTION FLOWS
- **EF-001 (Belum ada akun Guru BK):** sistem memberi tahu bahwa penugasan belum dapat dilakukan.
- **EF-002 (Siswa belum ditugaskan):** siswa tidak muncul pada daftar bimbingan Guru BK mana pun hingga penugasan diberikan.

## 6. BUSINESS RULES
- Satu siswa memiliki satu Guru BK pembimbing.
- Guru BK hanya dapat melihat dan memberi catatan pada siswa bimbingannya sendiri.
- Seluruh kartu ringkasan pada dasbor Guru BK (total siswa, status kuesioner, dan rekapitulasi rekomendasi per jurusan) dihitung hanya dari siswa bimbingannya.
- Penugasan disimpan pada data master dan diturunkan ke profil siswa saat pendaftaran.

## 7. ACCEPTANCE CRITERIA
- **AC-001:** Siswa yang mendaftar otomatis tertaut ke Guru BK sesuai penugasan pada data master.
- **AC-002:** Guru BK A tidak melihat siswa bimbingan Guru BK B, termasuk pada angka rekapitulasi.
- **AC-003:** Bila seorang Guru BK tidak memiliki siswa bimbingan, seluruh kartu ringkasannya bernilai nol secara konsisten.
