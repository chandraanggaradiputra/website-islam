'use server';

/**
 * ============================================================================
 * Server Actions: Modul Administrasi Eksekutif Super Admin
 * ============================================================================
 * Berkas ini menangani fungsionalitas backend khusus untuk peran Super Admin:
 * 1. Manajemen Akun Pengurus DKM: Mengambil daftar DKM aktif dan mereset kata sandi.
 * 2. Pengaturan Konfigurasi Sistem: Membaca & memperbarui parameter kontak dan donasi.
 * ============================================================================
 */

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { getWPAdminAuthHeader, getMasjidList } from '@/lib/wordpress';
import { getStoredRegistrations } from '@/lib/actions/dkm';
import { DKMUserItem, SystemSettings, DEFAULT_SYSTEM_SETTINGS } from '@/types';
import fs from 'fs/promises';
import path from 'path';

const WP_API_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  'https://salaf.maschandigital.id/wp-json/wp/v2';

// ============================================================================
// 1. MANAJEMEN PENGURUS DKM
// ============================================================================

/**
 * Mengambil daftar seluruh pengurus DKM terdaftar dari WordPress REST API
 * dan memperkayanya dengan data masjid yang dikelola serta kontak WhatsApp.
 */
export async function getDKMUsersList(): Promise<DKMUserItem[]> {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return [];
    }

    const authHeader = getWPAdminAuthHeader();
    if (!authHeader) {
      return [];
    }

    // Ambil daftar users, masjids, dan antrean registrasi secara paralel
    const [resUsers, masjids, registrations] = await Promise.all([
      fetch(`${WP_API_URL}/users?per_page=100&context=edit`, {
        headers: { Authorization: authHeader },
        next: { revalidate: 0 },
      }),
      getMasjidList(),
      getStoredRegistrations(),
    ]);

    if (!resUsers.ok) {
      console.error('[getDKMUsersList] Gagal mengambil data pengguna dari WP:', resUsers.statusText);
      return [];
    }

    const users = await resUsers.json();
    if (!Array.isArray(users)) return [];

    // Filter pengguna ber-role 'author' (peran DKM di WordPress)
    const authorUsers = users.filter((u: any) => {
      if (Array.isArray(u.roles)) {
        return u.roles.includes('author');
      }
      return false;
    });

    // Gabungkan data pengguna dengan masjid binaan dan nomor kontak
    const dkmList: DKMUserItem[] = authorUsers.map((u: any) => {
      // 1. Cari masjid binaan yang author-nya cocok dengan user.id
      const matchedMasjid = masjids.find(
        (m) =>
          Number(m.author) === Number(u.id) ||
          Number(m._embedded?.author?.[0]?.id) === Number(u.id)
      );

      // 2. Cari data nomor WhatsApp dari masjid atau dari antrean pendaftaran DKM
      const matchedReg = registrations.find(
        (r) => r.email?.toLowerCase() === u.email?.toLowerCase()
      );

      const phone =
        matchedMasjid?.acf?.no_wa_dkm ||
        matchedReg?.noWhatsapp ||
        '';

      return {
        id: u.id,
        name: u.name || u.username,
        email: u.email || '',
        username: u.username || '',
        phone: phone,
        masjidId: matchedMasjid?.id,
        masjidName: matchedMasjid?.title?.rendered,
        kecamatanName: matchedMasjid?.acf?.kota_kabupaten,
        registeredDate: u.registered_date || '',
      };
    });

    return dkmList;
  } catch (err) {
    console.error('Error in getDKMUsersList:', err);
    return [];
  }
}

/**
 * Mereset kata sandi akun pengurus DKM langsung melalui WordPress REST API
 */
export async function resetDKMUserPassword(
  userId: number,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Anda bukan Administrator.' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return {
        success: false,
        error: 'Kata sandi minimal terdiri dari 6 karakter.',
      };
    }

    const authHeader = getWPAdminAuthHeader();
    if (!authHeader) {
      return {
        success: false,
        error: 'Kredensial server WordPress tidak tersedia.',
      };
    }

    const res = await fetch(`${WP_API_URL}/users/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ password: newPassword.trim() }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.message || 'Gagal memperbarui kata sandi di server WordPress.',
      };
    }

    revalidatePath('/dashboard/admin');
    return {
      success: true,
      message: 'Kata sandi pengurus DKM berhasil diperbarui.',
    };
  } catch (err) {
    console.error('Error in resetDKMUserPassword:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memperbarui kata sandi.',
    };
  }
}

// ============================================================================
// 2. PENGATURAN KONFIGURASI SISTEM
// ============================================================================

/**
 * Membaca pengaturan sistem portal dari berkas persisten JSON
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'system-settings.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return { ...DEFAULT_SYSTEM_SETTINGS, ...parsed };
  } catch {
    // Fallback ke nilai standar jika berkas belum ada
    return { ...DEFAULT_SYSTEM_SETTINGS };
  }
}

/**
 * Menyimpan pembaruan konfigurasi sistem portal oleh Super Admin
 */
export async function updateSystemSettings(
  settings: SystemSettings
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Anda bukan Administrator.' };
    }

    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, 'system-settings.json');
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');

    revalidatePath('/dashboard/admin');
    revalidatePath('/donasi');

    return {
      success: true,
      message: 'Pengaturan sistem berhasil disimpan.',
    };
  } catch (err) {
    console.error('Error in updateSystemSettings:', err);
    return {
      success: false,
      error: 'Terjadi kegagalan saat menyimpan berkas pengaturan sistem.',
    };
  }
}
