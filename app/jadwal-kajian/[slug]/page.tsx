import { getKajianBySlug } from '@/lib/wordpress';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarButton } from '@/components/kajian/CalendarButton';
import { ShareButton } from '@/components/ui/ShareButton';
import { Calendar, MapPin, User, ArrowLeft, Book } from 'lucide-react';
import htmlParser from 'html-react-parser';
import Image from 'next/image';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateKajianSchema } from '@/lib/schema';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const kajian = await getKajianBySlug(resolvedParams.slug);
  
  if (!kajian) {
    return { title: 'Kajian Tidak Ditemukan' };
  }

  const { acf, title, featured_media_url, masjid_detail, masjid_name } = kajian;
  const masjidName = masjid_name
    || (masjid_detail ? masjid_detail.title.rendered : (acf?.nama_masjid_manual || 'Masjid tidak diketahui'));
    
  const isRutin = acf?.jenis_kajian === 'rutin';
  const waktu = isRutin ? `Setiap ${acf.hari_kajian}` : acf.tanggal_kajian;
  
  const plainTitle = title.rendered.replace(/<[^>]+>/g, '');
  const description = `Kajian bersama ${acf.nama_ustadz} di ${masjidName} pada ${waktu} jam ${acf.jam_mulai}.`;
  
  return {
    title: plainTitle,
    description,
    openGraph: {
      title: plainTitle,
      description,
      images: featured_media_url ? [featured_media_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: plainTitle,
      description,
      images: featured_media_url ? [featured_media_url] : [],
    }
  };
}

export default async function KajianDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const kajian = await getKajianBySlug(resolvedParams.slug);

  if (!kajian) {
    notFound();
  }

  const { acf, title, content, featured_media_url, masjid_detail, masjid_name } = kajian;
  const isRutin = acf?.jenis_kajian === 'rutin';
  
  const masjidName = masjid_name
    || (masjid_detail ? masjid_detail.title.rendered : (acf?.nama_masjid_manual || 'Masjid tidak diketahui'));
    
  const masjidSlug = masjid_detail?.slug || null;
  const kajianSchema = generateKajianSchema(kajian);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <JsonLd data={kajianSchema} />
      <Link href="/jadwal-kajian" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Jadwal
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {featured_media_url && (
          <div className="w-full h-64 md:h-96 relative bg-slate-100 dark:bg-slate-800">
            <Image 
              src={featured_media_url} 
              alt={title.rendered}
              fill
              className="object-contain"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex gap-2 mb-4">
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isRutin ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
              {isRutin ? 'Kajian Rutin' : 'Kajian Tematik'}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {acf.kategori_jamaah === 'umum' ? 'Umum' : acf.kategori_jamaah === 'khusus_akhwat' ? 'Akhwat' : 'Ikhwan'}
            </span>
            {acf.status_kajian === 'libur' && (
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                Diliburkan
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
            {title.rendered}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Pemateri</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{acf.nama_ustadz}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Book className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Kitab Bahasan</p>
                  <p className="font-medium text-slate-900 dark:text-white">{acf.kitab_bahasan || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Waktu</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {isRutin ? `Setiap ${acf.hari_kajian}` : acf.tanggal_kajian}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {acf.jam_mulai} - {acf.jam_selesai || 'Selesai'} ({acf.waktu_keterangan})
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Lokasi</p>
                  {masjidSlug ? (
                    <Link href={`/masjid/${masjidSlug}`} className="font-medium text-[#093c96] dark:text-blue-400 hover:underline">
                      {masjidName}
                    </Link>
                  ) : (
                    <p className="font-medium text-slate-900 dark:text-white">{masjidName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            <CalendarButton kajian={kajian} />
            <ShareButton title={title.rendered} text={`Bersama: ${acf.nama_ustadz}\nLokasi: ${masjidName}\nWaktu: ${isRutin ? 'Setiap ' + acf.hari_kajian : acf.tanggal_kajian} jam ${acf.jam_mulai}`} url="" />
          </div>

          {content.rendered && (
            <div>
              <h3 className="font-bold text-lg mb-4">Catatan Tambahan</h3>
              <div className="prose dark:prose-invert max-w-none prose-sm md:prose-base">
                {htmlParser(content.rendered)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
