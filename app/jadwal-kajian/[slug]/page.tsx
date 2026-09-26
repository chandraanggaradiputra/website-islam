import { getKajianBySlug } from '@/lib/wordpress';
import { getMasjidById } from '@/lib/actions/masjid';
import { Metadata } from 'next';
import Image from 'next/image';
import { WPMasjid, formatKategoriJamaah } from '@/types';
import { getKajianJsonLd } from '@/lib/schema';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarButton } from '@/components/kajian/CalendarButton';
import { ShareButton } from '@/components/ui/ShareButton';
import { CopyWhatsAppButton } from '@/components/kajian/CopyWhatsAppButton';
import { stripHtmlToWhatsAppText, formatWhatsAppText, generateDefaultKajianBroadcast, decodeHtmlEntities } from '@/lib/utils/whatsappText';
import { Calendar, MapPin, User, ArrowLeft, Book, AlertCircle, CheckCircle2, Video, MessageSquareShare } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { isKajianExpired, isKajianJustFinished, getKajianCatatanFaedah } from '@/lib/kajian';
import { parseStreamingUrl } from '@/lib/utils/streamingUrl';
import { KajianVideoPlayer } from '@/components/kajian/KajianVideoPlayer';
import { formatTanggalIndo } from '@/lib/utils/date';

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
    const targetId = typeof rawId === 'object' && rawId !== null ? Number((rawId as { ID?: number; id?: number }).ID || (rawId as { ID?: number; id?: number }).id) : Number(rawId);
    if (targetId) {
      const fetchedMasjid = await getMasjidById(targetId);
      if (fetchedMasjid) masjidName = fetchedMasjid.title.rendered;
    }
  }

  const isRutin = acf?.jenis_kajian === 'rutin';
  const waktu = isRutin ? `Setiap ${acf?.hari_kajian || ''}` : (acf?.tanggal_kajian ? formatTanggalIndo(acf.tanggal_kajian) : '');
  
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
  let finalMasjid: WPMasjid | null = masjid_detail || null;

  if (!masjid_detail && acf?.masjid_terkait && Array.isArray(acf.masjid_terkait) && acf.masjid_terkait.length > 0) {
    const rawId = acf.masjid_terkait[0];
    const targetId = typeof rawId === 'object' && rawId !== null ? Number((rawId as { ID?: number; id?: number }).ID || (rawId as { ID?: number; id?: number }).id) : Number(rawId);
    if (targetId) {
      const fetchedMasjid = await getMasjidById(targetId);
      if (fetchedMasjid) {
        finalMasjid = fetchedMasjid;
        finalMasjidName = fetchedMasjid.title.rendered;
        finalMasjidSlug = fetchedMasjid.slug;
        finalMasjidAlamat = fetchedMasjid.acf?.alamat_lengkap || null;
        if (!finalKotaKabupaten) finalKotaKabupaten = fetchedMasjid.acf?.kota_kabupaten || null;
      }
    }
  }

  const kajianSchema = getKajianJsonLd(kajian);
  
  const wktKeterangan = acf?.waktu_keterangan || (acf?.jam_mulai ? `${acf.jam_mulai} - ${acf.jam_selesai || 'Selesai'}` : '');

  // Deteksi status kajian selesai / kedaluwarsa & ketersediaan siaran streaming
  const isSelesai = acf?.status_kajian === 'selesai' || isKajianExpired(acf?.tanggal_kajian, acf?.jam_selesai, acf?.jam_mulai);
  const isJustFinished = !isSelesai && isKajianJustFinished(acf?.tanggal_kajian, acf?.jam_selesai, acf?.jam_mulai);
  const streamingInfo = parseStreamingUrl(acf?.link_streaming);
  const hasStreaming = !!streamingInfo;
  const catatanFaedahText = decodeHtmlEntities(getKajianCatatanFaedah(kajian));

  // Format tanggal baku bahasa Indonesia untuk banner informasi & tampilan
  const tanggalKajianDisplay = !isRutin && acf?.tanggal_kajian ? formatTanggalIndo(acf.tanggal_kajian) : '';

  // Siapkan teks format siaran WhatsApp untuk salin clipboard
  const rawContentText = stripHtmlToWhatsAppText(content?.rendered || '');
  const finalWhatsAppText = rawContentText.trim()
    ? rawContentText
    : generateDefaultKajianBroadcast({
        judul: decodeHtmlEntities(title.rendered.replace(/<[^>]+>/g, '')),
        ustadz: acf?.nama_ustadz,
        kitab: acf?.kitab_bahasan,
        waktu: isRutin ? `Setiap ${acf?.hari_kajian || ''}` : (tanggalKajianDisplay || '-'),
        waktuKeterangan: wktKeterangan,
        namaMasjid: finalMasjidName,
        alamatMasjid: finalMasjidAlamat || undefined,
        linkStreaming: acf?.link_streaming || undefined,
        slug,
      });

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
          <div className="flex flex-wrap gap-2 mb-4">
            {isSelesai ? (
              hasStreaming ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Selesai - Rekaman Tersedia</span>
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Kajian Selesai
                </span>
              )
            ) : isJustFinished ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Selesai Berlangsung
              </span>
            ) : (
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isRutin ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                {isRutin ? 'Kajian Rutin' : 'Kajian Tematik'}
              </span>
            )}
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {formatKategoriJamaah(acf?.kategori_jamaah)}
            </span>
            {!isSelesai && acf?.status_kajian === 'libur' && (
              <span className="text-xs font-extrabold px-3 py-1 rounded-md bg-red-600 text-white uppercase tracking-wider">
                DILIBURKAN
              </span>
            )}
            {finalKotaKabupaten && (
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {finalKotaKabupaten}
              </span>
            )}
          </div>

          {/* Banner Informasi Kajian Selesai */}
          {isSelesai && (
            <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Kajian Telah Selesai Dilaksanakan</h4>
                <p className="text-xs mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                  Kajian ini telah selesai dilaksanakan {isRutin && acf?.hari_kajian ? `(Rutin ${acf.hari_kajian})` : (tanggalKajianDisplay ? `pada ${tanggalKajianDisplay}` : '')}.
                  {hasStreaming ? ' Rekaman video dan siaran kajian dapat disimak di bawah ini.' : ''}
                </p>
              </div>
            </div>
          )}

          {!isSelesai && acf?.status_kajian === 'libur' && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Pemberitahuan: Kajian Ini Diliburkan</h4>
                <p className="text-xs mt-0.5 text-red-700 dark:text-red-300 leading-relaxed">
                  Jadwal kajian ini diliburkan sementara untuk sesi ini (misal karena pemateri udzur atau halangan lainnya). Silakan hubungi DKM terkait atau pantau jadwal kajian sunnah lainnya.
                </p>
              </div>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
            {decodeHtmlEntities(title.rendered)}
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
                    {isRutin ? `Setiap ${acf?.hari_kajian || ''}` : (tanggalKajianDisplay || formatTanggalIndo(acf?.tanggal_kajian))}
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

          <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            {!isSelesai && <CalendarButton kajian={kajian} masjid={finalMasjid} />}
            {!isSelesai && <CopyWhatsAppButton textToCopy={finalWhatsAppText} title={decodeHtmlEntities(title.rendered)} />}
            <ShareButton
              title={decodeHtmlEntities(title.rendered)}
              text={`Bersama: ${acf?.nama_ustadz ? decodeHtmlEntities(acf.nama_ustadz) : 'Asatidz'}\nLokasi: ${finalMasjidName}\nWaktu: ${isRutin ? 'Setiap ' + (acf?.hari_kajian || '') : (tanggalKajianDisplay || formatTanggalIndo(acf?.tanggal_kajian))} jam ${acf?.jam_mulai || ''}`}
              url=""
            />
          </div>

          {/* Pemutar Video Rekaman / Siaran Streaming Multi-Platform (YouTube, Facebook, dsb.) */}
          {hasStreaming && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-[#093c96] dark:text-blue-400" />
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  {isSelesai ? 'Rekaman Video Kajian' : 'Siaran Live / Streaming Kajian'}
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                {isSelesai
                  ? 'Mari simak kembali rekaman dokumentasi dan pembahasan faedah ilmu dari kajian ini:'
                  : 'Saksikan siaran langsung kajian melalui pemutar di bawah ini:'}
              </p>
              <KajianVideoPlayer url={acf?.link_streaming} title={`Video Kajian: ${decodeHtmlEntities(title.rendered)}`} />
            </div>
          )}

          {/* Seksi Konten: Catatan & Ringkasan Faedah Kajian (Kajian Selesai) ATAU Informasi & Teks Siaran WhatsApp (Kajian Berjalan) */}
          {isSelesai ? (
            // Untuk kajian selesai: HANYA tampilkan jika ada catatan faedah dari DKM (tanpa teks jadwal lama dan tanpa tombol salin WA)
            catatanFaedahText ? (
              <div className={hasStreaming ? 'mt-8 pt-6 border-t border-slate-200 dark:border-slate-800' : 'mt-8 pt-6 border-t border-slate-200 dark:border-slate-800'}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Book className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                    Catatan &amp; Ringkasan Faedah Kajian
                  </h2>
                </div>

                <div dir="ltr" className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans text-left [unicode-bidi:plaintext]">
                  {catatanFaedahText}
                </div>
              </div>
            ) : null
          ) : (
            // Untuk kajian aktif/mendatang: Tampilkan teks informasi siaran WhatsApp
            (content.rendered || acf?.catatan_faedah) ? (
              <div className={hasStreaming ? 'mt-8 pt-6 border-t border-slate-200 dark:border-slate-800' : 'mt-8 pt-6 border-t border-slate-200 dark:border-slate-800'}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                      <MessageSquareShare className="w-4 h-4" />
                    </div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                      Informasi &amp; Teks Siaran WhatsApp
                    </h2>
                  </div>
                  <CopyWhatsAppButton
                    textToCopy={finalWhatsAppText}
                    title={decodeHtmlEntities(title.rendered)}
                    variant="compact"
                  />
                </div>

                {acf?.catatan_faedah && (
                  <div dir="ltr" className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line text-left [unicode-bidi:plaintext]">
                    {acf.catatan_faedah}
                  </div>
                )}

                {rawContentText.trim() && (
                  <div
                    dir="ltr"
                    className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200 space-y-4 leading-relaxed font-sans break-words text-left [unicode-bidi:plaintext] [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_em]:italic [&_del]:line-through"
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppText(rawContentText) }}
                  />
                )}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
