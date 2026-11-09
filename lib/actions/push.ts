'use server';

/**
 * ============================================================================
 * Server Actions: Infrastruktur Web Push Notification & Broadcast Admin
 * ============================================================================
 * Berkas ini mengelola siklus hidup Web Push Notification:
 * 1. Pendaftaran & Penyimpanan Subscription jamaah ke berkas data persisten.
 * 2. Penghapusan Subscription yang berhenti langganan / kadaluwarsa (HTTP 410/404).
 * 3. Eksekusi Broadcast Push Notifikasi oleh Super Admin ke seluruh perangkat.
 * ============================================================================
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import webpush from 'web-push';
import { getSession } from '@/lib/auth';
import { getVapidKeys } from '@/lib/env';
import {
  PushSubscriptionRecord,
  BroadcastNotificationPayload,
  BroadcastResult,
} from '@/types/push';

// Konfigurasi identitas server VAPID ke web-push secara aman (Prinsip 1: Zero Default Secret)
function ensureVapidConfigured() {
  try {
    const { publicKey, privateKey, subject } = getVapidKeys();
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return { publicKey, privateKey, subject };
  } catch (err) {
    console.warn('[WebPush Security Alert] VAPID belum terkonfigurasi:', err);
    return null;
  }
}

// Gunakan os.tmpdir() di lingkungan serverless production untuk mitigasi EROFS (read-only filesystem)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), 'banten-mengaji-data')
  : path.join(process.cwd(), 'data');
const SUBS_FILE_PATH = path.join(DATA_DIR, 'push-subscriptions.json');

/**
 * Helper internal untuk membaca seluruh langganan dari file data
 */
async function readSubscriptions(): Promise<PushSubscriptionRecord[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(SUBS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Helper internal untuk menulis daftar langganan ke file data
 */
async function writeSubscriptions(subs: PushSubscriptionRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SUBS_FILE_PATH, JSON.stringify(subs, null, 2), 'utf-8');
}

/**
 * Mengambil VAPID Public Key untuk konfigurasi registrasi di browser client
 */
export async function getVapidPublicKey(): Promise<string> {
  const config = ensureVapidConfigured();
  return config?.publicKey || '';
}

/**
 * Menyimpan data push subscription baru atau memperbarui yang sudah ada
 * Memastikan tidak terjadi duplikasi endpoint langganan.
 */
export async function savePushSubscription(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    expirationTime?: number | null;
  },
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return { success: false, error: 'Format data subscription tidak valid.' };
    }

    const subs = await readSubscriptions();
    const existingIndex = subs.findIndex((s) => s.endpoint === subscription.endpoint);

    const record: PushSubscriptionRecord = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      expirationTime: subscription.expirationTime ?? null,
      createdAt: new Date().toISOString(),
      userAgent: userAgent || 'Unknown Device',
    };

    if (existingIndex >= 0) {
      // Perbarui subscription yang ada
      subs[existingIndex] = record;
    } else {
      // Tambah baru
      subs.push(record);
    }

    await writeSubscriptions(subs);
    return { success: true };
  } catch (err) {
    console.error('[Push] Gagal menyimpan push subscription:', err);
    return { success: false, error: 'Terjadi kegagalan server saat menyimpan subscription.' };
  }
}

/**
 * Menghapus push subscription berdasarkan endpoint (misal saat user menonaktifkan notifikasi)
 */
export async function removePushSubscription(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!endpoint) return { success: false, error: 'Endpoint tidak valid.' };

    const subs = await readSubscriptions();
    const filtered = subs.filter((s) => s.endpoint !== endpoint);

    await writeSubscriptions(filtered);
    return { success: true };
  } catch (err) {
    console.error('[Push] Gagal menghapus push subscription:', err);
    return { success: false, error: 'Gagal menghapus subscription.' };
  }
}

/**
 * Mengambil statistik total subscriber aktif untuk panel admin
 */
export async function getPushSubscriberStats(): Promise<import('@/types/push').PushSubscriberStats> {
  try {
    const subs = await readSubscriptions();
    return { totalSubscribers: subs.length, activeSubscribers: subs.length };
  } catch {
    return { totalSubscribers: 0, activeSubscribers: 0 };
  }
}

/**
 * Mengirimkan siaran (broadcast) notifikasi push ke seluruh subscriber aktif
 * Dilengkapi dengan pembersihan otomatis endpoint yang sudah kedaluwarsa (status 410 / 404).
 */
export async function sendBroadcastNotification(
  payload: BroadcastNotificationPayload
): Promise<BroadcastResult> {
  try {
    // Validasi otorisasi Super Admin
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return {
        success: false,
        totalSubscribers: 0,
        sentCount: 0,
        failedCount: 0,
        prunedCount: 0,
        error: 'Akses ditolak. Anda bukan Super Admin.',
      };
    }

    if (!payload.title || !payload.body) {
      return {
        success: false,
        totalSubscribers: 0,
        sentCount: 0,
        failedCount: 0,
        prunedCount: 0,
        error: 'Judul dan isi pesan notifikasi wajib diisi.',
      };
    }

    const subs = await readSubscriptions();
    if (subs.length === 0) {
      return {
        success: true,
        totalSubscribers: 0,
        sentCount: 0,
        failedCount: 0,
        prunedCount: 0,
        message: 'Tidak ada perangkat subscriber yang terdaftar.',
      };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title.trim(),
      body: payload.body.trim(),
      url: payload.url?.trim() || '/',
      icon: payload.icon || '/banten-mengaji.jpeg',
    });

    let sentCount = 0;
    let failedCount = 0;
    const staleEndpoints = new Set<string>();

    // Kirim notifikasi secara paralel dengan Promise.allSettled
    const sendPromises = subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          notificationPayload
        );
        sentCount++;
      } catch (err: unknown) {
        failedCount++;
        // Tangkap endpoint yang kadaluwarsa / ditutup browser (410 Gone atau 404 Not Found)
        const errorWithStatus = err as { statusCode?: number };
        if (errorWithStatus?.statusCode === 410 || errorWithStatus?.statusCode === 404) {
          staleEndpoints.add(sub.endpoint);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    // Pembersihan otomatis endpoint yang sudah kadaluwarsa (Auto-Prune)
    let prunedCount = 0;
    if (staleEndpoints.size > 0) {
      const activeSubs = subs.filter((s) => !staleEndpoints.has(s.endpoint));
      prunedCount = subs.length - activeSubs.length;
      await writeSubscriptions(activeSubs);
    }

    return {
      success: true,
      totalSubscribers: subs.length,
      sentCount,
      failedCount,
      prunedCount,
      activeSubscribers: subs.length - prunedCount,
      message: `Siaran berhasil terkirim ke ${sentCount} perangkat.${
        prunedCount > 0 ? ` (${prunedCount} perangkat tidak aktif dibersihkan)` : ''
      }`,
    };
  } catch (err) {
    console.error('[Push] Terjadi kesalahan broadcast:', err);
    return {
      success: false,
      totalSubscribers: 0,
      sentCount: 0,
      failedCount: 0,
      prunedCount: 0,
      activeSubscribers: 0,
      error: 'Terjadi kesalahan internal saat mengirimkan notifikasi siaran.',
    };
  }
}
