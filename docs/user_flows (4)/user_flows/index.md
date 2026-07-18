# User Flows Master Index

Document Version: v3.0

Project: SAMI-SMK — Sistem Analisis Minat Siswa SMK

Status: Validated

Last Updated: 2026-07-05

---

# 1. PURPOSE
Master indeks untuk seluruh spesifikasi User Flow sistem SAMI-SMK. Setiap alur diturunkan dari kebutuhan fungsional SRS (SoT-1) dan arsitektur halaman IA (SoT-2) untuk menjamin ketertelusuran penuh. Seluruh dokumen mengikuti struktur baku: Overview, Trigger, Preconditions, Main Flow, Alternative Flows, Exception Flows, Postconditions, Business Rules, Related Pages, Data Usage, Permissions, Acceptance Criteria, Traceability, Revision History.

---

# 2. FILE STRUCTURE
```
user_flows/
├── index.md (dokumen ini)
├── userflow_uc_001.md   (Registrasi Mandiri Siswa Baru)
├── userflow_uc_002.md   (Registrasi Mandiri Orang Tua)
├── userflow_uc_003.md   (Pengisian Kuesioner Minat)
├── userflow_uc_004.md   (Catatan Konseling & Analisis Minat)
├── userflow_uc_005.md   (Pengelolaan Data Master NISN)
├── userflow_uc_006.md   (Penugasan Siswa ke Guru BK)
├── userflow_uc_007.md   (Pengelolaan Jurusan Dinamis)
└── userflow_uc_008.md   (Pengelolaan Bank Soal Kuesioner)
```

---

# 3. USER FLOW CATALOG
|Use Case ID|Use Case Name|Primary Actor|File Path|Status|
|---|---|---|---|---|
|UC-001|Registrasi Mandiri Siswa Baru|Siswa|./userflow_uc_001.md|Validated|
|UC-002|Registrasi Mandiri Orang Tua (Kode Tautan)|Orang Tua|./userflow_uc_002.md|Validated|
|UC-003|Pengisian Kuesioner Minat|Siswa|./userflow_uc_003.md|Validated|
|UC-004|Catatan Konseling & Analisis Minat|Guru BK|./userflow_uc_004.md|Validated|
|UC-005|Pengelolaan Data Master NISN|Admin|./userflow_uc_005.md|Validated|
|UC-006|Penugasan Siswa ke Guru BK Pembimbing|Admin|./userflow_uc_006.md|Validated|
|UC-007|Pengelolaan Jurusan Dinamis|Admin|./userflow_uc_007.md|Validated|
|UC-008|Pengelolaan Bank Soal Kuesioner|Admin|./userflow_uc_008.md|Validated|

---

# 4. REQUIREMENT → USER FLOW MAPPING
|Requirement ID|Requirement Name|Use Cases|Status|
|---|---|---|---|
|F001|Autentikasi & Manajemen Hak Akses|UC-001, UC-002|Covered|
|F002|Pengelolaan Data Master NISN|UC-005, UC-006|Covered|
|F003|Modul Kuesioner Siswa|UC-003|Covered|
|F004|Dasbor & Konseling Guru BK|UC-004, UC-006|Covered|
|F005|Laporan & Pemantauan Orang Tua|UC-002|Covered|
|F006|Pengelolaan Jurusan Dinamis|UC-007|Covered|
|F007|Pengelolaan Bank Soal Kuesioner|UC-008|Covered|

---

# 5. DEPENDENCIES
|Use Case|Bergantung Pada|Alasan|
|---|---|---|
|UC-001|UC-005, UC-006|NISN harus ada di data master dan sudah ditugaskan ke Guru BK|
|UC-002|UC-001|Orang tua hanya dapat mendaftar bila anaknya sudah memiliki Kode Tautan|
|UC-003|UC-007, UC-008|Kuesioner memerlukan jurusan aktif yang memiliki soal|
|UC-004|UC-003, UC-006|Catatan dan analisis hanya untuk hasil kuesioner siswa bimbingannya|
|UC-008|UC-007|Soal dikaitkan ke jurusan yang sudah ada|

---

# 6. REVISION HISTORY
|Version|Date|Description|
|---|---|---|
|1.0|2026-06-17|Index awal: UC-001..UC-004, paradigma dua jurusan tetap|
|2.0|2026-07-05|Disinkronkan dengan aplikasi final: jurusan dinamis, penilaian independen; tambah UC-005..UC-008|
|3.0|2026-07-05|Seluruh user flow disusun ulang mengikuti struktur baku (Alternative Flows, Postconditions, Related Pages, Data Usage, Permissions, Traceability, Revision History)|
