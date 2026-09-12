'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';

/**
 * Komponen Penanganan PWA (Progressive Web App)
 * - Mendaftarkan service worker /sw.js di browser
 * - Mendeteksi kesiapan instalasi native (beforeinstallprompt di Chrome / Android)
 * - Menyediakan panduan instalasi ramah bagi pengguna Safari di perangkat iOS
 * - Mengingat preferensi penutupan (dismiss) pengguna menggunakan sessionStorage
 */
export function PwaHandler() {
  // State untuk menyimpan event instalasi Android/Chrome
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  // State visibilitas banner instalasi Android/Chrome
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  // State visibilitas panduan instalasi iOS Safari
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Registrasi Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker terdaftar dengan scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Gagal mendaftarkan Service Worker:', err);
        });
    }

    // Periksa apakah pengguna sebelumnya sudah menutup banner di sesi ini
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (isDismissed) return;

    // Periksa apakah aplikasi sudah berjalan dalam mode standalone (sudah terinstal)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Deteksi Android / Desktop Chrome via beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Deteksi iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|optios|edgios/.test(ua);

    if (isIos && isSafari && !isStandalone) {
      // Tampilkan banner panduan iOS jika belum pernah ditutup
      setShowIosGuide(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Fungsi memicu prompt instalasi native Chrome/Android
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowAndroidBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Fungsi menutup banner dan menyimpan preferensi ke sessionStorage
  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowAndroidBanner(false);
    setShowIosGuide(false);
  };

  // Jika tidak ada banner yang perlu ditampilkan, render null
  if (!showAndroidBanner && !showIosGuide) {
    return null;
  }

  return (
    <aside aria-label="Instalasi Aplikasi PWA" className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 dark:border-slate-800 relative">
        {/* Tombol Tutup Banner */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          aria-label="Tutup notifikasi instalasi"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-[#093c96]/10 border border-[#093c96]/20">
            <Image
              src="/icon-192.png"
              alt="Logo Banten Mengaji"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div className="pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C5A059]/15 text-[#8f702f] dark:text-[#E8C27A] border border-[#C5A059]/30">
                PWA Resmi
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
              Pasang Aplikasi Banten Mengaji
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Akses jadwal kajian & waktu sholat lebih praktis langsung dari layar utama ponsel Anda.
            </p>
          </div>
        </div>

        {/* Konten Khusus Android / Chrome */}
        {showAndroidBanner && (
          <div className="mt-3.5 flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#093c96] hover:bg-[#072d73] text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang Sekarang</span>
            </button>
          </div>
        )}

        {/* Konten Khusus iOS Safari */}
        {showIosGuide && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                <Smartphone className="w-3.5 h-3.5 text-[#093c96] dark:text-blue-400 shrink-0" />
                <span>Cara pasang di iPhone / iPad:</span>
              </div>
              <ol className="space-y-1 pl-5 list-decimal text-[11px] leading-relaxed">
                <li>
                  Ketuk tombol <span className="font-semibold text-slate-900 dark:text-white">Bagikan</span> (ikon <Share2 className="w-3 h-3 inline text-blue-600" /> di bilah navigasi Safari).
                </li>
                <li>
                  Gulir ke bawah, lalu pilih <span className="font-semibold text-slate-900 dark:text-white">Tambahkan ke Layar Utama</span> (<PlusSquare className="w-3 h-3 inline text-slate-700 dark:text-slate-300" />).
                </li>
              </ol>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleDismiss}
                className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
