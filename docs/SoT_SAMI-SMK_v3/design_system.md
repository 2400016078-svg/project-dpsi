# Design System

- **Document Version:** v3.0
- **Project:** Sistem Analisis Minat Siswa SMK (SAMI-SMK)
- **Status:** Validated
- **Last Updated:** 5 Juli 2026
- **Source of Truth:** #3

---

## 1. DESIGN PRINCIPLES

### 1.1 Design Goals
- **Clean (Bersih):** White space cukup, minim gangguan visual saat siswa mengisi kuesioner.
- **Modern (Mutakhir):** Estetika flat dengan subtle drop shadow.
- **Friendly (Ramah):** Visual inklusif, tidak mengintimidasi siswa, nyaman untuk Orang Tua.

### 1.2 UX Principles
- Simplicity over complexity (kuesioner bertahap, navigasi tidak membingungkan).
- Consistency across screens (konsistensi tombol, warna, ukuran teks di Desktop & Mobile).
- Accessibility by default (kepatuhan kontras WCAG 2.1 AA).

---

## 2. COLOR SYSTEM

Tema utama: **Biru Muda + Putih**.

```css
:root {
  /* Primary */
  --color-primary-dark: #1E3A8A;   /* Tombol utama, judul, link aktif */
  --color-primary-medium: #2563EB; /* Hover state */
  --color-primary-light: #3B82F6;  /* Aksen / indikator aktif */

  /* Background & Tint */
  --color-bg-base: #FFFFFF;        /* Kartu & kontainer */
  --color-bg-tint: #EFF6FF;        /* Latar aplikasi (tint biru muda) */

  /* Semantic */
  --color-success: #10B981;        /* Status "Selesai" */
  --color-warning: #F59E0B;        /* Peringatan isi 1 kali */
  --color-error:   #EF4444;        /* Input kosong / gagal */
  --color-info:    #06B6D4;        /* Info klaster jurusan */

  /* Neutral */
  --color-gray-50:  #F9FAFB;
  --color-gray-200: #E5E7EB;       /* Border kartu */
  --color-gray-800: #1F2937;       /* Body text (WCAG AA) */
}
```

---

## 3. TYPOGRAPHY

### 3.1 Font Families
| Usage | Font Family | Characteristics |
|---|---|---|
| Heading (Judul) | Poppins, sans-serif | Geometris, ramah, modern. |
| Body (Isi/Form) | Inter, sans-serif | Optimal keterbacaan di HP & laptop. |

### 3.2 Typography Scale
| Token | Font | Size | Weight | Usage |
|---|---|---|---|---|
| font-h1 | Poppins | 32px | Bold (700) | Judul portal utama. |
| font-h2 | Poppins | 24px | Semi-Bold (600) | Judul kartu dasbor. |
| font-h3 | Poppins | 20px | Medium (500) | Sub-judul / sapaan personal. |
| font-body-large | Inter | 16px | Regular (400) | Teks soal kuesioner. |
| font-body | Inter | 14px | Regular (400) | Teks isi dasbor, catatan BK. |
| font-caption | Inter | 12px | Medium (500) | Label status, peringatan. |

---

## 4. SPACING & RADIUS

### 4.1 Radius Scale
| Token | Value | Usage |
|---|---|---|
| radius-sm | 4px | Tag status kuesioner. |
| radius-md | 8px | Tombol & input form. |
| radius-lg | 12px | Kartu kontainer (dashboard cards). |

**Constraint:** Hindari sudut tajam (0px) maupun bentuk kapsul penuh (pill) pada kontainer utama.

### 4.2 Spacing Scale
| Token | Value | Usage |
|---|---|---|
| spacing-xs | 4px | Jarak label–input. |
| spacing-sm | 8px | Jarak antar tombol. |
| spacing-md | 16px | Padding tombol/form. |
| spacing-lg | 24px | Padding kartu dasbor. |

---

## 5. GRID SYSTEM (RESPONSIVE)
- **Desktop:** ≥1024px, 12 kolom, gutter 24px, margin 40px.
- **Mobile:** <768px, 4 kolom, gutter 16px, margin 16px.
- **Responsive rule:** seluruh halaman wajib menyesuaikan rapi di HP, tablet, dan laptop tanpa konten terpotong. Di HP, sidebar berubah menjadi bottom navigation/hamburger; tabel reflow menjadi kartu bertumpuk atau dapat di-scroll; tombol dengan target sentuh memadai (min ~44x44px). Tampilan desktop dipertahankan.

---

## 6. COMPONENT LIBRARY

### 6.1 Button
- **Primary:** bg `#1E3A8A`, teks `#FFFFFF`. Untuk "Mulai Isi Kuesioner".
- **Secondary:** bg transparan, border `#1E3A8A`, teks `#1E3A8A`.
- **Danger:** bg `#EF4444`, teks putih (Logout).
- **States:** Default radius 8px; Hover → `#2563EB`, cursor pointer; Disabled → bg `#E5E7EB`, teks `#9CA3AF`, cursor not-allowed.

### 6.2 Dashboard Card
- bg putih `#FFFFFF`, radius 12px, border 1px `#E5E7EB`, shadow-sm.
- Untuk: kartu sapaan personal, kartu status tes, kartu statistik BK.

---

## 7. FORM & ACCESSIBILITY RULES
- Input border `#E5E7EB`; focus → border `#3B82F6` dengan ring outline halus.
- Body text `#1F2937` di atas putih/tint untuk rasio kontras minimal 4.5:1 (AA).
- Tombol utama dilarang memakai teks pudar agar tetap terbaca low-vision.

---

## 8. UI STATE RULES
- **Empty state:** tampilkan ikon/teks ramah saat data kosong (mis. belum ada siswa/catatan).
- **Error state:** gunakan `--color-error` dan pesan Bahasa Indonesia yang ramah.
- **Loading state:** skeleton/spinner sederhana saat memuat data dari basis data terpusat (state pemuatan harus selalu selesai, tidak menggantung).
- **Success state:** gunakan `--color-success` (mis. status kuesioner "Selesai").

---

## 9. REVISION HISTORY
| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 17 Juni 2026 | System Analyst | Validated. Token visual Biru Muda + Putih, Inter/Poppins. |
| 2.0 | 28 Juni 2026 | System Analyst | Aturan responsif, state pemuatan ke basis data terpusat. |
| 3.0 | 5 Juli 2026 | System Analyst | Grafik hasil ("Persentase Kecocokan") kini menampilkan satu batang per jurusan secara dinamis dengan warna berbeda per jurusan; tetap rapi di HP. Token visual tetap. |
