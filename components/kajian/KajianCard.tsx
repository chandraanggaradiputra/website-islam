import Link from 'next/link';
import Image from 'next/image';
import { WPKajian, formatKategoriJamaah } from '@/types';
import { MapPin, Clock, Calendar, User, Video } from 'lucide-react';
import { isKajianExpired, isKajianJustFinished } from '@/lib/kajian';
import htmlParser from 'html-react-parser';

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#093c96] dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

function formatTanggal(rawDate?: string): string | null {
  if (!rawDate || typeof rawDate !== 'string') return null;
  const clean = rawDate.trim();
  let year = '';
  let month = '';
  let day = '';

  if (clean.includes('-')) {
    const parts = clean.split('-');
    year = parts[0] || '';
    month = parts[1] || '';
    day = parts[2] || '';
  } else if (/^\d{8}$/.test(clean)) {
    year = clean.slice(0, 4);
    month = clean.slice(4, 6);
    day = clean.slice(6, 8);
  }

  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  if (!year || isNaN(monthNum) || isNaN(dayNum) || monthNum < 1 || monthNum > 12) {
    return null;
  }

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  return `${dayNum} ${monthNames[monthNum - 1]} ${year}`;
}

export function KajianCard({ kajian }: { kajian: WPKajian }) {
  const { title, acf, slug, masjid_detail, masjid_name } = kajian;
  const masjidName =
    masjid_name ||
    (masjid_detail
      ? masjid_detail.title.rendered
      : acf?.nama_masjid_manual || 'Masjid tidak diketahui');

  const isRutin = acf?.jenis_kajian === 'rutin';

  // Deteksi status selesai / lampau untuk penandaan kartu arsip
  const isSelesai =
    acf?.status_kajian === 'selesai' ||
    isKajianExpired(acf?.tanggal_kajian, acf?.jam_selesai, acf?.jam_mulai);
  const isJustFinished =
    !isSelesai &&
    isKajianJustFinished(acf?.tanggal_kajian, acf?.jam_selesai, acf?.jam_mulai);
  const hasRecording = Boolean(acf?.link_streaming && acf.link_streaming.trim() !== '');

  const tanggalDisplay = formatTanggal(acf?.tanggal_kajian);
  const jadwalHari = acf?.hari_kajian && acf.hari_kajian.trim()
    ? `Setiap ${acf.hari_kajian.trim()}`
    : null;

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
          {/* Badge Status Kajian Mendatang vs Arsip Selesai vs Selesai Berlangsung */}
          {isSelesai ? (
            hasRecording ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-950 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                <Video className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                <span>Selesai - Rekaman Tersedia</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                <span>Kajian Selesai</span>
                {tanggalDisplay && <span className="opacity-90">({tanggalDisplay})</span>}
              </span>
            )
          ) : isJustFinished ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              <span>Selesai Berlangsung</span>
            </span>
          ) : (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                isRutin
                  ? 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800'
                  : 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800'
              }`}
            >
              {isRutin ? 'Kajian Rutin' : 'Kajian Tematik'}
            </span>
          )}

          {acf?.kategori_jamaah && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {formatKategoriJamaah(acf.kategori_jamaah)}
            </span>
          )}

          {!isSelesai && acf?.status_kajian === 'libur' && (
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-red-600 text-white uppercase tracking-wider">
              DILIBURKAN
            </span>
          )}
        </div>

        {!isSelesai && acf?.status_kajian === 'libur' && (
          <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium">
            Kajian pekan ini diliburkan (misal karena pemateri udzur).
          </div>
        )}

        <h3 className="font-bold text-lg leading-tight mb-2 text-slate-900 dark:text-slate-100 line-clamp-2">
          {htmlParser(title.rendered)}
        </h3>

        <div className="space-y-2 mt-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
          {acf?.nama_ustadz && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {acf.nama_ustadz}
              </span>
            </div>
          )}
          {(isRutin && jadwalHari) || tanggalDisplay ? (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
              <span>{isRutin ? jadwalHari : tanggalDisplay}</span>
            </div>
          ) : null}
          {(acf?.jam_mulai || acf?.waktu_keterangan) && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
              <span>
                {acf?.waktu_keterangan ||
                  (acf?.jam_mulai
                    ? `${acf.jam_mulai} - ${acf.jam_selesai || 'Selesai'}`
                    : '')}
              </span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="line-clamp-2">{masjidName}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/50">
        <Link
          href={`/jadwal-kajian/${slug}`}
          className={`min-h-[44px] flex items-center justify-center w-full text-center text-sm font-semibold text-[#093c96] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${FOCUS_RING}`}
        >
          <span>
            {isSelesai && hasRecording ? 'Tonton Rekaman & Faedah' : 'Lihat Detail Lengkap'}
          </span>
          <span className="sr-only">: {htmlParser(title.rendered)}</span>
        </Link>
      </div>
    </div>
  );
}
