# Implementation Plan - Tahap 2: Penyelarasan Menyeluruh CRUD Jadwal Kajian Sisi DKM

Menyelaraskan pengalaman pengurus DKM saat menambah dan mengedit jadwal kajian di area DKM (`/dashboard/dkm` dan `/dashboard/dkm/tambah-kajian`) agar 100% identik dengan standar yang telah diterapkan di sisi Super Admin pada Tahap 1.

---

## User Review Required

> [!IMPORTANT]
> - Di modal edit kajian DKM (`DKMKajianList.tsx`), `WhatsAppScratchpad` akan ditambahkan di posisi paling atas dengan `defaultValue` yang didekode dari `editingKajian?.content?.rendered`.
> - Input Hari Kajian diubah dari teks bebas menjadi `<select>` dengan 7 hari baku: *Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Ahad*.
> - Kolom `waktuKeterangan` ditambahkan secara seragam di `DKMKajianList.tsx` dan `TambahKajianForm.tsx`.
> - Server action `updateKajianByDkm` di `lib/actions/kajian.ts` diperbarui untuk menerima field `content` (teks broadcast WhatsApp), mendukung fallback `title || judul`, dan `namaUstadz || penceramah`, serta mempertahankan status langsung tayang (`publish`).
> - Seluruh elemen interaktif dan tombol diberi `min-h-[44px]` dan label diberi asosiasi `htmlFor` - `id` (WCAG 2.2 AA).

---

## Proposed Changes

### 1. Komponen Modal Edit Kajian DKM

#### [MODIFY] [DKMKajianList.tsx](file:///C:/website-islam/components/dashboard/DKMKajianList.tsx)

1. **Import `WhatsAppScratchpad` dan helper `stripHtmlToWhatsAppText`**:
   - Impor komponen `WhatsAppScratchpad` dan utility `stripHtmlToWhatsAppText` dari `@/lib/utils/whatsappText`.
2. **Pasang `WhatsAppScratchpad` di Paling Atas Form Modal**:
   - Tempatkan sebelum pilihan status pelaksanaan kajian:
     ```tsx
     <WhatsAppScratchpad
       id="edit-dkm-content"
       name="content"
       defaultValue={stripHtmlToWhatsAppText(editingKajian.content?.rendered || '')}
     />
     ```
3. **Penyelarasan Input Judul / Tema Kajian**:
   - Ganti `name="judul"` menjadi `name="title"` (dengan fallback `judul` di server action).
   - Pasang `id="edit-dkm-title"` dan `<label htmlFor="edit-dkm-title">`.
   - Nilai awal menggunakan `defaultValue={decodeHtmlEntities(editingKajian.title.rendered)}`.
   - Tambahkan kelas `min-h-[44px]`.
4. **Penyelarasan Hari & Tanggal Kajian (Baku 7 Hari)**:
   - Ubah `hariKajian` dari `<input type="text">` menjadi `<select id="edit-dkm-hariKajian" name="hariKajian">` dengan 7 hari baku:
     `-- Pilih Hari --`, `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`, `Ahad`.
   - Tanggal Kajian: `<input type="date" id="edit-dkm-tanggalKajian" name="tanggalKajian">`.
   - Tambahkan label dinamis: `* (Wajib untuk Rutin)` pada Hari dan `* (Wajib untuk Tematik)` pada Tanggal tergantung pada `selectedJenisKajian`.
5. **Penyelarasan Kolom Waktu**:
   - `jamMulai` dan `jamSelesai`: gunakan `font-mono`, `min-h-[44px]`, label `htmlFor`, dan helper text format 24 jam WIB.
   - Tambahkan kolom `waktuKeterangan` dengan `id="edit-dkm-waktuKeterangan"`, `name="waktuKeterangan"`, `min-h-[44px]`.
6. **Penyelarasan Jenis Kajian & Kategori Jamaah**:
   - Jenis Kajian: `rutin` vs `tematik`.
   - Kategori Jamaah: `umum`, `khusus_ikhwan`, `khusus_akhwat`.
   - Berikan `id`, `htmlFor`, dan `min-h-[44px]`.
7. **Masjid Penyelenggara Terkunci**:
   - Tambahkan penanda visual masjid terkunci & `<input type="hidden" name="masjid_terkait" value={userMasjidId} />`.
8. **Poster Flyer & Live Streaming**:
   - Tampilkan thumbnail poster saat ini di modal dari `editingKajian.featured_media_url` atau `editingKajian._embedded['wp:featuredmedia'][0].source_url`.
   - Sediakan tombol ganti/unggah poster dengan `min-h-[44px]`.
   - Input `linkStreaming` dengan label `htmlFor`, `id`, dan `min-h-[44px]`.
9. **Aksesibilitas & Target Sentuh WCAG 2.2**:
   - Seluruh `<label>` diberi `htmlFor` yang cocok dengan `id` input/select.
   - Seluruh elemen input, tombol status (`Aktif` / `Diliburkan`), tombol batal, dan tombol simpan diberi `min-h-[44px]`.

---

### 2. Formulir Tambah Kajian DKM

#### [MODIFY] [TambahKajianForm.tsx](file:///C:/website-islam/components/dashboard/TambahKajianForm.tsx)

1. **Skema Zod & Form Values**:
   - Tambahkan `waktuKeterangan: z.string().optional()` ke `kajianSchema`.
   - Tambahkan default value `waktuKeterangan: ''`.
2. **Input `waktuKeterangan`**:
   - Tambahkan input `waktuKeterangan` di bawah baris Jam Mulai / Selesai dengan label `htmlFor="waktuKeterangan"`, `id="waktuKeterangan"`, `placeholder="Contoh: Ba'da Isya pukul 20.00 WIB"`, serta `min-h-[44px]`.
3. **Penyelarasan Nama Ustadz**:
   - Tambahkan `formData.append('namaUstadz', data.penceramah)` agar backend menerima kedua nama key (`namaUstadz` dan `penceramah`).
4. **Aksesibilitas WCAG 2.2**:
   - Pastikan seluruh input/select/button memiliki target sentuh `min-h-[44px]`.

---

### 3. Server Actions Kajian

#### [MODIFY] [lib/actions/kajian.ts](file:///C:/website-islam/lib/actions/kajian.ts)

1. **Perbaikan `updateKajianByDkm`**:
   - Baca teks broadcast WhatsApp:
     ```typescript
     const content = (formData.get('content') || formData.get('deskripsi'))?.toString()?.trim() || '';
     ```
   - Baca judul kajian dengan fallback ganda:
     ```typescript
     const judul = (formData.get('title') || formData.get('judul'))?.toString()?.trim();
     ```
   - Baca nama ustadz dengan fallback:
     ```typescript
     const namaUstadz = formData.get('namaUstadz')?.toString() || formData.get('penceramah')?.toString() || currentKajian.acf?.nama_ustadz || '';
     ```
   - Sertakan `content` dalam payload ke WordPress REST API:
     ```typescript
     const payload: {
       title?: string;
       content?: string;
       status?: string;
       featured_media?: number;
       acf: Record<string, unknown>;
     } = {
       status: 'publish',
       ...(content ? { content } : {}),
       acf: {
         nama_ustadz: namaUstadz,
         jenis_kajian: formData.get('jenisKajian')?.toString() || currentKajian.acf?.jenis_kajian || 'rutin',
         kategori_jamaah: cleanKategori,
         kitab_bahasan: formData.get('kitabBahasan')?.toString() || '',
         hari_kajian: formData.get('hariKajian')?.toString() || '',
         tanggal_kajian: tanggalKajian || currentKajian.acf?.tanggal_kajian || '',
         jam_mulai: formData.get('jamMulai')?.toString() || '',
         jam_selesai: formData.get('jamSelesai')?.toString() || '',
         waktu_keterangan: formData.get('waktuKeterangan')?.toString() || (formData.get('jamMulai') ? `${formData.get('jamMulai')} WIB` : ''),
         status_kajian: statusKajian,
         link_streaming: formData.get('linkStreaming')?.toString() || '',
       }
     };
     ```
   - Pastikan jika ada poster baru yang diunggah, `mediaId` disimpan ke `payload.featured_media`.
   - Revalidasi rute:
     ```typescript
     revalidatePath('/sitemap.xml');
     revalidatePath('/jadwal-kajian');
     if (slug) revalidatePath(`/jadwal-kajian/${slug}`);
     revalidatePath('/');
     revalidatePath('/dashboard/dkm');
     ```
   - Auto-ping IndexNow jika slug kajian tersedia dan status kajian 'publish'.
2. **Pengecekan `submitKajian`**:
   - Pastikan fallback `formData.get('title') || formData.get('judul')`.
   - Pastikan fallback `formData.get('namaUstadz') || formData.get('penceramah')`.
   - Pastikan `waktu_keterangan` menerima nilai dari `formData.get('waktuKeterangan')`.

---

## Verification Plan

### Automated Tests
1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   *Ekspektasi: 0 error.*
2. **Next.js Production Build**:
   ```bash
   npm run build
   ```
   *Ekspektasi: Seluruh 22 rute berhasil terkompilasi.*

### Manual / Git Verification
1. Periksa `git diff` untuk memastikan keselarasan field antara DKM dan Admin.
2. Lakukan commit di `staging-website-islam`, merge fast-forward ke `main`, dan push ke remote repository `origin`.
3. Buat dokumentasi resmi `walkthrough.md`.
