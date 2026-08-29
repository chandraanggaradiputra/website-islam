import { getArtikelList } from '@/lib/wordpress';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import htmlParser from 'html-react-parser';

export const revalidate = 60;

export default async function ArtikelPage() {
  const artikelList = await getArtikelList();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Artikel Islami</h1>
        <p className="text-slate-600 dark:text-slate-400">Kumpulan tulisan dan nasihat yang bermanfaat.</p>
      </div>

      {artikelList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {artikelList.map(artikel => (
            <Link href={`/artikel/${artikel.slug}`} key={artikel.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <BookOpen className="w-4 h-4" />
                  <span>{new Date(artikel.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h3 className="font-bold text-xl leading-tight mb-3 group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors">
                  {htmlParser(artikel.title.rendered)}
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                  {htmlParser(artikel.excerpt.rendered)}
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-semibold text-[#093c96] dark:text-blue-400 group-hover:underline">
                    Baca Selengkapnya
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <p className="font-medium text-lg mb-1">Belum ada artikel</p>
          <p className="text-sm">Silakan kunjungi halaman ini kembali nanti.</p>
        </div>
      )}
    </div>
  );
}
