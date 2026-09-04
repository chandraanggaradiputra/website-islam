'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, role, logout } = useAuthSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md dark:bg-slate-950/95 transition-colors border-b border-slate-200/80 dark:border-slate-800/80">
      
      {/* ========================================================================= */}
      {/* LAPISAN 1: TOP BAR */}
      {/* ========================================================================= */}
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 gap-4">
        
        {/* Bagian Kiri: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white group shrink-0">
          <Image
            src="/banten-mengaji.jpeg"
            alt="Logo Banten Mengaji"
            width={40}
            height={40}
            className="rounded-xl object-cover shadow-sm border border-slate-200/60 dark:border-slate-800 group-hover:scale-105 transition-transform shrink-0"
            priority
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-[#093c96] dark:text-blue-400 leading-tight">
              Banten Mengaji
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Provinsi Banten
            </span>
          </div>
        </Link>

        {/* Bagian Tengah: Global Search (Desktop) */}
        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <GlobalSearch 
            triggerClassName="w-full flex items-center justify-between rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shadow-sm" 
            triggerText="Cari jadwal kajian, ustadz, atau masjid..." 
          />
        </div>

        {/* Bagian Kanan: CTA, ThemeToggle, Auth */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Search Trigger for Mobile */}
          <div className="md:hidden">
            <GlobalSearch 
              triggerClassName="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors" 
              triggerText="" 
              iconOnly={true} 
            />
          </div>

          {/* Tombol Ekosistem Marketplace Mas Chan Digital */}
          <a
            href="https://maschandigital.id"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#093c96] hover:bg-blue-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm hover:shadow-blue-900/20 transition-all ml-1 shrink-0"
            title="Kunjungi Marketplace UMKM Kota Serang"
          >
            <span>Mas Chan Digital</span>
            <ExternalLink className="h-3 w-3 opacity-90" />
          </a>

          {/* Tema Gelap/Terang */}
          <ThemeToggle />

          {/* Role-Adaptive Auth Buttons */}
          {role === 'guest' && (
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link
                href="/daftar-dkm"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#093c96] dark:text-blue-400" />
                <span>Daftar DKM</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#093c96] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </Link>
            </div>
          )}

          {(role === 'admin' || role === 'dkm') && (
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <div className="flex flex-col text-right mr-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || (role === 'admin' ? 'Admin' : 'Pengurus')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 max-w-[120px] truncate">
                  {role === 'admin' ? 'Super Admin' : user?.masjidName || 'Pengurus DKM'}
                </span>
              </div>
              <Link
                href={role === 'admin' ? '/dashboard/admin' : '/dashboard/dkm'}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm whitespace-nowrap ${
                  role === 'admin' ? 'bg-[#093c96] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dasbor</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-red-950/40 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="sr-only lg:not-sr-only lg:inline-block">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAPISAN 2: SUB-NAVIGATION BAR (Desktop Only) */}
      {/* ========================================================================= */}
      <div className="hidden md:block border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 py-2">
        <div className="container mx-auto max-w-6xl px-4 flex items-center justify-between">
          
          {/* Bagian Kiri: Daftar Menu Navigasi Utama */}
          <nav aria-label="Navigasi Utama" className="flex items-center gap-1">
            <Link
              href="/"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-blue-100/50 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/jadwal-kajian"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/jadwal-kajian')
                  ? 'bg-blue-100/50 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              Jadwal Kajian
            </Link>
            <Link
              href="/jadwal-sholat"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/jadwal-sholat')
                  ? 'bg-blue-100/50 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              Jadwal Sholat
            </Link>
            <Link
              href="/masjid"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/masjid')
                  ? 'bg-blue-100/50 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              Direktori Masjid
            </Link>
            <Link
              href="/artikel"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/artikel')
                  ? 'bg-blue-100/50 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              Artikel & Faedah
            </Link>
            <Link
              href="/donasi"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/donasi')
                  ? 'bg-blue-100/50 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              Infaq & Donasi
            </Link>
          </nav>

          {/* Bagian Kanan: Tagline */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Syiar Dakwah Salafiyah se-Provinsi Banten</span>
          </div>
        </div>
      </div>
    </header>
  );
}
