'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { WPMasjid } from '@/types';
import { extractFeaturedImage } from '@/lib/wordpress';

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

/**
 * Mengambil data detail satu masjid berdasarkan ID (termasuk status apa pun jika berwenang)
 */
export async function getMasjidById(id: number): Promise<WPMasjid | null> {
  try {
    const session = await getSession();
    const headers: Record<string, string> = {};
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    const res = await fetch(`${WP_API_URL}/masjid/${id}?_embed`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;
    const masjid: WPMasjid = await res.json();
    masjid.featured_media_url = extractFeaturedImage(masjid) || masjid.featured_media_url;
    return masjid;
  } catch (err) {
    console.error(`Error getMasjidById ${id}:`, err);
    return null;
  }
}

/**
 * Server Action: DKM Mengupdate Profil Masjid Sendiri
 */
export async function updateMasjidProfile(formData: FormData) {
  const session = await getSession();
  if (!session || !session.token) {
    return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };
  }

  const masjidId = Number(formData.get('masjidId')) || session.masjidId;
  if (!masjidId) {
    return { success: false, error: 'ID Masjid tidak valid atau belum terhubung dengan akun Anda.' };
  }

  try {
    let mediaId: number | undefined = undefined;

    // 1. Upload Foto Utama Masjid jika ada berkas baru
    const foto = formData.get('foto') as File | null;
    if (foto && foto.size > 0 && typeof foto.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await foto.arrayBuffer();
        const mediaRes = await fetch(`${WP_API_URL}/media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(foto.name)}"`,
            'Content-Type': foto.type || 'image/jpeg',
          },
          body: Buffer.from(arrayBuffer),
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          mediaId = mediaData.id;
        } else {
          console.warn('Gagal upload media ke WP API:', await mediaRes.text());
        }
      } catch (uploadErr) {
        console.error('Error saat upload foto:', uploadErr);
      }
    }

    // Parse Fasilitas
    const fasilitasRaw = formData.getAll('fasilitas');
    const fasilitasList: string[] = fasilitasRaw.map((f) => f.toString()).filter(Boolean);

    // Siapkan Payload Update
    const payload: {
      content?: string;
      featured_media?: number;
      acf: Record<string, unknown>;
    } = {
      content: formData.get('deskripsi')?.toString() || '',
      acf: {
        alamat_lengkap: formData.get('alamatLengkap')?.toString() || '',
        google_maps_url: formData.get('googleMapsUrl')?.toString() || '',
        no_wa_dkm: formData.get('noWaDkm')?.toString() || '',
        nama_kontak_dkm: formData.get('namaKontakDkm')?.toString() || '',
        nama_bank: formData.get('namaBank')?.toString() || '',
        nomor_rekening: formData.get('nomorRekening')?.toString() || '',
        atas_nama_rekening: formData.get('atasNamaRekening')?.toString() || '',
        fasilitas: fasilitasList,
        instagram_url: formData.get('instagramUrl')?.toString() || '',
        youtube_url: formData.get('youtubeUrl')?.toString() || '',
      },
    };

    if (mediaId) {
      payload.featured_media = mediaId;
    }

    const res = await fetch(`${WP_API_URL}/masjid/${masjidId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Error response WP API saat update profil masjid:', errText);
      return { success: false, error: `Gagal menyimpan data masjid: ${errText}` };
    }

    // Revalidasi Cache
    revalidatePath('/');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/dkm');
    revalidatePath('/dashboard/dkm/profil-masjid');

    return { success: true, message: 'Profil masjid berhasil diperbarui!' };
  } catch (error) {
    console.error('Error in updateMasjidProfile:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat memperbarui profil masjid.' };
  }
}

/**
 * Server Action: Super Admin Membuat Masjid Baru
 */
export async function createMasjidByAdmin(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak. Anda bukan Administrator.' };
  }

  const namaMasjid = formData.get('namaMasjid')?.toString();
  if (!namaMasjid || namaMasjid.trim().length < 3) {
    return { success: false, error: 'Nama masjid minimal 3 karakter.' };
  }

  try {
    let mediaId: number | undefined = undefined;

    // Upload Foto jika ada
    const foto = formData.get('foto') as File | null;
    if (foto && foto.size > 0 && typeof foto.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await foto.arrayBuffer();
        const mediaRes = await fetch(`${WP_API_URL}/media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(foto.name)}"`,
            'Content-Type': foto.type || 'image/jpeg',
          },
          body: Buffer.from(arrayBuffer),
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          mediaId = mediaData.id;
        }
      } catch (uploadErr) {
        console.error('Error saat upload foto:', uploadErr);
      }
    }

    const kecamatanId = Number(formData.get('kecamatan')) || undefined;
    const fasilitasRaw = formData.getAll('fasilitas');
    const fasilitasList: string[] = fasilitasRaw.map((f) => f.toString()).filter(Boolean);

    const payload: {
      title: string;
      content: string;
      status: string;
      kecamatan?: number[];
      featured_media?: number;
      acf: Record<string, unknown>;
    } = {
      title: namaMasjid,
      content: formData.get('deskripsi')?.toString() || '',
      status: 'publish',
      kecamatan: kecamatanId ? [kecamatanId] : [],
      acf: {
        alamat_lengkap: formData.get('alamatLengkap')?.toString() || '',
        google_maps_url: formData.get('googleMapsUrl')?.toString() || '',
        no_wa_dkm: formData.get('noWaDkm')?.toString() || '',
        nama_kontak_dkm: formData.get('namaKontakDkm')?.toString() || '',
        nama_bank: formData.get('namaBank')?.toString() || '',
        nomor_rekening: formData.get('nomorRekening')?.toString() || '',
        atas_nama_rekening: formData.get('atasNamaRekening')?.toString() || '',
        fasilitas: fasilitasList,
        instagram_url: formData.get('instagramUrl')?.toString() || '',
        youtube_url: formData.get('youtubeUrl')?.toString() || '',
      },
    };

    if (mediaId) {
      payload.featured_media = mediaId;
    }

    const res = await fetch(`${WP_API_URL}/masjid`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Gagal membuat masjid: ${errText}` };
    }

    revalidatePath('/');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return { success: true, message: 'Masjid baru berhasil diterbitkan!' };
  } catch (error) {
    console.error('Error in createMasjidByAdmin:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat membuat masjid.' };
  }
}

/**
 * Server Action: Super Admin Mengedit Data Masjid
 */
export async function updateMasjidByAdmin(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak. Anda bukan Administrator.' };
  }

  const id = Number(formData.get('id'));
  if (!id) {
    return { success: false, error: 'ID Masjid tidak valid.' };
  }

  const namaMasjid = formData.get('namaMasjid')?.toString();

  try {
    let mediaId: number | undefined = undefined;

    // Upload Foto jika ada
    const foto = formData.get('foto') as File | null;
    if (foto && foto.size > 0 && typeof foto.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await foto.arrayBuffer();
        const mediaRes = await fetch(`${WP_API_URL}/media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(foto.name)}"`,
            'Content-Type': foto.type || 'image/jpeg',
          },
          body: Buffer.from(arrayBuffer),
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          mediaId = mediaData.id;
        }
      } catch (uploadErr) {
        console.error('Error saat upload foto:', uploadErr);
      }
    }

    const kecamatanId = Number(formData.get('kecamatan')) || undefined;
    const fasilitasRaw = formData.getAll('fasilitas');
    const fasilitasList: string[] = fasilitasRaw.map((f) => f.toString()).filter(Boolean);

    const payload: {
      title?: string;
      content?: string;
      kecamatan?: number[];
      featured_media?: number;
      acf: Record<string, unknown>;
    } = {
      acf: {
        alamat_lengkap: formData.get('alamatLengkap')?.toString() || '',
        google_maps_url: formData.get('googleMapsUrl')?.toString() || '',
        no_wa_dkm: formData.get('noWaDkm')?.toString() || '',
        nama_kontak_dkm: formData.get('namaKontakDkm')?.toString() || '',
        nama_bank: formData.get('namaBank')?.toString() || '',
        nomor_rekening: formData.get('nomorRekening')?.toString() || '',
        atas_nama_rekening: formData.get('atasNamaRekening')?.toString() || '',
        fasilitas: fasilitasList,
        instagram_url: formData.get('instagramUrl')?.toString() || '',
        youtube_url: formData.get('youtubeUrl')?.toString() || '',
      },
    };

    if (namaMasjid) payload.title = namaMasjid;
    if (formData.has('deskripsi')) payload.content = formData.get('deskripsi')?.toString() || '';
    if (kecamatanId) payload.kecamatan = [kecamatanId];
    if (mediaId) payload.featured_media = mediaId;

    const res = await fetch(`${WP_API_URL}/masjid/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Gagal memperbarui masjid: ${errText}` };
    }

    revalidatePath('/');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return { success: true, message: 'Data masjid berhasil diperbarui!' };
  } catch (error) {
    console.error('Error in updateMasjidByAdmin:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat memperbarui masjid.' };
  }
}

/**
 * Server Action: Super Admin Menghapus Masjid
 */
export async function deleteMasjidByAdmin(id: number) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak. Anda bukan Administrator.' };
  }

  try {
    const res = await fetch(`${WP_API_URL}/masjid/${id}?force=true`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Gagal menghapus masjid: ${errText}` };
    }

    revalidatePath('/');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return { success: true, message: 'Masjid berhasil dihapus.' };
  } catch (error) {
    console.error('Error in deleteMasjidByAdmin:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat menghapus masjid.' };
  }
}
