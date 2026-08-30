'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  Sparkles,
  ChevronDown,
  Calendar,
  Clock,
  Landmark,
  BookOpen,
  HeartHandshake,
  ExternalLink,
  User,
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  ShieldAlert,
  Building2,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, role, logout } = useAuthSession();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAgendaActive = pathname === '/jadwal-kajian' || pathname === '/jadwal-sholat';
  const isKhazanahActive = pathname === '/masjid' || pathname === '/artikel' || pathname === '/donasi';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 transition-colors">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 gap-4">
        
        {/* ========================================================================= */}
        {/* 1. Brand Logo */}
        {/* ========================================================================= */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#093c96] to-blue-700 text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-[#093c96] dark:text-blue-400 leading-tight">
              Syiar Salaf
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Kota Serang, Banten
            </span>
          </div>
        </Link>

        {/* ========================================================================= */}
        {/* 2. Desktop Navigation with Smooth Hover Submenus */}
        {/* ========================================================================= */}
        <nav aria-label="Navigasi Header Desktop" className="hidden lg:flex items-center gap-1 xl:gap-2">
          
          {/* Menu: Beranda */}
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              pathname === '/'
                ? 'bg-blue-50 text-[#093c96] font-semibold dark:bg-blue-950/60 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            Beranda
          </Link>

          {/* Submenu 1: Agenda Ibadah */}
          <div className="relative group">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                isAgendaActive
                  ? 'bg-blue-50 text-[#093c96] font-semibold dark:bg-blue-950/60 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Agenda Ibadah</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 opacity-70" />
            </button>

            {/* Dropdown Panel */}
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 pt-2 w-64 z-50">
              <div className="rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 space-y-1">
                <Link
                  href="/jadwal-kajian"
                  className="flex items-start gap-3 rounded-xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/item"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 group-hover/item:scale-105 transition-transform shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-[#093c96] dark:group-hover/item:text-blue-400 transition-colors">
                      Jadwal Kajian Sunnah
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Kajian rutin & tematik di Serang
                    </p>
                  </div>
                </Link>

                <Link
                  href="/jadwal-sholat"
                  className="flex items-start gap-3 rounded-xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/item"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover/item:scale-105 transition-transform shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-[#093c96] dark:group-hover/item:text-blue-400 transition-colors">
                      Jadwal Sholat Bulanan
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Resmi Bimas Islam Kemenag RI
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Submenu 2: Khazanah & Direktori */}
          <div className="relative group">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                isKhazanahActive
                  ? 'bg-blue-50 text-[#093c96] font-semibold dark:bg-blue-950/60 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Khazanah & Direktori</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 opacity-70" />
            </button>

            {/* Dropdown Panel */}
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 pt-2 w-72 z-50">
              <div className="rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 space-y-1">
                <Link
                  href="/masjid"
                  className="flex items-start gap-3 rounded-xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/item"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover/item:scale-105 transition-transform shrink-0">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
                      Direktori Masjid Sunnah
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Daftar masjid di wilayah Kota Serang
                    </p>
                  </div>
                </Link>

                <Link
                  href="/artikel"
                  className="flex items-start gap-3 rounded-xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/item"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 group-hover/item:scale-105 transition-transform shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-[#093c96] dark:group-hover/item:text-blue-400 transition-colors">
                      Artikel & Faedah Ilmiah
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Risalah ilmu tholabul &apos;ilmi bermanhaj salaf
                    </p>
                  </div>
                </Link>

                <Link
                  href="/donasi"
                  className="flex items-start gap-3 rounded-xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/item"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover/item:scale-105 transition-transform shrink-0">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors">
                      Infaq Pengembangan
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Dukung operasional & dakwah Islam
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Tombol Ekosistem Marketplace Mas Chan Digital */}
          <a
            href="https://maschandigital.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1 text-xs font-bold text-white shadow-sm hover:scale-105 hover:shadow-orange-500/20 transition-all ml-1 shrink-0"
            title="Kunjungi Marketplace UMKM Kota Serang"
          >
            <span>🛍️ Pasar Mas Chan</span>
            <ExternalLink className="h-3 w-3 opacity-90" />
          </a>
        </nav>

        {/* ========================================================================= */}
        {/* 3. Right Area: Global Search, ThemeToggle, & Profile / Auth */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Search Global */}
          <GlobalSearch />

          {/* Tema Gelap/Terang */}
          <ThemeToggle />

          {/* Kondisi 1: GUEST */}
          {role === 'guest' && (
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link
                href="/daftar-dkm"
                aria-label="Pendaftaran DKM"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#093c96] dark:text-blue-400" />
                <span>Daftar DKM</span>
              </Link>
              <Link
                href="/login"
                aria-label="Masuk Akun"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#093c96] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </Link>
            </div>
          )}

          {/* Kondisi 2: LOGGED IN (SUPER ADMIN / DKM MASJID) - Avatar Profile Dropdown */}
          {(role === 'admin' || role === 'dkm') && (
            <div className="relative ml-1" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Menu Profil Akun"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold text-xs shadow-sm ${
                    role === 'admin' ? 'bg-[#093c96]' : 'bg-emerald-600'
                  }`}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : role === 'admin' ? 'A' : 'D'}
                </div>
                <div className="hidden md:flex flex-col max-w-[110px]">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {user?.name || (role === 'admin' ? 'Super Admin' : 'DKM')}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate -mt-0.5">
                    {role === 'admin' ? 'Administrator' : user?.masjidName || 'DKM Masjid'}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Header */}
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#093c96] dark:bg-blue-950/60 dark:text-blue-300">
                          <ShieldCheck className="h-3 w-3" /> Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Landmark className="h-3 w-3" /> DKM Masjid
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || (role === 'dkm' && user?.masjidName ? user.masjidName : '')}
                    </p>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1 space-y-0.5">
                    <Link
                      href={role === 'admin' ? '/dashboard/admin' : '/dashboard/dkm'}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-[#093c96] dark:text-blue-400" />
                      <span>Dasbor Utama</span>
                    </Link>

                    {role === 'admin' && (
                      <Link
                        href="/dashboard/admin?tab=dkm"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                        <span>Antrean Moderasi DKM</span>
                      </Link>
                    )}

                    {role === 'dkm' && (
                      <>
                        <Link
                          href="/dashboard/dkm/profil-masjid"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                        >
                          <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Profil Masjid Saya</span>
                        </Link>
                        <Link
                          href="/dashboard/dkm/tambah-kajian"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-[#093c96] dark:text-blue-400" />
                          <span>+ Tambah Kajian</span>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
