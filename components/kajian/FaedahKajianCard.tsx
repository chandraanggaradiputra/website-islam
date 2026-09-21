import Link from 'next/link';
import { WPKajian } from '@/types';
import { formatTanggalIndo } from '@/lib/utils/date';
import { decodeHtmlEntities } from '@/lib/utils/text';
import { getKajianCatatanFaedah } from '@/lib/kajian';
import { parseStreamingUrl } from '@/lib/utils/streamingUrl';
import { Calendar, MapPin, User, Video, ArrowRight, BookOpen } from 'lucide-react';

interface FaedahKajianCardProps {
  kajian: WPKajian;
}

export function FaedahKajianCard({ kajian }: FaedahKajianCardProps) {
  const { title, slug, acf, masjid_name, masjid_detail } = kajian;
  const rawFaedah = getKajianCatatanFaedah(kajian);
  const cleanFaedah = decodeHtmlEntities(rawFaedah);
  const cleanTitle = decodeHtmlEntities(title?.rendered || '');
  const ustadz = acf?.nama_ustadz ? decodeHtmlEntities(acf.nama_ustadz) : 'Asatidz';
  const finalMasjidName = masjid_name ? decodeHtmlEntities(masjid_name) : (acf?.nama_masjid_manual || 'Masjid Terkait');
  const lokasiWilayah = acf?.kota_kabupaten || masjid_detail?.acf?.kota_kabupaten || '';
  const tanggalDisplay = acf?.tanggal_kajian ? formatTanggalIndo(acf.tanggal_kajian) : '';
  const hasStreaming = !!parseStreamingUrl(acf?.link_streaming);

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col h-full overflow-hidden">
      <div className="p-5 sm:p-6 flex-grow flex flex-col">
        {/* Header Kartu: Tanggal & Badge Rekaman */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{tanggalDisplay || 'Kajian Rutin'}</span>
          </div>
          {hasStreaming && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-900/60">
              <Video className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Ada Rekaman</span>
            </span>
          )}
        </div>

        {/* Info Masjid & Lokasi */}
        <div className="flex items-center gap-1.5 text-xs text-[#093c96] dark:text-blue-400 font-semibold mb-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{finalMasjidName}{lokasiWilayah ? ` • ${lokasiWilayah}` : ''}</span>
        </div>

        {/* Judul Kajian */}
        <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          <Link href={`/jadwal-kajian/${slug}`}>
            {cleanTitle}
          </Link>
        </h3>

        {/* Pemateri / Ustadz */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
          <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
            <User className="w-3 h-3" />
          </div>
          <span className="font-medium">{ustadz}</span>
        </div>

        {/* Cuplikan Faedah */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed mb-4 flex-grow whitespace-pre-line">
          {cleanFaedah}
        </div>

        {/* Footer Kartu & CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Intisari Faedah</span>
          </span>
          <Link
            href={`/jadwal-kajian/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#093c96] hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group-hover:underline"
          >
            <span>{hasStreaming ? 'Baca & Tonton' : 'Baca Selengkapnya'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
