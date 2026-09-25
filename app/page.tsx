import Link from 'next/link';
import { PrayerTimesWidget } from '@/components/prayer/PrayerTimesWidget';
import { KajianCard } from '@/components/kajian/KajianCard';
import { MasjidCard } from '@/components/masjid/MasjidCard';
import { getKajianList, getMasjidList, getArtikelList } from '@/lib/wordpress';
import { isKajianExpired } from '@/lib/kajian';
import { ArrowRight, BookOpen } from 'lucide-react';
import htmlParser from 'html-react-parser';

export const revalidate = 60;

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#093c96] dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

interface SectionHeaderProps {
  id: string;
  title: string;
  href: string;
  srContext: string;
}

function SectionHeader({ id, title, href, srContext }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 id={id} className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <Link
        href={href}
        className={`text-sm font-semibold text-[#093c96] dark:text-blue-400 hover:underline flex items-center gap-1 min-h-[44px] px-2 rounded-lg transition-colors ${FOCUS_RING}`}
      >
        <span>Lihat Semua</span>
        <span className="sr-only">: {srContext}</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

interface StateBoxProps {
  children: React.ReactNode;
  error?: boolean;
}

function StateBox({ children, error = false }: StateBoxProps) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`rounded-xl p-8 text-center text-sm font-medium border ${
        error
          ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
      }`}
    >
      {children}
    </div>
  );
}

export default async function Home() {
  const [kajianRes, masjidRes, artikelRes] = await Promise.allSettled([
    getKajianList(),
    getMasjidList(),
    getArtikelList(),
  ]);

  const kajianList = kajianRes.status === 'fulfilled' ? kajianRes.value : null;
  if (kajianRes.status === 'rejected') {
    console.error('Error fetching Kajian list in page.tsx:', kajianRes.reason);
  }

  const masjidList = masjidRes.status === 'fulfilled' ? masjidRes.value : null;
  if (masjidRes.status === 'rejected') {
    console.error('Error fetching Masjid list in page.tsx:', masjidRes.reason);
  }

  const artikelList = artikelRes.status === 'fulfilled' ? artikelRes.value : null;
  if (artikelRes.status === 'rejected') {
    console.error('Error fetching Artikel list in page.tsx:', artikelRes.reason);
  }

  const validKajian = kajianList
    ? kajianList.filter((k) => {
        if (k.acf?.status_kajian === 'selesai') return false;
        if (isKajianExpired(k.acf?.tanggal_kajian, k.acf?.jam_selesai, k.acf?.jam_mulai)) {
          return false;
        }
        return (
          k.acf?.status_kajian === 'aktif' ||
          k.acf?.status_kajian === 'libur' ||
          !k.acf?.status_kajian
        );
      })
    : [];

  const activeKajian = validKajian.slice(0, 3);
  const featuredMasjid = masjidList ? masjidList.slice(0, 2) : [];
  const latestArtikel = artikelList ? artikelList.slice(0, 3) : [];

  return (
    <div className="space-y-10">
      {/* Heading 1 Utama Tingkat Halaman (Aksesibilitas Screen Reader) */}
      <h1 className="sr-only">Banten Mengaji, Portal Dakwah Sunnah Banten</h1>

      {/* Seksi Waktu Sholat */}
      <section aria-labelledby="sec-sholat">
        <h2 id="sec-sholat" className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Waktu Sholat
        </h2>
        <PrayerTimesWidget />
      </section>

      {/* Seksi Kajian Terdekat */}
      <section aria-labelledby="sec-kajian">
        <SectionHeader
          id="sec-kajian"
          title="Kajian Terdekat"
          href="/jadwal-kajian"
          srContext="Daftar Jadwal Kajian Terdekat"
        />

        {kajianList === null ? (
          <StateBox error>
            Gagal memuat jadwal kajian terbaru. Silakan coba muat ulang halaman beberapa saat lagi.
          </StateBox>
        ) : activeKajian.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeKajian.map((kajian) => (
              <KajianCard key={kajian.id} kajian={kajian} />
            ))}
          </div>
        ) : (
          <StateBox>
            Belum ada jadwal kajian terbaru saat ini.
          </StateBox>
        )}
      </section>

      {/* Seksi Direktori Masjid */}
      <section aria-labelledby="sec-masjid">
        <SectionHeader
          id="sec-masjid"
          title="Direktori Masjid"
          href="/masjid"
          srContext="Direktori Masjid Sunnah Banten"
        />

        {masjidList === null ? (
          <StateBox error>
            Gagal memuat direktori masjid. Silakan coba muat ulang halaman beberapa saat lagi.
          </StateBox>
        ) : featuredMasjid.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredMasjid.map((masjid) => (
              <MasjidCard key={masjid.id} masjid={masjid} />
            ))}
          </div>
        ) : (
          <StateBox>
            Belum ada data masjid yang terdaftar.
          </StateBox>
        )}
      </section>

      {/* Seksi Artikel & Mutiara Faedah Terbaru */}
      <section aria-labelledby="sec-artikel">
        <SectionHeader
          id="sec-artikel"
          title="Artikel Terbaru"
          href="/artikel"
          srContext="Katalog Direktori Mutiara Faedah Kajian"
        />

        {artikelList === null ? (
          <StateBox error>
            Gagal memuat mutiara faedah & artikel terbaru. Silakan coba muat ulang halaman beberapa saat lagi.
          </StateBox>
        ) : latestArtikel.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestArtikel.map((artikel) => (
              <Link
                href={`/artikel/${artikel.slug}`}
                key={artikel.id}
                className={`group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all flex flex-col ${FOCUS_RING}`}
              >
                <div className="p-5 flex-grow">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium mb-2">
                    <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                    <span>{new Date(artikel.date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-slate-900 dark:text-slate-100">
                    {htmlParser(artikel.title.rendered)}
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-3">
                    {htmlParser(artikel.excerpt.rendered)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <StateBox>
            Belum ada artikel atau mutiara faedah terbaru.
          </StateBox>
        )}
      </section>
    </div>
  );
}
