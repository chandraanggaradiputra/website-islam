'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DKMRegistrationPayload, DKMRegistrationApplication } from '@/types';
import { sendNewDKMNotificationToAdmin, sendDKMApprovalEmail, sendDKMRejectionEmail, addDKMSubscriberToMailketing } from '@/lib/mailketing';

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

function getWPAdminAuthHeader(): string | null {
  const user = process.env.WP_ADMIN_USERNAME?.trim();
  const pass = process.env.WP_APPLICATION_PASSWORD?.trim();

  if (!user || !pass) {
    console.warn('[DKM Auth Error] Kredensial server WordPress tidak lengkap:', {
      hasUsername: Boolean(user),
      hasAppPassword: Boolean(pass),
    });
    return null;
  }

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
        password: appData.password,
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
          featuredMediaId: masjid.featured_media || appData.newMasjidData?.featuredMediaId,
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
 * Menerima FormData atau DKMRegistrationPayload
 */
export async function submitDaftarDKM(formDataOrPayload: FormData | DKMRegistrationPayload) {
  try {
    const authHeader = getWPAdminAuthHeader();
    if (!authHeader) {
      return { success: false, error: 'Sistem pendaftaran sedang tidak tersedia (Kredensial Server belum dikonfigurasi).' };
    }

    const isFormData = typeof (formDataOrPayload as any)?.get === 'function';

    let namaPengurus = '';
    let email = '';
    let password = '';
    let noWhatsapp = '';
    let kotaKabupaten = '';
    let masjidOption = '';
    let isNewMasjid = false;
    let namaMasjidBaru = '';
    let kecamatan = '';
    let kecamatanNama = '';
    let alamatMasjid = '';
    let googleMapsUrl = '';
    let fasilitas: string[] = [];
    let namaBank = '';
    let nomorRekening = '';
    let atasNamaRekening = '';
    let catatan = '';
    let fotoMasjid: File | null = null;

    if (isFormData) {
      const fd = formDataOrPayload as FormData;
      namaPengurus = fd.get('namaPengurus')?.toString() || '';
      email = fd.get('email')?.toString() || '';
      password = fd.get('password')?.toString() || '';
      noWhatsapp = fd.get('noWhatsapp')?.toString() || '';
      kotaKabupaten = fd.get('kotaKabupaten')?.toString() || '';
      masjidOption = fd.get('masjidOption')?.toString() || '';
      isNewMasjid = masjidOption === 'NEW_MASJID' || fd.get('isNewMasjid') === 'true';
      namaMasjidBaru = fd.get('namaMasjidBaru')?.toString() || '';
      kecamatan = fd.get('kecamatan')?.toString() || '';
      kecamatanNama = fd.get('kecamatanNama')?.toString() || '';
      alamatMasjid = fd.get('alamatMasjid')?.toString() || '';
      googleMapsUrl = fd.get('googleMapsUrl')?.toString() || '';
      fasilitas = fd.getAll('fasilitas').map((f) => f.toString());
      namaBank = fd.get('namaBank')?.toString() || '';
      nomorRekening = fd.get('nomorRekening')?.toString() || '';
      atasNamaRekening = fd.get('atasNamaRekening')?.toString() || '';
      catatan = fd.get('catatan')?.toString() || '';

      const rawFile = fd.get('fotoMasjid');
      if (rawFile && typeof rawFile === 'object' && 'size' in rawFile && (rawFile as File).size > 0) {
        fotoMasjid = rawFile as File;
      }
    } else {
      const p = formDataOrPayload as DKMRegistrationPayload;
      namaPengurus = p.namaPengurus || '';
      email = p.email || '';
      password = p.password || '';
      noWhatsapp = p.noWhatsapp || '';
      kotaKabupaten = p.kotaKabupaten || '';
      masjidOption = p.masjidOption || '';
      isNewMasjid = masjidOption === 'NEW_MASJID' || Boolean(p.isNewMasjid);
      namaMasjidBaru = p.namaMasjidBaru || '';
      kecamatan = p.kecamatan?.toString() || '';
      kecamatanNama = p.kecamatanNama || '';
      alamatMasjid = p.alamatMasjid || '';
      googleMapsUrl = p.googleMapsUrl || '';
      fasilitas = p.fasilitas || [];
      namaBank = p.namaBank || '';
      nomorRekening = p.nomorRekening || '';
      atasNamaRekening = p.atasNamaRekening || '';
      catatan = p.catatan || '';
      fotoMasjid = p.fotoMasjid || null;
    }

    // 1. Upload Foto / Profil Masjid jika disertakan
    let mediaId: number | undefined = undefined;
    if (fotoMasjid && fotoMasjid.size > 0 && typeof fotoMasjid.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await fotoMasjid.arrayBuffer();
        const mediaRes = await fetch(`${WP_API_URL}/media`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fotoMasjid.name || 'foto-masjid.jpg')}"`,
            'Content-Type': fotoMasjid.type || 'image/jpeg',
          },
          body: Buffer.from(arrayBuffer),
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          mediaId = mediaData.id;
        } else {
          console.error('[submitDaftarDKM] Gagal upload foto profil masjid:', await mediaRes.text());
        }
      } catch (uploadErr) {
        console.error('[submitDaftarDKM] Error saat upload foto media:', uploadErr);
      }
    }
    
    // Siapkan data JSON tambahan untuk disimpan di konten post (dienkripsi Base64)
    const appData = {
      namaPengurus,
      email,
      password, // Password tersimpan untuk diaktifkan saat admin menekan "Setujui Akun DKM"
      noWhatsapp,
      masjidId: !isNewMasjid ? Number(masjidOption) : undefined,
      masjidName: !isNewMasjid ? (namaMasjidBaru || `Masjid #${masjidOption}`) : namaMasjidBaru,
      isNewMasjid,
      newMasjidData: isNewMasjid ? {
        namaMasjid: namaMasjidBaru || '',
        kotaKabupaten,
        kecamatanName: kecamatanNama,
        alamatLengkap: alamatMasjid || '',
        googleMapsUrl,
        fasilitas,
        namaBank,
        nomorRekening,
        atasNamaRekening,
        featuredMediaId: mediaId,
      } : undefined,
      catatan,
    };

    const base64Content = Buffer.from(JSON.stringify(appData)).toString('base64');
    const contentPayload = `<!-- DKM_METADATA_START:${base64Content}:DKM_METADATA_END -->`;

    let wpMasjidPayload: Record<string, unknown> = {};

    if (isNewMasjid) {
      // Bentuk objek ACF secara defensif (hanya field yang benar-benar bernilai)
      const alamatLengkapFormatted = alamatMasjid
        ? (kecamatanNama && !alamatMasjid.toLowerCase().includes(kecamatanNama.toLowerCase())
            ? `${alamatMasjid}, Kec. ${kecamatanNama}`
            : alamatMasjid)
        : (kecamatanNama ? `Kec. ${kecamatanNama}` : '');

      const acfPayload: Record<string, unknown> = {
        kota_kabupaten: kotaKabupaten || 'Kota Serang',
        alamat_lengkap: alamatLengkapFormatted,
        no_wa_dkm: noWhatsapp || '',
        nama_kontak_dkm: namaPengurus || '',
      };

      // HANYA kirim google_maps_url jika diawali http/https (JANGAN kirim string kosong "")
      if (googleMapsUrl && googleMapsUrl.trim().startsWith('http')) {
        acfPayload.google_maps_url = googleMapsUrl.trim();
      }

      if (namaBank && namaBank.trim()) {
        acfPayload.nama_bank = namaBank.trim();
      }
      if (nomorRekening && nomorRekening.trim()) {
        acfPayload.nomor_rekening = nomorRekening.trim();
      }
      if (atasNamaRekening && atasNamaRekening.trim()) {
        acfPayload.atas_nama_rekening = atasNamaRekening.trim();
      }
      if (Array.isArray(fasilitas) && fasilitas.length > 0) {
        const WP_FASILITAS_MAP: Record<string, string> = {
          'Parkir Mobil & Motor': '• Parkir Mobil & Motor',
          'Tempat Wudhu Terpisah': '• Tempat Wudhu Terpisah',
          'Ruangan Ber-AC': '• Ruangan Ber-AC',
          'Area Khusus Akhwat': '• Area Khusus Akhawat (Hijab)',
          'Area Khusus Akhawat (Hijab)': '• Area Khusus Akhawat (Hijab)',
          'Perpustakaan Kitab': '• Perpustakaan Kitab',
        };
        acfPayload.fasilitas = fasilitas.map(
          (f) => WP_FASILITAS_MAP[f] || (f.startsWith('• ') ? f : `• ${f}`)
        );
      }

      wpMasjidPayload = {
        title: namaMasjidBaru || 'Usulan Masjid Baru',
        status: 'pending',
        content: contentPayload,
        acf: acfPayload,
      };

      if (mediaId) {
        wpMasjidPayload.featured_media = mediaId;
      }

      // Hindari error taksonomi kecamatan: HANYA sertakan properti kecamatan jika ID benar-benar angka valid (> 0)
      const rawKecId = Number(kecamatan);
      if (!isNaN(rawKecId) && rawKecId > 0) {
        wpMasjidPayload.kecamatan = [rawKecId];
      }
    } else {
      // Klaim masjid yang sudah ada
      const acfPayload: Record<string, unknown> = {
        kota_kabupaten: kotaKabupaten || 'Kota Serang',
        no_wa_dkm: noWhatsapp || '',
        nama_kontak_dkm: namaPengurus || '',
      };

      wpMasjidPayload = {
        title: `KLAIM: ${namaMasjidBaru || 'Masjid #' + masjidOption} - ${namaPengurus}`,
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

    // Konstruksi data pendaftaran untuk email & subscriber
    const pendaftaranData = {
      namaMasjid: isNewMasjid ? namaMasjidBaru : `Klaim: ${masjidOption}`,
      namaPengurus,
      email,
      noWhatsapp,
      kotaKabupaten: kotaKabupaten || 'Tidak diketahui',
      alamatLengkap: alamatMasjid,
      fasilitas,
    };

    // Kirim notifikasi email ke admin & daftarkan ke list Mailketing secara aman di serverless
    await Promise.allSettled([
      sendNewDKMNotificationToAdmin(pendaftaranData),
      addDKMSubscriberToMailketing(pendaftaranData),
    ]);
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
 * Otomatis membuat akun User WordPress (wp_users) dan mengaitkan author masjid
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
    // Ambil detail pendaftaran masjid
    const resGet = await fetch(`${WP_API_URL}/masjid/${registrationId}`, {
      headers: { 'Authorization': authHeader },
    });
    if (!resGet.ok) {
      return { success: false, error: 'Data permohonan tidak ditemukan di server.' };
    }
    const masjidData = await resGet.json();
    const isClaim = typeof masjidData.title?.rendered === 'string' && masjidData.title.rendered.startsWith('KLAIM:');

    // Ekstrak metadata pendaftar (nama, email, password)
    let appData: any = {};
    try {
      if (masjidData.content?.rendered) {
        const rawContent = masjidData.content.rendered;
        const match = rawContent.match(/DKM_METADATA_START:(.*?):DKM_METADATA_END/);
        if (match && match[1]) {
          appData = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
        }
      }
    } catch (e) {
      console.error('Failed parsing metadata on approve:', e);
    }

    // 1. Buat atau dapatkan akun pengguna WordPress di wp_users
    let userId: number | undefined = undefined;
    if (appData.email) {
      try {
        const userPayload = {
          username: appData.email,
          name: appData.namaPengurus || appData.email,
          email: appData.email,
          password: appData.password || undefined,
          roles: ['author'],
        };

        const userRes = await fetch(`${WP_API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(userPayload),
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.id;
        } else {
          const userErr = await userRes.json().catch(() => ({}));
          console.warn('[approveDKMRegistration] User baru tidak dapat dibuat langsung, mencari akun yang sudah ada:', userErr);

          // Kasus defensif: Jika email/username sudah pernah ada di WordPress, gunakan user yang sudah ada
          const searchRes = await fetch(`${WP_API_URL}/users?search=${encodeURIComponent(appData.email)}`, {
            headers: { 'Authorization': authHeader },
          });
          if (searchRes.ok) {
            const users = await searchRes.json();
            const foundUser = users.find(
              (u: any) =>
                u.email?.toLowerCase() === appData.email?.toLowerCase() ||
                u.username?.toLowerCase() === appData.email?.toLowerCase()
            );
            if (foundUser) {
              userId = foundUser.id;
            }
          }
        }
      } catch (uErr) {
        console.error('[approveDKMRegistration] Error saat membuat user WordPress:', uErr);
      }
    }

    if (!isClaim) {
      // Jika ini masjid baru: Terbitkan masjid ('publish') dan sematkan author: userId
      const updatePayload: Record<string, unknown> = {
        status: 'publish',
      };
      if (userId) {
        updatePayload.author = userId;
      }

      const resPub = await fetch(`${WP_API_URL}/masjid/${registrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!resPub.ok) {
        const errText = await resPub.text();
        console.error('[approveDKMRegistration] Gagal mem-publish masjid:', errText);
        throw new Error('Gagal mem-publish masjid usulan.');
      }
    } else {
      // Jika ini klaim: Tautkan author akun DKM ke masjid asli yang diklaim
      if (appData.masjidId && userId) {
        try {
          await fetch(`${WP_API_URL}/masjid/${appData.masjidId}`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ author: userId }),
          });
        } catch (claimAuthorErr) {
          console.error('[approveDKMRegistration] Error menautkan author ke masjid klaim:', claimAuthorErr);
        }
      }

      // Hapus entri klaim draft sementara
      const resDel = await fetch(`${WP_API_URL}/masjid/${registrationId}?force=true`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader },
      });
      if (!resDel.ok) {
        throw new Error('Gagal menghapus entri klaim setelah di-approve.');
      }
    }

    if (appData.email) {
      const namaMasjidFinal = appData.newMasjidData?.namaMasjid || appData.masjidName || masjidData.title?.rendered || 'Masjid Anda';
      sendDKMApprovalEmail({
        email: appData.email,
        namaMasjid: namaMasjidFinal.replace('KLAIM: ', ''),
      }).catch((e) => console.error('[Mailketing Error di approveDKMRegistration]', e));
    }

    revalidatePath('/');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return {
      success: true,
      message: userId
        ? 'Akun DKM & profil masjid berhasil disetujui! Akun pengguna WordPress telah dibuat dan siap digunakan login.'
        : 'Akun DKM berhasil diverifikasi dan data masjid telah diterbitkan.',
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
    // 1. Ambil data masjid untuk mendapatkan email pemohon
    const resGet = await fetch(`${WP_API_URL}/masjid/${registrationId}`, {
      headers: { 'Authorization': authHeader },
    });
    
    if (resGet.ok) {
      const masjidData = await resGet.json();
      let appData: any = {};
      try {
        if (masjidData.content?.rendered) {
          const rawContent = masjidData.content.rendered;
          const match = rawContent.match(/DKM_METADATA_START:(.*?):DKM_METADATA_END/);
          if (match && match[1]) {
            appData = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
          }
        }
      } catch (e) {
        console.error('Failed parsing metadata on reject:', e);
      }
      
      if (appData.email) {
        const namaMasjidFinal = appData.newMasjidData?.namaMasjid || appData.masjidName || masjidData.title?.rendered || 'Usulan Masjid';
        sendDKMRejectionEmail({
          email: appData.email,
          namaMasjid: namaMasjidFinal.replace('KLAIM: ', ''),
        }).catch((e) => console.error('[Mailketing Error di rejectDKMRegistration]', e));
      }
    }

    // 2. Hapus draft masjid / klaim masjid ini
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
