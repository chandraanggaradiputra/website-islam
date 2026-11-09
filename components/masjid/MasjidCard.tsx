// components/masjid/MasjidCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { WPMasjid } from '@/types';
import { MapPin, Navigation, Landmark } from 'lucide-react';
import { formatFasilitasLabel } from '@/lib/utils/fasilitas';
import { SHIMMER_BLUR_DATA_URL } from '@/lib/constants/imagePlaceholder';

export function MasjidCard({ masjid }: { masjid: WPMasjid }) {
  const { title, acf, slug } = masjid;
  const fasilitas = (acf.fasilitas || []).map(formatFasilitasLabel);

  const mapsUrl =
    acf.google_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      masjid.title.rendered + ' Kota Serang'
    )}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Banner Thumbnail Berdimensi Tetap aspect-video sm:h-48 (Zero Layout Shift) */}
      {masjid.featured_media_url ? (
        <div className="relative w-full aspect-video sm:h-48 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
          <Image
            src={masjid.featured_media_url}
            alt={title.rendered}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={SHIMMER_BLUR_DATA_URL}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video sm:h-48 bg-gradient-to-br from-emerald-900/10 via-slate-100 to-teal-900/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/40 border-b border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Masjid Sunnah
            </span>
            <Landmark className="w-5 h-5 text-slate-400/80 dark:text-slate-500/80" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
              {title.rendered}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              {acf.kota_kabupaten || 'Provinsi Banten'}
            </span>
          </div>
        </div>
      )}

      <div className="p-5 flex-grow">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100">
            {title.rendered}
          </h3>
          {acf.kota_kabupaten && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
              {acf.kota_kabupaten}
            </span>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{acf.alamat_lengkap}</span>
        </div>

        {fasilitas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {fasilitas.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-md"
              >
                {f}
              </span>
            ))}
            {fasilitas.length > 3 && (
              <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-md">
                +{fasilitas.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid 2 Tombol Aksi dengan Touch Target Minimal 48x48px (WCAG 2.2 SC 2.5.8) */}
      <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
        <Link
          href={`/masjid/${slug}`}
          className="min-h-[48px] flex items-center justify-center p-3 text-center text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 transition-colors border-r border-slate-100 dark:border-slate-800"
        >
          Lihat Profil
        </Link>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] flex items-center justify-center gap-1.5 p-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[#093c96] dark:text-blue-400 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>Rute Maps</span>
        </a>
      </div>
    </div>
  );
}
