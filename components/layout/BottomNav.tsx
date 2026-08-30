'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { 
  Home, 
  Calendar, 
  Clock, 
  Landmark, 
  Menu, 
  Plus, 
  ShieldCheck, 
  X, 
  ShoppingBag, 
  BookOpen, 
  HeartHandshake, 
  UserPlus, 
  LogIn, 
  LogOut, 
  MessageCircle, 
  Shield, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, logout } = useAuthSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
            href="/jadwal-sholat"
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith('/jadwal-sholat') ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Sholat</span>
          </Link>
        )}

        {/* Tab 4: Direktori Masjid */}
        <Link
          href={role === 'dkm' ? '/dashboard/dkm/profil-masjid' : '/masjid'}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith('/masjid') || pathname.startsWith('/dashboard/dkm/profil-masjid')
              ? 'text-[#093c96] dark:text-blue-400 font-bold' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Landmark className="h-5 w-5" />
          <span>{role === 'dkm' ? 'Masjidku' : 'Masjid'}</span>
        </Link>

        {/* Tab 5: Menu Khazanah / Dasbor Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
            isDrawerOpen ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Buka Menu Khazanah dan Layanan"
        >
          <Menu className="h-5 w-5" />
          <span>{isAuthenticated ? 'Dasbor' : 'Menu'}</span>
        </button>
      </nav>

      {/* 2. BOTTOM SHEET DRAWER (SLIDE UP DARI BAWAH) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
          <div 
            className="w-full max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all animate-in slide-in-from-bottom duration-300"
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAuthenticated ? `Hai, ${user?.name || user?.username}` : 'Menu & Khazanah Dakwah'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAuthenticated ? (role === 'admin' ? 'Super Admin Portal' : 'Pengurus DKM Masjid') : 'Syiar Salaf Kota Serang'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* HIGHLIGHT PROMINEN: JEMBATAN PASAR MAS CHAN DIGITAL */}
            <div className="my-5">
              <a
                href="https://maschandigital.id"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur shrink-0">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold tracking-tight">Pasar Mas Chan</span>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">UMKM Serang</span>
                    </div>
                    <p className="text-xs text-orange-100 mt-0.5">Belanja produk lokal & muslim Kota Serang</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 opacity-80 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            </div>

            {/* DAFTAR MENU LENGKAP */}
            <div className="space-y-4 text-sm">
              {/* Grup Khazanah */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Khazanah & Ibadah</p>
                <div className="space-y-1">
                  <Link
                    href="/jadwal-sholat"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <Clock className="h-5 w-5 text-[#093c96] dark:text-blue-400 shrink-0" />
                      <span>Jadwal Sholat Bulanan (Kemenag RI)</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>

                  <Link
                    href="/artikel"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>Artikel & Faedah Ilmiah</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>

                  <Link
                    href="/donasi"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <HeartHandshake className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>Infaq & Donasi Pengembangan</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Grup Akses Akun & Layanan DKM */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Layanan Pengurus DKM</p>
                <div className="space-y-1">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href={role === 'admin' ? '/dashboard/admin' : '/dashboard/dkm'}
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-xl p-3 bg-blue-50/60 text-[#093c96] dark:bg-blue-950/40 dark:text-blue-300 font-semibold transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 shrink-0" />
                          <span>Masuk ke Dasbor {role === 'admin' ? 'Admin' : 'DKM'}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsDrawerOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 font-medium transition-colors cursor-pointer"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/daftar-dkm"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                          <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Daftar Pengurus DKM Masjid</span>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      </Link>

                      <Link
                        href="/login"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                          <LogIn className="h-5 w-5 text-[#093c96] dark:text-blue-400 shrink-0" />
                          <span>Masuk Akun (Login)</span>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Bantuan & Legalitas */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <a
                  href="https://wa.me/6282298148474?text=Assalamualaikum%20Admin%20Syiar%20Salaf%20Serang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-600 font-semibold hover:underline"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Bantuan WA Admin</span>
                </a>
                <div className="flex items-center gap-3">
                  <Link href="/syarat-ketentuan" onClick={() => setIsDrawerOpen(false)} className="hover:underline">
                    Syarat
                  </Link>
                  <span>•</span>
                  <Link href="/kebijakan-privasi" onClick={() => setIsDrawerOpen(false)} className="hover:underline">
                    Privasi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}