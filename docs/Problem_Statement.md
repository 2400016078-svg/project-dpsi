# Problem Statement — SAMI-SMK

## 1. Latar Belakang

Setiap tahun, SMK menerima siswa baru yang perlu diarahkan ke jurusan yang sesuai dengan minat dan potensinya, bukan hanya berdasarkan nilai akademik atau kuota kelas. Idealnya, penempatan jurusan mempertimbangkan minat siswa secara terukur.

Selama ini, proses pemetaan minat siswa baru di sekolah umumnya dilakukan secara manual: Guru BK membagikan kuesioner cetak atau formulir sederhana, kemudian merekap hasilnya satu per satu untuk menentukan kecenderungan jurusan tiap siswa. Proses ini memakan waktu, rawan salah rekap, dan sulit dipantau progresnya secara langsung oleh Guru BK maupun orang tua. (Berdasarkan observasi dan wawancara di SMK Ma'arif 1 Yogyakarta.)

## 2. Rumusan Masalah

1. Guru BK kesulitan memantau progres pengisian kuesioner minat puluhan hingga ratusan siswa baru secara manual.
2. Belum ada sistem terpusat yang menyimpan hasil kuesioner, riwayat catatan konseling, dan rekomendasi jurusan siswa secara digital.
3. Orang tua tidak memiliki akses langsung untuk memantau hasil pemetaan minat maupun catatan konseling anaknya.
4. Proses pencocokan hasil kuesioner ke rekomendasi jurusan dilakukan manual sehingga rentan bias/human error dan tidak konsisten antar Guru BK.
5. Data master siswa (NISN) dan verifikasi identitas saat registrasi akun sekolah belum terdigitalisasi dengan baik.
6. Ketika sekolah menambah atau mengubah jurusan, instrumen kuesioner manual harus disusun ulang dari awal.

## 3. Dampak Masalah

- Guru BK kehilangan waktu untuk tugas konseling substantif karena sibuk merekap data manual.
- Keputusan penjurusan siswa berisiko kurang tepat karena data minat tidak terdokumentasi rapi.
- Orang tua tidak mendapat informasi perkembangan anak secara transparan.
- Sekolah kesulitan melakukan analisis tren minat siswa antar-angkatan untuk perencanaan kapasitas jurusan ke depan.

## 4. Tujuan Solusi

Membangun **SAMI-SMK**, sebuah sistem informasi berbasis web yang:
- Mendigitalisasi proses pengisian kuesioner minat siswa baru (skala Likert 1–5).
- Menghitung persentase kecocokan **setiap jurusan secara mandiri (0–100%)** dan menghasilkan rekomendasi jurusan otomatis (skor tertinggi).
- Mendukung **jurusan dinamis**: Admin dapat menambah, mengubah, atau menghapus jurusan beserta soalnya tanpa mengubah kode, sehingga sistem tetap relevan saat jurusan sekolah berubah.
- Menyediakan dashboard untuk Guru BK memantau status dan hasil kuesioner siswa bimbingannya.
- Menyediakan modul catatan konseling digital yang terhubung ke hasil kuesioner siswa.
- Memberi akses hanya-baca kepada Orang Tua untuk memantau hasil dan catatan konseling anak.
- Menyediakan mekanisme verifikasi registrasi berbasis data master NISN untuk mencegah akun palsu.

## 5. Ruang Lingkup (Scope)

**Termasuk dalam scope:**
- Modul autentikasi & manajemen hak akses (Admin, Guru BK, Siswa, Orang Tua)
- Modul kuesioner minat siswa dan penilaian otomatis per jurusan
- Dashboard Guru BK beserta analisis minat berbasis aturan
- Modul catatan konseling
- Modul laporan hanya-baca untuk Orang Tua
- Pengelolaan data master NISN, penugasan Guru BK, jurusan dinamis, dan bank soal oleh Admin
- Impor data massal (NISN, jurusan, soal) melalui berkas Excel

**Di luar scope (untuk iterasi berikutnya):**
- Integrasi dengan sistem akademik/rapor sekolah
- Notifikasi otomatis via SMS/WhatsApp
- Aplikasi versi mobile native
- Analisis kepribadian (sistem saat ini berfokus pada minat)

