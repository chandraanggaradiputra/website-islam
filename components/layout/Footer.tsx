// components/layout/Footer.tsx
import Link from 'next/link';
import { MapPin, Phone, Mail, Sparkles, Heart } from 'lucide-react';
import clsx from 'clsx';

const KECAMATAN_LIST = [
  'Serang',
  'Cipocok Jaya',
  'Kasemen',
  'Taktakan',
  'Walantaka',
  'Curug',
];

export function Footer() {
  return (
    <footer className={clsx('bg-slate-50', 'dark:bg-slate-950', 'border-slate-200', 'dark:border-slate-800', 'border-t', 'text-slate-600', 'dark:text-slate-400', 'transition-colors')}>
      <div className={clsx('mx-auto', 'px-4', 'py-12', 'max-w-6xl', 'container')}>
        <div className={clsx('gap-8', 'grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')}>
          {/* Kolom 1: Profil Portal */}
          <div className="space-y-4">
            <div className={clsx('flex', 'items-center', 'gap-2.5')}>
              <div className={clsx('flex', 'justify-center', 'items-center', 'bg-[#093c96]', 'rounded-lg', 'w-8', 'h-8', 'text-white')}>
                <Sparkles className={clsx('w-4', 'h-4')} />
              </div>
              <span className={clsx('font-bold', 'text-[#093c96]', 'dark:text-blue-400', 'text-lg')}>
                Syiar Salaf Serang
              </span>
            </div>
            <p className={clsx('text-slate-600', 'dark:text-slate-400', 'text-sm', 'leading-relaxed')}>
              Pusat informasi jadwal kajian ilmiah Islam bermanhaj Salafus Shalih, direktori masjid sunnah, dan faedah tholabul &apos;ilmi di wilayah Kota Serang dan sekitarnya.
            </p>
            <div className={clsx('flex', 'items-center', 'gap-2', 'text-slate-500', 'text-xs')}>
              <MapPin className={clsx('w-4', 'h-4', 'text-[#093c96]', 'dark:text-blue-400')} />
              <span>Kota Serang, Banten, Indonesia</span>
            </div>
          </div>

          {/* Kolom 2: Navigasi Utama */}
          <div>
            <h4 className={clsx('mb-4', 'font-semibold', 'text-slate-900', 'dark:text-slate-200', 'text-sm', 'uppercase', 'tracking-wider')}>
              Menu Utama
            </h4>
            <ul className={clsx('space-y-2.5', 'text-sm')}>
              <li>
                <Link href="/" className={clsx('hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}>
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/jadwal-kajian" className={clsx('hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}>
                  Jadwal Kajian Sunnah
                </Link>
              </li>
              <li>
                <Link href="/masjid" className={clsx('hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}>
                  Direktori Masjid Sunnah
                </Link>
              </li>
              <li>
                <Link href="/artikel" className={clsx('hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}>
                  Artikel & Faedah Ilmiah
                </Link>
              </li>
              <li>
                <Link href="/donasi" className={clsx('hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}>
                  Infaq Pengembangan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kajian Berdasarkan Kecamatan */}
          <div>
            <h4 className={clsx('mb-4', 'font-semibold', 'text-slate-900', 'dark:text-slate-200', 'text-sm', 'uppercase', 'tracking-wider')}>
              Kecamatan di Serang
            </h4>
            <ul className={clsx('gap-2', 'grid', 'grid-cols-2', 'text-sm')}>
              {KECAMATAN_LIST.map((kec) => (
                <li key={kec}>
                  <Link
                    href={`/jadwal-kajian?kecamatan=${encodeURIComponent(kec)}`}
                    className={clsx('hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}
                  >
                    Kec. {kec}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Layanan & Informasi */}
          <div className="space-y-3">
            <h4 className={clsx('font-semibold', 'text-slate-900', 'dark:text-slate-200', 'text-sm', 'uppercase', 'tracking-wider')}>
              Informasi & Kontak
            </h4>
            <p className={clsx('text-slate-500', 'dark:text-slate-400', 'text-xs')}>
              Ingin mendaftarkan jadwal kajian rutin DKM atau konfirmasi infaq dakwah?
            </p>
            <div className={clsx('space-y-2', 'pt-1', 'text-sm')}>
              <a
                href="https://wa.me/6282298148474"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx('flex', 'items-center', 'gap-2', 'hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}
              >
                <Phone className={clsx('w-4', 'h-4', 'text-emerald-600')} />
                <span>0822-9814-8474 (WhatsApp)</span>
              </a>
              <a
                href="mailto:admin@maschandigital.id"
                className={clsx('flex', 'items-center', 'gap-2', 'hover:text-[#093c96]', 'dark:hover:text-blue-400', 'transition-colors')}
              >
                <Mail className={clsx('w-4', 'h-4', 'text-blue-600')} />
                <span>admin@maschandigital.id</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className={clsx('mt-12', 'pt-6', 'border-slate-200/80', 'dark:border-slate-800', 'border-t', 'text-slate-500', 'dark:text-slate-400', 'text-xs', 'text-center', 'space-y-2')}>
          <p className={clsx('flex', 'flex-wrap', 'justify-center', 'items-center', 'gap-1')}>
            <span>© 2026 Syiar Salaf Kota Serang. All rights reserved.</span>
            <span>•</span>
            <span className={clsx('inline-flex', 'items-center', 'gap-1')}>
              Developed with <Heart className={clsx('fill-red-500', 'w-3', 'h-3', 'text-red-500')} /> by
              <a
                href="https://maschandigital.id"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx('font-semibold', 'text-[#093c96]', 'dark:text-blue-400', 'hover:underline')}
              >
                Mas Chan Digital
              </a>
            </span>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Link href="/syarat-ketentuan" className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Syarat & Ketentuan
            </Link>
            <span className="mx-2">•</span>
            <Link href="/kebijakan-privasi" className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}