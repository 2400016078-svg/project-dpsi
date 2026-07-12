# Data Model — SAMI-SMK
> Skema ini disusun dari hasil pembacaan `information_schema` database asli (11 tabel).

---

## Gambaran Umum

SAMI-SMK memetakan minat siswa SMK ke beberapa jurusan melalui kuesioner. Ada 4 peran: Siswa, Guru BK, Orang Tua, Admin. Basis datanya terdiri dari tabel akun, profil, data master, bank soal, jurusan (dinamis), serta jawaban dan hasil kuesioner.

Relasi inti:
- `users` menyimpan semua akun (semua peran).
- `siswa_profiles` & `orang_tua_profiles` memperluas `users` untuk data spesifik siswa/orang tua.
- `master_nisn` = daftar NISN sah untuk verifikasi pendaftaran siswa.
- `questions` = bank soal, tiap soal terhubung ke satu `jurusan` (lewat `id_jurusan`).
- `kuesioner_responses` = jawaban siswa (Likert 1–5) per soal.
- `kuesioner_results` + `kuesioner_result_scores` = hasil kuesioner (skor per jurusan) dan rekomendasi.

### Catatan tentang tipe ENUM (USER-DEFINED)
Beberapa kolom bertipe **enum** (di hasil `information_schema` tampil sebagai `USER-DEFINED`): `users.role`, `siswa_profiles.status_kuesioner`, `questions.klaster_jurusan`, `kuesioner_results.rekomendasi_final`, `link_codes.status`. Enum harus dibuat DULU sebelum tabel yang memakainya.

### Catatan kolom "legacy" (peninggalan)
Beberapa kolom masih ada karena riwayat pengembangan, meski kini tidak dipakai lagi:
- `master_nisn.kelompok`, `siswa_profiles.kelompok`, `users.kelompok` — sisa konsep "kelompok" lama (sekarang diganti penugasan Guru BK via `id_guru_bk`).
- `questions.klaster_jurusan` — cara lama mengaitkan soal ke jurusan (sekarang pakai `id_jurusan`).
- `kuesioner_results.skor_multimedia`, `kuesioner_results.skor_tbsm` — cara lama menyimpan skor untuk 2 jurusan (sekarang skor per jurusan disimpan di `kuesioner_result_scores`). Kolom ini kini nullable dan dipertahankan agar hasil lama tetap tampil.

---

## Skema SQL

```sql
-- Ekstensi untuk gen_random_uuid()
create extension if not exists pgcrypto;

-- ============================================================
-- ENUM (buat dulu sebelum tabel yang memakainya)
-- ============================================================
do $$ begin
    create type role_enum as enum ('siswa','guru_bk','orang_tua','admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create type status_kuesioner_enum as enum ('belum_dikerjakan','selesai');
exception when duplicate_object then null; end $$;

do $$ begin
    create type klaster_jurusan_enum as enum ('multimedia_dkv','tbsm');
exception when duplicate_object then null; end $$;

do $$ begin
    create type rekomendasi_enum as enum ('multimedia_dkv','tbsm','seimbang');
exception when duplicate_object then null; end $$;

do $$ begin
    create type link_status_enum as enum ('aktif','terpakai','kedaluwarsa','dicabut');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 1. USERS — semua akun (siswa, guru_bk, orang_tua, admin)
-- ============================================================
create table if not exists users (
    id          uuid primary key default gen_random_uuid(),
    username    varchar not null,             -- unik, dipakai untuk login
    password    varchar not null,             -- CATATAN: sebaiknya di-hash (bcrypt) sebelum produksi
    role        role_enum not null,           -- enum
    nama        varchar,                       -- nama tampilan (mis. nama Guru BK)
    kelompok    varchar,                       -- (legacy, tidak dipakai lagi)
    created_at  timestamp default now(),
    updated_at  timestamp default now()
);

-- ============================================================
-- 2. MASTER_NISN — daftar NISN sah untuk verifikasi siswa
-- ============================================================
create table if not exists master_nisn (
    id             uuid primary key default gen_random_uuid(),
    nisn           varchar not null,          -- 10 digit
    nama_siswa     varchar not null,
    angkatan_tahun integer not null,          -- mis. 2026
    is_claimed     boolean not null default false,  -- true bila sudah dipakai daftar
    id_guru_bk     uuid references users(id), -- Guru BK pembimbing
    kelompok       varchar,                    -- (legacy)
    created_at     timestamp default now()
);

-- ============================================================
-- 3. SISWA_PROFILES — data spesifik siswa
-- ============================================================
create table if not exists siswa_profiles (
    id               uuid primary key default gen_random_uuid(),
    id_user          uuid not null references users(id) on delete cascade,
    nisn             varchar not null,
    nama_siswa       varchar not null,
    angkatan_tahun   integer not null,
    status_kuesioner status_kuesioner_enum not null default 'belum_dikerjakan',
    id_guru_bk       uuid references users(id),  -- Guru BK pembimbing
    kelompok         varchar,                    -- (legacy)
    created_at       timestamp default now()
);

-- ============================================================
-- 4. ORANG_TUA_PROFILES — data orang tua (relasi 1:1 ke siswa)
-- ============================================================
create table if not exists orang_tua_profiles (
    id               uuid primary key default gen_random_uuid(),
    id_user          uuid not null references users(id) on delete cascade,
    id_siswa         uuid not null references siswa_profiles(id) on delete cascade,
    nama_orang_tua   varchar not null,
    email_orang_tua  varchar not null,
    created_at       timestamp default now()
);

-- ============================================================
-- 5. LINK_CODES — kode tautan (siswa -> orang tua), sekali pakai
-- ============================================================
create table if not exists link_codes (
    id               uuid primary key default gen_random_uuid(),
    kode             varchar not null,
    id_siswa         uuid not null references siswa_profiles(id) on delete cascade,
    status           link_status_enum not null default 'aktif',
    id_ortu_pemakai  uuid references users(id),
    used_at          timestamp,
    expires_at       timestamp not null,
    created_at       timestamp default now()
);

-- ============================================================
-- 6. JURUSAN — jurusan dinamis (bisa N jurusan)
-- ============================================================
create table if not exists jurusan (
    id          uuid primary key default gen_random_uuid(),
    kode        varchar not null,          -- mis. 'multimedia_dkv', 'tbsm'
    nama        varchar not null,          -- mis. 'Multimedia / DKV'
    deskripsi   text,
    is_active   boolean not null default true,  -- false = diarsipkan (soft delete)
    created_at  timestamptz not null default now()
);

-- ============================================================
-- 7. QUESTIONS — bank soal (tiap soal -> satu jurusan via id_jurusan)
-- ============================================================
create table if not exists questions (
    id              serial primary key,        -- auto-increment (integer)
    teks_pertanyaan text not null,
    id_jurusan      uuid references jurusan(id),
    klaster_jurusan klaster_jurusan_enum,      -- (legacy, cara lama; kini pakai id_jurusan)
    created_at      timestamp default now()
);

-- ============================================================
-- 8. KUESIONER_RESPONSES — jawaban siswa (Likert 1–5) per soal
-- ============================================================
create table if not exists kuesioner_responses (
    id             uuid primary key default gen_random_uuid(),
    id_siswa       uuid not null references siswa_profiles(id) on delete cascade,
    id_soal        integer not null references questions(id),
    nilai_jawaban  integer not null,          -- 1..5
    created_at     timestamp default now(),
    unique (id_siswa, id_soal)                 -- 1 jawaban per (siswa, soal): unique_siswa_soal
);

-- ============================================================
-- 9. KUESIONER_RESULTS — hasil kuesioner + rekomendasi
-- ============================================================
create table if not exists kuesioner_results (
    id                uuid primary key default gen_random_uuid(),
    id_siswa          uuid not null references siswa_profiles(id) on delete cascade,
    skor_multimedia   numeric,               -- (legacy, nullable) skor cara lama
    skor_tbsm         numeric,               -- (legacy, nullable) skor cara lama
    rekomendasi_final rekomendasi_enum not null,  -- enum
    created_at        timestamp default now()
);

-- ============================================================
-- 10. KUESIONER_RESULT_SCORES — skor per jurusan (mendukung N jurusan)
-- ============================================================
create table if not exists kuesioner_result_scores (
    id          uuid primary key default gen_random_uuid(),
    id_result   uuid not null references kuesioner_results(id) on delete cascade,
    id_jurusan  uuid not null references jurusan(id),
    skor        numeric not null,          -- persentase 0..100 (independen per jurusan)
    created_at  timestamptz not null default now(),
    unique (id_result, id_jurusan)
);

-- ============================================================
-- 11. BK_NOTES — catatan konseling Guru BK
-- ============================================================
create table if not exists bk_notes (
    id            uuid primary key default gen_random_uuid(),
    id_result     uuid not null references kuesioner_results(id) on delete cascade,
    id_guru_bk    uuid not null references users(id),
    teks_catatan  text not null,
    created_at    timestamp default now()
);
```

---

## Row Level Security (RLS)

Supabase mengaktifkan RLS. Aplikasi ini memakai anon/publishable key, jadi tiap tabel diberi policy agar bisa dibaca/ditulis. Contoh pola untuk satu tabel (ulangi untuk tiap tabel):

```sql
alter table users enable row level security;

drop policy if exists "users_all_anon" on users;
drop policy if exists "users_all_authenticated" on users;

create policy "users_all_anon"
    on users for all to anon
    using (true) with check (true);

create policy "users_all_authenticated"
    on users for all to authenticated
    using (true) with check (true);
```

> **Catatan keamanan (penting untuk diajarkan):** policy `using (true)` sangat permisif — cocok untuk belajar/prototipe, tapi untuk aplikasi nyata perlu diperketat agar tiap pengguna hanya mengakses datanya sendiri. Password juga sebaiknya di-hash (mis. bcrypt), bukan disimpan apa adanya.

---

## Ringkasan Relasi (untuk dijelaskan ke teman)

| Tabel | Terhubung ke | Lewat kolom |
|---|---|---|
| siswa_profiles | users | id_user |
| siswa_profiles | users (Guru BK) | id_guru_bk |
| orang_tua_profiles | users, siswa_profiles | id_user, id_siswa |
| master_nisn | users (Guru BK) | id_guru_bk |
| questions | jurusan | id_jurusan |
| kuesioner_responses | siswa_profiles, questions | id_siswa, id_soal |
| kuesioner_results | siswa_profiles | id_siswa |
| kuesioner_result_scores | kuesioner_results, jurusan | id_result, id_jurusan |
| bk_notes | kuesioner_results, users | id_result, id_guru_bk |
| link_codes | siswa_profiles, users | id_siswa, id_ortu_pemakai |

---

## Urutan Membuat Tabel (penting)

Karena tabel saling bergantung (foreign key), buat sesuai urutan:
1. (enum dulu) → 2. users → 3. master_nisn → 4. siswa_profiles → 5. orang_tua_profiles → 6. link_codes → 7. jurusan → 8. questions → 9. kuesioner_responses → 10. kuesioner_results → 11. kuesioner_result_scores → 12. bk_notes.

Membuat tabel di urutan terbalik akan error karena referensi (foreign key) atau enum belum ada.

---

## Constraint penting (untuk dijelaskan)
- `kuesioner_responses` punya UNIQUE (id_siswa, id_soal) — dinamai `unique_siswa_soal` — memastikan 1 jawaban per soal per siswa.
- `kuesioner_result_scores` punya UNIQUE (id_result, id_jurusan) — 1 skor per jurusan per hasil.
- `questions.id` bertipe serial (auto-increment). Bila melakukan seed dengan id eksplisit, sequence perlu disinkronkan: `SELECT setval(pg_get_serial_sequence('questions','id'), (SELECT COALESCE(MAX(id),0) FROM questions)+1, false);`
