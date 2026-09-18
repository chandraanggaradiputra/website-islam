# Walkthrough: Penyempurnaan Navigasi Mobile Dasbor DKM

**Branch:** `staging-website-islam` → merge ke `main`
**Tanggal:** 18 September 2026
**Commit:** `feat(dkm-mobile): tambah DkmSubNav, adaptive BottomNav, dan header link dasbor`

---

## Ringkasan Perubahan

Tugas ini menyempurnakan pengalaman navigasi pengguna pengurus DKM pada perangkat seluler. Sebelumnya, pengguna DKM yang masuk ke sub-halaman (Tambah Kajian / Profil Masjid) mengalami kondisi "dead-end" — tidak ada tombol kembali maupun navigasi kontekstual. Bottom Navigation Bar juga mengarah ke portal publik, sehingga menekan "Beranda" mengeluarkan DKM dari area dasbor mereka.

---

## File yang Diubah

### File Baru

| File | Deskripsi |
|------|-----------|
| `components/dashboard/DkmSubNav.tsx` | Komponen navigasi tab horizontal khusus DKM dengan back-link dan 3 pills (Dasbor, Profil Masjid, Tambah Kajian). WCAG 2.2 compliant. |
| `app/dashboard/dkm/layout.tsx` | Layout wrapper DKM yang otomatis menyuntikkan `<DkmSubNav />` di atas setiap halaman DKM tanpa mengubah tiap halaman satu per satu. |
| `app/dashboard/dkm/profil/page.tsx` | Server redirect dari `/dashboard/dkm/profil` → `/dashboard/dkm/profil-masjid` untuk mencegah 404 pada alias URL. |

### File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `app/dashboard/layout.tsx` | Link "DKM Panel" di mobile header sekarang mengarah ke `/dashboard/dkm` (atau `/dashboard/admin` untuk admin), bukan ke `/`. |
| `components/layout/BottomNav.tsx` | Tab 1 adaptif: menampilkan "Dasbor" + `LayoutDashboard` icon saat di rute DKM. Tab 3 menampilkan floating button emerald aktif saat di `/dashboard/dkm/tambah-kajian`. Tab 4 menampilkan "Profil Masjid" + `Building2` icon di konteks DKM. |
| `implementation-plan.md` | Dokumen rencana implementasi resmi. |

---

## Hasil Verifikasi Runtime

Semua rute diverifikasi pada viewport mobile **390×844px** menggunakan Chrome DevTools MCP (Brave):

### `/dashboard/dkm` (Halaman Utama Dasbor)

- ✅ 3 pills navigasi tampil: **Dasbor** (aktif, emerald), **Profil Masjid**, **Tambah Kajian**
- ✅ Tidak ada back-link (benar — ini halaman root DKM)
- ✅ Bottom Nav Tab 1 menampilkan "Dasbor" (LayoutDashboard icon) bukan "Beranda"

### `/dashboard/dkm/tambah-kajian`

- ✅ Back-link "← Kembali ke Dasbor Utama" muncul di atas pills
- ✅ Pill **Tambah Kajian** berstatus `aria-current="page"` (warna aktif emerald)
- ✅ Klik back-link → navigasi ke `/dashboard/dkm` berhasil
- ✅ Bottom Nav Tab 3: floating button emerald dengan ring aktif

### `/dashboard/dkm/profil-masjid`

- ✅ Back-link muncul
- ✅ Pill **Profil Masjid** berstatus `aria-current="page"`
- ✅ Bottom Nav Tab 4: icon `Building2` "Profil Masjid"

### `/dashboard/dkm/profil` (URL Alias)

- ✅ Redirect otomatis ke `/dashboard/dkm/profil-masjid` tanpa error 404

### Mobile Header

- ✅ Teks "DKM Panel" pada header mobile berfungsi sebagai tautan aktif menuju `/dashboard/dkm`

---

## Screenshot

### Halaman Tambah Kajian (Mobile 390×844)

![DKM Nav - Tambah Kajian](./dkm-nav-tambah-kajian.png)

### Halaman Profil Masjid (Mobile 390×844)

![DKM Nav - Profil Masjid](./dkm-nav-profil-masjid.png)

---

## Verifikasi TypeScript & Build

```
npx tsc --noEmit   → 0 errors ✅
npm run build      → 22 routes, success ✅
```

Route baru yang muncul di build output:
- `/dashboard/dkm/profil` (redirect server-side)

---

## Git

```
Branch: staging-website-islam
Commit: feat(dkm-mobile): tambah DkmSubNav, adaptive BottomNav, dan header link dasbor

Fast-forward merged ke: main
Push: origin main + staging-website-islam
```

---

## Standar Aksesibilitas (WCAG 2.2)

| Kriteria | Status |
|----------|--------|
| Touch target min 44px (`min-h-[44px]`) | ✅ |
| `aria-current="page"` pada tab aktif | ✅ |
| Label deskriptif pada back-link | ✅ |
| Kontras warna emerald-700 pada bg putih | ✅ |
| Keyboard navigable (native `<a>` / `<Link>`) | ✅ |
