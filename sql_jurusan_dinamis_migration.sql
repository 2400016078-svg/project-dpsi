-- ============================================================================
-- Migrasi: Jurusan Dinamis (mendukung N jurusan, bukan cuma Multimedia/DKV & TBSM)
-- Jalankan SELURUH file ini di Supabase SQL Editor, dari atas ke bawah, SATU KALI.
-- Aman dijalankan ulang (idempotent) jika perlu diulang karena error di tengah jalan.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- STEP 1: Tabel `jurusan` + seed 2 jurusan yang sudah ada + RLS
-- ----------------------------------------------------------------------------
create table if not exists jurusan (
  id uuid primary key default gen_random_uuid(),
  kode varchar unique not null,
  nama varchar not null,
  deskripsi text,
  created_at timestamptz not null default now()
);

insert into jurusan (kode, nama, deskripsi) values
  ('multimedia_dkv', 'Multimedia / DKV', 'Desain grafis, animasi, fotografi, videografi, dan industri kreatif digital.'),
  ('tbsm', 'TBSM', 'Otomotif, perbaikan mesin, bisnis sparepart, dan kewirausahaan teknik.')
on conflict (kode) do nothing;

alter table jurusan enable row level security;

drop policy if exists "jurusan_all_anon" on jurusan;
drop policy if exists "jurusan_all_authenticated" on jurusan;
create policy "jurusan_all_anon" on jurusan for all to anon using (true) with check (true);
create policy "jurusan_all_authenticated" on jurusan for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- STEP 2: Hubungkan `questions` ke `jurusan` + migrasi data soal yang sudah ada
-- (klaster_jurusan lama TIDAK dihapus, hanya tidak dipakai lagi oleh kode aplikasi)
-- ----------------------------------------------------------------------------
alter table questions add column if not exists id_jurusan uuid references jurusan(id);

update questions
set id_jurusan = (select id from jurusan where jurusan.kode = questions.klaster_jurusan)
where id_jurusan is null;

create index if not exists idx_questions_id_jurusan on questions(id_jurusan);

-- klaster_jurusan is superseded by id_jurusan going forward; the app no longer
-- writes to it, so it must stop being required on new inserts.
alter table questions alter column klaster_jurusan drop not null;

-- ----------------------------------------------------------------------------
-- STEP 3: Tabel skor per jurusan (kuesioner_result_scores) + RLS
-- ----------------------------------------------------------------------------
create table if not exists kuesioner_result_scores (
  id uuid primary key default gen_random_uuid(),
  id_result uuid not null references kuesioner_results(id) on delete cascade,
  id_jurusan uuid not null references jurusan(id),
  skor numeric not null,
  created_at timestamptz not null default now(),
  unique (id_result, id_jurusan)
);

create index if not exists idx_krs_id_result on kuesioner_result_scores(id_result);
create index if not exists idx_krs_id_jurusan on kuesioner_result_scores(id_jurusan);

alter table kuesioner_result_scores enable row level security;

drop policy if exists "krs_all_anon" on kuesioner_result_scores;
drop policy if exists "krs_all_authenticated" on kuesioner_result_scores;
create policy "krs_all_anon" on kuesioner_result_scores for all to anon using (true) with check (true);
create policy "krs_all_authenticated" on kuesioner_result_scores for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- STEP 4: Migrasi skor lama (skor_multimedia / skor_tbsm) -> kuesioner_result_scores
-- lalu longgarkan kedua kolom lama itu (hasil baru tidak wajib mengisinya lagi)
-- ----------------------------------------------------------------------------
insert into kuesioner_result_scores (id_result, id_jurusan, skor)
select kr.id, j.id, kr.skor_multimedia
from kuesioner_results kr
join jurusan j on j.kode = 'multimedia_dkv'
where kr.skor_multimedia is not null
on conflict (id_result, id_jurusan) do nothing;

insert into kuesioner_result_scores (id_result, id_jurusan, skor)
select kr.id, j.id, kr.skor_tbsm
from kuesioner_results kr
join jurusan j on j.kode = 'tbsm'
where kr.skor_tbsm is not null
on conflict (id_result, id_jurusan) do nothing;

alter table kuesioner_results alter column skor_multimedia drop not null;
alter table kuesioner_results alter column skor_tbsm drop not null;

-- ----------------------------------------------------------------------------
-- STEP 5 (verifikasi opsional -- boleh dijalankan terpisah untuk mengecek hasil)
-- ----------------------------------------------------------------------------
-- select * from jurusan order by created_at;
-- select id, teks_pertanyaan, klaster_jurusan, id_jurusan from questions order by id;
-- select kr.id, kr.rekomendasi_final, krs.skor, j.nama
--   from kuesioner_results kr
--   join kuesioner_result_scores krs on krs.id_result = kr.id
--   join jurusan j on j.id = krs.id_jurusan
--   order by kr.id;
