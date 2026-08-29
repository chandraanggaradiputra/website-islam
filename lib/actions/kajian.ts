'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const WP_API_URL = 'https://salaf.maschandigital.id/wp-json/wp/v2';

export async function submitKajian(formData: FormData) {
  const session = await getSession();
  if (!session || !session.token) {
    return { success: false, error: 'Sesi tidak valid atau telah berakhir.' };
  }

  try {
    let mediaId = null;

    // 1. Upload Poster jika ada
    const poster = formData.get('poster') as File | null;
    if (poster && poster.size > 0) {
      const arrayBuffer = await poster.arrayBuffer();
      const mediaRes = await fetch(`${WP_API_URL}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Disposition': `attachment; filename="${poster.name}"`,
          'Content-Type': poster.type,
        },
        body: Buffer.from(arrayBuffer),
      });

      if (!mediaRes.ok) {
        const err = await mediaRes.json();
        console.error('Media upload error:', err);
        return { success: false, error: 'Gagal mengupload poster kajian.' };
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
        tanggal_kajian: formData.get('tanggal')?.toString().replace(/-/g, ''), // Format depends on ACF (usually Ymd for Date picker) - wait, let's just pass YYYYMMDD
        jam_mulai: formData.get('waktu'),
        jam_selesai: formData.get('waktu'),
        status_kajian: 'aktif',
        masjid_terkait: session.masjidId ? [session.masjidId] : [], 
        waktu_keterangan: formData.get('waktu'), 
        link_streaming: formData.get('linkStreaming') || '',
      }
    };

    // Replace hyphens to match ACF Ymd format if it's standard Y-m-d
    if (payload.acf.tanggal_kajian) {
      payload.acf.tanggal_kajian = formData.get('tanggal')?.toString().split('-').join('') || '';
    }

    const kajianRes = await fetch(`${WP_API_URL}/kajian`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!kajianRes.ok) {
      const err = await kajianRes.json();
      console.error('Kajian creation error:', err);
      return { success: false, error: 'Gagal mengirim jadwal kajian.' };
    }

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
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'publish' })
    });

    if (!res.ok) {
      return { success: false, error: 'Gagal mempublikasi kajian.' };
    }

    revalidatePath('/');
    revalidatePath('/jadwal-kajian');
    revalidatePath('/dashboard/admin');

    return { success: true };
  } catch (error) {
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
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'draft' })
    });

    if (!res.ok) {
      return { success: false, error: 'Gagal menolak kajian.' };
    }
    
    revalidatePath('/dashboard/admin');

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}
