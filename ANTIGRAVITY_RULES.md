# Standar Rekayasa Kode Proyek "Website Islam" (Mas Chan Digital)

1. **5 Prinsip Rekayasa Baku**:
   - **Prinsip 1 (Zero Silent Fallback)**: Dilarang keras menyuntikkan ID/nama data default palsu jika data relasi/sesi kosong. Kembalikan `null` atau `Error` eksplisit.
   - **Prinsip 2 (Anti-Dangling Filter)**: Setiap fungsi `.filter()` wajib memiliki evaluasi boolean yang eksplisit (`return Boolean(...)`).
   - **Prinsip 3 (Single Source of Truth)**: Fungsi normalisasi tanggal, waktu, dan format teks wajib menggunakan helper bersama di `lib/utils.ts` atau `lib/wordpress.ts`.
   - **Prinsip 4 (Cache Revalidation)**: Setiap Server Action yang mengubah status data wajib memanggil `revalidatePath('/')`, `revalidatePath('/jadwal-kajian')`, dan `revalidatePath('/masjid')`.
   - **Prinsip 5 (Strict Type Safety)**: 0 error pada `npx tsc --noEmit`. Dilarang menggunakan tipe `any`, dan penanganan `catch` wajib men-cast `error` secara aman atau dikosongkan jika tidak dipakai.

2. **Protokol Git Push**:
   Setiap menyelesaikan 1 blok fitur/perbaikan wajib menjalankan:
   ```bash
   npx tsc --noEmit && git add . && git commit -m "feat/fix: deskripsi" && git push origin main
   ```