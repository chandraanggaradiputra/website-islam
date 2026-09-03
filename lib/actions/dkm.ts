'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DKMRegistrationPayload, DKMRegistrationApplication } from '@/types';
import fs from 'fs';
import path from 'path';

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';
const REGISTRATIONS_FILE = path.join(process.cwd(), 'data', 'dkm-registrations.json');

// Helper untuk membaca pendaftaran DKM yang tersimpan
export async function getStoredRegistrations(): Promise<DKMRegistrationApplication[]> {
  try {
    if (!fs.existsSync(path.dirname(REGISTRATIONS_FILE))) {
      fs.mkdirSync(path.dirname(REGISTRATIONS_FILE), { recursive: true });
    }
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf-8');
    return JSON.parse(data) as DKMRegistrationApplication[];
  } catch (err) {
    console.error('Error reading registrations file:', err);
    return [];
  }
}

// Helper untuk menyimpan pendaftaran DKM
async function saveRegistrations(list: DKMRegistrationApplication[]) {
  try {
    if (!fs.existsSync(path.dirname(REGISTRATIONS_FILE))) {
      fs.mkdirSync(path.dirname(REGISTRATIONS_FILE), { recursive: true });
    }
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error('Error saving registrations file:', err);
  }
}

/**
 * Server Action: Pengajuan Pendaftaran DKM Hibrid (Masjid Terdaftar / Usulan Masjid Baru)
 */
export async function submitDaftarDKM(payload: DKMRegistrationPayload) {
  try {
    const isNewMasjid = payload.masjidOption === 'NEW_MASJID' || Boolean(payload.isNewMasjid);
    let createdMasjidId: number | undefined = undefined;

    // Jika pengurus mengusulkan masjid baru, kita buatkan draft / pending masjid di WordPress jika memungkinkan
    if (isNewMasjid && payload.namaMasjidBaru) {
      try {
        const session = await getSession();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (session?.token) {
          headers['Authorization'] = `Bearer ${session.token}`;
        }

        const wpMasjidPayload = {
          title: payload.namaMasjidBaru,
          status: 'pending',
          kecamatan: payload.kecamatan ? [Number(payload.kecamatan)] : [],
          acf: {
            kota_kabupaten: payload.kotaKabupaten || '',
            alamat_lengkap: payload.alamatMasjid || '',
            google_maps_url: payload.googleMapsUrl || '',
            no_wa_dkm: payload.noWhatsapp || '',
            nama_kontak_dkm: payload.namaPengurus || '',
            nama_bank: payload.namaBank || '',
            nomor_rekening: payload.nomorRekening || '',
            atas_nama_rekening: payload.atasNamaRekening || '',
            fasilitas: payload.fasilitas || [],
          },
        };

        const res = await fetch(`${WP_API_URL}/masjid`, {
          method: 'POST',
          headers,
          body: JSON.stringify(wpMasjidPayload),
        });

        if (res.ok) {
          const resData = await res.json();
          createdMasjidId = resData.id;
        }
      } catch (e) {
        console.warn('Gagal membuat draft masjid di WP API, disimpan di antrean lokal:', e);
      }
    }

    const application: DKMRegistrationApplication = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      namaPengurus: payload.namaPengurus,
      email: payload.email,
      noWhatsapp: payload.noWhatsapp,
      masjidId: isNewMasjid ? createdMasjidId : payload.masjidId,
      masjidName: isNewMasjid ? payload.namaMasjidBaru : undefined,
      isNewMasjid,
      newMasjidData: isNewMasjid
        ? {
            namaMasjid: payload.namaMasjidBaru || '',
            kotaKabupaten: payload.kotaKabupaten,
            kecamatanId: payload.kecamatan ? Number(payload.kecamatan) : undefined,
            kecamatanName: payload.kecamatanNama,
            alamatLengkap: payload.alamatMasjid || '',
            googleMapsUrl: payload.googleMapsUrl,
            fasilitas: payload.fasilitas,
            namaBank: payload.namaBank,
            nomorRekening: payload.nomorRekening,
            atasNamaRekening: payload.atasNamaRekening,
          }
        : undefined,
      catatan: payload.catatan,
      status: 'pending',
      createdMasjidId,
    };

    const currentList = await getStoredRegistrations();
    currentList.unshift(application);
    await saveRegistrations(currentList);

    revalidatePath('/dashboard/admin');

    return {
      success: true,
      message: 'Permohonan pendaftaran DKM berhasil diajukan.',
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in submitDaftarDKM:', err.message);
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses permohonan.',
    };
  }
}

/**
 * Server Action: Super Admin menyetujui akun DKM & menerbitkan masjid baru
 */
export async function approveDKMRegistration(registrationId: string | number) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak. Anda bukan Administrator.' };
  }

  try {
    const list = await getStoredRegistrations();
    const itemIndex = list.findIndex((r) => r.id.toString() === registrationId.toString());

    if (itemIndex === -1) {
      return { success: false, error: 'Data permohonan tidak ditemukan.' };
    }

    const app = list[itemIndex];

    // Jika ini usulan masjid baru, terbitkan masjid di WordPress
    if (app.isNewMasjid && app.newMasjidData) {
      let targetMasjidId = app.createdMasjidId || app.masjidId;

      if (targetMasjidId) {
        // Update status menjadi publish
        await fetch(`${WP_API_URL}/masjid/${targetMasjidId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'publish' }),
        });
      } else {
        // Buat masjid baru berstatus publish
        const res = await fetch(`${WP_API_URL}/masjid`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: app.newMasjidData.namaMasjid,
            status: 'publish',
            kecamatan: app.newMasjidData.kecamatanId ? [app.newMasjidData.kecamatanId] : [],
            acf: {
              kota_kabupaten: app.newMasjidData.kotaKabupaten || '',
              alamat_lengkap: app.newMasjidData.alamatLengkap,
              google_maps_url: app.newMasjidData.googleMapsUrl || '',
              no_wa_dkm: app.noWhatsapp,
              nama_kontak_dkm: app.namaPengurus,
              nama_bank: app.newMasjidData.namaBank || '',
              nomor_rekening: app.newMasjidData.nomorRekening || '',
              atas_nama_rekening: app.newMasjidData.atasNamaRekening || '',
              fasilitas: app.newMasjidData.fasilitas || [],
            },
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          targetMasjidId = resData.id;
          app.createdMasjidId = targetMasjidId;
          app.masjidId = targetMasjidId;
        }
      }
    }

    app.status = 'approved';
    list[itemIndex] = app;
    await saveRegistrations(list);

    revalidatePath('/');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return {
      success: true,
      message: 'Akun DKM berhasil diverifikasi dan data masjid diterbitkan.',
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in approveDKMRegistration:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem saat menyetujui pendaftaran.' };
  }
}

/**
 * Server Action: Super Admin menolak permohonan DKM
 */
export async function rejectDKMRegistration(registrationId: string | number) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak.' };
  }

  try {
    const list = await getStoredRegistrations();
    const itemIndex = list.findIndex((r) => r.id.toString() === registrationId.toString());

    if (itemIndex === -1) {
      return { success: false, error: 'Data permohonan tidak ditemukan.' };
    }

    const app = list[itemIndex];
    app.status = 'rejected';

    // Jika ada draft masjid terkait, ubah ke draft atau hapus
    if (app.createdMasjidId) {
      try {
        await fetch(`${WP_API_URL}/masjid/${app.createdMasjidId}?force=true`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
      } catch (err) {
        console.warn('Gagal menghapus draft masjid terkait:', err);
      }
    }

    list[itemIndex] = app;
    await saveRegistrations(list);

    revalidatePath('/dashboard/admin');

    return { success: true, message: 'Permohonan DKM telah ditolak.' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in rejectDKMRegistration:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem saat menolak pendaftaran.' };
  }
}
