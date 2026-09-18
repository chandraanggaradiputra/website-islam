# Rencana Implementasi: Penyempurnaan Navigasi Mobile Dasbor DKM

Rencana teknis ini disusun untuk menyempurnakan pengalaman navigasi pengguna pengurus DKM pada perangkat seluler (mobile). Solusi ini menghilangkan kondisi "dead-end" saat berada di sub-halaman DKM, menghubungkan teks/logo "DKM Panel" sebagai tautan aktif kembali ke dasbor utama, menyediakan tab navigasi cepat horizontal berstandar WCAG 2.2 touch target (min 44px), serta membuat bilah Bottom Navigation Bar adaptif terhadap rute dasbor DKM.

---

## User Review Required

> [!IMPORTANT]
> **Penyelarasan URL Profil Masjid**:
> Di codebase saat ini, rute resmi untuk profil masjid DKM adalah `/dashboard/dkm/profil-masjid`. Pada prompt tugas, terdapat penyebutan `/dashboard/dkm/profil`.
> Rencana ini akan:
> 1. Menggunakan tautan `/dashboard/dkm/profil-masjid` pada navigasi utama agar langsung memuat form profil masjid tanpa jeda pengalihan.
> 2. Membuat berkas pembantu `app/dashboard/dkm/profil/page.tsx` yang melakukan `redirect('/dashboard/dkm/profil-masjid')` sehingga bila ada pengguna atau bookmark yang mengakses `/dashboard/dkm/profil`, sistem tidak akan menampilkan 404 melainkan langsung dialihkan secara transparan.
> 3. Memastikan deteksi status aktif pada `DkmSubNav` dan `BottomNav` mencakup kedua pola rute (`/dashboard/dkm/profil*`).

---

## Proposed Changes

### 1. Komponen Baru Navigasi Tab Seluler DKM

#### [NEW] [DkmSubNav.tsx](file:///C:/website-islam/components/dashboard/DkmSubNav.tsx)
- Membuat komponen client `"use client"` yang menampilkan:
  - **Tautan Balik Cepat (`← Kembali ke Dasbor Utama`)**: Hanya muncul saat berada di sub-halaman (misalnya `/dashboard/dkm/tambah-kajian` atau `/dashboard/dkm/profil-masjid`), dengan target sentuh min 36-44px dan label aksesibilitas ARIA yang jelas.
  - **3 Tab Cepat Horizontal (Pills)**:
    - `Dasbor` (`/dashboard/dkm`, ikon `LayoutDashboard`)
    - `Profil Masjid` (`/dashboard/dkm/profil-masjid`, ikon `Building2`)
    - `Tambah Kajian` (`/dashboard/dkm/tambah-kajian`, ikon `PlusCircle`)
  - Standar WCAG 2.2: target sentuh `min-h-[44px]`, kontras warna tinggi (warna aktif Emerald `bg-emerald-700 text-white shadow-sm`), serta atribut `aria-current="page"`.

---

### 2. Tata Letak Dasbor DKM & Tautan Header Mobile

#### [NEW] [app/dashboard/dkm/layout.tsx](file:///C:/website-islam/app/dashboard/dkm/layout.tsx)
- Membuat layout khusus untuk area DKM yang secara modular memasang `<DkmSubNav />` di bagian atas area konten seluruh halaman DKM (`/dashboard/dkm`, `/dashboard/dkm/profil-masjid`, `/dashboard/dkm/tambah-kajian`).
- Menjamin konsistensi antarmuka tanpa perlu menyisipkan kode komponen secara manual di setiap berkas halaman.

#### [NEW] [app/dashboard/dkm/profil/page.tsx](file:///C:/website-islam/app/dashboard/dkm/profil/page.tsx)
- Menambahkan Server Component pengalihan cepat (`redirect('/dashboard/dkm/profil-masjid')`) untuk memastikan URL alias `/dashboard/dkm/profil` selalu valid dan tidak dead-link.

#### [MODIFY] [app/dashboard/layout.tsx](file:///C:/website-islam/app/dashboard/layout.tsx)
- Mengubah tautan logo dan teks di bilah atas mobile (`<header className="... md:hidden">`):
  - Saat ini: `<Link href="/" ...>DKM Panel</Link>` (melempar pengguna ke beranda publik).
  - Diubah menjadi: `<Link href={isAdmin ? '/dashboard/admin' : '/dashboard/dkm'} ...>DKM Panel</Link>`.
  - Memberikan efek visual hover/focus dan `title` aksesibilitas agar pengurus DKM dapat kembali ke dasbor utama hanya dengan mengetuk logo/judul di bilah atas.

---

### 3. Bilah Navigasi Bawah Adaptif (Adaptive Bottom Navigation)

#### [MODIFY] [components/layout/BottomNav.tsx](file:///C:/website-islam/components/layout/BottomNav.tsx)
- Menambahkan pemeriksaan kondisi `isDkmDashboard = pathname.startsWith('/dashboard/dkm')`.
- **Tab 1 (Kiri)**:
  - Jika `isDkmDashboard`: Diarahkan ke `/dashboard/dkm` dengan ikon `LayoutDashboard`, label `"Dasbor"`, dan status aktif saat berada di root dasbor DKM.
  - Jika di luar dasbor DKM: Tetap mengarah ke `/` dengan label `"Beranda"` dan ikon `Home`.
- **Tab 3 (Tengah)**:
  - Memastikan tautan mengarah langsung ke `/dashboard/dkm/tambah-kajian` dengan penanda visual aktif yang serasi saat berada di halaman tambah jadwal.
- **Tab 4**:
  - Mengarah ke `/dashboard/dkm/profil-masjid` dengan label `"Profil Masjid"`, ikon `Building2`/`Landmark`, dan aktif saat `pathname.startsWith('/dashboard/dkm/profil')`.
- **Tab 5 (Menu Drawer)**:
  - Mempertahankan kartu profil DKM dan tombol pintas navigasi di dalam bottom sheet drawer.

---

## Verification Plan

### Automated Tests
1. **Pemeriksaan Tipe Data**:
   ```bash
   npx tsc --noEmit
   ```
   Ekspektasi: 0 error.
2. **Build Produksi Next.js**:
   ```bash
   npm run build
   ```
   Ekspektasi: Seluruh rute terkompilasi optimal (termasuk rute baru `app/dashboard/dkm/profil` dan `app/dashboard/dkm/layout.tsx`).

### Manual Verification via Chrome DevTools MCP (Brave)
1. Menjalankan server lokal `npm run dev` pada port 3000.
2. Mengatur viewport seluler iPhone 12/14/15 standard: `390×844 px` (touch enabled).
3. Melakukan login sebagai DKM atau membuka `/dashboard/dkm`.
4. Memverifikasi elemen-elemen baru:
   - Header atas bertuliskan "DKM Panel" dapat diklik dan mengarah ke `/dashboard/dkm`.
   - Di bawah header muncul horizontal pills `DkmSubNav`: Tab "Dasbor", "Profil Masjid", dan "Tambah Kajian".
   - Bottom Navigation Bar bawah pada Tab 1 menampilkan "Dasbor" (ikon `LayoutDashboard`), bukan "Beranda".
5. Mengetuk tab "Tambah Kajian":
   - Memastikan URL berpindah ke `/dashboard/dkm/tambah-kajian`.
   - Memastikan tombol `← Kembali ke Dasbor Utama` muncul di atas pills navigasi.
   - Mengetuk tombol kembali, memastikan pengguna kembali ke `/dashboard/dkm`.
6. Mengetuk tab "Profil Masjid":
   - Memastikan berpindah ke profil masjid, tombol kembali tampil, dan tab "Profil Masjid" menyala aktif.
7. Menguji pengalihan rute alias `/dashboard/dkm/profil` -> otomatis diarahkan ke `/dashboard/dkm/profil-masjid`.
8. Menangkap bukti visual (screenshot) dan menyusun berkas laporan akhir `walkthrough.md`.
9. Melakukan commit di branch `staging-website-islam`, fast-forward merge ke branch `main`, dan push ke GitHub `origin`.
