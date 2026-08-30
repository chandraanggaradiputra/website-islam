'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

export async function submitKajian(formData: FormData) {
  const session = await getSession();
  if (!session || !session.token) {
    return { success: false, error: 'Sesi tidak valid atau telah berakhir.' };
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

    // 2. Buat Postingan Kajian Baru
    const payload = {
      title: formData.get('judul'),
      status: 'pending',
      featured_media: mediaId,
      acf: {
        nama_ustadz: formData.get('penceramah'),
        jenis_kajian: formData.get('jenisKajian'),
        kategori_jamaah: formData.get('kategoriJamaah'),
        kitab_bahasan: formData.get('deskripsi'),
        tanggal_kajian: formData.get('tanggal')?.toString().split('-').join('') || '',
        jam_mulai: formData.get('waktu'),
        jam_selesai: formData.get('waktu'),
        status_kajian: 'aktif',
        masjid_terkait: session.masjidId ? [session.masjidId] : [],
        waktu_keterangan: formData.get('waktu'),
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
  } catch (error) {
    console.error('Submit kajian error:', error);
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

    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

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

    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return { success: true, message: 'Status kajian berhasil diperbarui!' };
  } catch (error) {
    console.error('Error in updateKajianStatus:', error);
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
        kategori_jamaah: formData.get('kategoriJamaah')?.toString() || 'umum',
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

    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/masjid');
    revalidatePath('/dashboard/admin');

    return { success: true, message: 'Jadwal kajian berhasil diperbarui!' };
  } catch (error) {
    console.error('Error in updateKajianByAdmin:', error);
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
  } catch (error) {
    console.error('Error in deleteKajian:', error);
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}
