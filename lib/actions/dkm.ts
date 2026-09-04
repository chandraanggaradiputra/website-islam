'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DKMRegistrationPayload, DKMRegistrationApplication } from '@/types';

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

function getWPAdminAuthHeader(): string | null {
  const user = process.env.WP_ADMIN_USERNAME;
  const pass = process.env.WP_APPLICATION_PASSWORD;
  if (!user || !pass) return null;
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
}

/**
 * Server Action: Membaca data pendaftaran DKM dari CPT Masjid (status: pending)
 */
export async function getStoredRegistrations(): Promise<DKMRegistrationApplication[]> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    console.warn('[Security Alert] Unauthorized access attempt to getStoredRegistrations.');
    return [];
  }

  const authHeader = getWPAdminAuthHeader();
  if (!authHeader) {
    console.warn('WP_ADMIN_USERNAME atau WP_APPLICATION_PASSWORD belum diset.');
    return [];
  }

  try {
    const res = await fetch(`${WP_API_URL}/masjid?status=pending&_embed&per_page=100`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Gagal mengambil data antrean DKM:', await res.text());
      return [];
    }

    const pendingMasjids = await res.json();
    const applications: DKMRegistrationApplication[] = pendingMasjids.map((masjid: any) => {
      // Deteksi jika ini adalah klaim masjid (judul dimulai dengan KLAIM:)
      const isClaim = masjid.title.rendered.startsWith('KLAIM:');
      
      let appData: Partial<DKMRegistrationApplication> = {};
      try {
        if (masjid.content.rendered) {
          const rawContent = masjid.content.rendered;
          const match = rawContent.match(/DKM_METADATA_START:(.*?):DKM_METADATA_END/);
          if (match && match[1]) {
             appData = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
          }
        }
      } catch (e) {
        console.error('Failed parsing metadata:', e);
      }

      return {
        id: masjid.id,
        date: masjid.date,
        namaPengurus: appData.namaPengurus || masjid.acf?.nama_kontak_dkm || '-',
        email: appData.email || '-',
        noWhatsapp: appData.noWhatsapp || masjid.acf?.no_wa_dkm || '-',
        masjidId: isClaim ? appData.masjidId : undefined,
        masjidName: isClaim ? appData.masjidName : undefined,
        isNewMasjid: !isClaim,
        newMasjidData: !isClaim ? {
          namaMasjid: masjid.title.rendered,
          kotaKabupaten: masjid.acf?.kota_kabupaten,
          kecamatanId: masjid.kecamatan && masjid.kecamatan.length > 0 ? masjid.kecamatan[0] : undefined,
          kecamatanName: appData.newMasjidData?.kecamatanName,
          alamatLengkap: masjid.acf?.alamat_lengkap || '',
          googleMapsUrl: masjid.acf?.google_maps_url,
          fasilitas: masjid.acf?.fasilitas || [],
          namaBank: masjid.acf?.nama_bank,
          nomorRekening: masjid.acf?.nomor_rekening,
          atasNamaRekening: masjid.acf?.atas_nama_rekening,
        } : undefined,
        catatan: appData.catatan || '',
        status: 'pending',
        createdMasjidId: masjid.id,
      };
    });

    return applications;
  } catch (error) {
    console.error('Error fetching registrations from WP:', error);
    return [];
  }
}

export const getDKMRegistrations = getStoredRegistrations;

/**
 * Server Action: Pengajuan Pendaftaran DKM Hibrid (Masjid Terdaftar / Usulan Masjid Baru)
 */
export async function submitDaftarDKM(payload: DKMRegistrationPayload) {
  try {
    const authHeader = getWPAdminAuthHeader();
    if (!authHeader) {
      return { success: false, error: 'Sistem pendaftaran sedang tidak tersedia (Kredensial Server belum dikonfigurasi).' };
    }

    const isNewMasjid = payload.masjidOption === 'NEW_MASJID' || Boolean(payload.isNewMasjid);
    
    // Siapkan data JSON tambahan untuk disimpan di konten post agar kita tidak kehilangan data ekstra (email, catatan, nama masjid asli, dll)
    const appData = {
      namaPengurus: payload.namaPengurus,
      email: payload.email,
      noWhatsapp: payload.noWhatsapp,
      masjidId: !isNewMasjid ? Number(payload.masjidOption) : undefined,
      masjidName: !isNewMasjid ? payload.namaMasjidBaru : undefined, // Kita bisa butuh nama untuk display awal
      isNewMasjid,
      newMasjidData: isNewMasjid ? {
        kecamatanName: payload.kecamatanNama,
      } : undefined,
      catatan: payload.catatan,
    };

    const base64Content = Buffer.from(JSON.stringify(appData)).toString('base64');
    const contentPayload = `<!-- DKM_METADATA_START:${base64Content}:DKM_METADATA_END -->`;

    let wpMasjidPayload: any = {};
    
    const rawKecId = Number(payload.kecamatan);
    const validKecamatan = !isNaN(rawKecId) && rawKecId > 0 ? [rawKecId] : [];

    if (isNewMasjid) {
      wpMasjidPayload = {
        title: payload.namaMasjidBaru,
        status: 'pending',
        content: contentPayload,
        kecamatan: validKecamatan,
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
    } else {
      // Klaim masjid yang sudah ada
      wpMasjidPayload = {
        title: `KLAIM: ${payload.namaMasjidBaru || 'Masjid #' + payload.masjidOption} - ${payload.namaPengurus}`,
        status: 'pending',
        content: contentPayload,
        // Kita isi ACF minimal
        acf: {
          kota_kabupaten: payload.kotaKabupaten || '',
          no_wa_dkm: payload.noWhatsapp || '',
          nama_kontak_dkm: payload.namaPengurus || '',
        }
      };
    }

    const res = await fetch(`${WP_API_URL}/masjid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(wpMasjidPayload),
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      console.error('WP API Error:', errorMsg);
      return { success: false, error: 'Gagal mengirim pendaftaran ke server.' };
    }

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

  const authHeader = getWPAdminAuthHeader();
  if (!authHeader) {
     return { success: false, error: 'Kredensial server belum dikonfigurasi.' };
  }

  try {
    // Ambil detail pendaftaran
    const resGet = await fetch(`${WP_API_URL}/masjid/${registrationId}`, {
      headers: { 'Authorization': authHeader }
    });
    if (!resGet.ok) {
      return { success: false, error: 'Data permohonan tidak ditemukan di server.' };
    }
    const masjidData = await resGet.json();
    const isClaim = masjidData.title.rendered.startsWith('KLAIM:');

    if (!isClaim) {
      // Jika ini masjid baru, cukup publish
      const resPub = await fetch(`${WP_API_URL}/masjid/${registrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'publish' }),
      });
      if (!resPub.ok) throw new Error('Gagal mem-publish masjid usulan.');
    } else {
      // Jika ini klaim, kita idealnya mengupdate author dari masjid asli, tapi API ini hanya mengatur approval.
      // Untuk saat ini, kita anggap klaim disetujui lalu kita hapus post draft "KLAIM:" tersebut 
      // (karena data masjid asli sudah ada)
      const resDel = await fetch(`${WP_API_URL}/masjid/${registrationId}?force=true`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader },
      });
      if (!resDel.ok) throw new Error('Gagal menghapus entri klaim setelah di-approve.');
    }

    revalidatePath('/');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return {
      success: true,
      message: 'Akun DKM berhasil diverifikasi.',
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

  const authHeader = getWPAdminAuthHeader();
  if (!authHeader) {
     return { success: false, error: 'Kredensial server belum dikonfigurasi.' };
  }

  try {
    // Hapus draft masjid / klaim masjid ini
    const resDel = await fetch(`${WP_API_URL}/masjid/${registrationId}?force=true`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!resDel.ok) {
       return { success: false, error: 'Gagal menghapus permohonan di server.' };
    }

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
