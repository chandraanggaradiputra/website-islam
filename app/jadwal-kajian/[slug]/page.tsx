import { getKajianBySlug } from '@/lib/wordpress';
import { getMasjidById } from '@/lib/actions/masjid';
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
  const { slug } = await params;
  const kajian = await getKajianBySlug(slug);
  
  if (!kajian) {
    return { title: 'Kajian Tidak Ditemukan' };
  }

  const { acf, title, featured_media_url, masjid_detail, masjid_name } = kajian;
  let masjidName = masjid_name || (masjid_detail ? masjid_detail.title.rendered : (acf?.nama_masjid_manual || 'Masjid tidak diketahui'));
  
  if (!masjid_detail && acf?.masjid_terkait && Array.isArray(acf.masjid_terkait) && acf.masjid_terkait.length > 0) {
    const rawId = acf.masjid_terkait[0];
    const targetId = typeof rawId === 'object' && rawId !== null ? Number((rawId as any).ID || (rawId as any).id) : Number(rawId);
    if (targetId) {
      const fetchedMasjid = await getMasjidById(targetId);
      if (fetchedMasjid) masjidName = fetchedMasjid.title.rendered;
    }
  }

  const isRutin = acf?.jenis_kajian === 'rutin';
  const waktu = isRutin ? `Setiap ${acf?.hari_kajian || ''}` : (acf?.tanggal_kajian || '');
  
  const plainTitle = title.rendered.replace(/<[^>]+>/g, '');
  const description = `Kajian bersama ${acf?.nama_ustadz || 'Asatidz'} di ${masjidName} pada ${waktu} jam ${acf?.jam_mulai || ''}.`;
  
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

export default async function SingleKajianPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kajian = await getKajianBySlug(slug);

  if (!kajian) {
    notFound();
  }

  const { acf, title, content, featured_media_url, masjid_detail, masjid_name } = kajian;
  const isRutin = acf?.jenis_kajian === 'rutin';
  
  let finalMasjidName = masjid_name || (masjid_detail ? masjid_detail.title.rendered : (acf?.nama_masjid_manual || 'Masjid tidak diketahui'));
  let finalMasjidSlug = masjid_detail?.slug || null;
  let finalMasjidAlamat = masjid_detail?.acf?.alamat_lengkap || null;
  let finalKotaKabupaten = acf?.kota_kabupaten || masjid_detail?.acf?.kota_kabupaten || null;

  if (!masjid_detail && acf?.masjid_terkait && Array.isArray(acf.masjid_terkait) && acf.masjid_terkait.length > 0) {
    const rawId = acf.masjid_terkait[0];
    const targetId = typeof rawId === 'object' && rawId !== null ? Number((rawId as any).ID || (rawId as any).id) : Number(rawId);
    if (targetId) {
      const fetchedMasjid = await getMasjidById(targetId);
      if (fetchedMasjid) {
        finalMasjidName = fetchedMasjid.title.rendered;
        finalMasjidSlug = fetchedMasjid.slug;
        finalMasjidAlamat = fetchedMasjid.acf?.alamat_lengkap || null;
        if (!finalKotaKabupaten) finalKotaKabupaten = fetchedMasjid.acf?.kota_kabupaten || null;
      }
    }
  }

  const kajianSchema = generateKajianSchema(kajian);
  
  const wktKeterangan = acf?.waktu_keterangan || (acf?.jam_mulai ? `${acf.jam_mulai} - ${acf.jam_selesai || 'Selesai'}` : '');

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
              {acf?.kategori_jamaah === 'umum' ? 'Umum' : acf?.kategori_jamaah === 'khusus_akhwat' ? 'Akhwat' : acf?.kategori_jamaah === 'khusus_ikhwan' ? 'Ikhwan' : (acf?.kategori_jamaah || 'Umum')}
            </span>
            {acf?.status_kajian === 'libur' && (
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                Diliburkan
              </span>
            )}
            {finalKotaKabupaten && (
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {finalKotaKabupaten}
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
                  <p className="font-semibold text-slate-900 dark:text-white">{acf?.nama_ustadz || 'Asatidz'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Book className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Kitab Bahasan</p>
                  <p className="font-medium text-slate-900 dark:text-white">{acf?.kitab_bahasan || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Waktu</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {isRutin ? `Setiap ${acf?.hari_kajian || ''}` : (acf?.tanggal_kajian || '')}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {wktKeterangan}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Lokasi</p>
                  {finalMasjidSlug ? (
                    <Link href={`/masjid/${finalMasjidSlug}`} className="font-medium text-[#093c96] dark:text-blue-400 hover:underline block">
                      {finalMasjidName}
                    </Link>
                  ) : (
                    <p className="font-medium text-slate-900 dark:text-white block">{finalMasjidName}</p>
                  )}
                  {finalMasjidAlamat && (
                    <p className="text-xs text-slate-500 mt-1">{finalMasjidAlamat}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            <CalendarButton kajian={kajian} />
            <ShareButton title={title.rendered} text={`Bersama: ${acf?.nama_ustadz || 'Asatidz'}\nLokasi: ${finalMasjidName}\nWaktu: ${isRutin ? 'Setiap ' + (acf?.hari_kajian || '') : (acf?.tanggal_kajian || '')} jam ${acf?.jam_mulai || ''}`} url="" />
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
