# Class Diagram — SAMI-SMK

Model data 11 entitas untuk aplikasi **SAMI-SMK (Sistem Analisis Minat Siswa SMK)**, memakai PostgreSQL melalui Supabase.

> Diagram di bawah ditulis dalam format **Mermaid**. Diagram akan tampil otomatis sebagai gambar saat berkas ini dibuka di GitHub atau editor Markdown yang mendukung Mermaid (mis. VS Code dengan ekstensi Mermaid).

## Diagram

```mermaid
classDiagram
    class User {
        +uuid id PK
        +string username UK
        +string password
        +enum role
        +string nama
        +timestamp created_at
        +timestamp updated_at
        +login() bool
        +logout() void
    }

    class MasterNISN {
        +uuid id PK
        +string nisn UK
        +string nama_siswa
        +int angkatan_tahun
        +bool is_claimed
        +uuid id_guru_bk FK
        +timestamp created_at
        +verifyNISN() bool
        +claim() void
    }

    class SiswaProfile {
        +uuid id PK
        +uuid id_user FK
        +string nisn
        +string nama_siswa
        +int angkatan_tahun
        +enum status_kuesioner
        +uuid id_guru_bk FK
        +timestamp created_at
        +hasCompletedKuesioner() bool
    }

    class OrangTuaProfile {
        +uuid id PK
        +uuid id_user FK
        +uuid id_siswa FK
        +string nama_orang_tua
        +string email_orang_tua
        +timestamp created_at
    }

    class LinkCode {
        +uuid id PK
        +string kode UK
        +uuid id_siswa FK
        +enum status
        +uuid id_ortu_pemakai FK
        +timestamp used_at
        +timestamp expires_at
        +isValid() bool
        +consume() void
    }

    class Jurusan {
        +uuid id PK
        +string kode UK
        +string nama
        +text deskripsi
        +bool is_active
        +timestamp created_at
        +archive() void
        +activate() void
        +isReferenced() bool
    }

    class Question {
        +int id PK
        +text teks_pertanyaan
        +uuid id_jurusan FK
        +timestamp created_at
    }

    class KuesionerResponse {
        +uuid id PK
        +uuid id_siswa FK
        +int id_soal FK
        +int nilai_jawaban
        +timestamp created_at
    }

    class KuesionerResult {
        +uuid id PK
        +uuid id_siswa FK
        +enum rekomendasi_final
        +timestamp created_at
        +calculateScores() void
        +determineRecommendation() string
    }

    class KuesionerResultScore {
        +uuid id PK
        +uuid id_result FK
        +uuid id_jurusan FK
        +decimal skor
        +timestamp created_at
        +toPercentage() decimal
    }

    class BKNote {
        +uuid id PK
        +uuid id_result FK
        +uuid id_guru_bk FK
        +text teks_catatan
        +timestamp created_at
    }

    User "1" --> "1" SiswaProfile : extends
    User "1" --> "1" OrangTuaProfile : extends
    User "1" --> "*" SiswaProfile : supervises
    User "1" --> "*" MasterNISN : assigned_to
    MasterNISN "1" --> "1" SiswaProfile : verifies
    SiswaProfile "1" --> "*" LinkCode : generates
    SiswaProfile "1" --> "1" OrangTuaProfile : monitored_by
    SiswaProfile "1" --> "*" KuesionerResponse : answers
    SiswaProfile "1" --> "*" KuesionerResult : has
    Jurusan "1" --> "*" Question : groups
    Question "1" --> "*" KuesionerResponse : answered_in
    KuesionerResult "1" --> "*" KuesionerResultScore : contains
    Jurusan "1" --> "*" KuesionerResultScore : scored_for
    KuesionerResult "1" --> "*" BKNote : annotated_by
    User "1" --> "*" BKNote : writes
```

## Keterangan Entitas

| Entitas | Kelompok | Deskripsi Singkat |
|---|---|---|
| User | Akun & pengguna | Akun seluruh peran (Siswa, Guru BK, Orang Tua, Admin). |
| MasterNISN | Akun & pengguna | Data master NISN resmi sekolah untuk verifikasi pendaftaran. |
| SiswaProfile | Akun & pengguna | Profil siswa, tertaut ke akun dan Guru BK pembimbing. |
| OrangTuaProfile | Akun & pengguna | Profil orang tua, tertaut 1:1 ke seorang siswa. |
| LinkCode | Akun & pengguna | Kode tautan sekali pakai untuk menautkan orang tua ke siswa. |
| Jurusan | Jurusan & penilaian | Jurusan dinamis yang dikelola Admin (jumlah tidak dibatasi). |
| Question | Jurusan & penilaian | Bank soal kuesioner; tiap soal terkait satu jurusan. |
| KuesionerResponse | Akun & pengguna | Jawaban siswa untuk tiap soal (skala Likert 1–5). |
| KuesionerResult | Akun & pengguna | Header hasil kuesioner beserta rekomendasi jurusan. |
| KuesionerResultScore | Jurusan & penilaian | Skor kecocokan per jurusan (0–100%) untuk sebuah hasil. |
| BKNote | Akun & pengguna | Catatan konseling Guru BK pada hasil kuesioner siswa. |

## Keterangan Notasi

- **PK** — Primary Key (kunci utama)
- **FK** — Foreign Key (kunci tamu / relasi antar-tabel)
- **UK** — Unique Key (nilai unik)
- Panah **1 → \***  menunjukkan relasi satu-ke-banyak.

Detail lengkap struktur, tipe data, constraint, index, dan skema SQL terdapat pada berkas `data_model.md`.
