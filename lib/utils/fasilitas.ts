export const VALID_ACF_FASILITAS = [
  '• Parkir Mobil & Motor',
  '• Tempat Wudhu Terpisah',
  '• Ruangan Ber-AC',
  '• Area Khusus Akhawat (Hijab)',
  '• Perpustakaan Kitab',
] as const;

export type ValidAcfFasilitas = (typeof VALID_ACF_FASILITAS)[number];

export const ACF_FASILITAS_MAP: Record<string, ValidAcfFasilitas> = {
  'parkir mobil & motor': '• Parkir Mobil & Motor',
  'parkir mobil dan motor': '• Parkir Mobil & Motor',
  'parkir mobil': '• Parkir Mobil & Motor',
  'parkir': '• Parkir Mobil & Motor',
  'tempat wudhu terpisah': '• Tempat Wudhu Terpisah',
  'tempat wudhu': '• Tempat Wudhu Terpisah',
  'wudhu terpisah': '• Tempat Wudhu Terpisah',
  'ruangan ber-ac': '• Ruangan Ber-AC',
  'ruangan ber ac': '• Ruangan Ber-AC',
  'ber-ac': '• Ruangan Ber-AC',
  'ac': '• Ruangan Ber-AC',
  'area khusus akhwat': '• Area Khusus Akhawat (Hijab)',
  'area khusus akhawat': '• Area Khusus Akhawat (Hijab)',
  'area khusus akhwat (hijab)': '• Area Khusus Akhawat (Hijab)',
  'area khusus akhawat (hijab)': '• Area Khusus Akhawat (Hijab)',
  'khusus akhwat': '• Area Khusus Akhawat (Hijab)',
  'khusus akhawat': '• Area Khusus Akhawat (Hijab)',
  'akhwat': '• Area Khusus Akhawat (Hijab)',
  'akhawat': '• Area Khusus Akhawat (Hijab)',
  'perpustakaan kitab': '• Perpustakaan Kitab',
  'perpustakaan': '• Perpustakaan Kitab',
};

/**
 * Normalisasi nilai fasilitas ke format enum ACF WordPress yang valid.
 * Mencegah error 400 rest_not_in_enum.
 */
export function normalizeFasilitas(rawFasilitas: unknown): string[] {
  if (!rawFasilitas) return [];

  const items: unknown[] = Array.isArray(rawFasilitas) ? rawFasilitas : [rawFasilitas];
  const normalizedSet = new Set<string>();

  for (const item of items) {
    if (typeof item !== 'string') continue;
    const clean = item.trim();
    if (!clean) continue;

    // Jika sudah cocok persis dengan enum ACF WordPress
    if (VALID_ACF_FASILITAS.includes(clean as ValidAcfFasilitas)) {
      normalizedSet.add(clean);
      continue;
    }

    // Bersihkan karakter bullet, dash, titik, asterisk di awal string
    const stripped = clean.replace(/^[•\-\*\.]\s*/, '').trim().toLowerCase();

    // Cek di tabel pemetaan
    if (ACF_FASILITAS_MAP[stripped]) {
      normalizedSet.add(ACF_FASILITAS_MAP[stripped]);
      continue;
    }

    // Cek kecocokan stripped dengan valid enum
    const directMatch = VALID_ACF_FASILITAS.find(
      (v) => v.replace(/^•\s*/, '').trim().toLowerCase() === stripped
    );
    if (directMatch) {
      normalizedSet.add(directMatch);
      continue;
    }

    // Fallback pencocokan kata kunci
    if (stripped.includes('akhwat') || stripped.includes('akhawat')) {
      normalizedSet.add('• Area Khusus Akhawat (Hijab)');
    } else if (stripped.includes('parkir')) {
      normalizedSet.add('• Parkir Mobil & Motor');
    } else if (stripped.includes('wudhu')) {
      normalizedSet.add('• Tempat Wudhu Terpisah');
    } else if (stripped.includes('ac')) {
      normalizedSet.add('• Ruangan Ber-AC');
    } else if (stripped.includes('perpustakaan')) {
      normalizedSet.add('• Perpustakaan Kitab');
    }
  }

  return Array.from(normalizedSet);
}
