import Link from 'next/link';
import { PrayerTimesWidget } from '@/components/prayer/PrayerTimesWidget';
import { KajianCard } from '@/components/kajian/KajianCard';
import { MasjidCard } from '@/components/masjid/MasjidCard';
import { getKajianList, getMasjidList, getArtikelList } from '@/lib/wordpress';
import { ArrowRight, BookOpen } from 'lucide-react';
import htmlParser from 'html-react-parser';

export const revalidate = 60;

export default async function Home() {
  const [kajianList, masjidList, artikelList] = await Promise.all([
    getKajianList(),
    getMasjidList(),
    getArtikelList(),
  ]);

  let activeKajian = kajianList.filter(k => k.acf.status_kajian === 'aktif').slice(0, 3);
  if (activeKajian.length === 0) {
    activeKajian = kajianList.slice(0, 3);
  }
  const featuredMasjid = masjidList.slice(0, 2);
  const latestArtikel = artikelList.slice(0, 3);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-4">Waktu Sholat</h1>
        <PrayerTimesWidget />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Kajian Terdekat</h2>
          <Link href="/jadwal-kajian" className="text-sm font-medium text-[#093c96] dark:text-blue-400 hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {activeKajian.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeKajian.map(kajian => (
              <KajianCard key={kajian.id} kajian={kajian} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
            Belum ada jadwal kajian terbaru saat ini.
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Direktori Masjid</h2>
          <Link href="/masjid" className="text-sm font-medium text-[#093c96] dark:text-blue-400 hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredMasjid.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredMasjid.map(masjid => (
              <MasjidCard key={masjid.id} masjid={masjid} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
            Belum ada data masjid yang terdaftar.
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Artikel Terbaru</h2>
          <Link href="/artikel" className="text-sm font-medium text-[#093c96] dark:text-blue-400 hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {latestArtikel.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestArtikel.map(artikel => (
              <Link href={`/artikel/${artikel.slug}`} key={artikel.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all flex flex-col">
                <div className="p-5 flex-grow">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{new Date(artikel.date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {htmlParser(artikel.title.rendered)}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {htmlParser(artikel.excerpt.rendered)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
            Belum ada artikel terbaru.
          </div>
        )}
      </section>
    </div>
  );
}
