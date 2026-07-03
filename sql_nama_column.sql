-- Run this in Supabase SQL Editor BEFORE deploying
-- Adds nama (display name) column to users table

ALTER TABLE users ADD COLUMN nama varchar(255) DEFAULT '';

-- Copy existing guru_bk_profiles names into users.nama for matching rows
UPDATE users SET nama = (
  SELECT nama_guru_bk FROM guru_bk_profiles WHERE guru_bk_profiles.id_user = users.id
) WHERE role IN ('guru_bk', 'admin') AND EXISTS (
  SELECT 1 FROM guru_bk_profiles WHERE guru_bk_profiles.id_user = users.id
);

-- Verify
-- SELECT id, username, role, nama FROM users ORDER BY username;
