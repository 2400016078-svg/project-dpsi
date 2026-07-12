# UC-004 — Pemberian Catatan Konseling Tambahan (BK)

- **Status:** Validated
- **Source of Truth:** #4
- **Last Updated:** 5 Juli 2026

## 1. OVERVIEW
- **Summary:** Guru BK menulis catatan rekomendasi pada hasil kuesioner siswa tanpa mengubah skor asli.
- **Goal:** Catatan konseling tersimpan dan tercatat di riwayat.
- **Primary Actor:** Guru BK.

## 2. PRECONDITIONS
- Guru BK sudah login dan siswa terkait sudah memiliki hasil kuesioner (UC-003).

## 3. MAIN FLOW
| Step | Actor Action | System Response |
|---|---|---|
| 1 | Guru BK membuka "Daftar Siswa Bimbingan" (PAGE-005). | Sistem menampilkan tabel siswa. |
| 2 | Guru BK memfilter berdasarkan drop-down "Angkatan 2026". | Sistem menampilkan baris: Nama \| Angkatan \| Hasil Rekomendasi \| Status Catatan. |
| 3 | Guru BK memilih satu siswa (PAGE-006). | Sistem menampilkan grafik minat read-only (satu batang per jurusan, dinamis) DAN kartu "Analisis Minat" otomatis (alat bantu, Guru BK saja). |
| 4 | Guru BK menginput teks pada kolom "Catatan Konseling". | Sistem memvalidasi kolom tidak kosong. |
| 5 | Guru BK menekan "Simpan Catatan". | Sistem menyimpan catatan dan mencatat log kronologis ke riwayat (PAGE-008). |

## 4. EXCEPTION FLOWS
- **EF-001 (Catatan kosong):** pesan error "Catatan tidak boleh kosong."

## 5. BUSINESS RULES
- Guru BK dilarang mengubah/menghapus angka persentase hasil asli; hanya menambah teks catatan.
- **Analisis Minat** dihasilkan dinamis dari skor per jurusan: menentukan jurusan tertinggi + selisih ke berikutnya, memberi interpretasi 3 tingkat (jelas condong / cenderung / seimbang) dan saran. Berlaku otomatis untuk jurusan apa pun (termasuk yang baru). Keputusan akhir tetap pada Guru BK.
- Guru BK hanya melihat siswa yang ditugaskan kepadanya.

## 6. ACCEPTANCE CRITERIA
- **AC-001:** Catatan tersimpan dan status catatan siswa berubah menjadi "sudah_diberikan".
- **AC-002:** Grafik persentase siswa tetap utuh setelah catatan disimpan.
