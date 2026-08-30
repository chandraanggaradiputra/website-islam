'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  Sparkles,
  LogIn,
  UserPlus,
  PlusCircle,
  ShieldAlert,
  LogOut,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

const BASE_NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jadwal Kajian', href: '/jadwal-kajian' },
  { label: 'Jadwal Sholat', href: '/jadwal-sholat' },
  { label: 'Direktori Masjid', href: '/masjid' },
  { label: 'Artikel & Faedah', href: '/artikel' },
];

export function Header() {
  const pathname = usePathname();
  const { user, role, logout } = useAuthSession();

  // Dynamic Navigation Links based on user role
  const navLinks = [...BASE_NAV_LINKS];
  if (role === 'dkm') {
    navLinks.push({ label: 'Dasbor DKM', href: '/dashboard/dkm' });
  } else if (role === 'admin') {
    navLinks.push({ label: 'Dasbor Admin', href: '/dashboard/admin' });
  }

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
        <nav aria-label="Navigasi Header Desktop" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
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

        {/* Right Actions - Role-Adaptive */}
        <div className="flex items-center gap-2">
          {/* Tombol Search Global */}
          <GlobalSearch />

          {/* Kondisi 1: GUEST */}
          {role === 'guest' && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/daftar-dkm"
                aria-label="Pendaftaran DKM"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#093c96] dark:text-blue-400" />
                <span>Daftar DKM</span>
              </Link>
              <Link
                href="/login"
                aria-label="Masuk Akun"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#093c96] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </Link>
            </div>
          )}

          {/* Kondisi 2: DKM MASJID */}
          {role === 'dkm' && (
            <div className="hidden sm:flex items-center gap-2">
              {/* Badge Masjid */}
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 max-w-[180px] truncate">
                <Landmark className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{user?.masjidName || 'Masjid DKM'}</span>
              </div>

              {/* Tombol Tambah Kajian */}
              <Link
                href="/dashboard/dkm/tambah-kajian"
                aria-label="Tambah Jadwal Kajian"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Tambah Kajian</span>
              </Link>

              {/* Tombol Logout */}
              <button
                type="button"
                onClick={logout}
                aria-label="Keluar Akun"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          )}

          {/* Kondisi 3: SUPER ADMIN */}
          {role === 'admin' && (
            <div className="hidden sm:flex items-center gap-2">
              {/* Badge Admin */}
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#093c96] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                <ShieldCheck className="h-3.5 w-3.5 text-[#093c96] dark:text-blue-400" />
                <span>Super Admin</span>
              </div>

              {/* Tombol Antrean Moderasi */}
              <Link
                href="/dashboard/admin"
                aria-label="Antrean Moderasi Kajian"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#093c96] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Moderasi</span>
              </Link>

              {/* Tombol Logout */}
              <button
                type="button"
                onClick={logout}
                aria-label="Keluar Akun Admin"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          )}

          {/* Tema Gelap/Terang */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
