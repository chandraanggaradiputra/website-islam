import Link from 'next/link';
import Image from 'next/image';
import { WPKajian, formatKategoriJamaah } from '@/types';
import { MapPin, Clock, Calendar, User } from 'lucide-react';

export function KajianCard({ kajian }: { kajian: WPKajian }) {
  const { title, acf, slug, masjid_detail, masjid_name } = kajian;
  const masjidName = masjid_name 
    || (masjid_detail ? masjid_detail.title.rendered : (acf?.nama_masjid_manual || 'Masjid tidak diketahui'));

  const isRutin = acf?.jenis_kajian === 'rutin';
  
  // Format tanggal jika ada tanpa menyebabkan hydration mismatch (hindari toLocaleDateString bawaan)
  let tanggalDisplay = '';
  if (acf?.tanggal_kajian) {
    const [year, month, day] = acf.tanggal_kajian.split('-');
    if (year && month && day) {
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      tanggalDisplay = `${parseInt(day, 10)} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
    }
  }
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {kajian.featured_media_url && (
        <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
          <Image
            src={kajian.featured_media_url}
            alt={title.rendered}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5 flex-grow">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isRutin ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
            {isRutin ? 'Kajian Rutin' : 'Kajian Tematik'}
          </span>
          {acf?.kategori_jamaah && (
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {formatKategoriJamaah(acf.kategori_jamaah)}
            </span>
          )}
          {acf?.status_kajian === 'libur' && (
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-red-600 text-white uppercase tracking-wider">
              DILIBURKAN
            </span>
          )}
        </div>

        {acf?.status_kajian === 'libur' && (
          <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium">
            Kajian pekan ini diliburkan (misal karena pemateri udzur).
          </div>
        )}
        
        <h3 className="font-bold text-lg leading-tight mb-2 text-slate-900 dark:text-slate-100 line-clamp-2">
          {title.rendered}
        </h3>
        
        <div className="space-y-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
          {acf?.nama_ustadz && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-800 dark:text-slate-200">{acf.nama_ustadz}</span>
            </div>
          )}
          {(isRutin && acf?.hari_kajian) || tanggalDisplay ? (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{isRutin ? `Setiap ${acf?.hari_kajian}` : tanggalDisplay}</span>
            </div>
          ) : null}
          {(acf?.jam_mulai || acf?.waktu_keterangan) && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                {acf?.waktu_keterangan || (acf?.jam_mulai ? `${acf.jam_mulai} - ${acf.jam_selesai || 'Selesai'}` : '')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="line-clamp-1">{masjidName}</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50">
        <Link 
          href={`/jadwal-kajian/${slug}`}
          className="block w-full text-center text-sm font-semibold text-[#093c96] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Lihat Detail Lengkap
        </Link>
      </div>
    </div>
  );
}
