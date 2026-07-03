import { v4 as uuid } from "uuid";
import { supabase } from "../lib/supabaseClient";

export async function getQuestions() {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("id");
  if (error) {
    console.error("getQuestions error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
}

export async function getResultBySiswaId(siswaId) {
  const { data, error } = await supabase
    .from("kuesioner_results")
    .select("*")
    .eq("id_siswa", siswaId)
    .maybeSingle();
  if (error) {
    console.error("getResultBySiswaId error:", error.message, error.details, error.hint);
    return null;
  }
  return data;
}

export async function getResults() {
  const { data, error } = await supabase
    .from("kuesioner_results")
    .select("*");
  if (error) {
    console.error("getResults error:", error.message, error.details, error.hint);
    return [];
  }
  return data || [];
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
  const { data: results, error: resultsErr } = await supabase
    .from("kuesioner_results")
    .select("*");
  if (resultsErr) {
    console.error("getStudentsBimbingan results error:", resultsErr.message, resultsErr.details, resultsErr.hint);
  }
  const { data: notes, error: notesErr } = await supabase
    .from("bk_notes")
    .select("*");
  if (notesErr) {
    console.error("getStudentsBimbingan notes error:", notesErr.message, notesErr.details, notesErr.hint);
  }
  const resultsData = results || [];
  const notesData = notes || [];
  return (siswas || []).map((s) => {
    const result = resultsData.find((r) => r.id_siswa === s.id);
    const hasNote = result ? notesData.some((n) => n.id_result === result.id) : false;
    return {
      siswa_id: s.id,
      nisn: s.nisn,
      nama_siswa: s.nama_siswa,
      angkatan: s.angkatan_tahun,
      status_kuesioner: s.status_kuesioner,
      rekomendasi_sistem: result ? result.rekomendasi_final : "-",
      status_catatan_bk: hasNote ? "sudah_diberikan" : "belum_diberikan",
      skor_multimedia: result ? result.skor_multimedia : 0,
      skor_tbsm: result ? result.skor_tbsm : 0,
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

export async function submitKuesioner(siswaId, responses) {
  const existing = await getResultBySiswaId(siswaId);
  if (existing) return { success: false, code: "QUESTIONNAIRE_ALREADY_SUBMITTED" };
  if (!responses || responses.length === 0) return { success: false, code: "INCOMPLETE" };

  const questions = await getQuestions();
  let totalMultimedia = 0;
  let totalTbsm = 0;

  const newResponses = responses.map((r) => {
    const q = questions.find((qq) => qq.id === r.id_soal);
    if (q && q.klaster_jurusan === "multimedia_dkv") totalMultimedia += r.nilai_jawaban;
    else if (q && q.klaster_jurusan === "tbsm") totalTbsm += r.nilai_jawaban;
    return { id: uuid(), id_siswa: siswaId, id_soal: r.id_soal, nilai_jawaban: r.nilai_jawaban };
  });

  const { error: respErr } = await supabase.from("kuesioner_responses").insert(newResponses);
  if (respErr) {
    console.error("submitKuesioner responses error:", respErr.message, respErr.details, respErr.hint);
    return { success: false, code: "INSERT_FAILED" };
  }

  const totalPoints = totalMultimedia + totalTbsm;
  const skorMultimedia = totalPoints > 0 ? Math.round((totalMultimedia / totalPoints) * 100 * 100) / 100 : 0;
  const skorTbsm = totalPoints > 0 ? Math.round((totalTbsm / totalPoints) * 100 * 100) / 100 : 0;
  const rekomendasi = skorMultimedia >= skorTbsm ? "Multimedia / DKV" : "TBSM";

  const newResult = {
    id: uuid(),
    id_siswa: siswaId,
    skor_multimedia: skorMultimedia,
    skor_tbsm: skorTbsm,
    rekomendasi_final: rekomendasi,
  };

  const { error: resultErr } = await supabase.from("kuesioner_results").insert(newResult);
  if (resultErr) {
    console.error("submitKuesioner result error:", resultErr.message, resultErr.details, resultErr.hint);
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
      skor_multimedia: newResult.skor_multimedia,
      skor_tbsm: newResult.skor_tbsm,
      rekomendasi_final: newResult.rekomendasi_final,
    },
  };
}
