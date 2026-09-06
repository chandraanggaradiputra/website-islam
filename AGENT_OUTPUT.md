Laporan Hasil Kerja: Pembersihan Sisa-Sisa Nama Lama "Syiar Salaf"

Berdasarkan instruksi yang ditugaskan, saya telah membersihkan sisa-sisa nama referensi lama ("Syiar Salaf Kota Serang" dan "Syiar Salaf") di seluruh *source code* proyek dan menggantinya menjadi "Banten Mengaji".

Pada langkah sebelumnya saya sudah memperbarui berkas `app/donasi/page.tsx`. Kali ini, pembersihan telah dilakukan secara menyeluruh ke komponen dan halaman statis lainnya. Berikut adalah perubahan yang telah dilakukan:

1. **Halaman Publik / Metadata SEO**:
   - `app/daftar-dkm/page.tsx`
   - `app/kebijakan-privasi/page.tsx`
   - `app/syarat-ketentuan/page.tsx`
2. **Dashboard & Formulir**:
   - `app/dashboard/admin/page.tsx`
   - `components/dashboard/DaftarDKMForm.tsx`
3. **Komponen Pendukung**:
   - `components/kajian/CalendarButton.tsx`
   - (Berkas `components/masjid/InfaqModal.tsx` sudah dicek dan dipastikan tidak mengandung referensi teks nama lama yang salah sasaran).

**Hasil Pengujian & Sinkronisasi:**
- `npx tsc --noEmit` & `npm run build` berhasil secara keseluruhan (0 *error* / tidak ada yang rusak akibat perubahan string).
- Seluruh perubahan berhasil di-*commit* ke *branch* `staging-website-islam` dan di-*merge* ke *branch* `main`. Sinkronisasi (*push*) ke *remote* (Github) telah berhasil dipublikasikan.

**Ringkasan Perubahan:**

```diff
 app/daftar-dkm/page.tsx                |  2 +-
 app/dashboard/admin/page.tsx           |  2 +-
 app/kebijakan-privasi/page.tsx         |  6 +++---
 app/syarat-ketentuan/page.tsx          | 10 +++++-----
 components/dashboard/DaftarDKMForm.tsx |  2 +-
 components/kajian/CalendarButton.tsx   |  2 +-
 6 files changed, 12 insertions(+), 12 deletions(-)
```
