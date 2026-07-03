const JELAS_CONDONG_THRESHOLD = 65;
const CENDERUNG_THRESHOLD = 55;

export function analisisMinat(skorMultimedia, skorTbsm) {
  if (skorMultimedia == null || skorTbsm == null) return null;

  const isMultimedia = skorMultimedia >= skorTbsm;
  const dominantField = isMultimedia ? "Multimedia / DKV" : "TBSM";
  const dominantScore = isMultimedia ? skorMultimedia : skorTbsm;

  let category, label, text;

  if (dominantScore >= JELAS_CONDONG_THRESHOLD) {
    category = "jelas_condong";
    label = "Jelas Condong";
    text = `Siswa menunjukkan kecenderungan kuat ke bidang ${dominantField} (${dominantScore}%). Pola jawabannya mengindikasikan minat yang konsisten pada bidang ini. Saran: arahkan eksplorasi siswa ke ${dominantField}, dan konfirmasikan singkat saat konseling.`;
  } else if (dominantScore >= CENDERUNG_THRESHOLD) {
    category = "cenderung";
    label = "Cenderung";
    text = `Siswa cenderung ke bidang ${dominantField} (${dominantScore}%), namun belum terlalu kuat. Saran: lakukan obrolan singkat untuk memastikan minat ini, dan perhatikan apakah ada ketertarikan di bidang lain.`;
  } else {
    category = "seimbang";
    label = "Seimbang";
    text = `Minat siswa relatif seimbang antara Multimedia/DKV (${skorMultimedia}%) dan TBSM (${skorTbsm}%). Hasil kuesioner saja belum cukup untuk menentukan arah. Saran: (a) lakukan wawancara personal untuk menggali pengalaman, hobi, dan cita-cita siswa — tanyakan kegiatan apa yang paling ia nikmati dan mengapa; (b) jika masih belum jelas, beri kesempatan mencoba pengalaman nyata di kedua bidang (mis. praktik singkat di bengkel dan di studio kreatif) sebelum memutuskan; (c) pertimbangkan faktor pendukung lain seperti nilai akademik mata pelajaran terkait dan dukungan keluarga.`;
  }

  const badgeColor = category === "jelas_condong" ? "green" : category === "cenderung" ? "blue" : category === "seimbang" ? "orange" : "gray";
  const badgeLabel = category === "jelas_condong" ? "Prioritas Rendah" : category === "cenderung" ? "Cenderung" : category === "seimbang" ? "Perlu Perhatian" : "Belum Mengisi";
  const priority = category === "seimbang" ? 0 : category === "cenderung" ? 1 : 2;

  return { category, label, text, dominantField, dominantScore, badgeColor, badgeLabel, priority };
}
