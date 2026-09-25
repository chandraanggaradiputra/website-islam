# TASK: [TASK-BM-008] Fix Bidirectional Text Alignment (LTR/RTL) & Left Alignment pada Pesan Kajian
Branch Target: staging-website-islam (lalu merge ke main)
GitHub Issue: https://github.com/chandraanggaradiputra/website-islam/issues/3

Dokumentasi Alur & SOP Baru:
1. Sebelum eksekusi: Wajib membuat implementation-plan.md dan mem-push / memposting isinya ke komentar GitHub Issue terkait (Issue #3) agar Admin Chan dapat meninjau implementasi secara mandiri.
2. Review & Proceed: Tunggu lampu hijau (*Proceed*) dari Admin Chan atau Mas Chan di komentar GitHub / chat. *(Catatan: Untuk TASK-BM-008 saat ini, Mas Chan sudah memberikan izin PROCEED, silakan langsung eksekusi kode)*.
3. Setelah eksekusi: Verifikasi via Chrome DevTools MCP (Brave) & posting ringkasan laporan walkthrough.md ke komentar GitHub Issue #3.

---

## 1. Konteks Masalah & Target
Perbandingan antara tampilan teks informasi kajian di WhatsApp dengan tampilan pada website Banten Mengaji menunjukkan ketidaksesuaian:
- Di WhatsApp: Teks tersusun seimbang (teks Arab dibaca RTL, sedangkan teks Latin dibaca LTR dengan rata kiri yang rapi).
- Di Website: Seluruh teks pada card preview atau detail pesan kajian mengalami penataan rata kanan (RTL) yang memengaruhi teks Latin, sehingga tanda kutip (`"M.H"`), angka (`99`), dan emoji (`🗓️`, `⏰`) posisinya terbalik atau melompat baris secara tidak wajar.

Target perbaikan:
Menerapkan sistem *Bidirectional Text* (BiDi) yang rapi dan seimbang. Teks Latin kembali rata kiri (LTR) dan tanda baca/emoji tidak berantakan, sedangkan teks Arab tetap tampil proporsional (RTL).

---

## 2. Rincian Modifikasi Berkas
Identifikasi dan sesuaikan komponen yang merender format pesan kajian / card preview:
1. **Container Alignment**:
   - Pastikan wrapper utama pesan kajian memiliki atribut `dir="ltr"` dan kelas Tailwind `text-left`.
2. **Penanganan Teks Arab vs Latin**:
   - Berikan atribut `dir="auto"` pada baris-baris pesan dinamis, atau pisahkan baris berkarakter Arab (seperti Basmalah dan doa *hafizhahullah*) dengan pembungkus terisolasi berkelas `text-center font-arabic` dan atribut `dir="rtl"`.
   - Pastikan styling CSS `unicode-bidi: plaintext` atau pemisahan paragraf aktif agar browser menangani arah baca tiap baris secara native.
3. **Preservasi Tanda Baca & Emoji**:
   - Pastikan tanda petik, angka, tanda hubung, dan emoji kalender/jam tidak terbalik posisinya.

---

## 3. Langkah Verifikasi & Git
1. Uji coba lokal di dev server Turbopack (`npm run dev`) pada viewport mobile (360px - 414px) dan desktop.
2. Validasi kualitas: Jalankan `npx tsc --noEmit` (harus 0 error) dan `npm run build` (sukses).
3. Verifikasi browser via Chrome DevTools MCP (Brave): Pastikan kepatuhan aksesibilitas WCAG 2.2 AA (skor Lighthouse ≥ 95).
4. Fast-forward merge dari branch `staging-website-islam` ke `main`, lalu push origin ke GitHub untuk memicu auto-deploy di Vercel.
5. Dokumentasikan seluruh hasil pengujian dan tangkapan layar di `walkthrough.md`, lalu post ringkasannya ke komentar GitHub Issue #3.