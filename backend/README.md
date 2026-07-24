# Backend — Migrasi Basis Data SAMI-SMK

Folder ini memuat seluruh berkas migrasi SQL untuk basis data **SAMI-SMK**, yang dijalankan pada **Supabase (PostgreSQL)**. Aplikasi memakai Supabase sebagai *Backend-as-a-Service*, sehingga definisi struktur basis data dan logikanya direpresentasikan oleh berkas-berkas SQL di sini.

## Cara Menjalankan

Setiap berkas dijalankan melalui **Supabase Dashboard → SQL Editor**, diurutkan dari nomor terkecil ke terbesar. Sebagian besar berkas bersifat *idempotent* (aman dijalankan ulang).

> Catatan: matikan fitur terjemahan otomatis browser saat menyalin SQL, agar kata kunci SQL tidak ikut diterjemahkan.

## Daftar Migrasi (urut kronologis)

| No | Berkas | Tujuan |
|----|--------|--------|
| 001 | `001_initial_schema.sql` | Skema dasar: seluruh tabel inti, tipe enum, index, dan Row Level Security. |
| 002 | `002_kelompok_migration.sql` | Menambah sistem pengelompokan (kelompok A/B/C) untuk pembagian siswa ke Guru BK. *(Kemudian digantikan oleh 003.)* |
| 003 | `003_guru_bk_assignment.sql` | Mengganti sistem kelompok dengan penugasan Guru BK langsung (kolom `id_guru_bk`). |
| 004 | `004_nama_column.sql` | Menambah kolom `nama` (nama tampilan) pada tabel `users`. |
| 005 | `005_jurusan_dinamis_migration.sql` | Mengubah jurusan dari dua tetap (Multimedia/DKV & TBSM) menjadi **jurusan dinamis** (jumlah tidak dibatasi); menambah tabel `jurusan` dan `kuesioner_result_scores`. |
| 006 | `006_jurusan_soft_delete_migration.sql` | Menambah kolom `is_active` agar jurusan dapat diarsipkan (soft-delete), bukan dihapus permanen. |
| 007 | `007_data_publik_function.sql` | Fungsi RPC `data_publik()` untuk menampilkan data (tanpa kredensial) — dipakai saat demo. |

## Catatan Evolusi

Urutan berkas mencerminkan **perjalanan pengembangan** proyek:

1. Sistem awal memakai dua jurusan tetap dan pengelompokan siswa berbasis kelompok (A/B/C).
2. Pengelompokan kemudian disederhanakan menjadi penugasan Guru BK langsung (003).
3. Jurusan diubah menjadi dinamis agar sekolah dapat menambah/mengubah jurusan sendiri (005), dilengkapi kemampuan mengarsipkan jurusan (006).

Beberapa kolom lama (mis. `kelompok`, `klaster_jurusan`, `skor_multimedia`, `skor_tbsm`) sengaja **tidak dihapus** demi menjaga data historis, namun tidak lagi dipakai oleh kode aplikasi terbaru.

## Arsitektur Backend

SAMI-SMK tidak memiliki server backend dengan kode tersendiri. Seluruh operasi data dilakukan langsung ke Supabase dari sisi frontend, dengan keamanan diatur melalui Row Level Security. Berkas SQL di folder inilah yang berperan sebagai definisi dan dokumentasi backend.
