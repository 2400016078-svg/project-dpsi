# UC-003 — Pengisian Kuesioner Minat (Siswa)

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026 (v2.0 — jurusan dinamis)

## 1. OVERVIEW
- **Summary:** Siswa mengisi kuesioner Skala Likert (1–5) yang menghasilkan persentase kecocokan untuk SETIAP jurusan aktif, lalu rekomendasi jurusan dengan skor tertinggi.
- **Goal:** Siswa memperoleh hasil rekomendasi jurusan dan statusnya terkunci.
- **Primary Actor:** Siswa.

## 2. PRECONDITIONS
- Siswa sudah login dan status kuesioner masih `belum_dikerjakan`.
- Terdapat minimal satu jurusan aktif yang memiliki soal.

## 3. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Siswa membuka halaman Kuesioner dari dasbor. | Sistem menampilkan kuesioner format stepper, memuat SELURUH soal dari jurusan aktif secara dinamis. |
| 2 | Siswa menjawab seluruh pertanyaan (Likert 1–5). | Sistem menyimpan jawaban sementara per langkah. |
| 3 | Siswa menekan "Kirim Hasil Tes (Submit)". | Sistem memvalidasi kelengkapan (tidak ada soal terlewat). |
| 4 | - | Sistem menghitung skor tiap jurusan secara independen, menyimpan skor per jurusan, mengunci formulir, mengubah status → `selesai`, menampilkan grafik "Persentase Kecocokan" (satu batang per jurusan) beserta rekomendasi. |

## 4. EXCEPTION FLOWS
- **EF-001 (Soal belum lengkap):** tombol submit nonaktif / pesan "Mohon lengkapi semua pertanyaan."
- **EF-002 (Akses berulang):** jika status sudah `selesai` lalu mencoba akses ulang, sistem melempar balik ke dasbor: "Anda telah mengisi kuesioner. Formulir telah terkunci."
- **EF-003 (Submit ulang karena jawaban tersimpan sebagian):** sistem membersihkan jawaban lama siswa lalu menyimpan yang baru agar tidak terjadi bentrok data.

## 5. BUSINESS RULES
- Pengisian hanya 1 kali; nilai jawaban harus integer 1–5.
- **Penilaian independen per jurusan:** untuk tiap jurusan, skor = (rata-rata jawaban soal jurusan itu / 5) × 100, menghasilkan persentase 0–100% yang berdiri sendiri (tidak dibagi rata antar-jurusan). Angka tetap bermakna berapa pun jumlah jurusan.
- Rekomendasi final = jurusan dengan persentase tertinggi.
- Skor per jurusan disimpan pada struktur hasil per jurusan (mendukung N jurusan).

## 6. ACCEPTANCE CRITERIA
- **AC-001:** Submit hanya berhasil jika semua soal terisi.
- **AC-002:** Setelah submit, status `selesai` dan rute kuesioner terblokir permanen.
- **AC-003:** Grafik hasil menampilkan satu batang untuk setiap jurusan aktif, dengan jurusan tertinggi sebagai rekomendasi.
