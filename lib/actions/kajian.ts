'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getMasjidById } from '@/lib/actions/masjid';
import { notifySearchEngines } from '@/lib/seo';
import { WPKajian } from '@/types';
import { isKajianExpired } from '@/lib/kajian';
import { getWPAdminAuthHeader } from '@/lib/wordpress';

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

export async function submitKajian(formData: FormData) {
  const session = await getSession();
  if (!session || !session.token) {
    return { success: false, error: 'Sesi tidak valid atau telah berakhir.' };
  }

  // Verifikasi otorisasi DKM: 1 Masjid hanya dapat dikelola oleh akun DKM resmi yang terhubung
  const userRole = (session as any).user?.role || session.role;
  const userMasjidId = Number((session as any).user?.masjidId || session.masjidId);

  if (userRole === 'dkm') {
    const rawTarget = formData.get('masjid_terkait') || formData.get('masjidId');
    const targetMasjidId = rawTarget ? Number(rawTarget) : userMasjidId;

    if (!userMasjidId || targetMasjidId !== userMasjidId) {
      return {
        success: false,
        error: 'Akses Ditolak: Anda hanya berhak mengelola jadwal kajian untuk masjid resmi yang terhubung dengan akun DKM Anda.',
        message: 'Akses Ditolak: Anda hanya berhak mengelola jadwal kajian untuk masjid resmi yang terhubung dengan akun DKM Anda.',
      };
    }
  }

  try {
    let mediaId = null;

    // 1. Upload Poster jika ada
    const poster = formData.get('poster') as File | null;
    if (poster && poster.size > 0 && typeof poster.arrayBuffer === 'function') {
      const arrayBuffer = await poster.arrayBuffer();
      const mediaRes = await fetch(`${WP_API_URL}/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(poster.name)}"`,
          'Content-Type': poster.type || 'image/jpeg',
        },
        body: Buffer.from(arrayBuffer),
      });

      if (!mediaRes.ok) {
        const errText = await mediaRes.text();
        console.error('Media upload error status:', mediaRes.status);
        console.error('Media upload error body:', errText);
        return { success: false, error: `Gagal mengupload poster [${mediaRes.status}]: ${errText}` };
      }

      const mediaData = await mediaRes.json();
      mediaId = mediaData.id;
    }

    // Dapatkan data masjid untuk mengambil kota_kabupaten dan otomatis menyematkannya ke kajian
    let kotaKabupaten = '';
    if (session.masjidId) {
      const masjid = await getMasjidById(session.masjidId);
      if (masjid && masjid.acf?.kota_kabupaten) {
        kotaKabupaten = masjid.acf.kota_kabupaten;
      }
    }

    // Normalisasi kategori jamaah syar'i (khusus_akhwat)
    const rawKategori = formData.get('kategoriJamaah')?.toString() || 'umum';
    const cleanKategori =
      rawKategori.toLowerCase().includes('akhwat') || rawKategori.toLowerCase().includes('akhawat')
        ? 'khusus_akhwat'
        : rawKategori === 'khusus_ikhwan'
        ? 'khusus_ikhwan'
        : 'umum';

    // 2. Buat Postingan Kajian Baru
    const payload = {
      title: formData.get('judul'),
      status: 'pending',
      featured_media: mediaId,
      acf: {
        kota_kabupaten: kotaKabupaten,
        kota__kabupaten: kotaKabupaten,
        nama_ustadz: formData.get('penceramah'),
        jenis_kajian: formData.get('jenisKajian'),
        kategori_jamaah: cleanKategori,
        kitab_bahasan: formData.get('kitabBahasan') || formData.get('kitab_bahasan') || '',
        hari_kajian: formData.get('hariKajian')?.toString() || '',
        tanggal_kajian: formData.get('tanggal')?.toString().split('-').join('') || '',
        jam_mulai: formData.get('jamMulai')?.toString() || '',
        jam_selesai: formData.get('jamSelesai')?.toString() || '',
        waktu_keterangan: formData.get('waktuKeterangan')?.toString() || `${formData.get('jamMulai')?.toString() || ''} - ${formData.get('jamSelesai')?.toString() || 'Selesai'}`,
        status_kajian: 'aktif',
        masjid_terkait: session.masjidId ? [session.masjidId] : [],
        link_streaming: formData.get('linkStreaming') || '',
      },
    };

    const kajianRes = await fetch(`${WP_API_URL}/kajian`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!kajianRes.ok) {
      const errorBody = await kajianRes.text();
      console.error('WP Error Response Status:', kajianRes.status);
      console.error('WP Error Response Body:', errorBody);
      return { success: false, error: `WordPress Error [${kajianRes.status}]: ${errorBody}` };
    }

    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/dashboard/dkm');
    revalidatePath('/dashboard/admin');

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Submit kajian error:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

export async function approveKajian(id: number) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Tidak ada akses.' };
  }

  try {
    const res = await fetch(`${WP_API_URL}/kajian/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'publish' }),
    });

    if (!res.ok) {
      return { success: false, error: 'Gagal mempublikasi kajian.' };
    }

    const data = await res.json();
    const slug = data.slug;

    revalidatePath('/sitemap.xml');
    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    if (slug) {
      const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'banten-mengaji.vercel.app';
      notifySearchEngines([`https://${host}/jadwal-kajian/${slug}`]);
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

export async function rejectKajian(id: number) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Tidak ada akses.' };
  }

  try {
    const res = await fetch(`${WP_API_URL}/kajian/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'draft' }),
    });

    if (!res.ok) {
      return { success: false, error: 'Gagal menolak kajian.' };
    }

    revalidatePath('/dashboard/admin');

    return { success: true };
  } catch {
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Server Action: Super Admin Mengubah Status Kajian (Publish / Draft / Selesai / Libur)
 */
export async function updateKajianStatus(
  id: number,
  status: 'publish' | 'draft' | 'pending',
  statusKajian?: 'aktif' | 'libur' | 'selesai'
) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak.' };
  }

  try {
    const bodyPayload: {
      status: string;
      acf?: { status_kajian?: string };
    } = { status };

    if (statusKajian) {
      bodyPayload.acf = { status_kajian: statusKajian };
    }

    const res = await fetch(`${WP_API_URL}/kajian/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Gagal memperbarui status: ${err}` };
    }

    const data = await res.json();
    const slug = data.slug;

    revalidatePath('/sitemap.xml');
    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    if (slug && status === 'publish') {
      const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'banten-mengaji.vercel.app';
      notifySearchEngines([`https://${host}/jadwal-kajian/${slug}`]);
    }

    return { success: true, message: 'Status kajian berhasil diperbarui!' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in updateKajianStatus:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Server Action: Super Admin Membuat Jadwal Kajian Baru
 */
export async function createKajianByAdmin(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak. Anda bukan Administrator.' };
  }

  const judul = formData.get('judul')?.toString()?.trim();
  if (!judul) {
    return { success: false, error: 'Judul / Tema kajian wajib diisi.' };
  }

  try {
    let mediaId: number | undefined = undefined;

    // Upload poster jika ada
    const poster = formData.get('poster') as File | null;
    if (poster && poster.size > 0 && typeof poster.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await poster.arrayBuffer();
        const mediaRes = await fetch(`${WP_API_URL}/media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(poster.name)}"`,
            'Content-Type': poster.type || 'image/jpeg',
          },
          body: Buffer.from(arrayBuffer),
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          mediaId = mediaData.id;
        }
      } catch (err) {
        console.error('Error saat upload poster:', err);
      }
    }

    const masjidTerkait = Number(formData.get('masjidTerkait')) || undefined;
    
    let kotaKabupaten = '';
    if (masjidTerkait) {
      const masjid = await getMasjidById(masjidTerkait);
      if (masjid && masjid.acf?.kota_kabupaten) {
        kotaKabupaten = masjid.acf.kota_kabupaten;
      }
    }

    const rawKategori = formData.get('kategoriJamaah')?.toString() || 'umum';
    const cleanKategori =
      rawKategori.toLowerCase().includes('akhwat') || rawKategori.toLowerCase().includes('akhawat')
        ? 'khusus_akhwat'
        : rawKategori === 'khusus_ikhwan'
        ? 'khusus_ikhwan'
        : 'umum';

    const payload: {
      title: string;
      status: string;
      featured_media?: number;
      acf: Record<string, unknown>;
    } = {
      title: judul,
      status: formData.get('postStatus')?.toString() || 'publish',
      acf: {
        nama_ustadz: formData.get('namaUstadz')?.toString() || '',
        jenis_kajian: formData.get('jenisKajian')?.toString() || 'rutin',
        kategori_jamaah: cleanKategori,
        kitab_bahasan: formData.get('kitabBahasan')?.toString() || '',
        hari_kajian: formData.get('hariKajian')?.toString() || '',
        tanggal_kajian: formData.get('tanggalKajian')?.toString().split('-').join('') || '',
        jam_mulai: formData.get('jamMulai')?.toString() || '',
        jam_selesai: formData.get('jamSelesai')?.toString() || '',
        waktu_keterangan:
          formData.get('waktuKeterangan')?.toString() ||
          (formData.get('jamMulai') ? `${formData.get('jamMulai')} WIB` : ''),
        status_kajian: formData.get('statusKajian')?.toString() || 'aktif',
        link_streaming: formData.get('linkStreaming')?.toString() || '',
      },
    };

    if (kotaKabupaten) {
      payload.acf.kota_kabupaten = kotaKabupaten;
      payload.acf.kota__kabupaten = kotaKabupaten;
    }

    if (masjidTerkait) {
      payload.acf.masjid_terkait = [masjidTerkait];
    }
    if (mediaId) {
      payload.featured_media = mediaId;
    }

    const res = await fetch(`${WP_API_URL}/kajian`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Gagal membuat kajian: ${err}` };
    }

    const data = await res.json();
    const slug = data.slug;

    revalidatePath('/sitemap.xml');
    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    if (slug && payload.status === 'publish') {
      const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'banten-mengaji.vercel.app';
      notifySearchEngines([`https://${host}/jadwal-kajian/${slug}`]);
    }

    return { success: true, message: 'Jadwal kajian baru berhasil diterbitkan!' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in createKajianByAdmin:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Server Action: Super Admin Mengedit Data Kajian
 */
export async function updateKajianByAdmin(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak.' };
  }

  const id = Number(formData.get('id'));
  if (!id) {
    return { success: false, error: 'ID Kajian tidak valid.' };
  }

  try {
    let mediaId: number | undefined = undefined;

    // Upload poster baru jika ada
    const poster = formData.get('poster') as File | null;
    if (poster && poster.size > 0 && typeof poster.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await poster.arrayBuffer();
        const mediaRes = await fetch(`${WP_API_URL}/media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(poster.name)}"`,
            'Content-Type': poster.type || 'image/jpeg',
          },
          body: Buffer.from(arrayBuffer),
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          mediaId = mediaData.id;
        }
      } catch (err) {
        console.error('Error saat upload poster:', err);
      }
    }

    const masjidTerkait = Number(formData.get('masjidTerkait')) || undefined;
    
    let kotaKabupaten = '';
    if (masjidTerkait) {
      const masjid = await getMasjidById(masjidTerkait);
      if (masjid && masjid.acf?.kota_kabupaten) {
        kotaKabupaten = masjid.acf.kota_kabupaten;
      }
    }

    const rawKategori = formData.get('kategoriJamaah')?.toString() || 'umum';
    const cleanKategori =
      rawKategori.toLowerCase().includes('akhwat') || rawKategori.toLowerCase().includes('akhawat')
        ? 'khusus_akhwat'
        : rawKategori === 'khusus_ikhwan'
        ? 'khusus_ikhwan'
        : 'umum';

    const payload: {
      title?: string;
      status?: string;
      featured_media?: number;
      acf: Record<string, unknown>;
    } = {
      title: formData.get('judul')?.toString(),
      status: formData.get('postStatus')?.toString() || 'publish',
      acf: {
        nama_ustadz: formData.get('namaUstadz')?.toString() || '',
        jenis_kajian: formData.get('jenisKajian')?.toString() || 'rutin',
        kategori_jamaah: cleanKategori,
        kitab_bahasan: formData.get('kitabBahasan')?.toString() || '',
        hari_kajian: formData.get('hariKajian')?.toString() || '',
        tanggal_kajian: formData.get('tanggalKajian')?.toString().split('-').join('') || '',
        jam_mulai: formData.get('jamMulai')?.toString() || '',
        jam_selesai: formData.get('jamSelesai')?.toString() || '',
        waktu_keterangan: formData.get('waktuKeterangan')?.toString() || '',
        status_kajian: formData.get('statusKajian')?.toString() || 'aktif',
        link_streaming: formData.get('linkStreaming')?.toString() || '',
      },
    };

    if (kotaKabupaten) {
      payload.acf.kota_kabupaten = kotaKabupaten;
      payload.acf.kota__kabupaten = kotaKabupaten;
    }

    if (masjidTerkait) {
      payload.acf.masjid_terkait = [masjidTerkait];
    }
    if (mediaId) {
      payload.featured_media = mediaId;
    }

    const res = await fetch(`${WP_API_URL}/kajian/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Gagal memperbarui kajian: ${err}` };
    }

    const data = await res.json();
    const slug = data.slug;

    revalidatePath('/sitemap.xml');
    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    if (slug && payload.status === 'publish') {
      const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'banten-mengaji.vercel.app';
      notifySearchEngines([`https://${host}/jadwal-kajian/${slug}`]);
    }

    return { success: true, message: 'Jadwal kajian berhasil diperbarui!' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in updateKajianByAdmin:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Server Action: Super Admin Menghapus Kajian
 */
export async function deleteKajian(id: number) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.token) {
    return { success: false, error: 'Akses ditolak.' };
  }

  try {
    const res = await fetch(`${WP_API_URL}/kajian/${id}?force=true`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Gagal menghapus kajian: ${err}` };
    }

    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return { success: true, message: 'Kajian berhasil dihapus.' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in deleteKajian:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Server Action: DKM Mengedit Data Jadwal Kajian Sendiri
 * Termasuk validasi batas waktu kedaluwarsa dan kemampuan mengubah status_kajian ('aktif' | 'libur')
 */
export async function updateKajianByDkm(formData: FormData) {
  const session = await getSession();
  if (!session || !session.token) {
    return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };
  }

  const id = Number(formData.get('id'));
  if (!id) {
    return { success: false, error: 'ID Kajian tidak valid.' };
  }

  const authHeader = session.token ? `Bearer ${session.token}` : getWPAdminAuthHeader();
  if (!authHeader) {
    return { success: false, error: 'Kredensial server tidak tersedia.' };
  }

  try {
    // 1. Ambil data kajian saat ini untuk memverifikasi batas waktu kedaluwarsa & kepemilikan
    const resCurrent = await fetch(`${WP_API_URL}/kajian/${id}?_embed`, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });

    if (!resCurrent.ok) {
      return { success: false, error: 'Data kajian tidak ditemukan.' };
    }

    const currentKajian: WPKajian = await resCurrent.json();

    // Verifikasi otorisasi DKM (hanya boleh mengedit kajian masjid miliknya, kecuali admin)
    const userRole = (session as any).user?.role || session.role;
    const userMasjidId = Number((session as any).user?.masjidId || session.masjidId);

    if (userRole === 'dkm') {
      const rawMasjid = currentKajian.acf?.masjid_terkait as unknown;
      let targetMasjidId: number | null = null;
      if (Array.isArray(rawMasjid) && rawMasjid.length > 0) {
        const first = rawMasjid[0];
        targetMasjidId = typeof first === 'object' && first !== null
          ? Number((first as { ID?: number; id?: number }).ID || (first as { ID?: number; id?: number }).id)
          : Number(first);
      } else if (typeof rawMasjid === 'object' && rawMasjid !== null) {
        targetMasjidId = Number((rawMasjid as { ID?: number; id?: number }).ID || (rawMasjid as { ID?: number; id?: number }).id);
      } else if (rawMasjid) {
        targetMasjidId = Number(rawMasjid);
      }

      const formMasjidTerkait = formData.get('masjid_terkait') ? Number(formData.get('masjid_terkait')) : null;

      if (!userMasjidId || (targetMasjidId && targetMasjidId !== userMasjidId) || (formMasjidTerkait && formMasjidTerkait !== userMasjidId)) {
        return {
          success: false,
          error: 'Akses Ditolak: Anda hanya berhak mengelola jadwal kajian untuk masjid resmi yang terhubung dengan akun DKM Anda.',
          message: 'Akses Ditolak: Anda hanya berhak mengelola jadwal kajian untuk masjid resmi yang terhubung dengan akun DKM Anda.',
        };
      }
    }

    // 2. Validasi Batas Waktu Kedaluwarsa
    const isExpired = isKajianExpired(
      currentKajian.acf?.tanggal_kajian,
      currentKajian.acf?.jam_selesai,
      currentKajian.acf?.jam_mulai
    );

    if (isExpired) {
      return {
        success: false,
        error: 'Kajian telah selesai dilaksanakan dan tidak dapat diedit lagi.',
      };
    }

    // 3. Upload poster baru jika diunggah
    let mediaId: number | undefined = undefined;
    const poster = formData.get('poster') as File | null;
    if (poster && poster.size > 0 && typeof poster.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await poster.arrayBuffer();
        const mediaRes = await fetch(`${WP_API_URL}/media`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(poster.name)}"`,
            'Content-Type': poster.type || 'image/jpeg',
          },
          body: Buffer.from(arrayBuffer),
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          mediaId = mediaData.id;
        } else {
          console.error('[updateKajianByDkm] Gagal upload poster:', await mediaRes.text());
        }
      } catch (err) {
        console.error('[updateKajianByDkm] Error upload poster:', err);
      }
    }

    // 4. Siapkan payload update
    const judul = formData.get('judul')?.toString()?.trim();
    const statusKajian = formData.get('statusKajian')?.toString() || 'aktif';
    const tanggalKajian = formData.get('tanggalKajian')?.toString().split('-').join('') || '';

    const rawKategori = formData.get('kategoriJamaah')?.toString() || currentKajian.acf?.kategori_jamaah || 'umum';
    const cleanKategori =
      rawKategori.toLowerCase().includes('akhwat') || rawKategori.toLowerCase().includes('akhawat')
        ? 'khusus_akhwat'
        : rawKategori === 'khusus_ikhwan'
        ? 'khusus_ikhwan'
        : 'umum';

    const payload: {
      title?: string;
      featured_media?: number;
      acf: Record<string, unknown>;
    } = {
      acf: {
        nama_ustadz: formData.get('namaUstadz')?.toString() || currentKajian.acf?.nama_ustadz || '',
        jenis_kajian: formData.get('jenisKajian')?.toString() || currentKajian.acf?.jenis_kajian || 'rutin',
        kategori_jamaah: cleanKategori,
        kitab_bahasan: formData.get('kitabBahasan')?.toString() || '',
        hari_kajian: formData.get('hariKajian')?.toString() || '',
        tanggal_kajian: tanggalKajian || currentKajian.acf?.tanggal_kajian || '',
        jam_mulai: formData.get('jamMulai')?.toString() || '',
        jam_selesai: formData.get('jamSelesai')?.toString() || '',
        waktu_keterangan:
          formData.get('waktuKeterangan')?.toString() ||
          (formData.get('jamMulai') ? `${formData.get('jamMulai')} WIB` : ''),
        status_kajian: statusKajian,
        link_streaming: formData.get('linkStreaming')?.toString() || '',
      },
    };

    if (judul) payload.title = judul;
    if (mediaId) payload.featured_media = mediaId;

    // 5. Kirim update ke WordPress REST API
    let resUpdate = await fetch(`${WP_API_URL}/kajian/${id}`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (resUpdate.status === 403) {
      const adminAuth = getWPAdminAuthHeader();
      if (adminAuth) {
        resUpdate = await fetch(`${WP_API_URL}/kajian/${id}`, {
          method: 'POST',
          headers: {
            Authorization: adminAuth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    }

    if (!resUpdate.ok) {
      const errText = await resUpdate.text();
      return { success: false, error: `Gagal memperbarui jadwal kajian: ${errText}` };
    }

    const updatedData = await resUpdate.json();
    const slug = updatedData.slug || currentKajian.slug;

    revalidatePath('/sitemap.xml');
    revalidatePath('/jadwal-kajian');
    if (slug) {
      revalidatePath(`/jadwal-kajian/${slug}`);
    }
    revalidatePath('/');
    revalidatePath('/dashboard/dkm');

    return {
      success: true,
      message: statusKajian === 'libur'
        ? 'Jadwal kajian berhasil diperbarui dan ditandai DILIBURKAN.'
        : 'Jadwal kajian berhasil diperbarui!',
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in updateKajianByDkm:', err.message);
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Terjadi kesalahan sistem saat memperbarui kajian.' };
  }
}

/**
 * Mengarsipkan kajian tematik yang telah lewat waktu pelaksanaannya secara asinkron di latar belakang.
 * Mengubah status_kajian ACF menjadi 'selesai'.
 */
export async function archiveExpiredKajian(kajianList: WPKajian[]): Promise<void> {
  const expiredActiveKajian = kajianList.filter((k) => {
    if (k.acf?.status_kajian !== 'aktif') return false;
    return isKajianExpired(k.acf?.tanggal_kajian, k.acf?.jam_selesai, k.acf?.jam_mulai);
  });

  if (expiredActiveKajian.length === 0) return;

  const authHeader = getWPAdminAuthHeader();
  if (!authHeader) return;

  try {
    await Promise.allSettled(
      expiredActiveKajian.map(async (kajian) => {
        try {
          await fetch(`${WP_API_URL}/kajian/${kajian.id}`, {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              acf: {
                status_kajian: 'selesai',
              },
            }),
          });
        } catch (updateErr) {
          console.error(`[archiveExpiredKajian] Gagal mengarsipkan kajian ID ${kajian.id}:`, updateErr);
        }
      })
    );
  } catch (err) {
    console.error('[archiveExpiredKajian] Error:', err);
  }
}

// Alias resmi untuk kompatibilitas pemanggilan createKajian
export const createKajian = submitKajian;
