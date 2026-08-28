# Aturan Rekayasa & Standar Kode Proyek "Website Islam"

1. **Strict TypeScript 7 & Zero Type Errors**:
   - Seluruh kode wajib lolos `npx tsc --noEmit` dengan 0 error.
   - Dilarang menggunakan tipe `any`. Gunakan interface resmi dari `types/index.ts`.
   - Gunakan `catch (err: unknown)` dengan validasi `if (err instanceof Error)`.

2. **React 19 & Next.js 16 App Router Compliance**:
   - Dilarang memanggil `setState()` secara sinkron langsung di badan `useEffect` saat mount.
   - Tangani `params` dan `searchParams` pada Server Component sebagai `Promise`:
     `const resolvedParams = await Promise.resolve(params);`

3. **Prinsip Zero Silent Fallback**:
   - Jika data REST API WordPress kosong/gagal di-fetch, kembalikan state error yang jelas atau array kosong `[]`.
   - Dilarang membuat fallback data tiruan/palsu di komponen produksi.

4. **Aksesibilitas (A11y) & HTML Semantik**:
   - Seluruh tombol icon wajib memiliki `aria-label`.
   - Navigasi mobile wajib menggunakan tag semantik `<nav aria-label="Navigasi Utama">`.

5. **Penanganan Tipografi Arab & Nilai Waktu**:
   - Teks Arab wajib menggunakan font `var(--font-amiri)` dengan `leading-[2.2]`.
   - Perhitungan jam/waktu sholat dinamis wajib aman dari hydration mismatch (gunakan initial value dari server atau pasca-mount flag).