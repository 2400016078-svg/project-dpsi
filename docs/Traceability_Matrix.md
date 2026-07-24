# Matriks Ketertelusuran (Traceability) — SAMI-SMK

## 1. Tujuan

Dokumen ini memetakan **masalah pemangku kepentingan → kebutuhan fungsional → fitur sistem**, untuk menunjukkan bahwa setiap kebutuhan yang dibangun benar-benar menjawab masalah nyata, dan tidak ada masalah yang terlewat.

## 2. Kode Referensi

- **Masalah:** M1–M6 (dari Problem Statement, bagian Rumusan Masalah)
- **Stakeholder:** Kepala Sekolah, Guru BK, Siswa, Orang Tua, Admin
- **Kebutuhan:** FR-01 s/d FR-26 (dari Functional Requirements)
- **Fitur:** F001 s/d F007

## 3. Daftar Masalah (ringkas)

| Kode | Masalah | Dialami Terutama Oleh |
|---|---|---|
| M1 | Belum ada cara terukur memetakan minat siswa baru | Kepala Sekolah, Siswa |
| M2 | Proses pemetaan masih manual, memakan waktu, sulit dipantau | Guru BK |
| M3 | Hasil pemetaan tidak tersimpan sebagai data valid & dapat diolah | Kepala Sekolah, Guru BK |
| M4 | Orang tua tidak punya akses ke hasil & perkembangan anak | Orang Tua |
| M5 | Instrumen harus disusun ulang saat jurusan berubah | Admin |
| M6 | Guru BK sulit memantau & menindaklanjuti banyak siswa | Guru BK |

## 4. Matriks Ketertelusuran Utama (Masalah → Kebutuhan → Fitur)

| Masalah | Stakeholder | Kebutuhan Fungsional | Fitur |
|---|---|---|---|
| **M1** — Belum ada pemetaan minat terukur | Kepala Sekolah, Siswa | FR-10 (siswa mengisi kuesioner), FR-12 (sistem menghitung skor), FR-13 (rekomendasi), FR-14 (lihat hasil) | F003 |
| **M2** — Proses manual & tak terpantau | Guru BK | FR-10 (digitalisasi pengisian), FR-11 (kunci sekali isi), FR-15 (daftar & status siswa) | F003, F004 |
| **M3** — Hasil tak tersimpan valid | Kepala Sekolah, Guru BK | FR-12 (skor tersimpan), FR-14 (grafik), FR-16 (analisis otomatis), FR-18 (rekapitulasi) | F003, F004 |
| **M4** — Orang tua tanpa akses | Orang Tua | FR-05 (daftar via kode tautan), FR-20 (lihat hasil anak), FR-21 (akses hanya-baca) | F001, F005 |
| **M5** — Instrumen ulang saat jurusan berubah | Admin | FR-22 (kelola jurusan dinamis), FR-23 (arsip jurusan), FR-24 (pakai jurusan aktif), FR-25 (kelola soal), FR-26 (soal ke jurusan) | F006, F007 |
| **M6** — Sulit memantau & menindaklanjuti | Guru BK | FR-15 (daftar siswa), FR-17 (catatan konseling), FR-19 (riwayat catatan), FR-08 (penugasan siswa) | F002, F004 |

## 5. Ketertelusuran Pendukung (Verifikasi & Keamanan)

| Kebutuhan Dasar | Kebutuhan Fungsional | Fitur |
|---|---|---|
| Verifikasi identitas pendaftaran | FR-04 (siswa verifikasi NISN), FR-06 (admin kelola NISN), FR-07 (sistem verifikasi) | F001, F002 |
| Keamanan akses antar peran | FR-01 (login), FR-02 (hak akses per peran), FR-03 (blokir akses tak sesuai) | F001 |

## 6. Analisis Kelengkapan

- **Seluruh 6 masalah (M1–M6) tertutup** oleh minimal satu kebutuhan fungsional. Tidak ada masalah yang tidak ditangani.
- **Seluruh 26 kebutuhan fungsional** dapat ditelusuri kembali ke masalah atau kebutuhan dasar (verifikasi/keamanan). Tidak ada kebutuhan "yatim" yang tidak berdasar masalah.
- Pemetaan menunjukkan konsistensi dari **masalah nyata → kebutuhan → fitur yang diimplementasikan**.

## 7. Validasi

Seluruh masalah pada matriks ini bersumber dari wawancara langsung dengan Kepala Sekolah SMK Ma'arif 1 Yogyakarta (transkrip pada `Data_Wawancara_Observasi.md`), memperkuat ketertelusuran dari bukti lapangan hingga implementasi sistem.
