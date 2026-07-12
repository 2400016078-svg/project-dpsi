# User Flows Master Index

- **Document Version:** v2.0
- **Project:** Sistem Analisis Minat Siswa SMK (SAMI-SMK)
- **Status:** Validated
- **Last Updated:** 5 Juli 2026
- **Source of Truth:** #4 (Index)

---

## 1. PURPOSE
Master indeks untuk seluruh spesifikasi User Flow sistem SAMI-SMK. Setiap alur diturunkan dari kebutuhan fungsional SRS (SoT-1) dan arsitektur halaman IA (SoT-2) untuk menjamin ketertelusuran penuh. Versi ini disinkronkan dengan aplikasi final yang mendukung jurusan dinamis.

## 2. FILE STRUCTURE
```
user_flows/
├── index.md (dokumen ini)
├── userflow_uc_001.md   (Registrasi Mandiri Siswa Baru)
├── userflow_uc_002.md   (Registrasi Mandiri Orang Tua)
├── userflow_uc_003.md   (Pengisian Kuesioner Minat — jurusan dinamis)
├── userflow_uc_004.md   (Pemberian Catatan Konseling BK + Analisis Minat)
├── userflow_uc_007.md   (Pengelolaan Jurusan Dinamis — Admin)
└── userflow_uc_008.md   (Pengelolaan Bank Soal Kuesioner — Admin)
```

## 3. USER FLOW CATALOG
| Use Case ID | Use Case Name | File Path | Status |
|---|---|---|---|
| UC-001 | Registrasi Mandiri Siswa Baru | ./userflow_uc_001.md | Validated |
| UC-002 | Registrasi Mandiri Orang Tua (Kode Tautan) | ./userflow_uc_002.md | Validated |
| UC-003 | Pengisian Kuesioner Minat (Siswa) | ./userflow_uc_003.md | Validated |
| UC-004 | Pemberian Catatan Konseling + Analisis Minat (BK) | ./userflow_uc_004.md | Validated |
| UC-007 | Pengelolaan Jurusan Dinamis (Admin) | ./userflow_uc_007.md | Validated |
| UC-008 | Pengelolaan Bank Soal Kuesioner (Admin) | ./userflow_uc_008.md | Validated |

> Catatan: UC-005 (Data Master NISN) dan UC-006 (Penugasan Guru BK) didokumentasikan penuh pada Use Case Specification (SoT-4). Index user flow ini memuat alur interaktif utama.

## 4. REQUIREMENT → USER FLOW MAPPING
| Requirement ID | Use Cases | Status |
|---|---|---|
| F001 (Autentikasi & RBAC) | UC-001, UC-002 | Covered |
| F003 (Modul Kuesioner Siswa) | UC-003 | Covered |
| F004 (Dasbor & Konseling BK + Analisis Minat) | UC-004 | Covered |
| F006 (Pengelolaan Jurusan Dinamis) | UC-007 | Covered |
| F007 (Pengelolaan Bank Soal) | UC-008 | Covered |

## 5. DEPENDENCIES
- UC-002 bergantung pada UC-001 (Orang Tua hanya bisa mendaftar jika siswa anaknya sudah punya Kode Tautan).
- UC-003 bergantung pada UC-008 & UC-007 (kuesioner memerlukan jurusan aktif yang memiliki soal).
- UC-004 bergantung pada UC-003 (catatan & analisis hanya untuk hasil kuesioner yang sudah ada).
- UC-008 bergantung pada UC-007 (soal dikaitkan ke jurusan yang sudah ada).

## 6. REVISION HISTORY
| Version | Date | Description |
|---|---|---|
| 1.0 | 17 Juni 2026 | Index awal: UC-001..UC-004, paradigma 2 jurusan (Multimedia/DKV & TBSM). |
| 2.0 | 5 Juli 2026 | Disinkronkan dengan aplikasi final: UC-003 menjadi jurusan dinamis + penilaian independen; UC-004 menambah Analisis Minat dinamis; tambah UC-007 (Kelola Jurusan) & UC-008 (Kelola Soal); perbaikan mapping requirement. |
