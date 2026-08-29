import { getArtikelBySlug } from '@/lib/wordpress';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShareButton } from '@/components/ui/ShareButton';
import { ArrowLeft, Calendar } from 'lucide-react';
import htmlParser from 'html-react-parser';
import Image from 'next/image';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateArtikelSchema } from '@/lib/schema';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const artikel = await getArtikelBySlug(resolvedParams.slug);
  
  if (!artikel) {
    return { title: 'Artikel Tidak Ditemukan' };
  }

  const plainTitle = artikel.title.rendered.replace(/<[^>]+>/g, '');
  const plainDescription = artikel.excerpt.rendered.replace(/<[^>]+>/g, '').trim();
  
  return {
    title: plainTitle,
    description: plainDescription,
    openGraph: {
      title: plainTitle,
      description: plainDescription,
      images: artikel.featured_media_url ? [artikel.featured_media_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: plainTitle,
      description: plainDescription,
      images: artikel.featured_media_url ? [artikel.featured_media_url] : [],
    }
  };
}

export default async function ArtikelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const artikel = await getArtikelBySlug(resolvedParams.slug);

  if (!artikel) {
    notFound();
  }

  const artikelSchema = generateArtikelSchema(artikel);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <JsonLd data={artikelSchema} />
      <Link href="/artikel" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Artikel
      </Link>

      <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {artikel.featured_media_url && (
          <div className="w-full h-64 md:h-96 relative bg-slate-100 dark:bg-slate-800">
            <Image 
              src={artikel.featured_media_url} 
              alt={artikel.title.rendered}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(artikel.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            
            <ShareButton title={htmlParser(artikel.title.rendered) as string} text={htmlParser(artikel.excerpt.rendered) as string} url="" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 dark:text-white leading-tight">
            {htmlParser(artikel.title.rendered)}
          </h1>

          <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-a:text-[#093c96] dark:prose-a:text-blue-400 prose-img:rounded-xl">
            {htmlParser(artikel.content.rendered)}
          </div>
        </div>
      </article>
    </div>
  );
}
