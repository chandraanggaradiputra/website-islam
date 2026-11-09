# 📖 Panduan Pola Arsitektur CLS & Ergonomi Mobile Next.js 16 (Banten Mengaji)

Dokumen ini mendokumentasikan pola arsitektur baku yang terbukti berhasil mengeliminasi **Cumulative Layout Shift (CLS)** dari **0.975 &rarr; < 0.1** serta mencapai standar aksesibilitas **WCAG 2.2 Level AA** pada antarmuka smartphone di Next.js 16 (App Router, Turbopack) & React 19.

---

## 1. Jam Digital Real-Time: Two-Pass Rendering dengan Static Container Reservation

### Permasalahan (Root Cause)
Pada Next.js 16 dengan React 19 SSR, me-render waktu dinamis (seperti jam digital WIB `HH:mm:ss`) secara naif menyebabkan:
1. **React 19 Hydration Mismatch**: Timestamp server berbeda dengan timestamp klien saat render.
2. **Micro Horizontal/Vertical Layout Shift**: Angka jam berdetak dengan lebar font proporsional, menyebabkan kontainer bergetar tiap detik.

### Pola Solusi Baku
```tsx
// components/prayer/MonthlyPrayerCalendar.tsx
export function LiveClockWib() {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}:${seconds} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-mono tabular-nums font-semibold text-blue-100 border border-white/15 min-w-[130px] justify-center h-7"
      suppressHydrationWarning
    >
      <Clock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
      <span>{currentTimeStr || '--:--:-- WIB'}</span>
    </div>
  );
}
```

**Kunci Keberhasilan**:
- Dimensi kontainer di-lock: `min-w-[130px] h-7`.
- Font wajib: `font-mono tabular-nums` agar tiap angka memiliki lebar sama.
- Atribut wajib: `suppressHydrationWarning`.

---

## 2. Zero-Collapse Table Retention saat Sinkronisasi Preferensi Client

### Permasalahan (Root Cause)
Komponen client-side yang mengambil preferensi wilayah dari `localStorage` sering kali me-reset state data ke `null` saat wilayah terdeteksi berbeda dari server default, meruntuhkan (*collapse*) tabel jadwal 30 hari (~1400px), menyebabkan pergeseran layout masif (CLS 0.975).

### Pola Solusi Baku
```tsx
// app/jadwal-sholat/page.tsx (Server Component)
export default async function JadwalSholatPage({ searchParams }: PageProps) {
  // Pre-fetch wilayah default di server agar initial HTML langsung memuat tabel 30 hari
  const initialData = await getMonthlyShalat('Kota Serang', validBulan, validTahun);

  return (
    <div className="max-w-5xl mx-auto space-y-6 min-h-[850px]">
      <MonthlyPrayerCalendar
        bulan={validBulan}
        tahun={validTahun}
        initialData={initialData}
      />
    </div>
  );
}

// components/prayer/MonthlyPrayerCalendar.tsx (Client Component)
export function MonthlyPrayerCalendar({ initialData }: Props) {
  const [currentData, setCurrentData] = useState(initialData);
  const [region, setRegion] = useState('Kota Serang');
  const [isPending, startTransition] = useTransition();

  // Sinkronisasi wilayah dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem('banten_mengaji_region');
    if (stored && stored !== 'Kota Serang') {
      setRegion(stored);
    }
  }, []);

  useEffect(() => {
    startTransition(async () => {
      const data = await fetchMonthlyPrayerTimesAction(region, currentMonth, currentYear);
      setCurrentData(data); // Swap data langsung tanpa me-reset currentData ke null!
    });
  }, [region]);

  return (
    <div className={clsx('transition-opacity duration-200', isPending && 'opacity-70')}>
      {/* Tabel 30 hari tetap tampak di layar selama fetching */}
    </div>
  );
}
```

---

## 3. Fallback Banner Bergaya Islami Berdimensi Tetap (`aspect-video sm:h-48`)

### Permasalahan (Root Cause)
Pada CMS headless (seperti WordPress REST API), postingan tanpa gambar poster (`featured_media_url`) menyebabkan kartu menjadi pendek, merusak simetri grid kartu 2 atau 3 kolom, dan memicu layout shift saat filter diterapkan.

### Pola Solusi Baku
```tsx
// components/kajian/KajianCard.tsx & MasjidCard.tsx
{kajian.featured_media_url ? (
  <div className="relative w-full aspect-video sm:h-48 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
    <Image
      src={kajian.featured_media_url}
      alt={title.rendered}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
      placeholder="blur"
      blurDataURL={SHIMMER_BLUR_DATA_URL}
    />
  </div>
) : (
  <div className="relative w-full aspect-video sm:h-48 bg-gradient-to-br from-blue-900/10 via-slate-100 to-indigo-900/10 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/40 border-b border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between overflow-hidden">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#093c96] dark:text-blue-400">
        {isRutin ? 'Kajian Rutin' : 'Kajian Tematik'}
      </span>
      <BookOpen className="w-5 h-5 text-slate-400/80 dark:text-slate-500/80" />
    </div>
    <div>
      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
        {masjidName}
      </span>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
        {acf?.nama_ustadz ? `Bersama ${acf.nama_ustadz}` : 'Kajian Sunnah Banten'}
      </span>
    </div>
  </div>
)}
```

---

## 4. Standarisasi 48x48px Touch Targets & Safe Area Layout (WCAG 2.2)

### Permasalahan (Root Cause)
Tombol navigasi mobile, filter dropdown, dan aksi kartu yang hanya berukuran ~32px sulit disentuh jempol, sering salah klik, dan elemen bawah halaman rentan tertutup oleh bar navigasi ponsel yang tetap (*sticky*).

### Pola Solusi Baku
```tsx
// app/layout.tsx
// Padding bawah layout utama memperhitungkan safe-area iPhone/Android
<main className="flex-grow mx-auto px-4 py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0 container">
  {children}
</main>

// components/layout/BottomNav.tsx
// Navigasi 5 tab bawah dengan area klik penuh per kolom (~78x64px)
<nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 pb-[env(safe-area-inset-bottom)] box-content items-center justify-around border-t ...">
  <Link
    href="/jadwal-kajian"
    className="flex-1 h-full min-h-[48px] flex flex-col items-center justify-center gap-1 px-1 py-1 text-[11px] font-medium transition-all active:scale-95 select-none"
  >
    <Calendar className="h-5 w-5" />
    <span>Kajian</span>
  </Link>
</nav>

// Dropdown & Input Filter (KajianFilter.tsx, MasjidFilter.tsx)
<select className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 min-h-[48px] text-sm font-medium ...">
  ...
</select>
```
