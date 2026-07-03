-- Run these ALTER statements in your Supabase SQL Editor (Dashboard > SQL Editor)
-- BEFORE deploying the updated app code.

-- 1. Add kelompok column to master_nisn
ALTER TABLE master_nisn ADD COLUMN kelompok varchar DEFAULT NULL;

-- 2. Add kelompok column to siswa_profiles
ALTER TABLE siswa_profiles ADD COLUMN kelompok varchar DEFAULT NULL;

-- 3. Add kelompok column to users table (Guru BK filtering reads from here)
ALTER TABLE users ADD COLUMN kelompok varchar DEFAULT NULL;

-- 4. Remove kelompok from guru_bk_profiles if it was added by a previous migration
ALTER TABLE guru_bk_profiles DROP COLUMN IF EXISTS kelompok;

-- 5. Create guru_bk_profiles table (if not exists) — holds display name only
CREATE TABLE IF NOT EXISTS guru_bk_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user uuid REFERENCES users(id) UNIQUE,
  nama_guru_bk varchar NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Verify: SELECT column_name FROM information_schema.columns WHERE table_name='master_nisn';
-- Verify: SELECT column_name FROM information_schema.columns WHERE table_name='siswa_profiles';
-- Verify: SELECT column_name FROM information_schema.columns WHERE table_name='users';
-- Verify: SELECT * FROM information_schema.tables WHERE table_name='guru_bk_profiles';

-- =============================================
-- Seed kelompok for existing Guru BK users (run once)
-- =============================================
-- UPDATE users SET kelompok = 'A' WHERE username = 'gurubk';
-- UPDATE users SET kelompok = 'B' WHERE username = 'gurubk1';
-- Repeat for any other Guru BK accounts.
-- Verify: SELECT username, role, kelompok FROM users WHERE role='guru_bk';
