# UC-001 — Registrasi Mandiri Siswa Baru

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026

## 1. OVERVIEW
- **Summary:** Siswa baru registrasi akun mandiri dengan verifikasi NISN dari data master sekolah.
- **Goal:** Siswa berhasil membuat akun login (Username & Password) yang aktif.
- **Primary Actor:** Siswa Baru.
- **Supporting Actor:** Admin (pengimpor data master NISN).

## 2. TRIGGER
Siswa menekan "Daftar Akun" di halaman utama (PAGE-001) dan memilih "Daftar sebagai Siswa".

## 3. PRECONDITIONS
| ID | Condition |
|---|---|
| PRE-001 | Admin telah meng-import data master (NISN + Nama resmi) siswa baru. |
| PRE-002 | NISN belum pernah dipakai membuat akun. |

## 4. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Siswa memasukkan 10 digit NISN dan menekan "Cek NISN". | Sistem memeriksa NISN ke data master. |
| 2 | - | Sistem menemukan data, mengunci kolom NISN, menampilkan Nama otomatis, membuka form Username & Password. |
| 3 | Siswa menginput Username & Password. | Sistem memvalidasi ketersediaan Username unik. |
| 4 | Siswa menekan "Daftar Akun". | Sistem menyimpan user baru (role Siswa, tanpa kelas/jurusan), menyalin Guru BK pembimbing dari data master, menandai NISN diklaim, menghasilkan Kode Tautan keluarga, menampilkan pesan sukses. |
| 5 | Siswa diarahkan ke halaman login. | - |

## 5. EXCEPTION FLOWS
- **EF-001 (NISN tidak ditemukan):** pesan error merah "NISN tidak terdaftar. Mohon hubungi Admin Sekolah."; form tetap terkunci.
- **EF-002 (NISN sudah punya akun):** "NISN ini sudah digunakan. Silakan login atau hubungi Guru BK."
- **EF-003 (Username duplikat):** "Username sudah digunakan, silakan pilih yang lain." (dicek langsung saat mengetik dan saat submit; username unik case-insensitive).

## 6. BUSINESS RULES
- Kolom Nama Siswa read-only (diambil dari data master) agar tidak dipalsukan.
- Data kelas & jurusan diset kosong (NULL); siswa dikelompokkan per Angkatan Tahun Masuk.

## 7. ACCEPTANCE CRITERIA
- **AC-001:** Nama siswa tampil otomatis hanya jika NISN terdaftar & belum diklaim.
- **AC-002:** Akun baru otomatis tertaut ke Guru BK pembimbing sesuai data master (penugasan langsung, dibagi merata antar-Guru BK).
