-- Run these ALTER statements in your Supabase SQL Editor (Dashboard > SQL Editor)
-- BEFORE deploying the updated app code.
-- This replaces the kelompok A/B/C system with direct Guru BK assignment.

-- 1. Add id_guru_bk (uuid, nullable, references users.id) to master_nisn
ALTER TABLE master_nisn ADD COLUMN id_guru_bk uuid REFERENCES users(id);

-- 2. Add id_guru_bk (uuid, nullable, references users.id) to siswa_profiles
ALTER TABLE siswa_profiles ADD COLUMN id_guru_bk uuid REFERENCES users(id);

-- The kelompok columns still exist but are no longer used by the app.
-- They can be dropped later once confirmed no data depends on them.

-- =============================================
-- Seed: assign existing students to Guru BK (example)
-- =============================================
-- UPDATE master_nisn SET id_guru_bk = (SELECT id FROM users WHERE username = 'gurubk') WHERE id_guru_bk IS NULL;
-- UPDATE siswa_profiles SET id_guru_bk = (SELECT id FROM users WHERE username = 'gurubk') WHERE id_guru_bk IS NULL;
-- Repeat for other Guru BK accounts, or let the app's "Bagi ulang merata" feature do it.

-- Verify:
-- SELECT mn.nisn, mn.nama_siswa, u.username AS guru_bk
-- FROM master_nisn mn
-- LEFT JOIN users u ON mn.id_guru_bk = u.id;
