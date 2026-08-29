import Link from 'next/link';
import { WPKajian } from '@/types';
import { MapPin, Clock, Calendar, User } from 'lucide-react';

export function KajianCard({ kajian }: { kajian: WPKajian }) {
  const { title, acf, slug, masjid_detail } = kajian;
  const masjidName = masjid_detail 
    ? masjid_detail.title.rendered 
    : (acf?.nama_masjid_manual || 'Masjid tidak diketahui');

  const isRutin = acf?.jenis_kajian === 'rutin';
  
  // Format tanggal jika ada
  const tanggalDisplay = acf?.tanggal_kajian ? new Date(acf.tanggal_kajian).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="flex gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isRutin ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
            {isRutin ? 'Kajian Rutin' : 'Kajian Tematik'}
          </span>
          {acf?.kategori_jamaah && (
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {acf.kategori_jamaah === 'umum' ? 'Umum' : acf.kategori_jamaah === 'khusus_akhawat' ? 'Akhawat' : 'Ikhwan'}
            </span>
          )}
        </div>
        
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
                {acf?.jam_mulai ? `${acf.jam_mulai} - ${acf.jam_selesai || 'Selesai'}` : ''}
                {acf?.waktu_keterangan ? ` (${acf.waktu_keterangan})` : ''}
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
