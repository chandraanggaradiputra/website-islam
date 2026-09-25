# TASK: [TASK-BM-007] Implementasi Grace Period Visibilitas Jadwal Kajian 24 Jam Pasca-Kajian
Website: Banten Mengaji (banten-mengaji.vercel.app)
Branch Target: staging-website-islam (lalu merge ke main)
Dokumentasi Alur:
1. Sebelum eksekusi: Buat implementation-plan.md untuk peninjauan
2. Setelah eksekusi: Buat walkthrough.md sebagai laporan resmi verifikasi

---

## 1. Konteks Kebutuhan DKM
Berdasarkan masukan dari Abu Ayesha (DKM Masjid At-Taqwa WILDAN), jadwal kajian yang telah berlangsung tidak boleh langsung hilang dari halaman jadwal kajian aktif sesaat setelah jam kajian selesai. Diperlukan masa tenggang (grace period) selama 24 jam (1 hari) pasca-kajian berakhir agar jadwal tetap dapat dilihat oleh jamaah sebelum statusnya otomatis berpindah ke arsip rekaman.

---

## 2. Rincian Modifikasi Berkas

### A. Utilitas Kedaluwarsa Kajian (`lib/kajian.ts` atau `lib/utils/kajian.ts`)
Perbarui fungsi `isKajianExpired` agar menambahkan toleransi waktu 24 jam (86.400.000 ms) setelah jam kajian selesai:

```typescript
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 Jam (1 Hari)

export function isKajianExpired(
  tanggalKajian?: string,
  jamSelesai?: string,
  jamMulai?: string
): boolean {
  if (!tanggalKajian || tanggalKajian === "-") return false;

  try {
    const jamPatokan = jamSelesai && jamSelesai !== "Selesai" ? jamSelesai : (jamMulai || "23:59");
    const [hours, minutes] = jamPatokan.split(":").map(Number);
    const [year, month, day] = tanggalKajian.split("-").map(Number);
    if (!year || !month || !day) return false;

    const waktuSelesaiKajian = new Date(Date.UTC(year, month - 1, day, (hours || 23) - 7, minutes || 59, 0));
    const waktuBatasArsip = new Date(waktuSelesaiKajian.getTime() + GRACE_PERIOD_MS);

    return Date.now() > waktuBatasArsip.getTime();
  } catch {
    return false;
  }
}

export function isKajianJustFinished(
  tanggalKajian?: string,
  jamSelesai?: string,
  jamMulai?: string
): boolean {
  if (!tanggalKajian || tanggalKajian === "-") return false;
  try {
    const jamPatokan = jamSelesai && jamSelesai !== "Selesai" ? jamSelesai : (jamMulai || "23:59");
    const [hours, minutes] = jamPatokan.split(":").map(Number);
    const [year, month, day] = tanggalKajian.split("-").map(Number);
    
    const waktuSelesaiKajian = new Date(Date.UTC(year, month - 1, day, (hours || 23) - 7, minutes || 59, 0));
    const waktuBatasArsip = new Date(waktuSelesaiKajian.getTime() + GRACE_PERIOD_MS);
    const now = Date.now();

    return now >= waktuSelesaiKajian.getTime() && now <= waktuBatasArsip.getTime();
  } catch {
    return false;
  }
}
```

### B. Halaman Jadwal Kajian (`app/jadwal-kajian/page.tsx`) & Kartu Kajian
1. Query filter jadwal aktif tetap memakai `!isKajianExpired(...)` yang baru.
2. Jika kajian memenuhi `isKajianJustFinished(...)` (dalam masa tenggang 24 jam):
   - Tampilkan badge status informatif: `Selesai Berlangsung` (badge slate/abu-abu netral) menggantikan jam kajian.
3. Kajian yang telah melewati batas 24 jam (`isKajianExpired === true`) otomatis masuk ke bagian/tab **Arsip Rekaman**.

### C. Penyelarasan MCP Server (`app/api/mcp/route.ts`)
Pastikan fungsi `executeGetUpcomingKajian` memanggil `isKajianExpired` yang baru, sehingga tool MCP juga tetap menyajikan kajian dalam masa tenggang 24 jam dengan informasi status yang jelas.

---

## 3. Langkah Verifikasi & GitOps
1. Pengujian Unit Runtime.
2. Validasi Kualitas: `npx tsc --noEmit` (0 error) dan `npm run build`.
3. Commit: `feat(kajian): grace period 24 jam visibilitas jadwal aktif sebelum arsip (TASK-BM-007)`.
4. Fast-forward merge ke `main` dan `git push origin main staging-website-islam`.
5. Susun laporan di `walkthrough.md`.