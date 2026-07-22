-- ============================================================
-- SAMI-SMK — Fungsi Data Publik (untuk keperluan demo)
-- File: 002_data_publik_function.sql
-- Deskripsi: Membuat satu endpoint RPC yang mengembalikan
--            seluruh data substantif aplikasi dalam satu JSON.
--            Tidak menyertakan tabel kredensial (users, link_codes).
-- Akses via: /rest/v1/rpc/data_publik?apikey=ANON_KEY
-- ============================================================

create or replace function data_publik()
returns json
language sql
security definer
as $$
  select json_build_object(
    'jurusan',                 (select json_agg(t) from jurusan t),
    'questions',               (select json_agg(t) from questions t),
    'master_nisn',             (select json_agg(t) from master_nisn t),
    'siswa_profiles',          (select json_agg(t) from siswa_profiles t),
    'orang_tua_profiles',      (select json_agg(t) from orang_tua_profiles t),
    'kuesioner_responses',     (select json_agg(t) from kuesioner_responses t),
    'kuesioner_results',       (select json_agg(t) from kuesioner_results t),
    'kuesioner_result_scores', (select json_agg(t) from kuesioner_result_scores t),
    'bk_notes',                (select json_agg(t) from bk_notes t)
  );
$$;

-- Beri izin akses ke peran anon (agar dapat diakses via REST API)
grant execute on function data_publik() to anon;

-- ------------------------------------------------------------
-- CATATAN KEAMANAN
-- - Fungsi ini sengaja TIDAK menyertakan tabel `users` dan
--   `link_codes` karena memuat kredensial.
-- - Endpoint memuat anon key pada URL-nya; gunakan untuk demo,
--   dan lakukan regenerate anon key setelah penilaian selesai.
-- ============================================================
