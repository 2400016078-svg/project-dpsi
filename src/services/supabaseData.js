import { v4 as uuid } from "uuid";
import { supabase } from "../lib/supabaseClient";

export async function getJurusan() {
  const { data, error } = await supabase
    .from("jurusan")
    .select("*")
    .order("created_at");
  if (error) {
    console.error("getJurusan error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

// Only jurusan available for new activity (questionnaire, new question assignment,
// new submission scoring) — excludes deactivated jurusan while leaving their historical
// questions/results untouched.
export async function getActiveJurusan() {
  const { data, error } = await supabase
    .from("jurusan")
    .select("*")
    .eq("is_active", true)
    .order("created_at");
  if (error) {
    console.error("getActiveJurusan error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function addJurusan(kode, nama, deskripsi) {
  const { data, error } = await supabase
    .from("jurusan")
    .insert({ kode, nama, deskripsi: deskripsi || null })
    .select()
    .single();
  if (error) {
    console.error("addJurusan error:", error.message, error.details, error.hint);
    return { success: false, code: error.code === "23505" ? "DUPLICATE_KODE" : "INSERT_FAILED" };
  }
  return { success: true, message: "Jurusan berhasil ditambahkan.", data };
}

export async function updateJurusan(id, kode, nama, deskripsi) {
  const { error } = await supabase
    .from("jurusan")
    .update({ kode, nama, deskripsi: deskripsi || null })
    .eq("id", id);
  if (error) {
    console.error("updateJurusan error:", error.message, error.details, error.hint);
    return { success: false, code: error.code === "23505" ? "DUPLICATE_KODE" : "UPDATE_FAILED" };
  }
  return { success: true, message: "Jurusan berhasil diperbarui." };
}

// Soft delete: deactivating never touches `questions` or `kuesioner_result_scores`,
// so historical soal/hasil kuesioner referencing this jurusan stay 100% intact and
// keep displaying correctly.
export async function deactivateJurusan(id) {
  const { error } = await supabase.from("jurusan").update({ is_active: false }).eq("id", id);
  if (error) {
    console.error("deactivateJurusan error:", error.message, error.details, error.hint);
    return { success: false, code: "DEACTIVATE_FAILED", message: "Gagal menonaktifkan jurusan. Silakan coba lagi." };
  }
  return { success: true, message: "Jurusan berhasil dinonaktifkan. Soal dan hasil kuesioner yang sudah ada tetap tersimpan." };
}

export async function activateJurusan(id) {
  const { error } = await supabase.from("jurusan").update({ is_active: true }).eq("id", id);
  if (error) {
    console.error("activateJurusan error:", error.message, error.details, error.hint);
    return { success: false, code: "ACTIVATE_FAILED", message: "Gagal mengaktifkan jurusan. Silakan coba lagi." };
  }
  return { success: true, message: "Jurusan berhasil diaktifkan kembali." };
}

// Smart "Hapus": clean hard-delete when nothing references this jurusan anymore;
// otherwise falls back to the soft-delete (deactivate) above so existing questions/
// results never break. Admin always sees the row disappear from the active list either
// way — the choice between hard/soft delete is invisible except for the result message.
export async function deleteJurusan(id) {
  const { count: qCount, error: qErr } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("id_jurusan", id);
  if (qErr) {
    console.error("deleteJurusan check questions error:", qErr.message, qErr.details, qErr.hint);
    return { success: false, code: "CHECK_FAILED", message: "Gagal memeriksa data terkait. Silakan coba lagi." };
  }

  const { count: rCount, error: rErr } = await supabase
    .from("kuesioner_result_scores")
    .select("id", { count: "exact", head: true })
    .eq("id_jurusan", id);
  if (rErr) {
    console.error("deleteJurusan check results error:", rErr.message, rErr.details, rErr.hint);
    return { success: false, code: "CHECK_FAILED", message: "Gagal memeriksa data terkait. Silakan coba lagi." };
  }

  if (qCount > 0 || rCount > 0) {
    const res = await deactivateJurusan(id);
    if (!res.success) return res;
    return { success: true, archived: true, message: "Jurusan diarsipkan karena masih dipakai data siswa; data siswa tetap aman." };
  }

  const { error } = await supabase.from("jurusan").delete().eq("id", id);
  if (error) {
    console.error("deleteJurusan error:", error.message, error.details, error.hint);
    return { success: false, code: "DELETE_FAILED", message: "Gagal menghapus jurusan. Silakan coba lagi." };
  }
  return { success: true, archived: false, message: "Jurusan dihapus." };
}

export async function getQuestions() {
  const { data, error } = await supabase
    .from("questions")
    .select("*, jurusan(id, kode, nama, created_at, is_active)")
    .order("id");
  if (error) {
    console.error("getQuestions error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

// Questions belonging to an active jurusan only — used to build a NEW questionnaire
// attempt and to score a NEW submission, so a deactivated jurusan's questions never
// appear for future students while past answers/results referencing them are untouched.
export async function getActiveQuestions() {
  const questions = await getQuestions();
  return questions.filter((q) => q.jurusan?.is_active === true);
}

export async function addQuestion(teksPertanyaan, idJurusan) {
  const { data, error } = await supabase
    .from("questions")
    .insert({ teks_pertanyaan: teksPertanyaan, id_jurusan: idJurusan })
    .select()
    .single();
  if (error) {
    console.error("addQuestion error:", error.message, error.details, error.hint);
    return { success: false, code: "INSERT_FAILED" };
  }
  return { success: true, message: "Soal berhasil ditambahkan.", data };
}

export async function updateQuestion(id, teksPertanyaan, idJurusan) {
  const { error } = await supabase
    .from("questions")
    .update({ teks_pertanyaan: teksPertanyaan, id_jurusan: idJurusan })
    .eq("id", id);
  if (error) {
    console.error("updateQuestion error:", error.message, error.details, error.hint);
    return { success: false, code: "UPDATE_FAILED" };
  }
  return { success: true, message: "Soal berhasil diperbarui." };
}

export async function deleteQuestion(id) {
  // Student answers reference this question via a FK (kuesioner_responses_id_soal_fkey),
  // so they must be removed first or the question delete fails with a FK violation.
  const { error: respErr } = await supabase
    .from("kuesioner_responses")
    .delete()
    .eq("id_soal", id);
  if (respErr) {
    console.error("deleteQuestion responses error:", respErr.message, respErr.details, respErr.hint);
    return { success: false, code: "DELETE_FAILED" };
  }

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("deleteQuestion error:", error.message, error.details, error.hint);
    return { success: false, code: "DELETE_FAILED" };
  }
  return { success: true, message: "Soal berhasil dihapus." };
}

// Bulk version of deleteQuestion() for multi-select delete on Kelola Soal. Same FK-safe
// order (kuesioner_responses before questions) but batched with .in() across every
// selected id in 2 queries total instead of looping deleteQuestion() per id (2*N
// queries) — works identically for questions that already have student answers.
export async function deleteQuestionsBulk(ids) {
  if (!ids || ids.length === 0) return { success: true, message: "Tidak ada soal yang dipilih.", deletedCount: 0 };

  const { error: respErr } = await supabase
    .from("kuesioner_responses")
    .delete()
    .in("id_soal", ids);
  if (respErr) {
    console.error("deleteQuestionsBulk responses error:", respErr.message, respErr.details, respErr.hint);
    return { success: false, code: "DELETE_FAILED" };
  }

  const { error } = await supabase
    .from("questions")
    .delete()
    .in("id", ids);
  if (error) {
    console.error("deleteQuestionsBulk error:", error.message, error.details, error.hint);
    return { success: false, code: "DELETE_FAILED" };
  }
  return { success: true, message: `${ids.length} soal berhasil dihapus.`, deletedCount: ids.length };
}

// Score rows come back nested per-result; flatten and sort by the jurusan's
// creation order so color/position stays stable across every chart (never
// re-ordered by score value — see dataviz skill "color follows identity").
function mapResultScores(rawScores) {
  return (rawScores || [])
    // `s.jurusan` is missing if the FK embed genuinely found nothing (shouldn't happen
    // in practice, but skip rather than crash); `s.skor` is coerced with Number() since
    // Postgres numeric columns can come back as strings, and any row that still ends up
    // non-finite (null/undefined/garbage from a very old row) is dropped rather than fed
    // into downstream sorting/threshold math (Chart, analisisMinat) as NaN.
    .filter((s) => s.jurusan && Number.isFinite(Number(s.skor)))
    .map((s) => ({ id_jurusan: s.id_jurusan, kode: s.jurusan.kode, nama: s.jurusan.nama, skor: Number(s.skor), created_at: s.jurusan.created_at }))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export async function getResultBySiswaId(siswaId) {
  const { data, error } = await supabase
    .from("kuesioner_results")
    .select("*, kuesioner_result_scores(id_jurusan, skor, jurusan(id, kode, nama, created_at))")
    .eq("id_siswa", siswaId)
    .maybeSingle();
  if (error) {
    console.error("getResultBySiswaId error:", error.message, error.details, error.hint);
    return null;
  }
  if (!data) return null;
  return { ...data, scores: mapResultScores(data.kuesioner_result_scores) };
}

export async function getResults() {
  const { data, error } = await supabase
    .from("kuesioner_results")
    .select("*, kuesioner_result_scores(id_jurusan, skor, jurusan(id, kode, nama, created_at))");
  if (error) {
    console.error("getResults error:", error.message, error.details, error.hint);
    return [];
  }
  return (data || []).map((r) => ({ ...r, scores: mapResultScores(r.kuesioner_result_scores) }));
}

export async function getNotesByResultId(resultId) {
  const { data, error } = await supabase
    .from("bk_notes")
    .select("*")
    .eq("id_result", resultId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getNotesByResultId error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function getBkNotes() {
  const { data, error } = await supabase
    .from("bk_notes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getBkNotes error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function getOrtuProfiles() {
  const { data, error } = await supabase
    .from("orang_tua_profiles")
    .select("*");
  if (error) {
    console.error("getOrtuProfiles error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function addBkNote(idResult, idGuruBk, teks) {
  if (!teks || teks.trim() === "") return { success: false, code: "CATATAN_KOSONG" };
  const newNote = {
    id: uuid(),
    id_result: idResult,
    id_guru_bk: idGuruBk,
    teks_catatan: teks.trim(),
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("bk_notes").insert(newNote);
  if (error) {
    console.error("addBkNote error:", error.message, error.details, error.hint);
    return { success: false, code: "INSERT_FAILED" };
  }
  return {
    success: true,
    message: "Catatan intervensi konseling Guru BK berhasil disimpan.",
    data: newNote,
  };
}

export async function getSiswaProfiles() {
  const { data, error } = await supabase
    .from("siswa_profiles")
    .select("*");
  if (error) {
    console.error("getSiswaProfiles error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function getSiswaByAngkatan(angkatan) {
  const { data, error } = await supabase
    .from("siswa_profiles")
    .select("*")
    .eq("angkatan_tahun", angkatan);
  if (error) {
    console.error("getSiswaByAngkatan error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function getAllAngkatans() {
  const { data: profiles, error } = await supabase
    .from("siswa_profiles")
    .select("angkatan_tahun");
  if (error) {
    console.error("getAllAngkatans error:", error.message, error.details, error.hint);
    return [];
  }
  const angkatans = [...new Set((profiles || []).map((p) => p.angkatan_tahun))];
  return angkatans.sort((a, b) => b - a);
}

export async function getStudentsBimbingan(angkatan, idGuruBk) {
  let query = supabase
    .from("siswa_profiles")
    .select("*")
    .eq("angkatan_tahun", angkatan);
  if (idGuruBk) query = query.eq("id_guru_bk", idGuruBk);
  const { data: siswas, error: siswaErr } = await query;
  if (siswaErr) {
    console.error("getStudentsBimbingan siswa error:", siswaErr.message, siswaErr.details, siswaErr.hint);
    return [];
  }
  const results = await getResults();
  const { data: notes, error: notesErr } = await supabase
    .from("bk_notes")
    .select("*");
  if (notesErr) {
    console.error("getStudentsBimbingan notes error:", notesErr.message, notesErr.details, notesErr.hint);
  }
  const notesData = notes || [];
  return (siswas || []).map((s) => {
    const result = results.find((r) => r.id_siswa === s.id);
    const hasNote = result ? notesData.some((n) => n.id_result === result.id) : false;
    return {
      siswa_id: s.id,
      nisn: s.nisn,
      nama_siswa: s.nama_siswa,
      angkatan: s.angkatan_tahun,
      status_kuesioner: s.status_kuesioner,
      rekomendasi_sistem: result ? result.rekomendasi_final : "-",
      status_catatan_bk: hasNote ? "sudah_diberikan" : "belum_diberikan",
      scores: result ? result.scores : [],
      id_result: result ? result.id : null,
    };
  });
}

export async function getSiswaByGuruBk(guruBkUserId) {
  const { data, error } = await supabase
    .from("siswa_profiles")
    .select("*")
    .eq("id_guru_bk", guruBkUserId);
  if (error) {
    console.error("getSiswaByGuruBk error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function getGuruBkLoadForAngkatan(angkatan) {
  const { data, error } = await supabase
    .from("master_nisn")
    .select("id_guru_bk")
    .eq("angkatan_tahun", angkatan);
  if (error) {
    console.error("getGuruBkLoadForAngkatan error:", error.message, error.details, error.hint);
    return {};
  }
  const counts = {};
  for (const row of data || []) {
    if (row.id_guru_bk) counts[row.id_guru_bk] = (counts[row.id_guru_bk] || 0) + 1;
  }
  return counts;
}

export function getSmallestGuruBk(loads, guruBkIds) {
  let min = Infinity;
  let best = guruBkIds[0];
  for (const gId of guruBkIds) {
    const c = loads[gId] || 0;
    if (c < min) { min = c; best = gId; }
  }
  return best;
}

export async function insertMasterNisnBatch(rows) {
  const { error } = await supabase.from("master_nisn").insert(rows);
  if (error) {
    console.error("insertMasterNisnBatch error:", error.message, error.details, error.hint);
    return { success: false, code: "INSERT_FAILED" };
  }
  return { success: true };
}

// Bulk import — rows: [{ teks_pertanyaan, id_jurusan }]. No `id` sent, same reasoning
// as addQuestion(): let the DB serial default assign it (see § 47 sequence bug).
export async function insertQuestionsBatch(rows) {
  const { error } = await supabase.from("questions").insert(rows);
  if (error) {
    console.error("insertQuestionsBatch error:", error.message, error.details, error.hint);
    return { success: false, code: "INSERT_FAILED" };
  }
  return { success: true };
}

// Bulk import — rows: [{ kode, nama, deskripsi }]. `is_active` is left unset so the
// column default (true) applies; `id`/`created_at` are DB-generated.
export async function insertJurusanBatch(rows) {
  const { error } = await supabase.from("jurusan").insert(rows);
  if (error) {
    console.error("insertJurusanBatch error:", error.message, error.details, error.hint);
    return { success: false, code: "INSERT_FAILED" };
  }
  return { success: true };
}

export async function submitKuesioner(siswaId, responses) {
  const existing = await getResultBySiswaId(siswaId);
  if (existing) return { success: false, code: "QUESTIONNAIRE_ALREADY_SUBMITTED" };
  if (!responses || responses.length === 0) return { success: false, code: "INCOMPLETE" };

  const [questions, jurusanList] = await Promise.all([getActiveQuestions(), getActiveJurusan()]);

  const countByJurusan = {};
  const sumByJurusan = {};
  for (const j of jurusanList) {
    countByJurusan[j.id] = 0;
    sumByJurusan[j.id] = 0;
  }
  for (const q of questions) {
    if (q.id_jurusan && Object.prototype.hasOwnProperty.call(countByJurusan, q.id_jurusan)) {
      countByJurusan[q.id_jurusan] += 1;
    }
  }

  const newResponses = responses.map((r) => {
    const q = questions.find((qq) => qq.id === r.id_soal);
    if (q?.id_jurusan && Object.prototype.hasOwnProperty.call(sumByJurusan, q.id_jurusan)) {
      sumByJurusan[q.id_jurusan] += r.nilai_jawaban;
    }
    return { id: uuid(), id_siswa: siswaId, id_soal: r.id_soal, nilai_jawaban: r.nilai_jawaban };
  });

  // A previous attempt for this student may have inserted some responses (e.g. a
  // failed submit before this point) without ever creating a kuesioner_results row,
  // which would otherwise have short-circuited via the `existing` check above. Clear
  // any such leftovers first so the insert below never hits unique_siswa_soal.
  const { error: cleanupErr } = await supabase.from("kuesioner_responses").delete().eq("id_siswa", siswaId);
  if (cleanupErr) {
    console.error("submitKuesioner cleanup error:", cleanupErr.message, cleanupErr.details, cleanupErr.hint);
    return { success: false, code: "INSERT_FAILED" };
  }

  const { error: respErr } = await supabase.from("kuesioner_responses").insert(newResponses);
  if (respErr) {
    console.error("submitKuesioner responses error:", respErr.message, respErr.details, respErr.hint);
    return { success: false, code: "INSERT_FAILED" };
  }

  // Each jurusan is scored independently on its own 0-100 scale: the average of the
  // student's Likert (1-5) answers to THAT jurusan's questions, scaled to a percentage
  // (avg / 5 * 100). Percentages do NOT sum to 100 across jurusan - a student who
  // answers strongly across the board can score high on every jurusan at once, and
  // adding more jurusan to the questionnaire no longer shrinks everyone else's score.
  // Jurusan with no answered questions are skipped entirely (never divide by zero).
  const scorePerJurusan = jurusanList
    .filter((j) => countByJurusan[j.id] > 0)
    .map((j) => {
      const avg = sumByJurusan[j.id] / countByJurusan[j.id];
      return {
        id_jurusan: j.id,
        nama: j.nama,
        skor: Math.round((avg / 5) * 100 * 100) / 100,
      };
    });

  // jurusanList is ordered by created_at ascending, so a strict `>` here keeps the
  // earliest-created jurusan as the winner on ties instead of the last one found.
  const rekomendasi = scorePerJurusan.reduce(
    (top, s) => (!top || s.skor > top.skor ? s : top),
    null,
  );

  const newResult = {
    id: uuid(),
    id_siswa: siswaId,
    rekomendasi_final: rekomendasi ? rekomendasi.nama : null,
  };

  const { error: resultErr } = await supabase.from("kuesioner_results").insert(newResult);
  if (resultErr) {
    console.error("submitKuesioner result error:", resultErr.message, resultErr.details, resultErr.hint);
    return { success: false, code: "INSERT_FAILED" };
  }

  const scoreRows = scorePerJurusan.map((s) => ({
    id_result: newResult.id,
    id_jurusan: s.id_jurusan,
    skor: s.skor,
  }));
  const { error: scoreErr } = await supabase.from("kuesioner_result_scores").insert(scoreRows);
  if (scoreErr) {
    console.error("submitKuesioner scores error:", scoreErr.message, scoreErr.details, scoreErr.hint);
    // The kuesioner_results row above already committed. Without this cleanup it would
    // become a permanent orphan (rekomendasi_final set, zero scores) - the student can
    // never resubmit because getResultBySiswaId() would find it and short-circuit as
    // "already submitted", yet its scores array stays empty forever (Chart/Analisis Minat
    // both render as if the student hasn't answered anything). Deleting it here lets the
    // student retry from a clean slate instead.
    await supabase.from("kuesioner_results").delete().eq("id", newResult.id);
    return { success: false, code: "INSERT_FAILED" };
  }

  const { error: updateErr } = await supabase
    .from("siswa_profiles")
    .update({ status_kuesioner: "selesai" })
    .eq("id", siswaId);
  if (updateErr) {
    console.error("submitKuesioner update error:", updateErr.message, updateErr.details, updateErr.hint);
  }

  return {
    success: true,
    message: "Kuesioner berhasil dikalkulasi dan status Anda telah dikunci.",
    data: {
      id_hasil: newResult.id,
      id_siswa: newResult.id_siswa,
      rekomendasi_final: newResult.rekomendasi_final,
      scores: scorePerJurusan,
    },
  };
}
