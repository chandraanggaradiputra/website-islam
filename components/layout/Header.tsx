'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { Moon, Sparkles, MessageCircle } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jadwal Kajian', href: '/jadwal-kajian' },
  { label: 'Direktori Masjid', href: '/masjid' },
  { label: 'Artikel & Faedah', href: '/artikel' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#093c96] to-blue-700 text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-[#093c96] dark:text-blue-400">
              Syiar Salaf
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1">
              Kota Serang, Banten
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Navigasi Header Desktop" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-[#093c96] font-semibold dark:bg-blue-950/60 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <Link
            href="https://wa.me/6282298148474?text=Assalamualaikum%20Admin%20Syiar%20Salaf%20Kota%20Serang,%20saya%20ingin%20info/pasang%20jadwal%20kajian"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Info Kajian</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
