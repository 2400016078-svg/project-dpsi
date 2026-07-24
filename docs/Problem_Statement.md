# Problem Statement — SAMI-SMK

> Dokumen ini berfokus **murni pada permasalahan**. Solusi dan kebutuhan sistem
> dibahas terpisah pada dokumen Functional Requirements dan SRS.

## 1. Konteks Instansi

**SMK Ma'arif 1 Yogyakarta** merupakan sekolah menengah kejuruan yang setiap tahun menerima siswa baru dari beragam latar belakang. Berdasarkan wawancara dengan Kepala Sekolah (30 April 2026), sekolah sedang berada dalam **masa transisi menuju digitalisasi**: sebagian proses (tes, input nilai) telah memakai aplikasi, namun banyak proses lain — termasuk pemantauan siswa dan pengarahan jurusan — masih dilakukan secara manual.

## 2. Latar Belakang Masalah

Penentuan jurusan siswa baru idealnya mempertimbangkan minat dan potensi siswa secara terukur. Namun berdasarkan konteks nyata di SMK Ma'arif 1, proses ini menghadapi kendala berlapis.

Kepala Sekolah menyatakan bahwa banyak keputusan penjurusan terjadi tanpa data minat yang memadai, sehingga muncul kasus siswa yang **merasa tidak sesuai dengan jurusan** setelah masuk. Beliau menggambarkan akar masalahnya: pihak sekolah dan orang tua sering **tidak memahami potensi masing-masing siswa**, sehingga pengarahan menjadi tidak tepat sasaran.

Pada saat yang sama, proses pemetaan minat yang ada masih manual: instrumen dibagikan dan direkap satu per satu, memakan waktu, dan sulit dipantau perkembangannya.

## 3. Rumusan Masalah

1. Sekolah belum memiliki cara terukur untuk **memetakan minat siswa baru** sejak awal masuk, sehingga pengarahan jurusan rentan tidak tepat.
2. Proses pemetaan minat yang berjalan masih **manual**, memakan waktu, dan sulit dipantau progresnya secara langsung.
3. Hasil pemetaan minat **tidak tersimpan sebagai data yang valid dan dapat diolah**, sehingga menyulitkan analisis dan tindak lanjut.
4. **Orang tua tidak memiliki akses** untuk mengetahui hasil pemetaan minat dan perkembangan anaknya secara transparan.
5. Ketika sekolah **menambah atau mengubah jurusan**, instrumen pemetaan manual harus disusun ulang dari awal.
6. Guru BK kesulitan **memantau dan menindaklanjuti** hasil banyak siswa karena tidak ada pusat data yang terorganisasi.

## 4. Dampak Masalah

- Keputusan penjurusan berisiko keliru, memunculkan siswa yang salah jurusan dan berpotensi pindah/menyesal.
- Guru BK kehilangan waktu untuk konseling substantif karena tersita proses rekap manual.
- Orang tua tidak dapat mendampingi anak secara terinformasi karena tidak mendapat hasil pemetaan.
- Sekolah sulit menganalisis tren minat antar-angkatan untuk perencanaan kapasitas jurusan.
- Potensi siswa tidak terarahkan secara optimal — sejalan dengan analogi Kepala Sekolah: "anak yang pandai memanjat justru diikutkan lomba renang" karena potensinya tidak dikenali.

## 5. Ruang Lingkup Permasalahan

Permasalahan yang menjadi fokus terbatas pada **proses pemetaan minat siswa baru terhadap jurusan** dan tindak lanjutnya (konseling, pelaporan ke orang tua). Aspek lain yang disinggung narasumber — seperti deteksi karakter, kondisi ekonomi, sistem PKL, dan pembayaran SPP — berada **di luar ruang lingkup** permasalahan yang diangkat.

## 6. Sumber & Validasi

Rumusan masalah ini didasarkan pada wawancara langsung dengan Kepala Sekolah SMK Ma'arif 1 Yogyakarta. Transkrip lengkap terdapat pada dokumen `Data_Wawancara_Observasi.md`.
