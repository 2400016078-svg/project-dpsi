-- ============================================================================
-- Migrasi: Jurusan Soft-Delete (Nonaktifkan, bukan Hapus)
-- Jalankan di Supabase SQL Editor, satu kali. Aman dijalankan ulang (idempotent).
-- ============================================================================

alter table jurusan add column if not exists is_active boolean not null default true;

-- ----------------------------------------------------------------------------
-- Verifikasi opsional -- boleh dijalankan terpisah untuk mengecek hasil
-- ----------------------------------------------------------------------------
-- select id, kode, nama, is_active from jurusan order by created_at;
