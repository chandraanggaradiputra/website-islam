import { getMasjidBySlug, getKajianList } from '@/lib/wordpress';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { KajianCard } from '@/components/kajian/KajianCard';
import { InfaqModal } from '@/components/masjid/InfaqModal';
import { MapPin, Navigation, ArrowLeft, Phone, Globe } from 'lucide-react';
import htmlParser from 'html-react-parser';
import Image from 'next/image';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const masjid = await getMasjidBySlug(resolvedParams.slug);
  
  if (!masjid) {
    return { title: 'Masjid Tidak Ditemukan' };
  }

  const plainTitle = masjid.title.rendered.replace(/<[^>]+>/g, '');
  const description = masjid.acf.alamat_lengkap || `Jadwal dan informasi detail mengenai ${plainTitle}.`;
  
  return {
    title: plainTitle,
    description,
    openGraph: {
      title: plainTitle,
      description,
      images: masjid.featured_media_url ? [masjid.featured_media_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: plainTitle,
      description,
      images: masjid.featured_media_url ? [masjid.featured_media_url] : [],
    }
  };
}

export default async function MasjidDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const masjid = await getMasjidBySlug(resolvedParams.slug);

  if (!masjid) {
    notFound();
  }

  // Fetch all kajian and filter by this masjid
  const allKajian = await getKajianList();
  const masjidKajian = allKajian.filter((k) => k.masjid_detail?.id === masjid.id);

  const { acf, title, content, featured_media_url } = masjid;
  const fasilitas = acf.fasilitas || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/masjid" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Direktori
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {featured_media_url && (
          <div className="w-full h-64 md:h-96 relative bg-slate-100 dark:bg-slate-800">
            <Image 
              src={featured_media_url} 
              alt={title.rendered}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">
            {title.rendered}
          </h1>

          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 mb-6">
            <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-[#093c96] dark:text-blue-400" />
            <span className="text-base">{acf.alamat_lengkap}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 space-y-6">
              {fasilitas.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Fasilitas</h3>
                  <div className="flex flex-wrap gap-2">
                    {fasilitas.map((f) => (
                      <span key={f} className="text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {content.rendered && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Profil Masjid</h3>
                  <div className="prose dark:prose-invert max-w-none prose-sm md:prose-base">
                    {htmlParser(content.rendered)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <a 
                href={acf.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(masjid.title.rendered + ' Kota Serang')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white py-3 rounded-xl font-semibold transition-colors"
              >
                <Navigation className="w-5 h-5" />
                Rute Google Maps
              </a>
              
              <InfaqModal masjid={masjid} />

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-4 space-y-3">
                <h4 className="font-semibold text-sm">Kontak DKM</h4>
                {acf.no_wa_dkm && (
                  <a href={`https://wa.me/${acf.no_wa_dkm.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>{acf.no_wa_dkm} {acf.nama_kontak_dkm ? `(${acf.nama_kontak_dkm})` : ''}</span>
                  </a>
                )}
                {acf.instagram_url && (
                  <a href={acf.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#093c96] dark:text-blue-400 hover:underline">
                    <Globe className="w-4 h-4" />
                    <span>Instagram</span>
                  </a>
                )}
                {acf.youtube_url && (
                  <a href={acf.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline">
                    <Globe className="w-4 h-4" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6">Jadwal Kajian di {title.rendered}</h2>
            {masjidKajian.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {masjidKajian.map(kajian => (
                  <KajianCard key={kajian.id} kajian={kajian} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-8 text-center text-slate-500">
                Belum ada jadwal kajian yang terdaftar untuk masjid ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
