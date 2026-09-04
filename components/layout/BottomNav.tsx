'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  Home, 
  Calendar, 
  Landmark, 
  Menu, 
  Plus, 
  ShieldCheck, 
  BookOpen, 
  LogIn,
  X,
  Clock,
  HeartHandshake,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  UserPlus,
  LayoutDashboard,
  LogOut,
  Sparkles,
  User
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { user, role, logout } = useAuthSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Penutup otomatis ketika rute (pathname) berpindah
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDrawerOpen(false);
  }, [pathname]);

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. BOTTOM NAVIGATION BAR (FIXED 5-TAB) */}
      {/* ========================================================================= */}
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

        {/* Tab 5: Tombol Menu Lengkap (Pemicu Bottom Sheet Drawer) */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
            isDrawerOpen ? 'text-[#093c96] dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Buka Menu Navigasi Lengkap"
        >
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 2. BOTTOM SHEET DRAWER (SLIDE-UP MODAL DARI BAWAH) */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Sheet Drawer Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu & Layanan Banten Mengaji"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200/90 bg-white p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950 transition-transform duration-300 animate-in slide-in-from-bottom"
          >
            {/* 1. Header Drawer: Drag handle bar kecil di tengah atas */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#093c96] to-blue-700 text-white shadow-sm shadow-blue-900/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Menu & Layanan Banten Mengaji
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Navigasi lengkap se-Provinsi Banten
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 2. Area Autentikasi Pengguna (Role-Adaptive) */}
            <div className="my-4">
              {role === 'guest' ? (
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-slate-800/90 dark:bg-slate-900/60">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#093c96] dark:bg-blue-950/80 dark:text-blue-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Masuk atau Daftarkan Masjid Anda
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola jadwal kajian dan identitas masjid Anda di platform Banten Mengaji.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#093c96] px-3 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Masuk / Login</span>
                    </Link>
                    <Link
                      href="/daftar-dkm"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 text-[#093c96] dark:text-blue-400" />
                      <span>Daftar DKM</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-slate-800/90 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#093c96] dark:bg-blue-950/80 dark:text-blue-400 font-bold">
                        {role === 'admin' ? <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" /> : <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user?.name || (role === 'admin' ? 'Super Admin' : 'Pengurus DKM')}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {role === 'admin' ? 'Super Admin' : user?.masjidName || 'Pengurus DKM'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={role === 'admin' ? '/dashboard/admin' : '/dashboard/dkm'}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                        role === 'admin'
                          ? 'bg-[#093c96] hover:bg-blue-800'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dasbor {role === 'admin' ? 'Admin' : 'DKM'}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsDrawerOpen(false);
                        await logout();
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Daftar Navigasi Utama & Fitur Ibadah */}
            <div className="my-4 space-y-1.5">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Fitur & Layanan Utama
              </p>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white dark:divide-slate-800/80 dark:border-slate-800/80 dark:bg-slate-900/40 overflow-hidden">
                <Link
                  href="/jadwal-sholat"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors">
                        Jadwal Sholat & Imsakiyah
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Waktu sholat 8 kota/kabupaten se-Banten
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                </Link>

                <Link
                  href="/jadwal-kajian"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-105 transition-transform">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors">
                        Jadwal Kajian Sunnah
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Kajian rutin, tematik, ikhwan & akhwat
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                </Link>

                <Link
                  href="/masjid"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Direktori Masjid Sunnah
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Peta dan profil masjid bermanhaj salaf
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                </Link>

                <Link
                  href="/artikel"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-105 transition-transform">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Artikel & Faedah Ilmiah
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Risalah tholabul &apos;ilmi bermanhaj salaf
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                </Link>

                <Link
                  href="/donasi"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:scale-105 transition-transform">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Infaq & Donasi Masjid
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Dukung sarana & operasional dakwah
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                </Link>
              </div>
            </div>

            {/* 4. Kartu Ekosistem Terhubung: Mas Chan Digital */}
            <div className="my-4">
              <a
                href="https://maschandigital.id"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-blue-50/50 border border-blue-200/90 dark:bg-[#093c96]/10 dark:border-[#093c96]/30 p-4 hover:border-[#093c96]/50 transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#093c96] text-white shadow-sm shadow-blue-900/20 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-[#093c96] dark:bg-[#093c96]/30 dark:text-blue-300">
                      Ekosistem Digital
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#093c96] dark:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors">
                  Mas Chan Digital
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Temukan produk halal, busana muslim, buku & kitab sunnah, dan aneka usaha kaum muslimin di Provinsi Banten.
                </p>
              </a>
            </div>

            {/* 5. Footer Drawer */}
            <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium">Tema:</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <Link
                  href="/kebijakan-privasi"
                  onClick={() => setIsDrawerOpen(false)}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </Link>
                <span>•</span>
                <Link
                  href="/syarat-ketentuan"
                  onClick={() => setIsDrawerOpen(false)}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Syarat Ketentuan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}