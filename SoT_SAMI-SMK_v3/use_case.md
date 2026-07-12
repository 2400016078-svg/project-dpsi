# Use Case Specification

- **Document Version:** v3.0
- **Project:** Sistem Analisis Minat Siswa SMK (SAMI-SMK)
- **Product:** Aplikasi Pemetaan Minat dan Kepribadian Jurusan SMK
- **Status:** Validated
- **Last Updated:** 5 Juli 2026
- **Source of Truth:** #4

---

## 1. PURPOSE
Dokumen ini mendefinisikan spesifikasi use case (alur pengguna) untuk sistem SAMI-SMK, diturunkan dari kebutuhan fungsional pada SRS (SoT-1) dan struktur halaman pada Information Architecture (SoT-2).

## 2. USE CASE CATALOG
| Use Case ID | Use Case Name | Aktor Utama | Status |
|---|---|---|---|
| UC-001 | Registrasi Mandiri Siswa Baru | Siswa Baru | Validated |
| UC-002 | Registrasi Mandiri Orang Tua (Kode Tautan) | Orang Tua | Validated |
| UC-003 | Pengisian Kuesioner Minat | Siswa | Validated |
| UC-004 | Pemberian Catatan Konseling + Analisis Minat | Guru BK | Validated |
| UC-005 | Pengelolaan Data Master NISN (Tambah, Impor, Hapus) | Admin | Validated |
| UC-006 | Penugasan Siswa ke Guru BK Pembimbing | Admin / Sistem | Validated |
| UC-007 | Pengelolaan Jurusan Dinamis (tambah, impor, arsip) | Admin | Validated |
| UC-008 | Pengelolaan Bank Soal (tambah, impor, hapus massal) | Admin | Validated |

## 3. REQUIREMENT → USE CASE MAPPING
| Requirement ID | Use Cases | Status |
|---|---|---|
| F001 (Autentikasi & RBAC) | UC-001, UC-002 | Covered |
| F002 (Data Master & Impor) | UC-005, UC-006 | Covered |
| F003 (Kuesioner Siswa) | UC-003 | Covered |
| F004 (Dasbor & Konseling BK) | UC-004 | Covered |

## 4. DEPENDENCIES
- UC-001 bergantung pada UC-005 (siswa hanya dapat registrasi bila NISN ada di data master).
- UC-002 bergantung pada UC-001 (orang tua mendaftar memakai kode tautan milik anak).
- UC-004 bergantung pada UC-003 (catatan & analisis hanya untuk hasil kuesioner yang sudah ada).
- UC-006 menyertai UC-005 (penugasan Guru BK dilakukan saat data master dibuat/diimpor).

---

# UC-001 — Registrasi Mandiri Siswa Baru

## Overview
- **Summary:** Siswa baru melakukan registrasi akun mandiri dengan verifikasi NISN terhadap data master sekolah.
- **Goal:** Siswa berhasil membuat akun login (Username & Password) yang aktif.
- **Primary Actor:** Siswa Baru. **Supporting Actor:** Admin (pengelola data master).

## Preconditions
| ID | Condition |
|---|---|
| PRE-001 | Admin telah memasukkan data master (NISN + Nama + Angkatan) siswa baru. |
| PRE-002 | NISN belum pernah dipakai membuat akun (belum diklaim). |

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Siswa menekan "Daftar sebagai Siswa", memasukkan 10 digit NISN, menekan "Cek NISN". | Sistem memeriksa NISN terhadap data master. |
| 2 | - | Sistem menemukan data, mengunci kolom NISN, menampilkan Nama otomatis, membuka form Username & Password. |
| 3 | Siswa menginput Username (unik) & Password. | Sistem memvalidasi ketersediaan Username secara langsung. |
| 4 | Siswa menekan "Daftar Akun". | Sistem menyimpan akun siswa, menyalin Guru BK pembimbing dari data master, menandai NISN diklaim, menghasilkan Kode Tautan keluarga. |
| 5 | Siswa diarahkan ke halaman login. | - |

## Exception Flows
- **EF-001 (NISN tidak ditemukan):** "NISN tidak terdaftar. Mohon hubungi Admin Sekolah."
- **EF-002 (NISN sudah punya akun):** "NISN ini sudah digunakan. Silakan login atau hubungi Guru BK."
- **EF-003 (Username duplikat):** "Username sudah digunakan, silakan pilih yang lain."

## Business Rules
- Nama Siswa read-only (dari data master). Username unik (case-insensitive); password boleh sama dengan pengguna lain.
- Siswa dikelompokkan berdasarkan Angkatan Tahun Masuk, bukan kelas.

## Acceptance Criteria
- **AC-001:** Nama siswa tampil otomatis hanya jika NISN terdaftar & belum diklaim.
- **AC-002:** Akun baru otomatis tertaut ke Guru BK pembimbing sesuai data master.

---

# UC-002 — Registrasi Mandiri Orang Tua (Kode Tautan)

## Overview
- **Summary:** Orang Tua membuat akun monitoring dan menautkannya ke akun anak melalui Kode Tautan unik.
- **Goal:** Akun orang tua terhubung presisi ke data anak (relasi 1:1). **Primary Actor:** Orang Tua.

## Preconditions
Siswa (anaknya) sudah teregistrasi (UC-001) sehingga memiliki Kode Tautan.

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Orang Tua menekan "Daftar sebagai Orang Tua", mengisi Nama, Email, Username, Password. | Sistem memvalidasi kelengkapan form. |
| 2 | Orang Tua menginput Kode Tautan, menekan "Verifikasi". | Sistem memeriksa validitas kode. |
| 3 | - | "Kode Valid. Akun Anda akan tertaut dengan Siswa: [Nama Anak]". |
| 4 | Orang Tua menekan "Konfirmasi Pendaftaran". | Sistem menyimpan akun, mengunci relasi ke ID Siswa, mengubah status kode menjadi terpakai. |

## Exception Flows
- **EF-001 (Kode salah/kedaluwarsa/terpakai):** "Kode Tautan tidak valid, sudah kedaluwarsa, atau sudah terpakai."

## Business Rules
- Relasi Orang Tua–Siswa 1:1. Kode tautan sekali pakai; siswa dapat membuat kode baru yang otomatis mencabut kode lama.

## Acceptance Criteria
- **AC-001:** Akun gagal dibuat jika Kode Tautan kosong/salah.
- **AC-002:** Akun yang sukses bersifat read-only dan terkunci ke satu ID Siswa.

---

# UC-003 — Pengisian Kuesioner Minat (Siswa)

## Overview
- **Summary:** Siswa mengisi kuesioner Skala Likert (1–5) yang menghasilkan persentase kecocokan Multimedia/DKV vs TBSM.
- **Goal:** Siswa memperoleh rekomendasi jurusan dan statusnya terkunci. **Primary Actor:** Siswa.

## Preconditions
Siswa sudah login dan status kuesioner masih `belum_dikerjakan`.

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Siswa membuka halaman Kuesioner. | Sistem menampilkan kuesioner format stepper. |
| 2 | Siswa menjawab seluruh pertanyaan (Likert 1–5). | Sistem menyimpan jawaban per langkah. |
| 3 | Siswa menekan "Kirim Hasil Tes". | Sistem memvalidasi kelengkapan. |
| 4 | - | Sistem mengalkulasi skor, mengunci formulir, mengubah status → `selesai`, menampilkan grafik persentase. |

## Exception Flows
- **EF-001 (Soal belum lengkap):** "Mohon lengkapi semua pertanyaan."
- **EF-002 (Akses berulang):** status `selesai` → dilempar ke dasbor, "Formulir telah terkunci."

## Business Rules
- Pengisian hanya 1 kali; nilai jawaban integer 1–5; skor deterministik per klaster soal.

## Acceptance Criteria
- **AC-001:** Submit hanya berhasil jika semua soal terisi.
- **AC-002:** Setelah submit, status `selesai` dan rute kuesioner terblokir permanen.

---

# UC-004 — Pemberian Catatan Konseling + Analisis Minat (BK)

## Overview
- **Summary:** Guru BK melihat hasil siswa bimbingannya (dibantu analisis minat otomatis) dan menulis catatan konseling tanpa mengubah skor asli.
- **Goal:** Catatan tersimpan; Guru BK terbantu memahami pola minat siswa. **Primary Actor:** Guru BK.

## Preconditions
Guru BK login; siswa terkait adalah bimbingannya dan sudah memiliki hasil kuesioner.

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Guru BK membuka "Daftar Siswa Bimbingan". | Sistem menampilkan **hanya siswa bimbingannya**, dengan penanda prioritas. |
| 2 | Guru BK memfilter berdasarkan Angkatan. | Sistem menampilkan: Nama \| Angkatan \| Rekomendasi \| Status Catatan. |
| 3 | Guru BK memilih satu siswa. | Sistem menampilkan grafik minat read-only **dan kartu Analisis Minat otomatis** (alat bantu). |
| 4 | Guru BK menginput teks "Catatan Konseling". | Sistem memvalidasi kolom tidak kosong. |
| 5 | Guru BK menekan "Simpan Catatan". | Sistem menyimpan catatan dan mencatat ke riwayat. |

## Exception Flows
- **EF-001 (Catatan kosong):** "Catatan tidak boleh kosong."

## Business Rules
- Guru BK hanya melihat siswa bimbingannya. Dilarang mengubah angka hasil asli; hanya menambah catatan.
- Analisis Minat bersifat alat bantu (berbasis aturan, 3 tingkat: jelas condong ≥65%, cenderung 55–64%, seimbang <55%); keputusan akhir tetap pada Guru BK.

## Acceptance Criteria
- **AC-001:** Catatan tersimpan dan status catatan berubah menjadi "sudah_diberikan".
- **AC-002:** Grafik persentase siswa tetap utuh setelah catatan disimpan.

---

# UC-005 — Pengelolaan Data Master NISN (Admin)

## Overview
- **Summary:** Admin mengelola daftar master NISN yang menjadi dasar verifikasi registrasi siswa.
- **Goal:** Data master tersedia dan akurat. **Primary Actor:** Admin.

## Preconditions
Admin sudah login.

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Admin membuka "Data Master NISN". | Sistem menampilkan daftar per Angkatan, status klaim, dan Guru BK pembimbing. |
| 2a | **Tambah manual:** Admin mengisi NISN (10 digit), Nama, Angkatan, menyimpan. | Sistem memvalidasi & menyimpan entri baru (belum diklaim). |
| 2b | **Impor massal:** Admin mengunggah berkas Excel/CSV (nisn, nama_siswa, angkatan_tahun). | Sistem memvalidasi tiap baris, melewati baris tidak valid/duplikat, lalu menyimpan, dan membagikan siswa merata ke Guru BK (UC-006). |
| 3 | Admin dapat menghapus satu entri atau mengosongkan seluruh data master. | Sistem meminta konfirmasi berlapis (ketik kata konfirmasi) sebelum menghapus permanen. |

## Exception Flows
- **EF-001 (NISN tidak valid):** "NISN harus 10 digit angka."
- **EF-002 (NISN duplikat):** baris dilewati dengan ringkasan jumlah yang berhasil/dilewati.

## Business Rules
- NISN unik & tepat 10 digit. Penghapusan bersifat permanen dan wajib melewati konfirmasi.

## Acceptance Criteria
- **AC-001:** Entri/baris valid muncul di daftar sesuai angkatannya.
- **AC-002:** Tindakan menghapus tidak pernah berjalan dari satu klik tak sengaja.

---

# UC-006 — Penugasan Siswa ke Guru BK Pembimbing (Admin / Sistem)

## Overview
- **Summary:** Sistem membagi siswa secara merata ke Guru BK pembimbing agar beban pemantauan terbagi; Admin dapat menyesuaikan.
- **Goal:** Setiap siswa memiliki satu Guru BK pembimbing, terbagi seimbang. **Primary Actor:** Admin/Sistem.

## Preconditions
Terdapat satu atau lebih akun Guru BK.

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Admin mengimpor/menambah siswa (UC-005). | Sistem membagi siswa baru ke Guru BK yang ada, ke pembimbing dengan beban paling sedikit (seimbang). |
| 2 | (Opsional) Admin menjalankan "Bagi Ulang Merata". | Sistem menyeimbangkan kembali penugasan seluruh siswa angkatan terkait. |
| 3 | Siswa & Orang Tua melihat nama Guru BK pembimbing di dasbornya. | Sistem menampilkan nama Guru BK terkait. |

## Exception Flows
- **EF-001 (Belum ada Guru BK):** siswa diimpor tanpa pembimbing, dengan peringatan "Belum ada akun Guru BK".

## Business Rules
- Seorang siswa memiliki tepat satu Guru BK pembimbing. Pembagian diupayakan merata antar-Guru BK. Tidak menggunakan konsep kelas; pembagian semata untuk membagi beban pemantauan.

## Acceptance Criteria
- **AC-001:** Setiap Guru BK hanya melihat siswa yang ditugaskan kepadanya.
- **AC-002:** Jumlah siswa per Guru BK relatif seimbang setelah impor/bagi ulang.

---

# UC-007 — Pengelolaan Jurusan Dinamis (Admin)

## Overview
- **Summary:** Admin menambah, mengubah, mengimpor, dan menghapus/mengarsipkan jurusan tanpa batas jumlah.
- **Goal:** Daftar jurusan sesuai kebutuhan sekolah; data siswa lama tetap aman. **Primary Actor:** Admin.

## Preconditions
Admin sudah login.

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Admin membuka "Kelola Jurusan". | Sistem menampilkan daftar jurusan (aktif & arsip). |
| 2a | Tambah manual: isi kode, nama, deskripsi. | Sistem menyimpan jurusan baru (aktif). |
| 2b | Impor massal: unggah Excel/CSV (kode, nama, deskripsi). | Sistem memvalidasi tiap baris, melewati kode duplikat, menyimpan, menampilkan ringkasan. |
| 3 | Admin menekan "Hapus" pada sebuah jurusan (dengan konfirmasi). | Bila jurusan belum dipakai: dihapus permanen. Bila sudah dipakai soal/hasil: diarsipkan (nonaktif), data siswa lama tetap tampil. |
| 4 | (Opsional) Admin mengaktifkan kembali jurusan yang diarsipkan. | Sistem menjadikan jurusan aktif lagi. |

## Business Rules
- Kode jurusan unik. Hanya jurusan aktif yang muncul di kuesioner/penilaian baru. Mengarsipkan tidak merusak hasil kuesioner siswa yang sudah ada.

## Acceptance Criteria
- **AC-001:** Jurusan yang belum dipakai terhapus bersih; yang sudah dipakai diarsipkan tanpa merusak hasil siswa.
- **AC-002:** Impor menampilkan ringkasan berhasil/dilewati.

---

# UC-008 — Pengelolaan Bank Soal (Admin)

## Overview
- **Summary:** Admin menambah, mengubah, menghapus (satuan & massal), dan mengimpor soal kuesioner yang dikaitkan ke jurusan.
- **Goal:** Bank soal terkelola efisien. **Primary Actor:** Admin.

## Preconditions
Admin sudah login; minimal ada satu jurusan aktif.

## Main Flow
| Step | Aksi Aktor | Respons Sistem |
|---|---|---|
| 1 | Admin membuka "Kelola Soal Kuesioner". | Sistem menampilkan soal dikelompokkan per jurusan. |
| 2a | Tambah/edit soal (pilih jurusan dari daftar aktif). | Sistem menyimpan perubahan; kuesioner siswa langsung menyesuaikan. |
| 2b | Impor massal: unggah Excel/CSV (teks_pertanyaan, kode_jurusan). | Sistem memvalidasi, mengaitkan ke jurusan, menyimpan, menampilkan ringkasan. |
| 3 | Hapus: satuan atau memilih beberapa soal lalu "Hapus Terpilih" (dengan konfirmasi). | Sistem menghapus soal; bila soal sudah dijawab siswa, jawaban terkait dihapus lebih dulu agar konsisten. |

## Business Rules
- Perubahan soal langsung memengaruhi kuesioner. Perhitungan skor tetap benar berapa pun jumlah soal.

## Acceptance Criteria
- **AC-001:** Tambah/edit/hapus (satuan & massal) berhasil; kuesioner siswa mencerminkan perubahan.
- **AC-002:** Menghapus soal yang sudah dijawab tidak menimbulkan error.

---

## REVISION HISTORY
| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 17 Juni 2026 | System Analyst | Validated (UC-001..UC-004). |
| 2.0 | 28 Juni 2026 | System Analyst | UC-005 diperluas, UC-006 penugasan Guru BK, UC-004 Analisis Minat, username unik. |
| 3.0 | 5 Juli 2026 | System Analyst | Tambah UC-007 (Kelola Jurusan dinamis + impor + arsip aman) dan UC-008 (Kelola Bank Soal + hapus massal + impor). UC-003/UC-004 disesuaikan untuk jurusan dinamis dan penilaian independen per jurusan. |
