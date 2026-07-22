-- ============================================================
-- SAMI-SMK — Skema Basis Data (PostgreSQL / Supabase)
-- File: 001_initial_schema.sql
-- Deskripsi: Definisi seluruh tabel, enum, index, dan RLS.
-- Urutan pembuatan mengikuti dependensi foreign key.
-- ============================================================

-- Ekstensi untuk gen_random_uuid()
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. TIPE ENUM
-- ------------------------------------------------------------
do $$ begin create type role_enum as enum ('siswa','guru_bk','orang_tua','admin');
exception when duplicate_object then null; end $$;

do $$ begin create type status_kuesioner_enum as enum ('belum_dikerjakan','selesai');
exception when duplicate_object then null; end $$;

do $$ begin create type link_status_enum as enum ('aktif','terpakai','kedaluwarsa','dicabut');
exception when duplicate_object then null; end $$;

do $$ begin create type rekomendasi_enum as enum ('multimedia_dkv','tbsm','seimbang');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 2. TABEL: users (pengguna)
-- ------------------------------------------------------------
create table if not exists users (
    id          uuid primary key default gen_random_uuid(),
    username    varchar unique not null,
    password    varchar not null,          -- catatan: plain text (lingkup akademik)
    role        role_enum not null,
    nama        varchar,
    created_at  timestamp default now(),
    updated_at  timestamp default now()
);

-- ------------------------------------------------------------
-- 3. TABEL: master_nisn (data master NISN)
-- ------------------------------------------------------------
create table if not exists master_nisn (
    id             uuid primary key default gen_random_uuid(),
    nisn           varchar unique not null,
    nama_siswa     varchar not null,
    angkatan_tahun int not null,
    is_claimed     boolean not null default false,
    id_guru_bk     uuid references users(id),
    created_at     timestamp default now()
);

-- ------------------------------------------------------------
-- 4. TABEL: siswa_profiles (profil siswa)
-- ------------------------------------------------------------
create table if not exists siswa_profiles (
    id               uuid primary key default gen_random_uuid(),
    id_user          uuid not null references users(id) on delete cascade,
    nisn             varchar not null,
    nama_siswa       varchar not null,
    angkatan_tahun   int not null,
    status_kuesioner status_kuesioner_enum not null default 'belum_dikerjakan',
    id_guru_bk       uuid references users(id),
    created_at       timestamp default now()
);

-- ------------------------------------------------------------
-- 5. TABEL: orang_tua_profiles (profil orang tua)
-- ------------------------------------------------------------
create table if not exists orang_tua_profiles (
    id               uuid primary key default gen_random_uuid(),
    id_user          uuid not null references users(id) on delete cascade,
    id_siswa         uuid not null references siswa_profiles(id) on delete cascade,
    nama_orang_tua   varchar not null,
    email_orang_tua  varchar not null,
    created_at       timestamp default now()
);

-- ------------------------------------------------------------
-- 6. TABEL: link_codes (kode tautan)
-- ------------------------------------------------------------
create table if not exists link_codes (
    id               uuid primary key default gen_random_uuid(),
    kode             varchar unique not null,
    id_siswa         uuid not null references siswa_profiles(id) on delete cascade,
    status           link_status_enum not null default 'aktif',
    id_ortu_pemakai  uuid references users(id),
    used_at          timestamp,
    expires_at       timestamp not null,
    created_at       timestamp default now()
);

-- ------------------------------------------------------------
-- 7. TABEL: jurusan (dinamis)
-- ------------------------------------------------------------
create table if not exists jurusan (
    id          uuid primary key default gen_random_uuid(),
    kode        varchar unique not null,
    nama        varchar not null,
    deskripsi   text,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8. TABEL: questions (pertanyaan / bank soal)
-- ------------------------------------------------------------
create table if not exists questions (
    id              serial primary key,
    teks_pertanyaan text not null,
    id_jurusan      uuid references jurusan(id),
    created_at      timestamp default now()
);

-- ------------------------------------------------------------
-- 9. TABEL: kuesioner_responses (jawaban kuesioner)
-- ------------------------------------------------------------
create table if not exists kuesioner_responses (
    id             uuid primary key default gen_random_uuid(),
    id_siswa       uuid not null references siswa_profiles(id) on delete cascade,
    id_soal        int not null references questions(id),
    nilai_jawaban  int not null check (nilai_jawaban between 1 and 5),
    created_at     timestamp default now(),
    constraint unique_siswa_soal unique (id_siswa, id_soal)
);

-- ------------------------------------------------------------
-- 10. TABEL: kuesioner_results (hasil kuesioner)
-- ------------------------------------------------------------
create table if not exists kuesioner_results (
    id                uuid primary key default gen_random_uuid(),
    id_siswa          uuid not null references siswa_profiles(id) on delete cascade,
    rekomendasi_final rekomendasi_enum not null,
    created_at        timestamp default now()
);

-- ------------------------------------------------------------
-- 11. TABEL: kuesioner_result_scores (skor per jurusan)
-- ------------------------------------------------------------
create table if not exists kuesioner_result_scores (
    id          uuid primary key default gen_random_uuid(),
    id_result   uuid not null references kuesioner_results(id) on delete cascade,
    id_jurusan  uuid not null references jurusan(id),
    skor        numeric not null check (skor >= 0 and skor <= 100),
    created_at  timestamptz not null default now(),
    unique (id_result, id_jurusan)
);

-- ------------------------------------------------------------
-- 12. TABEL: bk_notes (catatan konseling)
-- ------------------------------------------------------------
create table if not exists bk_notes (
    id            uuid primary key default gen_random_uuid(),
    id_result     uuid not null references kuesioner_results(id) on delete cascade,
    id_guru_bk    uuid not null references users(id),
    teks_catatan  text not null,
    created_at    timestamp default now()
);

-- ------------------------------------------------------------
-- 13. INDEX
-- ------------------------------------------------------------
create index if not exists idx_users_username       on users(username);
create index if not exists idx_master_nisn_nisn      on master_nisn(nisn);
create index if not exists idx_siswa_guru_bk         on siswa_profiles(id_guru_bk);
create index if not exists idx_questions_id_jurusan  on questions(id_jurusan);
create index if not exists idx_responses_siswa       on kuesioner_responses(id_siswa);
create index if not exists idx_krs_id_result         on kuesioner_result_scores(id_result);
create index if not exists idx_krs_id_jurusan        on kuesioner_result_scores(id_jurusan);
create index if not exists idx_link_codes_kode       on link_codes(kode);

-- ------------------------------------------------------------
-- 14. ROW LEVEL SECURITY
-- Pola permisif (lingkup akademik). Ulangi untuk tiap tabel.
-- ------------------------------------------------------------
-- Contoh untuk tabel users (terapkan pola sama ke tabel lain):
alter table users enable row level security;

drop policy if exists "users_all_anon" on users;
create policy "users_all_anon" on users
    for all to anon using (true) with check (true);

drop policy if exists "users_all_authenticated" on users;
create policy "users_all_authenticated" on users
    for all to authenticated using (true) with check (true);

-- (Untuk tabel lain: master_nisn, siswa_profiles, orang_tua_profiles,
--  link_codes, jurusan, questions, kuesioner_responses, kuesioner_results,
--  kuesioner_result_scores, bk_notes — buat policy dengan pola yang sama.)

-- ============================================================
-- CATATAN
-- - Urutan pembuatan tabel mengikuti dependensi foreign key.
-- - questions.id memakai serial; JANGAN insert id secara eksplisit.
-- - Skema ini adalah dokumentasi struktur; untuk versi paling akurat
--   gunakan hasil ekspor langsung dari Supabase.
-- ============================================================
