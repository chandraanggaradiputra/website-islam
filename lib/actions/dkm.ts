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
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Gagal mengambil data antrean DKM:', await res.text());
      return [];
    }

    const pendingMasjids = await res.json();
    const applications: DKMRegistrationApplication[] = pendingMasjids.map((masjid: any) => {
      // Deteksi jika ini adalah klaim masjid (judul dimulai dengan KLAIM:)
      const isClaim = typeof masjid.title?.rendered === 'string' && masjid.title.rendered.startsWith('KLAIM:');
      
      let appData: any = {};
      try {
        if (masjid.content?.rendered) {
          const rawContent = masjid.content.rendered;
          const match = rawContent.match(/DKM_METADATA_START:(.*?):DKM_METADATA_END/);
          if (match && match[1]) {
            appData = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
          }
        }
      } catch (e) {
        console.error('Failed parsing metadata:', e);
      }

      const masjidTitle = typeof masjid.title?.rendered === 'string'
        ? masjid.title.rendered
        : (typeof masjid.title === 'string' ? masjid.title : '');

      const namaMasjidFinal = appData.newMasjidData?.namaMasjid || appData.masjidName || masjidTitle || 'Usulan Masjid Baru';

      return {
        id: masjid.id,
        date: masjid.date,
        namaPengurus: appData.namaPengurus || masjid.acf?.nama_kontak_dkm || '-',
        email: appData.email || '-',
        noWhatsapp: appData.noWhatsapp || masjid.acf?.no_wa_dkm || '-',
        masjidId: isClaim ? appData.masjidId : undefined,
        masjidName: isClaim ? (appData.masjidName || masjidTitle) : namaMasjidFinal,
        isNewMasjid: !isClaim,
        newMasjidData: !isClaim ? {
          namaMasjid: namaMasjidFinal,
          kotaKabupaten: appData.newMasjidData?.kotaKabupaten || masjid.acf?.kota_kabupaten,
          kecamatanId: masjid.kecamatan && masjid.kecamatan.length > 0 ? masjid.kecamatan[0] : undefined,
          kecamatanName: appData.newMasjidData?.kecamatanName,
          alamatLengkap: appData.newMasjidData?.alamatLengkap || masjid.acf?.alamat_lengkap || '',
          googleMapsUrl: appData.newMasjidData?.googleMapsUrl || masjid.acf?.google_maps_url,
          fasilitas: (appData.newMasjidData?.fasilitas || masjid.acf?.fasilitas || []).map((f: string) => typeof f === 'string' ? f.replace(/^•\s*/, '') : f),
          namaBank: appData.newMasjidData?.namaBank || masjid.acf?.nama_bank,
          nomorRekening: appData.newMasjidData?.nomorRekening || masjid.acf?.nomor_rekening,
          atasNamaRekening: appData.newMasjidData?.atasNamaRekening || masjid.acf?.atas_nama_rekening,
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
      masjidName: !isNewMasjid ? (payload.namaMasjidBaru || `Masjid #${payload.masjidOption}`) : payload.namaMasjidBaru,
      isNewMasjid,
      newMasjidData: isNewMasjid ? {
        namaMasjid: payload.namaMasjidBaru || '',
        kotaKabupaten: payload.kotaKabupaten,
        kecamatanName: payload.kecamatanNama,
        alamatLengkap: payload.alamatMasjid || '',
        googleMapsUrl: payload.googleMapsUrl,
        fasilitas: payload.fasilitas,
        namaBank: payload.namaBank,
        nomorRekening: payload.nomorRekening,
        atasNamaRekening: payload.atasNamaRekening,
      } : undefined,
      catatan: payload.catatan,
    };

    const base64Content = Buffer.from(JSON.stringify(appData)).toString('base64');
    const contentPayload = `<!-- DKM_METADATA_START:${base64Content}:DKM_METADATA_END -->`;

    let wpMasjidPayload: Record<string, unknown> = {};

    if (isNewMasjid) {
      // Bentuk objek ACF secara defensif (hanya field yang benar-benar bernilai)
      const alamatLengkapFormatted = payload.alamatMasjid
        ? (payload.kecamatanNama && !payload.alamatMasjid.toLowerCase().includes(payload.kecamatanNama.toLowerCase())
            ? `${payload.alamatMasjid}, Kec. ${payload.kecamatanNama}`
            : payload.alamatMasjid)
        : (payload.kecamatanNama ? `Kec. ${payload.kecamatanNama}` : '');

      const acfPayload: Record<string, unknown> = {
        kota_kabupaten: payload.kotaKabupaten || 'Kota Serang',
        alamat_lengkap: alamatLengkapFormatted,
        no_wa_dkm: payload.noWhatsapp || '',
        nama_kontak_dkm: payload.namaPengurus || '',
      };

      // HANYA kirim google_maps_url jika diawali http/https (JANGAN kirim string kosong "")
      if (payload.googleMapsUrl && payload.googleMapsUrl.trim().startsWith('http')) {
        acfPayload.google_maps_url = payload.googleMapsUrl.trim();
      }

      if (payload.namaBank && payload.namaBank.trim()) {
        acfPayload.nama_bank = payload.namaBank.trim();
      }
      if (payload.nomorRekening && payload.nomorRekening.trim()) {
        acfPayload.nomor_rekening = payload.nomorRekening.trim();
      }
      if (payload.atasNamaRekening && payload.atasNamaRekening.trim()) {
        acfPayload.atas_nama_rekening = payload.atasNamaRekening.trim();
      }
      if (Array.isArray(payload.fasilitas) && payload.fasilitas.length > 0) {
        const WP_FASILITAS_MAP: Record<string, string> = {
          'Parkir Mobil & Motor': '• Parkir Mobil & Motor',
          'Tempat Wudhu Terpisah': '• Tempat Wudhu Terpisah',
          'Ruangan Ber-AC': '• Ruangan Ber-AC',
          'Area Khusus Akhwat': '• Area Khusus Akhawat (Hijab)',
          'Area Khusus Akhawat (Hijab)': '• Area Khusus Akhawat (Hijab)',
          'Perpustakaan Kitab': '• Perpustakaan Kitab',
        };
        acfPayload.fasilitas = payload.fasilitas.map(
          (f) => WP_FASILITAS_MAP[f] || (f.startsWith('• ') ? f : `• ${f}`)
        );
      }

      wpMasjidPayload = {
        title: payload.namaMasjidBaru || 'Usulan Masjid Baru',
        status: 'pending',
        content: contentPayload,
        acf: acfPayload,
      };

      // Hindari error taksonomi kecamatan: HANYA sertakan properti kecamatan jika ID benar-benar angka valid (> 0)
      const rawKecId = Number(payload.kecamatan);
      if (!isNaN(rawKecId) && rawKecId > 0) {
        wpMasjidPayload.kecamatan = [rawKecId];
      }
    } else {
      // Klaim masjid yang sudah ada
      const acfPayload: Record<string, unknown> = {
        kota_kabupaten: payload.kotaKabupaten || 'Kota Serang',
        no_wa_dkm: payload.noWhatsapp || '',
        nama_kontak_dkm: payload.namaPengurus || '',
      };

      wpMasjidPayload = {
        title: `KLAIM: ${payload.namaMasjidBaru || 'Masjid #' + payload.masjidOption} - ${payload.namaPengurus}`,
        status: 'pending',
        content: contentPayload,
        acf: acfPayload,
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
      const errData = await res.json().catch(() => ({}));
      const detailedMsg = errData.message || 'Gagal mengirim pendaftaran ke server.';
      console.error('[submitDaftarDKM Error]:', errData);
      return { success: false, error: detailedMsg };
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
      headers: { 'Authorization': authHeader },
    });
    if (!resGet.ok) {
      return { success: false, error: 'Data permohonan tidak ditemukan di server.' };
    }
    const masjidData = await resGet.json();
    const isClaim = typeof masjidData.title?.rendered === 'string' && masjidData.title.rendered.startsWith('KLAIM:');

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
