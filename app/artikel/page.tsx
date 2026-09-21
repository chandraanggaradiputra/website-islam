import { Metadata } from 'next';
import Link from 'next/link';
import { getKajianFaedahList } from '@/lib/kajian';
import { FaedahKajianCard } from '@/components/kajian/FaedahKajianCard';
import { BookOpen, Sparkles, Calendar, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Catatan & Ringkasan Faedah Kajian | Banten Mengaji',
  description: "Kumpulan intisari ilmu syar'i dan faedah tholabul 'ilmi dari kajian Islam bermanhaj Salaf di masjid-masjid se-Provinsi Banten.",
  openGraph: {
    title: 'Catatan & Ringkasan Faedah Kajian | Banten Mengaji',
    description: "Kumpulan intisari ilmu syar'i dan faedah tholabul 'ilmi dari kajian Islam bermanhaj Salaf di masjid-masjid se-Provinsi Banten.",
  },
};

export default async function ArtikelFaedahPage() {
  const faedahList = await getKajianFaedahList();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Halaman */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#093c96] via-[#072d73] to-slate-900 text-white p-8 md:p-12 shadow-md">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Intisari Tholabul &apos;Ilmi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Catatan &amp; Ringkasan Faedah Kajian
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            Kumpulan intisari ilmu syar&apos;i dan faedah tholabul &apos;ilmi dari kajian Islam bermanhaj Salaf di masjid-masjid se-Provinsi Banten yang telah selesai diselenggarakan.
          </p>
        </div>

        {/* Dekorasi Latar Belakang */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <BookOpen className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Grid Katalog Faedah */}
      {faedahList.length > 0 ? (
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Daftar Ringkasan Faedah Terbaru ({faedahList.length})
              </h2>
            </div>
            <Link
              href="/jadwal-kajian"
              className="text-xs font-semibold text-[#093c96] hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>Jadwal Mendatang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faedahList.map((kajian) => (
              <FaedahKajianCard key={kajian.id} kajian={kajian} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/40">
            <BookOpen className="w-7 h-7" />
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
            Belum Ada Catatan Faedah
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Pengurus DKM masjid se-Banten akan mengunggah ringkasan dan mutiara faedah setelah kajian selesai diselenggarakan. Silakan cek kembali secara berkala atau simak jadwal kajian mendatang.
          </p>

          <Link
            href="/jadwal-kajian"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#093c96] hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Lihat Jadwal Kajian Mendatang</span>
          </Link>
        </div>
      )}
    </div>
  );
}
