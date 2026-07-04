// Fixed-order categorical palette (validated for CVD-safety, see dataviz skill).
// Slot 1-2 intentionally match the original Multimedia/DKV (blue) & TBSM (teal) colors
// so the existing 2-jurusan look is unchanged; slots 3+ extend for any new jurusan.
export const JURUSAN_COLORS = [
  { hex: "#2563EB", bg: "bg-blue-50", text: "text-primary-medium" },
  { hex: "#0D9488", bg: "bg-accent-teal-light", text: "text-accent-teal" },
  { hex: "#EA580C", bg: "bg-accent-orange-light", text: "text-accent-orange" },
  { hex: "#7C3AED", bg: "bg-purple-50", text: "text-purple-600" },
  { hex: "#DB2777", bg: "bg-pink-50", text: "text-pink-600" },
  { hex: "#D97706", bg: "bg-amber-50", text: "text-amber-600" },
];

export function getJurusanColor(index) {
  return JURUSAN_COLORS[index % JURUSAN_COLORS.length];
}
