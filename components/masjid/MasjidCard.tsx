import Link from 'next/link';
import Image from 'next/image';
import { WPMasjid } from '@/types';
import { MapPin, Navigation } from 'lucide-react';
import { formatFasilitasLabel } from '@/lib/utils/fasilitas';

export function MasjidCard({ masjid }: { masjid: WPMasjid }) {
  const { title, acf, slug } = masjid;
  const fasilitas = (acf.fasilitas || []).map(formatFasilitasLabel);

  const mapsUrl = acf.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(masjid.title.rendered + ' Kota Serang')}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {masjid.featured_media_url && (
        <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
          <Image
            src={masjid.featured_media_url}
            alt={title.rendered}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
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
              <span key={f} className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-md">
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

      <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
        <Link 
          href={`/masjid/${slug}`}
          className="min-h-[44px] flex items-center justify-center p-3 text-center text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 transition-colors border-r border-slate-100 dark:border-slate-800"
        >
          Lihat Profil
        </Link>
        <a 
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] flex items-center justify-center gap-1.5 p-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[#093c96] dark:text-blue-400 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>Rute Maps</span>
        </a>
      </div>
    </div>
  );
}
