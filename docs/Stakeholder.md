# Analisis Pemangku Kepentingan — SAMI-SMK

## 1. Pengantar

Dokumen ini mengidentifikasi pemangku kepentingan (stakeholder) SAMI-SMK beserta peran, **masalah yang dialami**, dan kepentingannya. Fokus utama adalah masalah yang dihadapi tiap pihak, agar dapat ditelusuri langsung ke kebutuhan sistem (lihat dokumen Traceability).

## 2. Ringkasan Pemangku Kepentingan

| Stakeholder | Peran | Masalah yang Dialami |
|---|---|---|
| Kepala Sekolah | Pengambil keputusan strategis | Tidak memiliki data minat siswa yang valid untuk mengarahkan penjurusan; muncul kasus siswa salah jurusan. |
| Guru BK | Pelaksana bimbingan & konseling | Merekap hasil kuesioner puluhan siswa secara manual; sulit memantau progres dan menindaklanjuti. |
| Siswa Baru | Subjek yang dipetakan minatnya | Tidak mendapat gambaran jurusan yang sesuai minat; berisiko memilih jurusan yang keliru. |
| Orang Tua | Pendamping siswa | Tidak mengetahui hasil pemetaan minat & perkembangan anak; tidak dapat mendampingi secara terinformasi. |
| Admin Sekolah | Pengelola data & sistem | Data NISN dan jurusan belum terdigitalisasi; sulit mengelola instrumen saat jurusan berubah. |

## 3. Analisis Mendalam (Stakeholder Utama)

### 3.1 Kepala Sekolah
- **Peran:** menetapkan arah kebijakan penjurusan dan pemanfaatan data siswa.
- **Masalah yang dialami:** tidak ada instrumen untuk mendeteksi minat siswa baru sejak awal, sehingga pengarahan jurusan mengandalkan penilaian tidak terukur. Akibatnya muncul kasus siswa yang merasa tidak cocok dengan jurusannya. (Dinyatakan langsung dalam wawancara.)
- **Kepentingan:** memiliki data minat yang valid untuk pengambilan keputusan dan perencanaan sekolah.

### 3.2 Guru BK
- **Peran:** membimbing siswa, menganalisis minat, memberi konseling.
- **Masalah yang dialami:** proses rekap manual memakan waktu dan rawan salah; sulit memantau siapa yang sudah/belum mengisi; tidak ada pusat data untuk menindaklanjuti hasil. Waktu untuk konseling substantif tersita pekerjaan administratif.
- **Kepentingan:** memantau dan menindaklanjuti hasil siswa bimbingannya secara efisien.

### 3.3 Siswa Baru
- **Peran:** mengisi pemetaan minat, menerima arahan jurusan.
- **Masalah yang dialami:** tidak memperoleh gambaran objektif tentang jurusan yang sesuai minatnya, sehingga berisiko salah memilih dan menyesal setelah masuk.
- **Kepentingan:** memperoleh rekomendasi jurusan yang sesuai minat.

### 3.4 Orang Tua
- **Peran:** mendampingi anak dalam menentukan arah pendidikan.
- **Masalah yang dialami:** tidak memiliki akses terhadap hasil pemetaan minat dan catatan perkembangan anak; komunikasi hasil hanya lewat kunjungan langsung yang tidak selalu memungkinkan.
- **Kepentingan:** memantau hasil dan mendampingi anak secara terinformasi.

### 3.5 Admin Sekolah
- **Peran:** mengelola data master (NISN, jurusan, soal) dan akun.
- **Masalah yang dialami:** data belum terdigitalisasi; ketika jurusan sekolah berubah, instrumen dan pengelompokan harus disusun ulang secara manual.
- **Kepentingan:** mengelola data pokok secara efisien dan fleksibel.

## 4. Matriks Kepentingan–Pengaruh

| Stakeholder | Kepentingan | Pengaruh | Strategi Pelibatan |
|---|---|---|---|
| Kepala Sekolah | Tinggi | Tinggi | Sumber kebutuhan utama; penerima manfaat strategis |
| Guru BK | Tinggi | Tinggi | Pengguna inti; dilibatkan aktif dalam fitur konseling |
| Admin Sekolah | Tinggi | Tinggi | Dilibatkan dalam pengelolaan data |
| Siswa Baru | Tinggi | Sedang | Pengguna utama; antarmuka dioptimalkan |
| Orang Tua | Sedang | Rendah | Diberi akses pemantauan hanya-baca |

## 5. Pemetaan ke Peran Sistem

| Peran Sistem (RBAC) | Stakeholder |
|---|---|
| Admin | Admin Sekolah |
| Guru BK | Guru BK |
| Siswa | Siswa Baru |
| Orang Tua | Orang Tua |

Kepala Sekolah berperan sebagai pemangku kepentingan strategis (sumber kebutuhan), tanpa peran login khusus.
