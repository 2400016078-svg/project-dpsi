# Functional Requirements — SAMI-SMK

## 1. Pengantar

Dokumen ini merinci kebutuhan fungsional SAMI-SMK. Seluruh kebutuhan ditulis dengan **format standar Aktor + Aksi** ("[Aktor] dapat [aksi]"), diturunkan dari masalah pemangku kepentingan, dan dapat ditelusuri pada dokumen Traceability.

## 2. Aktor Sistem

| Kode | Aktor | Deskripsi |
|---|---|---|
| R1 | Siswa | Mengisi kuesioner minat dan melihat hasil. |
| R2 | Guru BK | Memantau siswa bimbingan, memberi konseling. |
| R3 | Orang Tua | Memantau hasil anak (hanya-baca). |
| R4 | Admin | Mengelola data master, jurusan, soal, penugasan. |
| S  | Sistem | Aksi otomatis (perhitungan, validasi). |

## 3. Kebutuhan Fungsional (format Aktor + Aksi)

### F001 — Autentikasi & Hak Akses
| Kode | Kebutuhan Fungsional (Aktor + Aksi) |
|---|---|
| FR-01 | **Pengguna dapat** masuk ke sistem menggunakan username dan password. |
| FR-02 | **Sistem dapat** menampilkan menu dan hak akses sesuai peran pengguna (RBAC). |
| FR-03 | **Sistem dapat** memblokir akses pengguna ke halaman yang tidak sesuai perannya. |
| FR-04 | **Siswa dapat** mendaftar akun mandiri dengan verifikasi NISN. |
| FR-05 | **Orang Tua dapat** mendaftar akun mandiri menggunakan kode tautan. |

### F002 — Pengelolaan Data Master NISN
| Kode | Kebutuhan Fungsional (Aktor + Aksi) |
|---|---|
| FR-06 | **Admin dapat** menambah, mengimpor (Excel), dan menghapus data NISN. |
| FR-07 | **Sistem dapat** memverifikasi NISN saat pendaftaran (terdaftar & belum diklaim). |
| FR-08 | **Admin dapat** menugaskan Guru BK pembimbing untuk tiap siswa. |
| FR-09 | **Admin dapat** menghapus data siswa beserta data terkaitnya secara bersih. |

### F003 — Kuesioner Minat Siswa
| Kode | Kebutuhan Fungsional (Aktor + Aksi) |
|---|---|
| FR-10 | **Siswa dapat** mengisi kuesioner minat berskala Likert 1–5. |
| FR-11 | **Sistem dapat** mengunci kuesioner setelah siswa mengirimkannya (sekali isi). |
| FR-12 | **Sistem dapat** menghitung persentase kecocokan mandiri (0–100%) tiap jurusan. |
| FR-13 | **Sistem dapat** menentukan rekomendasi jurusan dari skor tertinggi. |
| FR-14 | **Siswa dapat** melihat hasil kuesioner dalam bentuk grafik per jurusan. |

### F004 — Dasbor & Konseling Guru BK
| Kode | Kebutuhan Fungsional (Aktor + Aksi) |
|---|---|
| FR-15 | **Guru BK dapat** melihat daftar dan status siswa bimbingannya. |
| FR-16 | **Sistem dapat** menampilkan analisis minat otomatis (berbasis aturan) bagi Guru BK. |
| FR-17 | **Guru BK dapat** menambahkan catatan konseling pada hasil siswa. |
| FR-18 | **Guru BK dapat** melihat rekapitulasi angkatan dari siswa bimbingannya. |
| FR-19 | **Guru BK dapat** melihat riwayat catatan konseling yang pernah dibuat. |

### F005 — Pemantauan Orang Tua
| Kode | Kebutuhan Fungsional (Aktor + Aksi) |
|---|---|
| FR-20 | **Orang Tua dapat** melihat hasil kuesioner dan catatan konseling anaknya. |
| FR-21 | **Sistem dapat** membatasi akses Orang Tua menjadi hanya-baca atas data anaknya. |

### F006 — Pengelolaan Jurusan Dinamis
| Kode | Kebutuhan Fungsional (Aktor + Aksi) |
|---|---|
| FR-22 | **Admin dapat** menambah, mengubah, dan menghapus jurusan (jumlah tidak dibatasi). |
| FR-23 | **Admin dapat** mengarsipkan jurusan yang sudah dipakai (soft-delete). |
| FR-24 | **Sistem dapat** memakai hanya jurusan aktif pada kuesioner dan penilaian baru. |

### F007 — Pengelolaan Bank Soal
| Kode | Kebutuhan Fungsional (Aktor + Aksi) |
|---|---|
| FR-25 | **Admin dapat** menambah, mengubah, menghapus, dan mengimpor (Excel) soal. |
| FR-26 | **Admin dapat** menautkan setiap soal ke satu jurusan aktif. |

## 4. Kebutuhan Non-Fungsional (Ringkas)

| Kode | Kebutuhan |
|---|---|
| NFR-01 | Sistem dapat diakses melalui web secara responsif (laptop & ponsel). |
| NFR-02 | Sistem menyimpan data terpusat sehingga konsisten lintas perangkat. |
| NFR-03 | Sistem membedakan akses antar peran demi kerahasiaan data. |
| NFR-04 | Sistem menggunakan bahasa Indonesia yang mudah dipahami pengguna awam. |

Total: **26 kebutuhan fungsional**, seluruhnya memakai format Aktor + Aksi.
