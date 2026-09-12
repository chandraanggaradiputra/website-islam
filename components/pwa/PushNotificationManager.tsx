'use client';

/**
 * ============================================================================
 * Komponen: PushNotificationManager
 * ============================================================================
 * Mengelola izin dan pendaftaran Web Push Notification di sisi klien (browser).
 * Mendukung mode 'card' (tampilan kartu ajakan di direktori kajian) dan
 * mode 'button'/'inline' (tombol ringkas di banner PWA).
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getVapidPublicKey, savePushSubscription, removePushSubscription } from '@/lib/actions/push';

interface PushNotificationManagerProps {
  /** Mode tampilan: 'card' untuk banner halaman kajian, 'inline' untuk di dalam banner PWA */
  mode?: 'card' | 'inline' | 'compact';
  className?: string;
}

/**
 * Mengonversi VAPID Public Key base64 string menjadi Uint8Array untuk browser Push API
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager({
  mode = 'card',
  className = '',
}: PushNotificationManagerProps) {
  // Status dukungan Push API di browser
  const [isSupported, setIsSupported] = useState(false);
  // Status apakah perangkat ini sudah berlangganan
  const [isSubscribed, setIsSubscribed] = useState(false);
  // Status izin notifikasi ('default' | 'granted' | 'denied')
  const [permission, setPermission] = useState<NotificationPermission>('default');
  // State indikator pemuatan
  const [isLoading, setIsLoading] = useState(false);
  // Pesan feedback untuk pengguna
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    // Periksa ketersediaan Push API di browser
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Cek apakah sudah ada subscription aktif
      navigator.serviceWorker.ready
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => {
          if (subscription) {
            setIsSubscribed(true);
          }
        })
        .catch((err) => {
          console.warn('[PushManager] Gagal memeriksa subscription:', err);
        });
    }
  }, []);

  /**
   * Mengaktifkan langganan push notifikasi
   */
  const handleSubscribe = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      // 1. Minta izin notifikasi ke browser
      const permResult = await Notification.requestPermission();
      setPermission(permResult);

      if (permResult !== 'granted') {
        setFeedback({
          type: 'error',
          message: 'Izin notifikasi belum diberikan. Silakan izinkan notifikasi pada peramban Anda.',
        });
        setIsLoading(false);
        return;
      }

      // 2. Ambil registration service worker
      const registration = await navigator.serviceWorker.ready;

      // 3. Ambil VAPID public key dari server
      const vapidPublicKey = await getVapidPublicKey();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Daftarkan subscription ke browser push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey.buffer as ArrayBuffer,
      });

      // 5. Simpan subscription ke server backend
      const result = await savePushSubscription(
        subscription.toJSON() as any,
        navigator.userAgent
      );

      if (result.success) {
        setIsSubscribed(true);
        setFeedback({
          type: 'success',
          message: 'Alhamdulillah! Notifikasi jadwal kajian aktif di perangkat ini.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.error || 'Gagal mendaftarkan notifikasi ke server.',
        });
      }
    } catch (err: any) {
      console.error('[PushManager] Error subscribing:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat mengaktifkan notifikasi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Menonaktifkan langganan push notifikasi
   */
  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Hapus dari server backend
        await removePushSubscription(subscription.endpoint);
        // Batalkan langganan di browser
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setFeedback({
        type: 'info',
        message: 'Notifikasi push telah dinonaktifkan untuk perangkat ini.',
      });
    } catch (err: any) {
      console.error('[PushManager] Error unsubscribing:', err);
      setFeedback({
        type: 'error',
        message: 'Gagal menonaktifkan notifikasi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Jika browser tidak mendukung Web Push API
  if (!isSupported) {
    return null;
  }

  // ============================================================================
  // TAMPILAN MODE INLINE (Untuk disematkan dalam Banner PWA atau Header)
  // ============================================================================
  if (mode === 'inline' || mode === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {isSubscribed ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Notifikasi Aktif</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#b08d47] text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span>Aktifkan Notifikasi</span>
          </button>
        )}
      </div>
    );
  }

  // ============================================================================
  // TAMPILAN MODE CARD (Kartu ajakan di halaman Jadwal Kajian)
  // ============================================================================
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/30 p-5 sm:p-6 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#093c96]/10 text-[#093c96] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shrink-0 border border-[#093c96]/20">
            {isSubscribed ? (
              <BellRing className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Bell className="w-6 h-6 text-[#093c96] dark:text-blue-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C5A059]/15 text-[#8f702f] dark:text-[#E8C27A] border border-[#C5A059]/30">
                Pemberitahuan Langsung
              </span>
              {isSubscribed && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Aktif
                </span>
              )}
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
              {isSubscribed
                ? 'Perangkat Anda Terhubung ke Notifikasi Kajian'
                : 'Dapatkan Info Jadwal Kajian Sunnah Langsung di Ponsel'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-xl">
              {isSubscribed
                ? 'Anda akan menerima pemberitahuan instan saat ada rilis jadwal baru, perubahan pemateri, atau rekaman kajian yang baru diunggah.'
                : 'Nyalakan pemberitahuan instan tanpa membuka peramban agar Anda tidak ketinggalan jadwal kajian ilmiyyah di Provinsi Banten.'}
            </p>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isSubscribed ? (
            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BellOff className="w-3.5 h-3.5" />
              )}
              <span>Nonaktifkan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#093c96] hover:bg-[#072d73] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#093c96]/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BellRing className="w-4 h-4" />
              )}
              <span>Nyalakan Notifikasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Pesan Feedback */}
      {feedback && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : feedback.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
