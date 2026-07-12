# System Logic: UC-007 Pengelolaan Jurusan Dinamis

Document Version: v1.0
Use Case ID: UC-007
Status: Draft
Last Updated: 2026-07-05
Project: SAMI-SMK

---

## 1. Overview
Logika sistem untuk pengelolaan jurusan secara dinamis oleh Admin, termasuk **penghapusan pintar**: hapus permanen bila jurusan belum terpakai, arsipkan bila sudah terpakai agar data siswa lama tetap utuh.

---

## 2. Sequence Diagram — Hapus Pintar

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Frontend
    participant SB as Supabase

    Admin->>FE: Klik "Hapus" pada sebuah jurusan
    FE-->>Admin: Dialog konfirmasi
    Admin->>FE: Konfirmasi
    FE->>SB: COUNT questions WHERE id_jurusan = ?
    FE->>SB: COUNT kuesioner_result_scores WHERE id_jurusan = ?
    alt Tidak terpakai (kedua hitungan = 0)
        FE->>SB: DELETE jurusan WHERE id = ?
        FE-->>Admin: "Jurusan dihapus."
    else Masih terpakai
        FE->>SB: UPDATE jurusan SET is_active = false WHERE id = ?
        FE-->>Admin: "Jurusan diarsipkan; data siswa tetap aman."
    end
```

---

## 3. Operasi Sistem (Supabase)

**3.1 Pemeriksaan keterpakaian**
```js
const { count: cSoal } = await supabase.from('questions')
  .select('id', { count: 'exact', head: true }).eq('id_jurusan', idJurusan);

const { count: cSkor } = await supabase.from('kuesioner_result_scores')
  .select('id', { count: 'exact', head: true }).eq('id_jurusan', idJurusan);

const terpakai = (cSoal ?? 0) > 0 || (cSkor ?? 0) > 0;
```

**3.2 Hapus permanen (bila belum terpakai)**
```js
await supabase.from('jurusan').delete().eq('id', idJurusan);
```

**3.3 Arsipkan (bila sudah terpakai)**
```js
await supabase.from('jurusan').update({ is_active: false }).eq('id', idJurusan);
```

**3.4 Aktifkan kembali**
```js
await supabase.from('jurusan').update({ is_active: true }).eq('id', idJurusan);
```

**3.5 Impor massal**
```js
// parse .xlsx (kode, nama, deskripsi); lewati kode yang sudah ada
await supabase.from('jurusan').insert(barisBaru);
```

---

## 4. Data Flow
| Step | Input | Process | Output |
| --- | --- | --- | --- |
| 1 | id_jurusan | Hitung referensi (soal + skor hasil) | Terpakai / tidak |
| 2a | Tidak terpakai | DELETE baris jurusan | Jurusan hilang permanen |
| 2b | Terpakai | UPDATE `is_active = false` | Jurusan diarsipkan |
| 3 | — | Kueri aktivitas baru memfilter `is_active = true` | Jurusan arsip tidak muncul di kuesioner/soal/penilaian baru |

---

## 5. Business & Integrity Rules
| Rule | Deskripsi |
| --- | --- |
| Kode unik | `jurusan.kode` unik. |
| Hanya aktif | Kuesioner, pilihan soal, penilaian, dan grafik baru hanya memakai jurusan `is_active = true`. |
| Data historis aman | Hasil siswa yang merujuk jurusan arsip tetap ditampilkan lengkap dengan nama jurusannya. |
| Label pengguna | Tombol tetap bertuliskan "Hapus"; pemilihan perilaku (hapus/arsip) dilakukan sistem secara otomatis. |
| Efek reset | Setelah seluruh data siswa dikosongkan (UC-005), jurusan menjadi tidak terpakai sehingga dapat dihapus bersih. |

---

## 6. Traceability
| User Flow | Requirement | Operasi |
| --- | --- | --- |
| userflow_uc_007.md | F006 | COUNT questions/kuesioner_result_scores; DELETE atau UPDATE is_active pada jurusan; INSERT (impor) |
