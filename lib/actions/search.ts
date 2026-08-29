'use server';

import { getKajianList, getMasjidList, getArtikelList } from '@/lib/wordpress';
import { SearchResultItem } from '@/types';

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  try {
    const [listKajian, listMasjid, listArtikel] = await Promise.all([
      getKajianList(),
      getMasjidList(),
      getArtikelList(),
    ]);

    const results: SearchResultItem[] = [];

    // 1. Cari di Jadwal Kajian (Mencari di Judul, Nama Ustadz, Kitab, & Nama Masjid)
    listKajian.forEach((kajian) => {
      const title = kajian.title?.rendered || '';
      const ustadz = kajian.acf?.nama_ustadz || '';
      const kitab = kajian.acf?.kitab_bahasan || '';
      const masjid = kajian.masjid_name || kajian.masjid_detail?.title?.rendered || '';

      const isMatch =
        title.toLowerCase().includes(cleanQuery) ||
        ustadz.toLowerCase().includes(cleanQuery) ||
        kitab.toLowerCase().includes(cleanQuery) ||
        masjid.toLowerCase().includes(cleanQuery);

      if (isMatch) {
        results.push({
          id: kajian.id,
          title: title,
          subtitle: `${ustadz ? `Ust. ${ustadz}` : ''} ${masjid ? `• ${masjid}` : ''}`.trim(),
          category: 'kajian',
          url: `/jadwal-kajian/${kajian.slug}`,
          badgeText: 'Jadwal Kajian',
        });
      }
    });

    // 2. Cari di Direktori Masjid (Mencari di Nama Masjid, Alamat, & Kecamatan)
    listMasjid.forEach((masjid) => {
      const name = masjid.title?.rendered || '';
      const alamat = masjid.acf?.alamat_lengkap || '';
      // Memperbaiki type safety: kecamatan ada di root object (WPMasjid) dan bertipe number[]
      const kec = Array.isArray(masjid.kecamatan) ? masjid.kecamatan.join(', ') : '';

      const isMatch =
        name.toLowerCase().includes(cleanQuery) ||
        alamat.toLowerCase().includes(cleanQuery) ||
        kec.toLowerCase().includes(cleanQuery);

      if (isMatch) {
        results.push({
          id: masjid.id,
          title: name,
          subtitle: alamat || (kec ? `ID Kecamatan ${kec}` : 'Kota Serang'),
          category: 'masjid',
          url: `/masjid/${masjid.slug}`,
          badgeText: 'Masjid',
        });
      }
    });

    // 3. Cari di Artikel & Faedah Ilmiah (Mencari di Judul Artikel)
    listArtikel.forEach((artikel) => {
      const title = artikel.title?.rendered || '';
      if (title.toLowerCase().includes(cleanQuery)) {
        results.push({
          id: artikel.id,
          title: title,
          subtitle: 'Faedah Ilmiah & Artikel Dakwah',
          category: 'artikel',
          url: `/artikel/${artikel.slug}`,
          badgeText: 'Artikel',
        });
      }
    });

    return results;
  } catch (err: unknown) {
    console.error('Error in globalSearch Server Action:', err);
    return [];
  }
}
