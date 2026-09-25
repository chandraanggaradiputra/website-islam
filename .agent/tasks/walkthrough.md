# Walkthrough: [TASK-BM-007] Grace Period 24 Jam Jadwal Kajian & Badge "Selesai Berlangsung"

Dokumen ini merupakan laporan resmi implementasi dan verifikasi teknis untuk penambahan batas tenggang waktu (grace period) 24 jam serta badge status netral `"Selesai Berlangsung"` pada jadwal kajian portal dakwah Banten Mengaji.

---

## 1. Konteks Kebutuhan & Masalah

Sebelum penyesuaian ini:
1. Fungsi `isKajianExpired()` langsung mengembalikan status `true` tepat saat jam kajian berakhir (`Date.now() > endTimestamp`).
2. Hal ini menyebabkan kajian yang baru saja selesai langsung diarsipkan oleh auto-archive (`archiveExpiredKajian`) dan disembunyikan/diberi tanda kedaluwarsa secara mendadak.
3. Jamaah yang ingin mengecek informasi ustadz, lokasi masjid, atau materi/faedah kajian yang baru usai beberapa jam sebelumnya tidak lagi dapat melihat kartu kajian dalam kondisi aktif wajar.
4. Gemini MCP Server juga langsung menolak atau tidak mengelompokkan kajian tersebut ke dalam status yang jelas pasca-pelaksanaan.

---

## 2. Rincian Modifikasi Berkas

### A. Core Helper Logika Kajian (`lib/kajian.ts`)
- **Konstanta Grace Period**: Menambahkan konstanta terstandarisasi:
  ```typescript
  export const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
  ```
- **Helper `getKajianEndTimestamp`**: Mengekstraksi logika parsing tanggal dan jam selesai/mulai menjadi helper terpusat:
  ```typescript
  export function getKajianEndTimestamp(tanggalKajian?: string, jamSelesai?: string, jamMulai?: string): number | null
  ```
- **Pembaruan `isKajianExpired`**: Memperhitungkan grace period 24 jam:
  ```typescript
  export function isKajianExpired(tanggalKajian?: string, jamSelesai?: string, jamMulai?: string): boolean {
    const endTimestamp = getKajianEndTimestamp(tanggalKajian, jamSelesai, jamMulai);
    if (!endTimestamp) return false;
    return Date.now() > endTimestamp + GRACE_PERIOD_MS;
  }
  ```
- **Helper Baru `isKajianJustFinished`**: Mendeteksi apakah kajian berada dalam jendela waktu pasca-selesai namun masih dalam batas tenggang 24 jam:
  ```typescript
  export function isKajianJustFinished(tanggalKajian?: string, jamSelesai?: string, jamMulai?: string): boolean {
    const endTimestamp = getKajianEndTimestamp(tanggalKajian, jamSelesai, jamMulai);
    if (!endTimestamp) return false;
    const now = Date.now();
    return now > endTimestamp && now <= endTimestamp + GRACE_PERIOD_MS;
  }
  ```

### B. Komponen Kartu Jadwal Kajian (`components/kajian/KajianCard.tsx`)
- Mengimpor `isKajianJustFinished` dari `@/lib/kajian`.
- Mengevaluasi status masa tenggang:
  ```typescript
  const isJustFinished = !isSelesai && isKajianJustFinished(acf?.tanggal_kajian, acf?.jam_selesai, acf?.jam_mulai);
  ```
- Merender badge netral bertuliskan `"Selesai Berlangsung"` dengan palet slate yang elegan dan ramah dark mode:
  ```tsx
  {isJustFinished && (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
      <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
      Selesai Berlangsung
    </span>
  )}
  ```

### C. Halaman Detail Kajian (`app/jadwal-kajian/[slug]/page.tsx`)
- Mengimpor `isKajianJustFinished` dari `@/lib/kajian`.
- Menampilkan badge netral `"Selesai Berlangsung"` pada header kartu detail jadwal jika kajian baru saja usai dalam batas 24 jam.
- Melakukan pembersihan tipe TypeScript yang aman (`{ ID?: number; id?: number }`) guna menggantikan assertion `as any` pada relasi masjid ACF.

### D. Endpoint Gemini MCP Dakwah (`app/api/mcp/route.ts`)
- Mengimpor `isKajianJustFinished` dari `@/lib/kajian`.
- Pada tool dakwah publik `executeGetUpcomingKajian`:
  - Menyertakan properti `status_pelaksanaan: isJustFinished ? "selesai_berlangsung" : "mendatang"`.
  - Menyertakan flag boolean `is_just_finished: isJustFinished`.
  - Memberikan konteks akurat kepada agen AI Gemini mengenai kajian yang baru usai.

---

## 3. Hasil Pengujian & Verifikasi

### A. Pengujian Unit Logika Grace Period (`scripts/test-kajian-grace-period.ts`)
Pengujian unit dijalankan menggunakan `npx tsx scripts/test-kajian-grace-period.ts`:

| No | Skenario Pengujian | Input/Kondisi | Ekspektasi | Hasil | Status |
|:---|:---|:---|:---|:---|:---:|
| 1 | Nilai Konstanta `GRACE_PERIOD_MS` | `GRACE_PERIOD_MS` | Tepat 86.400.000 ms (24 jam) | 86.400.000 ms | **PASS** |
| 2 | Kajian Masa Depan (Besok) | Besok 09:00 - 11:00 | `expired = false`, `justFinished = false` | Sesuai | **PASS** |
| 3 | Kajian Rutin (Tanpa Tanggal) | `jenis_kajian: rutin` | `expired = false`, `justFinished = false` | Sesuai | **PASS** |
| 4 | Kajian Selesai 2 Jam Lalu (Expired Check) | Selesai 2 jam lalu | `isKajianExpired() === false` (tertahan grace period) | `false` | **PASS** |
| 5 | Kajian Selesai 2 Jam Lalu (Grace Check) | Selesai 2 jam lalu | `isKajianJustFinished() === true` | `true` | **PASS** |
| 6 | Kajian Selesai 30 Jam Lalu (Expired Check) | Selesai 30 jam lalu | `isKajianExpired() === true` (melewati 24 jam) | `true` | **PASS** |
| 7 | Kajian Selesai 30 Jam Lalu (Grace Check) | Selesai 30 jam lalu | `isKajianJustFinished() === false` (kedaluwarsa penuh) | `false` | **PASS** |
| 8 | Format Tanggal ACF Numeric YYYYMMDD | Format `20260920` (30 jam lalu) | Terdeteksi expired penuh | `true` | **PASS** |

**Tingkat Kelulusan Unit Test: 100% (8 dari 8 tes lolos)**.

### B. Validasi Kode & Kompilasi
- **ESLint**:
  ```bash
  npx eslint lib/kajian.ts components/kajian/KajianCard.tsx "app/jadwal-kajian/[slug]/page.tsx" app/api/mcp/route.ts
  ```
  $\rightarrow$ **0 Error, 0 Warning (Exit code: 0)**.
- **TypeScript Typecheck**:
  ```bash
  npx tsc --noEmit
  ```
  $\rightarrow$ **0 Error (Exit code: 0)**.
- **Production Build (Next.js 16 Turbopack)**:
  ```bash
  npm run build
  ```
  $\rightarrow$ **Compiled successfully in 89s, 19/19 static pages generated (Exit code: 0)**.

---

## 4. Kesimpulan
Semua kriteria penerimaan untuk TASK-BM-007 telah terpenuhi secara sempurna:
1. `isKajianExpired()` kini memiliki masa tenggang 24 jam terhitung dari jam selesai kajian.
2. Helper `isKajianJustFinished()` mendeteksi kajian dalam jendela 24 jam pasca selesai.
3. Badge netral `"Selesai Berlangsung"` tampil pada kartu kajian dan halaman detail.
4. Response tool Gemini MCP `get_upcoming_kajian` menyajikan status pelaksanaan yang kaya konteks.
5. Seluruh tes lolos 100% dan kode siap digabungkan (merge) ke branch utama.
