# Test Plan

Document Version: v1.0

Project: SAMI-SMK
Product: Sistem Analisis Minat Siswa SMK (Web-Based)

Status: Draft
Last Updated: 2026-07-05

---

# 1. INTRODUCTION

## 1.1 Purpose
Dokumen ini mendefinisikan rencana pengujian (test plan) untuk sistem SAMI-SMK. Test Plan ini menjadi acuan utama pelaksanaan seluruh aktivitas pengujian, mencakup strategi, lingkup, sumber daya, jadwal, serta kriteria kelulusan.

## 1.2 Objectives
- Memverifikasi bahwa seluruh fitur (F001–F007) berfungsi sesuai Software Requirements Specification (SRS v3.0).
- Memvalidasi bahwa setiap user flow (UC-001–UC-008) berjalan sesuai spesifikasi.
- Memastikan sistem bekerja benar untuk **jumlah jurusan berapa pun** (jurusan dinamis).
- Memastikan isolasi data antar-Guru BK dan antar-peran berjalan sesuai matriks hak akses.
- Mengidentifikasi defect sebelum sistem dipakai dengan data siswa sesungguhnya.

## 1.3 References
| Document | Version | Location |
| --- | --- | --- |
| Software Requirements Specification (SRS) | v3.0 | `SoT_SAMI-SMK_v3/srs.md` |
| Use Case Specification | v3.0 | `SoT_SAMI-SMK_v3/use_case.md` |
| User Flow Specifications | v3.0 | `user_flows/` |
| System Logic | v1.0 | `system_logic/` |
| Data Model | v2.0 | `data_model.md` |
| Test Case Specification | v1.0 | `test_cases.md` |

---

# 2. TEST SCOPE

## 2.1 In Scope
| Feature ID | Feature Name | Related Use Cases | Test Coverage |
| --- | --- | --- | --- |
| F001 | Autentikasi & Manajemen Hak Akses | UC-001, UC-002 | 10 TC |
| F002 | Pengelolaan Data Master NISN | UC-005, UC-006 | 8 TC |
| F003 | Modul Kuesioner Siswa | UC-003 | 8 TC |
| F004 | Dasbor & Konseling Guru BK | UC-004 | 7 TC |
| F005 | Laporan & Pemantauan Orang Tua | UC-002 | 3 TC |
| F006 | Pengelolaan Jurusan Dinamis | UC-007 | 7 TC |
| F007 | Pengelolaan Bank Soal Kuesioner | UC-008 | 7 TC |

**Total: 50 Test Case**

### 2.1.1 Test Types Included
| Test Type | Description |
| --- | --- |
| Functional Testing | Memverifikasi setiap fitur berfungsi sesuai SRS dan user flow |
| Validation Testing | Memvalidasi input form, aturan bisnis, dan integritas data |
| Authorization Testing | Memverifikasi matriks hak akses (RBAC) dan isolasi data antar-Guru BK |
| Data Integrity Testing | Menguji integritas foreign key saat penghapusan (siswa, soal, jurusan) |
| Calculation Testing | Memverifikasi ketepatan perhitungan skor per jurusan (0–100%) dan rekomendasi |
| Dynamic Behavior Testing | Menguji sistem tetap benar untuk 2, 3, dan N jurusan |
| Error Handling Testing | Menguji respons sistem terhadap input tidak valid dan galat koneksi |
| UI/Responsive Testing | Memverifikasi tampilan pada laptop dan ponsel |
| Import Testing | Menguji impor Excel/CSV (NISN, jurusan, soal) beserta templatenya |

## 2.2 Out of Scope
- Performance / load testing (fase terpisah)
- Security penetration testing (fase terpisah)
- Pengujian aplikasi native mobile (aplikasi bersifat web responsif)
- Pengujian kompatibilitas di luar Chrome dan Edge
- Integrasi dengan sistem akademik sekolah (di luar lingkup SRS)

---

# 3. TEST STRATEGY

## 3.1 Testing Levels

### Level 1: Component Testing
| Aspect | Detail |
| --- | --- |
| **Target** | Fungsi pada layanan data (`supabaseData.js`) dan komponen antarmuka |
| **Approach** | Pemeriksaan manual terhadap keluaran fungsi dan galat konsol |
| **Tool** | Browser DevTools (Console) |
| **Responsibility** | Developer |

### Level 2: Integration Testing
| Aspect | Detail |
| --- | --- |
| **Target** | Interaksi frontend → Supabase (PostgREST) → PostgreSQL |
| **Approach** | Pengujian manual alur data dan verifikasi langsung di Supabase Table Editor |
| **Tool** | Browser, Supabase Dashboard, SQL Editor |
| **Responsibility** | Tester |

### Level 3: System Testing
| Aspect | Detail |
| --- | --- |
| **Target** | Seluruh fitur end-to-end melalui browser, untuk keempat peran |
| **Approach** | Eksekusi manual berdasarkan Test Case Specification |
| **Tool** | Browser (Chrome/Edge), mode perangkat untuk uji responsif |
| **Responsibility** | Tester |

### Level 4: User Acceptance Testing (UAT)
| Aspect | Detail |
| --- | --- |
| **Target** | Skenario nyata: siswa mengisi kuesioner, Guru BK melakukan konseling |
| **Approach** | Pengujian eksploratif oleh pengguna akhir |
| **Tool** | Lingkungan mirip produksi (Netlify) |
| **Responsibility** | Guru BK / perwakilan sekolah + Tester |

## 3.2 Testing Approach
Eksekusi berdasarkan prioritas fitur:
1. **High Priority (F001, F003, F006, F007):** 100% test case dieksekusi.
2. **Medium Priority (F002, F004):** 100% test case dieksekusi.
3. **Low Priority (F005):** 100% test case dieksekusi.

### Defect Management
| Stage | Action |
| --- | --- |
| Defect Found | Tester mencatat defect pada Defect Log |
| Severity Level | Critical / Major / Minor / Trivial |
| Critical Defect | Pengujian dihentikan sampai defect diperbaiki |
| Major Defect | Pengujian fitur terkait dihentikan sampai diperbaiki |
| Minor / Trivial | Pengujian tetap berjalan; defect diperbaiki setelahnya |

---

# 4. TEST ENVIRONMENT

## 4.1 Hardware Requirements
| Perangkat | Spesifikasi Minimum |
| --- | --- |
| Komputer / Laptop | Processor Intel i3 / AMD Ryzen 3, RAM 4GB |
| Ponsel | Layar minimal 5 inci (untuk uji responsif) |

## 4.2 Software Requirements
### Frontend
| Software | Version |
| --- | --- |
| Google Chrome | Latest stable |
| Microsoft Edge | Latest stable |

### Backend & Basis Data
| Software | Version |
| --- | --- |
| Supabase (PostgreSQL + PostgREST) | Layanan terkelola |
| Supabase SQL Editor | Untuk verifikasi data langsung |

### Development
| Software | Version |
| --- | --- |
| Node.js | 18+ |
| Vite (dev server) | Sesuai `package.json` |

## 4.3 Network Requirements
- Koneksi internet stabil (aplikasi bergantung pada Supabase).
- Pengujian lokal melalui `localhost`; pengujian produksi melalui Netlify.

## 4.4 Test Data Requirements
| Data Item | Quantity | Description |
| --- | --- | --- |
| Akun Admin | 1 | Untuk menguji seluruh fitur pengelolaan |
| Akun Guru BK | 2 | Untuk menguji isolasi data antar-Guru BK |
| Data Master NISN | 5+ | Beberapa sudah diklaim, beberapa belum |
| Jurusan aktif | 3+ | Untuk menguji perilaku dinamis (lebih dari dua jurusan) |
| Jurusan tanpa soal | 1 | Untuk menguji penanganan pembagian dengan nol |
| Soal per jurusan | 5+ | Untuk menguji perhitungan rata-rata |
| Siswa sudah mengisi | 2+ | Untuk menguji hasil, grafik, dan Analisis Minat |
| Siswa belum mengisi | 1+ | Untuk menguji alur pengisian kuesioner |
| Akun Orang Tua | 1 | Tertaut ke salah satu siswa |
| Berkas Excel uji | 3 | Template NISN, jurusan, dan soal yang sudah diisi |

---

# 5. ROLES & RESPONSIBILITIES

| Role | Name / Team | Responsibility |
| --- | --- | --- |
| Test Manager | Pengembang / Analis Sistem | Menyusun test plan, mengawasi pelaksanaan, melaporkan hasil |
| Tester | Pengembang | Mengeksekusi test case, mencatat defect, memverifikasi perbaikan |
| Developer | Pengembang | Memperbaiki defect yang ditemukan |
| End User | Guru BK / perwakilan sekolah | Menjalankan UAT dan memberikan masukan |
| Project Sponsor | Dosen Pengampu | Menyetujui hasil pengujian |

---

# 6. TEST SCHEDULE

| Phase | Activity | Duration | Deliverable |
| --- | --- | --- | --- |
| **P1: Test Planning** | Menyusun test plan, menyiapkan lingkungan dan data uji | 1 hari | Test Plan Document |
| **P2: Test Case Preparation** | Menyusun test case specification | 1 hari | Test Case Specification |
| **P3: Test Execution** | Menjalankan test case dan mencatat hasil | 2 hari | Test Execution Sheet |
| **P4: Defect Fixing** | Memperbaiki defect yang ditemukan | 2 hari | Build yang diperbaiki |
| **P5: Re-testing** | Verifikasi perbaikan dan regression test | 1 hari | Test Report terbarui |
| **P6: UAT** | Pengujian penerimaan oleh pengguna | 1 hari | UAT Sign-off |
| **P7: Test Closure** | Menyusun laporan akhir pengujian | 1 hari | Test Summary Report |

**Total estimasi:** 9 hari kerja

---

# 7. ENTRY & EXIT CRITERIA

## 7.1 Entry Criteria
| No | Criteria |
| --- | --- |
| EC-01 | SRS, Use Case, User Flow, dan Test Case Specification sudah ditinjau |
| EC-02 | Aplikasi dapat dijalankan (localhost dan/atau Netlify) |
| EC-03 | Skema basis data lengkap (11 tabel) dan RLS aktif |
| EC-04 | Test data sudah disiapkan (jurusan, soal, NISN, akun tiap peran) |
| EC-05 | Tester memahami test case dan skenario pengujian |

## 7.2 Exit Criteria
| No | Criteria |
| --- | --- |
| XC-01 | 100% test case dieksekusi |
| XC-02 | Tidak ada defect Critical atau Major yang masih terbuka |
| XC-03 | Defect Minor/Trivial terdokumentasi dan diterima sebagai known issue |
| XC-04 | Perhitungan skor terverifikasi benar untuk minimal 3 jurusan |
| XC-05 | Isolasi data antar-Guru BK terverifikasi |
| XC-06 | Test Summary Report disusun |

## 7.3 Suspension Criteria
| No | Criteria |
| --- | --- |
| SC-01 | Terdapat critical defect yang menghalangi lebih dari 50% test case |
| SC-02 | Layanan Supabase tidak dapat diakses |
| SC-03 | Perubahan kebutuhan signifikan di tengah pengujian |

---

# 8. TEST DELIVERABLES

| Deliverable | Description | Due |
| --- | --- | --- |
| Test Plan | Dokumen perencanaan pengujian ini | Akhir P1 |
| Test Case Specification | Detail test case untuk setiap fitur | Akhir P2 |
| Test Execution Sheet | Hasil eksekusi test case (PASS/FAIL) | Akhir P3 |
| Defect Log | Daftar defect yang ditemukan | Akhir P3 |
| Re-test Report | Hasil verifikasi perbaikan defect | Akhir P5 |
| UAT Sign-off | Persetujuan pengguna akhir | Akhir P6 |
| Test Summary Report | Laporan akhir pengujian | Akhir P7 |

---

# 9. RISK & MITIGATION

| Risk ID | Risk Description | Probability | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R-01 | Sisa data (data yatim) membuat angka rekapitulasi keliru | Medium | High | Jalankan pembersihan data sebelum eksekusi; verifikasi langsung di Supabase |
| R-02 | Perhitungan skor keliru saat jurusan bertambah | Medium | High | Uji khusus dengan 2, 3, dan 4+ jurusan; verifikasi manual dengan perhitungan tangan |
| R-03 | Isolasi data antar-Guru BK bocor | Medium | High | Uji silang dengan dua akun Guru BK pada seluruh tampilan dan kartu rekapitulasi |
| R-04 | Galat integritas saat menghapus soal/jurusan/siswa | Medium | Medium | Uji penghapusan pada data yang sudah direferensikan |
| R-05 | Berkas impor tidak sesuai format | Low | Low | Selalu memulai dari template yang disediakan aplikasi |
| R-06 | Terjemahan otomatis browser merusak teks SQL saat verifikasi | Low | Medium | Nonaktifkan terjemahan pada halaman Supabase |
| R-07 | Versi produksi (Netlify) tertinggal dari versi lokal | Medium | High | Lakukan build dan unggah ulang sebelum pengujian produksi |

---

# 10. APPROVAL

| Role | Name | Signature | Date |
| --- | --- | --- | --- |
| Test Manager | | | |
| Developer | | | |
| Dosen Pengampu | | | |

---

# 11. REVISION HISTORY

| Version | Date | Description |
| --- | --- | --- |
| 1.0 | 2026-07-05 | Draf awal, disusun untuk aplikasi versi jurusan dinamis dengan penilaian independen per jurusan |
