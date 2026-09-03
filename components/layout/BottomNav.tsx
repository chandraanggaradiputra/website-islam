'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { 
  Home, 
  Calendar, 
  Landmark, 
  Menu, 
  Plus, 
  ShieldCheck, 
  BookOpen, 
  LogIn
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuthSession();

  return (
    <>
      {/* 1. BOTTOM NAVIGATION BAR (FIXED 5-TAB) */}
      <nav
        aria-label="Navigasi Utama Smartphone"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 md:hidden transition-colors"
      >
        {/* Tab 1: Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
            pathname === '/' ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Beranda</span>
        </Link>

        {/* Tab 2: Jadwal Kajian */}
        <Link
          href="/jadwal-kajian"
          className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith('/jadwal-kajian') ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Kajian</span>
        </Link>

        {/* Tab 3 (Tengah - Adaptif Berdasarkan Role) */}
        {role === 'dkm' ? (
          <Link
            href="/dashboard/dkm/tambah-kajian"
            className="flex flex-col items-center justify-center -mt-5 group"
            aria-label="Tambah Jadwal Kajian Baru"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#093c96] text-white shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-[#093c96] dark:text-blue-400 mt-0.5">Tambah</span>
          </Link>
        ) : role === 'admin' ? (
          <Link
            href="/dashboard/admin"
            className="flex flex-col items-center justify-center -mt-5 group"
            aria-label="Moderasi Jadwal Kajian"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Moderasi</span>
          </Link>
        ) : (
          <Link
            href="/masjid"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith('/masjid') ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Landmark className="h-5 w-5" />
            <span>Masjid</span>
          </Link>
        )}

        {/* Tab 4 */}
        {role === 'dkm' ? (
          <Link
            href="/dashboard/dkm/profil-masjid"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith('/dashboard/dkm/profil-masjid') ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Landmark className="h-5 w-5" />
            <span>Profil Masjid</span>
          </Link>
        ) : role === 'admin' ? (
          <Link
            href="/dashboard/admin?tab=dkm"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname === '/dashboard/admin' && typeof window !== 'undefined' && window.location.search.includes('tab=dkm')
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Landmark className="h-5 w-5" />
            <span>Data DKM</span>
          </Link>
        ) : (
          <Link
            href="/artikel"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith('/artikel') ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Artikel</span>
          </Link>
        )}

        {/* Tab 5 */}
        {role === 'dkm' ? (
          <Link
            href="/dashboard/dkm"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname === '/dashboard/dkm' ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span>Dasbor</span>
          </Link>
        ) : role === 'admin' ? (
          <Link
            href="/dashboard/admin"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname === '/dashboard/admin' && typeof window !== 'undefined' && !window.location.search.includes('tab=dkm')
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span>Dasbor</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname === '/login' ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LogIn className="h-5 w-5" />
            <span>Masuk</span>
          </Link>
        )}
      </nav>
    </>
  );
}