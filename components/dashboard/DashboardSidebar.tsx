'use client';

/**
 * ============================================================================
 * Komponen: DashboardSidebar (Flowbite-Inspired Desktop Navigation)
 * ============================================================================
 * Komponen navigasi vertikal modular untuk dasbor desktop dengan mengadaptasi
 * standar Flowbite Default Sidebar. Mengintegrasikan palet warna resmi
 * Royal Navy Mas Chan Digital (#093c96) untuk elemen aktif dan Warm Islamic
 * Gold (#C5A059) untuk aksen identitas masjid dan status kepengurusan DKM.
 *
 * Struktur Utama:
 * 1. Header Identitas Brand & Portal
 * 2. Kartu Profil Pengguna & Ringkasan Peran (Admin / DKM)
 * 3. Kartu Identitas Masjid Binaan (Khusus Pengurus DKM)
 * 4. Navigasi Menu Dinamis Berbasis Peran dengan Indikator Status Aktif
 * 5. Footer Aksi: Tautan Situs Publik & Tombol Logout Aman
 * ============================================================================
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard,
  Building2,
  CalendarPlus,
  Users,
  BookOpen,
  CreditCard,
  Settings,
  ShieldCheck,
  ExternalLink,
  LogOut,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  BellRing,
} from 'lucide-react';

// ============================================================================
// Definisi Tipe Data Props Komponen
// ============================================================================
export interface DashboardSidebarProps {
  /** Peran akun pengguna: 'admin' atau 'dkm' */
  userRole?: 'admin' | 'dkm';
  /** Nama lengkap pengguna yang sedang aktif */
  userName?: string;
  /** Alamat email resmi pengguna */
  userEmail?: string;
  /** Nama masjid fisik yang dikelola (khusus pengurus DKM) */
  masjidName?: string;
  /** ID postingan masjid fisik di WordPress */
  masjidId?: number;
  /** Nama kecamatan atau wilayah domisili masjid */
  kecamatanName?: string;
}

/**
 * Komponen Internal Navigasi (Membungkus useSearchParams agar aman di Suspense)
 */
function DashboardSidebarContent({
  userRole = 'dkm',
  userName = 'Pengurus',
  userEmail = '',
  masjidName,
  masjidId,
  kecamatanName,
}: DashboardSidebarProps) {
  // Hook navigasi rute aktif
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const isAdmin = userRole === 'admin';

  // Inisial nama untuk avatar fallback
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  // ============================================================================
  // Logika Pemeriksaan Tautan Menu Aktif
  // ============================================================================
  /**
   * Menentukan apakah rute tertentu sedang aktif berdasarkan pathname & tab query
   */
  const isItemActive = (href: string, tabValue?: string): boolean => {
    if (isAdmin) {
      if (tabValue) {
        return pathname === '/dashboard/admin' && currentTab === tabValue;
      }
      if (href === '/dashboard/admin') {
        return pathname === '/dashboard/admin' && !currentTab;
      }
      return pathname.startsWith(href);
    } else {
      // Role DKM
      if (href === '/dashboard/dkm') {
        return pathname === '/dashboard/dkm';
      }
      return pathname.startsWith(href);
    }
  };

  return (
    <aside
      aria-label="Sidebar Navigasi Dasbor"
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 transition-colors"
    >
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Header Identitas Brand & Portal */}
      {/* ---------------------------------------------------------------------- */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#093c96] rounded-xl p-1 -m-1 transition-all"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/banten-mengaji.jpeg"
              alt="Logo Banten Mengaji"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                Banten Mengaji
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#093c96]/10 text-[#093c96] dark:bg-blue-900/30 dark:text-blue-300">
                {isAdmin ? 'Super Admin' : 'Portal DKM'}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* Area Tengah Scrollable (Profil, Masjid Card, & Menu List) */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* -------------------------------------------------------------------- */}
        {/* 2. Kartu Profil Pengguna Aktif */}
        {/* -------------------------------------------------------------------- */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#093c96] text-white flex items-center justify-center font-bold text-base shadow-sm shadow-[#093c96]/20 shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate leading-snug">
              {userName}
            </p>
            {userEmail && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {userEmail}
              </p>
            )}
            <div className="mt-1">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-[#093c96] dark:bg-blue-950/80 dark:text-blue-300 border border-[#093c96]/20">
                  <ShieldCheck className="w-3 h-3" />
                  Administrator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-[#C5A059]/40">
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  Pengurus DKM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* 3. Khusus DKM: Kartu Masjid Binaan Beraksen Warm Islamic Gold */}
        {/* -------------------------------------------------------------------- */}
        {!isAdmin && (
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/10 border border-[#C5A059]/30 dark:border-[#C5A059]/20 rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Masjid Binaan
                </p>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                  {masjidName || 'Belum Terhubung'}
                </h4>
                {kecamatanName && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-[#C5A059] shrink-0" />
                    <span className="truncate">{kecamatanName}</span>
                  </p>
                )}
                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DKM Resmi Terdaftar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* 4. Navigasi Menu Dinamis (Flowbite List Style) */}
        {/* -------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Menu Utama
            </p>
            <ul className="space-y-1.5 font-medium">
              {/* === NAVIGASI ROLE DKM === */}
              {!isAdmin && (
                <>
                  {/* Dasbor DKM */}
                  <li>
                    <Link
                      href="/dashboard/dkm"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/dkm')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Dasbor Ikhtisar</span>
                    </Link>
                  </li>

                  {/* Profil Masjid Saya */}
                  <li>
                    <Link
                      href="/dashboard/dkm/profil-masjid"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/dkm/profil-masjid')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Profil Masjid</span>
                    </Link>
                  </li>

                  {/* Tambah Jadwal Kajian */}
                  <li>
                    <Link
                      href="/dashboard/dkm/tambah-kajian"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/dkm/tambah-kajian')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <CalendarPlus className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Tambah Jadwal</span>
                    </Link>
                  </li>

                  {/* Placeholder Fitur Mendatang: Kegiatan & Artikel */}
                  <li>
                    <div
                      title="Fitur rilis mendatang"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75"
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Kegiatan & Artikel</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Segera
                      </span>
                    </div>
                  </li>

                  {/* Placeholder Fitur Mendatang: Infaq & Keuangan */}
                  <li>
                    <div
                      title="Fitur rilis mendatang"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75"
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Infaq & Rekening</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Segera
                      </span>
                    </div>
                  </li>
                </>
              )}

              {/* === NAVIGASI ROLE ADMIN === */}
              {isAdmin && (
                <>
                  {/* Dasbor & Verifikasi DKM */}
                  <li>
                    <Link
                      href="/dashboard/admin?tab=dkm"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/admin', 'dkm') || (!currentTab && pathname === '/dashboard/admin')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Verifikasi DKM</span>
                    </Link>
                  </li>

                  {/* Kelola Basis Data Masjid */}
                  <li>
                    <Link
                      href="/dashboard/admin?tab=masjid"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/admin', 'masjid')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Kelola Masjid</span>
                    </Link>
                  </li>

                  {/* Kelola Jadwal Kajian */}
                  <li>
                    <Link
                      href="/dashboard/admin?tab=kajian"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/admin', 'kajian')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Kelola Kajian</span>
                    </Link>
                  </li>

                  {/* Tambah Kajian Admin */}
                  <li>
                    <Link
                      href="/dashboard/admin/tambah-kajian"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/admin/tambah-kajian')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <CalendarPlus className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Tambah Kajian</span>
                    </Link>
                  </li>

                  {/* Kelola Pengguna DKM */}
                  <li>
                    <Link
                      href="/dashboard/admin?tab=pengguna"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/admin', 'pengguna')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Pengurus DKM</span>
                    </Link>
                  </li>

                  {/* Siaran / Broadcast Notifikasi Push Jamaah */}
                  <li>
                    <Link
                      href="/dashboard/admin?tab=broadcast"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/admin', 'broadcast')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <BellRing className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Broadcast Notifikasi</span>
                    </Link>
                  </li>

                  {/* Pengaturan Sistem Portal */}
                  <li>
                    <Link
                      href="/dashboard/admin?tab=pengaturan"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isItemActive('/dashboard/admin', 'pengaturan')
                          ? 'bg-[#093c96] text-white shadow-sm shadow-[#093c96]/25 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">Pengaturan Sistem</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. Footer Aksi: Tautan Situs Publik & Logout */}
      {/* ---------------------------------------------------------------------- */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Tautan Cepat Menuju Beranda Publik */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#093c96] dark:hover:text-blue-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#093c96]" />
            Lihat Situs Publik
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
        </Link>

        {/* Tombol Logout Akun */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer group"
          >
            <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
            <span>Keluar dari Dasbor</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

/**
 * Komponen Ekspor Utama dengan Suspense Fallback
 */
export function DashboardSidebar(props: DashboardSidebarProps) {
  return (
    <Suspense
      fallback={
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 animate-pulse p-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
          <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-6" />
          <div className="space-y-2 flex-1">
            <div className="h-9 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
            <div className="h-9 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
            <div className="h-9 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
          </div>
        </aside>
      }
    >
      <DashboardSidebarContent {...props} />
    </Suspense>
  );
}
export default DashboardSidebar;
