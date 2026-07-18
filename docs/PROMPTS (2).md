# PROMPTS — Rekaman Penggunaan Agentic AI (SAMI-SMK)

Document Version: v2.0
Project: SAMI-SMK — Sistem Analisis Minat Siswa SMK
Last Updated: 2026-07-05

---

## 1. RINGKASAN PENGGUNAAN AI

Pengembangan SAMI-SMK memakai pendekatan **Source of Truth (SoT)**: dokumen desain disusun lebih dulu, lalu dipakai sebagai acuan agentic AI dalam menulis kode.

| Tahap | Alat yang Dipakai | Keterangan |
| --- | --- | --- |
| Fase 1–3 (prototipe awal) | **OpenCode** (agentic AI) | Membangun prototipe berjalan dari dokumen SoT (5 prompt berurutan, lihat Bagian 2) |
| Fase 4 (pengembangan lanjutan) | **Claude Code CLI** | Beralih setelah OpenCode mencapai batas kuota. Dipakai untuk migrasi basis data, fitur lanjutan, dan perbaikan bug (lihat Bagian 3) |
| Penyusunan dokumen & analisis | **Claude (antarmuka chat)** | Membantu menyusun SoT, user flow, system logic, data model, dokumen pengujian, serta merumuskan prompt untuk agentic AI |

**Catatan kejujuran:** seluruh prompt di bawah adalah prompt yang benar-benar dipakai. Keputusan arsitektur, verifikasi hasil, pengujian di browser, dan seluruh perintah SQL dijalankan sendiri oleh pengembang; agentic AI tidak diberi akses service-role ke basis data produksi.

---

## 2. FASE 1–3 — PEMBANGUNAN PROTOTIPE (OpenCode)

Prompt dijalankan berurutan mengikuti struktur tutorial: Phase 1 → 2A → 2B → 2C → Phase 3.

### PROMPT 1 — PHASE 1: SCOPE DARI SRS
```
You are an agentic AI software developer.
We will build a runnable frontend prototype for SAMI-SMK (Sistem Analisis Minat Siswa SMK), a responsive web application that maps new students' interests toward SMK majors.

Start from Phase 1.
Read this document first: srs.md
Use srs.md as Source of Truth #1.
Use it to determine: system scope, user roles (Siswa, Guru BK, Orang Tua, Admin), allowed features, business rules, validation rules, data objects, constraints, and out-of-scope items.

Do not invent features outside srs.md. Do not implement real auth server, email/SMS sending, PPDB/admission features, multi-school support, questionnaire re-filling, or any ability for Guru BK to modify the original questionnaire scores, unless explicitly required in srs.md.

After reading srs.md, continue preparing the frontend prototype implementation based only on the allowed scope.
```

### PROMPT 2 — PHASE 2A: INFORMATION ARCHITECTURE
```
Continue to Phase 2A.
Read this document: information_architecture.md
Use information_architecture.md as Source of Truth #2.
Use it to determine: application pages, route structure, sidebar and bottom/hamburger navigation, page hierarchy, entry points, exit points, and authenticated/unauthenticated pages for each role.

Implement the application routing and global layout according to this document, including role-based protected routes. Do not create pages or routes outside information_architecture.md.
```

### PROMPT 3 — PHASE 2B: DESIGN SYSTEM
```
Continue to Phase 2B.
Read this document: design_system.md
Use design_system.md as Source of Truth #3.
Use it to determine: visual style, colors (light blue + white theme), typography (Poppins for headings, Inter for body), spacing, border radius, layout, buttons, inputs, tables, cards, charts, empty states, error states, loading states, and responsive behavior.

Apply the Design System to the frontend prototype. Do not create a visual style that conflicts with design_system.md.
```

### PROMPT 4 — PHASE 2C: USER FLOWS
```
Continue to Phase 2C.
Read all User Flow documents: user_flows/index.md and user_flows/userflow_uc_001.md onward.
Also read data_model.md as supporting reference for data validation.
Use these documents as Source of Truth #4.

Use them to determine: user actions, system responses, main flows, alternative flows, exception flows, preconditions, postconditions, and acceptance criteria for: student self-registration (NISN master validation, exactly 10 digits), parent self-registration (single-use link code, strict 1:1 parent-student relation), one-time questionnaire filling (Likert 1-5, form locked permanently after submit), and BK counseling notes (Guru BK may add notes but must never change the original scores).

Implement the prototype interactions according to these user flows. Do not create interactions that are not supported by the User Flow documents.
```

### PROMPT 5 — PHASE 3: EKSEKUSI PROTOTIPE BERJALAN
```
Continue to Phase 3.
Now build and finalize the runnable frontend prototype based on all Source of Truth documents.
Use a modern frontend stack: React, Vite, Tailwind CSS, React Router.
The prototype must be runnable with: npm install & npm run dev.

Complete the prototype so the main flows from the SoT can be demonstrated for all four roles. Seed sample data including a master NISN list, sample students, questionnaire results, and active link codes so every flow can be demoed end to end.

If there are conflicts between documents, make a reasonable implementation decision, continue development, and document it in IMPLEMENTATION_NOTES.md.
Create or update: README.md and IMPLEMENTATION_NOTES.md.
Do not stop at planning. Implement, run, fix errors, and make the prototype ready for demo.
```

### Prompt baku bila agent meminta klarifikasi
```
Please read the Source of Truth documents and make the implementation decision based on them. If something is unclear, make a reasonable assumption and document it in IMPLEMENTATION_NOTES.md.
```

---

## 3. FASE 4 — PENGEMBANGAN LANJUTAN (Claude Code CLI)

Setelah prototipe berjalan, pengembangan dilanjutkan dengan Claude Code. Prompt ditulis dalam bahasa Inggris (untuk presisi teknis) dengan permintaan laporan dalam bahasa Indonesia.

**Catatan efisiensi:** sejak pertengahan fase ini, setiap prompt ditambahi instruksi agar agent **tidak** menjalankan pengujian browser sendiri (Playwright), karena sangat boros kuota. Pengujian dilakukan manual oleh pengembang di browser.

### 3.1 Migrasi ke Basis Data Terpusat (Supabase)
```
Migrate the app from localStorage to Supabase (PostgreSQL) as a central database, so data persists across devices and browsers.
Keep the existing UI and flows. Use the existing supabaseClient with the anon/publishable key.
Give me all SQL I must run myself in the Supabase SQL Editor (table creation, RLS policies, seed data) — you only have the anon key and must not attempt privileged operations.
Migrate: users, master_nisn, siswa_profiles, orang_tua_profiles, link_codes, questions, kuesioner_responses, kuesioner_results, bk_notes.
Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.2 Jurusan Dinamis (perubahan arsitektur terbesar)
```
Make the jurusan (majors) fully manageable and dynamic — support ANY number of jurusan (2, 3, 4, ...), not just the fixed two, WITHOUT breaking the existing flow.

1. Create a `jurusan` table (give me the SQL): id, kode (unique), nama, deskripsi, created_at. Seed it with the existing two. Include RLS policies for the anon key.
2. Admin page "Kelola Jurusan": list, add, edit, delete jurusan. Admin-only, added to the sidebar.
3. Link questions to jurusan (add id_jurusan to questions referencing jurusan.id). Migrate existing questions. The jurusan dropdown in "Kelola Soal" must be populated dynamically from the jurusan table.
4. DYNAMIC SCORING: rewrite scoring so it computes a score PER jurusan from the answers to that jurusan's questions — for any number of jurusan. The recommendation is the highest-scoring jurusan. Do NOT assume exactly two.
5. RESULTS storage: kuesioner_results currently has fixed columns (skor_multimedia, skor_tbsm). Change to a flexible structure (new table kuesioner_result_scores {id, id_result, id_jurusan, skor}), and give me the SQL. Migrate existing results so old data still displays.
6. DYNAMIC DISPLAY: update all result views (student result, Guru BK chart, Orang Tua view) to render one bar per jurusan dynamically.
7. ANALISIS MINAT (Guru BK): generalize the rule-based analysis to N jurusan.

Give me ALL SQL I need to run. Do NOT break the current 2 jurusan, existing questions, or existing results.
Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.3 Perubahan Metode Penilaian (skor independen per jurusan)
```
Change the questionnaire scoring from "normalized to sum 100 across all jurusan" to "each jurusan scored independently 0–100%". With many jurusan the old method made every percentage look tiny (top was only 15%).

New scoring in submitKuesioner:
1. For each jurusan, take the student's answers to THAT jurusan's questions (Likert 1–5). Compute the average, then: percentage = (average / 5) * 100.
   Example: answers 5,4,5,4,4 → avg 4.4 → 88%.
2. Each jurusan is scored on its own 0–100 scale. Percentages do NOT need to sum to 100.
3. If a jurusan has no questions, skip it; do not divide by zero.
4. rekomendasi_final = the jurusan with the highest percentage.
5. Save each jurusan's percentage to kuesioner_result_scores.skor.

Update all displays (student result bars, Guru BK chart, Orang Tua chart) and the Analisis Minat thresholds accordingly.
Do NOT run Playwright/browser tests yourself — just implement it and tell me how to test in the browser; I'll test it myself.
Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.4 Analisis Minat Dinamis untuk Guru BK
```
Restore and generalize the Guru BK "Analisis Minat" card so it works AUTOMATICALLY for ANY jurusan — including jurusan added in the future — without any code changes per jurusan. The explanation must be generated dynamically from data, never hardcoded to specific jurusan names.

1. Read the student's per-jurusan scores from kuesioner_result_scores joined to jurusan.
2. Determine the TOP jurusan and the gap to the second-highest.
3. Generate the explanation using jurusan.nama pulled from the data, e.g. "Siswa ini jelas condong ke bidang {nama_jurusan_tertinggi} ({skor}%)..." — so if a NEW jurusan has the highest score, the card automatically says that jurusan.
4. 3-tier interpretation based on the top score and the gap: "jelas condong" / "cenderung" / "seimbang".
5. Include short practical follow-up suggestions for the Guru BK.
6. Render on the Guru BK student-detail page, Guru BK ONLY (never student/parent), with a note that the final decision remains the Guru BK's judgment.

Do NOT run Playwright/browser tests yourself. Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.5 Hapus Jurusan yang Aman (hapus pintar / arsip)
```
Implement a smart "Hapus" for jurusan so the app can be cleaned up safely while protecting real student data.

Keep the button labeled "Hapus". When Admin clicks it (with confirmation):
- Check if the jurusan is still referenced by any questions OR any kuesioner_result_scores.
- If NOT referenced: delete the jurusan row permanently (clean delete).
- If it IS referenced: do NOT hard-delete. Soft-delete it: set is_active = false (archive), so it disappears from all new activity (questionnaire, Kelola Soal dropdown, new scoring) but existing student results that reference it still display correctly.
- Show a friendly Indonesian message for each case.

Everywhere jurusan are used for NEW activity, only use jurusan where is_active = true. Existing results referencing an inactive jurusan must STILL display correctly.
Give me the SQL (alter table jurusan add column is_active boolean not null default true).
Do NOT run Playwright/browser tests yourself. Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.6 Penghapusan Siswa yang Bersih (integritas data)
```
When an Admin deletes a student, ALL of that student's related data must be deleted too, so no orphan rows remain. This must include the new tables from the dynamic-jurusan migration.

Update BOTH single delete and the bulk "Kosongkan Semua Data Siswa" to remove, in correct foreign-key order:
1. kuesioner_result_scores (for that student's results) — NEW table, must be included
2. bk_notes  3. kuesioner_responses  4. kuesioner_results  5. link_codes
6. orang_tua_profiles linked to this student, AND the linked orang_tua user account
7. siswa_profiles  8. the student's users row
Then set that student's master_nisn.is_claimed = false so the NISN can be reused.

Keep the confirmation dialogs (single: "Apakah Anda yakin?"; bulk: type-to-confirm safeguard).
Do NOT run Playwright/browser tests yourself. Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.7 Pengelolaan Bank Soal + Hapus Massal
```
Add a MULTI-SELECT / BULK DELETE feature to the Admin "Kelola Soal Kuesioner" page.

1. Add a checkbox to each question row (desktop table and mobile card view), plus a "select all" checkbox.
2. Show a bulk action bar when questions are selected: "N soal dipilih" with a "Hapus Terpilih" button.
3. Clicking "Hapus Terpilih" shows a confirmation dialog before deleting.
4. IMPORTANT: some selected questions may already have student answers (kuesioner_responses referencing them). For each selected question, delete its related kuesioner_responses first (correct FK order), then delete the question — so bulk delete works even for answered questions, with no foreign-key errors.
5. After deletion, show a summary, clear the selection, and re-fetch the list.
6. Keep the existing single "Hapus" per-row action as well.

Do NOT run Playwright/browser tests yourself. Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.8 Impor Excel (NISN, Jurusan, Soal) + Template
```
Add Excel/CSV bulk import for both QUESTIONS (soal) and JURUSAN in the Admin area, similar to the existing Data Master NISN import.

PART A — Import Soal: on "Kelola Soal Kuesioner", add an "Impor Soal" button (.xlsx/.csv). Expected columns: teks_pertanyaan, kode_jurusan. Look up the jurusan by kode (only ACTIVE jurusan) and insert the question with that id_jurusan. Do NOT send an id (let the DB auto-generate). If a kode_jurusan doesn't match, skip that row and report it. Show a summary after import.

PART B — Import Jurusan: on "Kelola Jurusan", add an "Impor Jurusan" button. Expected columns: kode, nama, deskripsi. Skip duplicate kode and report it.

For all three import features (NISN, Soal, Jurusan), add a "Unduh Template" button that downloads an .xlsx with the exact headers the import parser expects, plus 1-2 example rows. Verify each import parser's expected column names in the code and make the templates match them precisely.

Do NOT run Playwright/browser tests yourself. Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.9 Perbaikan Bug: Isolasi Data Dasbor Guru BK
```
Bug on the Guru BK dashboard: the summary cards are inconsistent. "Total Siswa" correctly shows only the logged-in Guru BK's assigned students (0), but the recommendation cards ("Rekom. {jurusan}") are counting students from OTHER Guru BK too — showing "Total Siswa = 0" but "Rekom. Multimedia/DKV = 1".

Fix: ALL summary cards on the Guru BK dashboard must count ONLY students assigned to the currently logged-in Guru BK (filter by id_guru_bk). This includes Total Siswa, Sudah/Belum Kuesioner, and every per-jurusan "Rekom." card. If Total Siswa = 0, every Rekom card must also be 0.
Keep the per-jurusan Rekom cards dynamic (one card per jurusan, any number of jurusan).

Do NOT run Playwright/browser tests yourself. Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

### 3.10 Perbaikan Bug: Integritas Foreign Key & Sequence
```
Two bugs after the dynamic-jurusan migration:

BUG 1 — Deleting a question fails with foreign key error: "update or delete on table questions violates foreign key constraint kuesioner_responses_id_soal_fkey". Fix deleteQuestion: before deleting the question, delete its related rows in kuesioner_responses first (correct FK order), then the question. Keep the confirmation dialog.

BUG 2 — Submitting the questionnaire fails with "duplicate key value violates unique constraint unique_siswa_soal" in submitKuesioner. Fix it: delete the student's existing kuesioner_responses before inserting the new ones, so re-submitting never crashes. After submit, per-jurusan scores must save to kuesioner_result_scores and the result must display.

Give me any SQL I need to run. Do NOT run Playwright/browser tests yourself. Report in Indonesian. Update IMPLEMENTATION_NOTES.md.
```

**Catatan:** bug "duplicate key value violates unique constraint questions_pkey" saat menambah soal ternyata bukan kesalahan kode, melainkan sequence auto-increment yang tertinggal karena seed memakai `id` eksplisit. Diperbaiki dengan SQL berikut yang dijalankan sendiri oleh pengembang di Supabase SQL Editor:
```sql
SELECT setval(pg_get_serial_sequence('questions','id'),
              (SELECT COALESCE(MAX(id),0) FROM questions) + 1, false);
```

---

## 4. PRINSIP PENGGUNAAN PROMPT

| Prinsip | Alasan |
| --- | --- |
| Prompt ditulis dalam bahasa Inggris | Presisi istilah teknis lebih terjaga |
| Meminta laporan dalam bahasa Indonesia | Memudahkan verifikasi oleh pengembang |
| Satu prompt = satu masalah terfokus | Mengurangi kesalahan dan menghemat kuota |
| Melarang agent menjalankan pengujian browser | Pengujian Playwright sangat boros kuota; pengujian dilakukan manual |
| Seluruh SQL dijalankan sendiri oleh pengembang | Agent hanya memiliki anon key; perubahan skema basis data tidak diserahkan ke agent |
| Selalu meminta pembaruan IMPLEMENTATION_NOTES.md | Menjaga rekam jejak keputusan implementasi |
| Verifikasi hasil di browser, bukan sekadar percaya laporan agent | Agent pernah melaporkan "sudah benar" untuk hal yang ternyata masih bermasalah |

---

## 5. REVISION HISTORY

| Version | Date | Description |
| --- | --- | --- |
| 1.0 | 2026-06-17 | Rekaman 5 prompt awal (Phase 1–3) dengan OpenCode; paradigma dua jurusan tetap |
| 2.0 | 2026-07-05 | Menambahkan Fase 4 (Claude Code CLI): jurusan dinamis, perubahan metode penilaian, Analisis Minat dinamis, hapus pintar jurusan, penghapusan siswa bersih, hapus massal soal, impor Excel, dan perbaikan bug. Menambahkan catatan alat yang dipakai dan prinsip penggunaan prompt |
