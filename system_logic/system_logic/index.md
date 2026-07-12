# System Logic — Master Index

- **Document Version:** v1.0
- **Project:** SAMI-SMK — Sistem Analisis Minat Siswa SMK
- **Last Updated:** 5 Juli 2026

---

## 1. PURPOSE
Dokumen System Logic menjelaskan **cara kerja sistem di balik layar** untuk tiap alur: sequence diagram, operasi basis data, algoritma perhitungan, aturan integritas, dan ketertelusuran. Dokumen ini melengkapi User Flow (yang menjelaskan langkah dari sisi pengguna).

## 2. CATATAN ARSITEKTUR
SAMI-SMK adalah aplikasi *frontend-only* (React + Vite) yang berkomunikasi **langsung dengan Supabase** (PostgreSQL + PostgREST) memakai publishable/anon key. Tidak terdapat server API kustom, sehingga bagian "kontrak" pada dokumen ini berisi **operasi Supabase** yang benar-benar dipakai aplikasi, bukan endpoint REST buatan sendiri.

Autentikasi bersifat custom (verifikasi terhadap tabel `users`), bukan Supabase Auth bawaan.

## 3. FILE STRUCTURE
```
system_logic/
├── index.md (dokumen ini)
├── sys_auth_login.md   (Autentikasi: login & sesi — prasyarat semua UC)
├── sys_uc_001.md       (Registrasi Mandiri Siswa Baru)
├── sys_uc_002.md       (Registrasi Mandiri Orang Tua)
├── sys_uc_003.md       (Pengisian Kuesioner & Perhitungan Skor)
├── sys_uc_004.md       (Dasbor BK, Analisis Minat & Catatan Konseling)
├── sys_uc_005.md       (Pengelolaan Data Master NISN)
├── sys_uc_006.md       (Penugasan Siswa ke Guru BK)
├── sys_uc_007.md       (Pengelolaan Jurusan Dinamis)
└── sys_uc_008.md       (Pengelolaan Bank Soal Kuesioner)
```

## 4. CATALOG
| Berkas | Cakupan | Requirement |
|---|---|---|
| sys_auth_login.md | Verifikasi kredensial, sesi client-side, kedaluwarsa 60 menit, route guard | F001 |
| sys_uc_001.md | Verifikasi NISN, pembuatan akun & profil siswa, kode tautan | F001, F002 |
| sys_uc_002.md | Verifikasi kode tautan, akun orang tua, relasi 1:1 | F001, F005 |
| sys_uc_003.md | Pemuatan soal dinamis, penyimpanan jawaban, **algoritma skor independen 0–100% per jurusan** | F003 |
| sys_uc_004.md | Isolasi data per Guru BK, grafik dinamis, **algoritma Analisis Minat 3 tingkat**, catatan konseling | F004 |
| sys_uc_005.md | Tambah/impor NISN, **urutan penghapusan siswa yang bersih** | F002 |
| sys_uc_006.md | Penugasan Guru BK dan penurunannya ke profil siswa | F002, F004 |
| sys_uc_007.md | **Hapus pintar** jurusan (hapus permanen vs arsip), impor | F006 |
| sys_uc_008.md | Tambah/impor/hapus soal (satuan & massal), penanganan FK & sequence | F007 |

## 5. CATATAN PENOMORAN
Penomoran UC pada dokumen ini **mengikuti User Flow dan Use Case Specification** (UC-001 s/d UC-008). Login tidak diberi nomor UC karena berperan sebagai prasyarat seluruh alur; logikanya didokumentasikan pada `sys_auth_login.md`.

## 6. KETERBATASAN YANG DISADARI
Tercatat pada `sys_auth_login.md` Bagian 5: kata sandi belum di-hash, verifikasi kredensial dilakukan di sisi klien, RLS masih permisif, dan belum ada pembatasan percobaan login. Hal-hal ini dicatat sebagai rencana pengembangan; aplikasi versi ini ditujukan untuk lingkup akademik.
