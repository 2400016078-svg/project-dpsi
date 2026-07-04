// Each jurusan's skor is now an INDEPENDENT 0-100 score (average Likert answer for
// that jurusan / 5 * 100) - scores no longer sum to 100 across jurusan, so a
// "neutral" answer of 3/5 on every question already produces a 60% baseline on
// every jurusan. Thresholds are calibrated against that baseline rather than
// against a fixed share of 100%, and work the same regardless of how many
// jurusan exist since only the top score and the gap to the runner-up matter.
const JELAS_CONDONG_THRESHOLD = 75; // top jurusan averages ~"setuju" (3.75/5) or higher
const CENDERUNG_THRESHOLD = 65; // top jurusan averages clearly above neutral (3.25/5)
// Gap (top - runner-up) needed to call the top jurusan "well ahead" rather than
// just the highest of a tight cluster. When the top few jurusan are within this
// gap of each other, the result is treated as "seimbang" regardless of how high
// the top score itself is.
const GAP_SEIMBANG = 10;

export function analisisMinat(scores) {
  if (!scores || scores.length === 0) return null;

  const sorted = [...scores].sort((a, b) => b.skor - a.skor);
  const top = sorted[0];
  const runnerUp = sorted[1];
  const gap = runnerUp ? top.skor - runnerUp.skor : top.skor;

  // "Well ahead" only matters once the top score is actually high - if the top
  // few jurusan are close together, it's balanced regardless of magnitude.
  const isWellAhead = !runnerUp || gap >= GAP_SEIMBANG;

  let category, label, text;

  if (isWellAhead && top.skor >= JELAS_CONDONG_THRESHOLD) {
    category = "jelas_condong";
    label = "Jelas Condong";
    text = `Siswa menunjukkan kecenderungan kuat ke bidang ${top.nama} (${top.skor}%), jauh di atas pilihan lainnya. Pola jawabannya mengindikasikan minat yang konsisten pada bidang ini. Saran: arahkan eksplorasi siswa ke ${top.nama}, dan konfirmasikan singkat saat konseling.`;
  } else if (isWellAhead && top.skor >= CENDERUNG_THRESHOLD) {
    category = "cenderung";
    label = "Cenderung";
    text = `Siswa cenderung ke bidang ${top.nama} (${top.skor}%), namun belum terlalu kuat dibanding pilihan lain. Saran: lakukan obrolan singkat untuk memastikan minat ini, dan perhatikan apakah ada ketertarikan di bidang lain.`;
  } else {
    category = "seimbang";
    label = "Seimbang";
    const ringkasan = sorted.map((s) => `${s.nama} (${s.skor}%)`).join(", ");
    text = `Minat siswa relatif seimbang di antara ${sorted.length} pilihan jurusan: ${ringkasan}. Hasil kuesioner saja belum cukup untuk menentukan arah. Saran: (a) lakukan wawancara personal untuk menggali pengalaman, hobi, dan cita-cita siswa — tanyakan kegiatan apa yang paling ia nikmati dan mengapa; (b) jika masih belum jelas, beri kesempatan mencoba pengalaman nyata di beberapa bidang teratas sebelum memutuskan; (c) pertimbangkan faktor pendukung lain seperti nilai akademik mata pelajaran terkait dan dukungan keluarga.`;
  }

  const badgeColor = category === "jelas_condong" ? "green" : category === "cenderung" ? "blue" : "orange";
  const badgeLabel = category === "jelas_condong" ? "Prioritas Rendah" : category === "cenderung" ? "Cenderung" : "Perlu Perhatian";
  const priority = category === "seimbang" ? 0 : category === "cenderung" ? 1 : 2;

  return { category, label, text, top, badgeColor, badgeLabel, priority };
}
