# Analisis Stakeholder — SAMI-SMK

## 1. Pengantar

Dokumen ini mengidentifikasi seluruh pemangku kepentingan (stakeholder) yang terlibat atau terpengaruh oleh sistem SAMI-SMK, beserta peran, kebutuhan, dan kepentingannya. Analisis ini menjadi dasar penentuan peran pengguna dan kebutuhan fungsional sistem.

## 2. Daftar Stakeholder

| Stakeholder | Jenis | Peran dalam Sistem |
|---|---|---|
| Siswa Baru | Pengguna utama | Mengisi kuesioner minat dan melihat hasil rekomendasi jurusan. |
| Guru BK | Pengguna utama | Memantau siswa bimbingan, meninjau hasil kuesioner, memberi catatan konseling. |
| Orang Tua | Pengguna pendukung | Memantau hasil dan perkembangan minat anak (akses hanya-baca). |
| Admin Sekolah | Pengelola sistem | Mengelola data master NISN, jurusan, bank soal, dan penugasan Guru BK. |
| Kepala Sekolah | Sponsor / pengambil keputusan | Berkepentingan atas data minat siswa untuk pengarahan jurusan dan perencanaan sekolah. |
| Tim Pengembang | Pelaksana proyek | Merancang, membangun, menguji, dan memelihara sistem. |

## 3. Analisis Peran & Kebutuhan

### 3.1 Siswa Baru
- **Kebutuhan:** cara mudah dan cepat mengisi kuesioner minat; melihat hasil yang jelas.
- **Kepentingan:** memperoleh gambaran jurusan yang sesuai dengan minatnya.
- **Ekspektasi sistem:** antarmuka sederhana, kuesioner sekali isi, hasil langsung tampil.

### 3.2 Guru BK
- **Kebutuhan:** memantau status pengisian dan hasil kuesioner siswa bimbingan tanpa rekap manual.
- **Kepentingan:** melakukan konseling yang lebih terarah berbasis data.
- **Ekspektasi sistem:** dashboard siswa bimbingan, grafik hasil, alat bantu analisis minat, dan pencatatan konseling digital.

### 3.3 Orang Tua
- **Kebutuhan:** mengetahui hasil pemetaan minat dan catatan konseling anaknya.
- **Kepentingan:** mendampingi anak dalam menentukan arah jurusan.
- **Ekspektasi sistem:** akses hanya-baca yang aman dan terhubung ke data anaknya saja.

### 3.4 Admin Sekolah
- **Kebutuhan:** mengelola data pokok sistem (NISN, jurusan, soal) secara efisien.
- **Kepentingan:** menjaga integritas dan keakuratan data sekolah.
- **Ekspektasi sistem:** fitur kelola data, impor massal Excel, dan verifikasi pendaftaran.

### 3.5 Kepala Sekolah
- **Kebutuhan:** data minat siswa yang valid untuk pengambilan keputusan.
- **Kepentingan:** pengarahan jurusan yang tepat dan perencanaan kapasitas sekolah.
- **Ekspektasi sistem:** proses penelusuran minat yang terdokumentasi (sesuai kebutuhan yang disampaikan pada wawancara).

## 4. Matriks Kepentingan–Pengaruh

| Stakeholder | Kepentingan | Pengaruh | Strategi Pelibatan |
|---|---|---|---|
| Guru BK | Tinggi | Tinggi | Dilibatkan aktif; pengguna inti fitur konseling |
| Siswa | Tinggi | Sedang | Pengguna utama; antarmuka dioptimalkan untuk mereka |
| Admin Sekolah | Tinggi | Tinggi | Dilibatkan dalam pengelolaan data |
| Kepala Sekolah | Tinggi | Tinggi | Sumber kebutuhan; penerima manfaat strategis |
| Orang Tua | Sedang | Rendah | Diberi akses pemantauan hanya-baca |
| Tim Pengembang | Tinggi | Tinggi | Pelaksana; menjaga mutu sistem |

## 5. Pemetaan Stakeholder ke Peran Sistem

Empat stakeholder menjadi peran pengguna langsung dalam sistem (RBAC):

| Peran Sistem | Stakeholder |
|---|---|
| Siswa | Siswa Baru |
| Guru BK | Guru BK |
| Orang Tua | Orang Tua |
| Admin | Admin Sekolah |

Kepala Sekolah dan Tim Pengembang tidak memiliki peran login khusus, tetapi menjadi pemangku kepentingan yang memengaruhi kebutuhan dan arah pengembangan sistem.
