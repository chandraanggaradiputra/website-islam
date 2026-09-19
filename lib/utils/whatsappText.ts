/**
 * Utilitas pemformatan teks pesan WhatsApp untuk Jadwal Kajian
 */

/**
 * Mengonversi teks format WhatsApp (*bold*, _italic_, link URL) menjadi markup HTML yang aman
 */
export function formatWhatsAppText(text: string): string {
  if (!text) return '';

  // 1. Amankan karakter HTML dasar untuk mencegah XSS
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Ubah *teks* menjadi <strong>teks</strong> (format tebal WhatsApp)
  formatted = formatted.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');

  // 3. Ubah _teks_ menjadi <em>teks</em> (format miring WhatsApp)
  formatted = formatted.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // 4. Ubah URL aktif (http/https) menjadi tautan yang bisa diklik
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  formatted = formatted.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 break-all">$1</a>'
  );

  return formatted;
}

/**
 * Mengonversi konten HTML (misal dari post_content WordPress atau wpautop)
 * kembali menjadi teks bersih berformat WhatsApp untuk disalin ke clipboard.
 */
export function stripHtmlToWhatsAppText(html: string): string {
  if (!html) return '';

  let text = html;

  // 1. Ganti pemisah baris HTML
  text = text.replace(/<br\s*[\/]?>/gi, '\n');
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  text = text.replace(/<\/?p[^>]*>/gi, '\n');
  text = text.replace(/<\/?div[^>]*>/gi, '\n');

  // 2. Kembalikan tag tebal ke sintaks WhatsApp (*teks*)
  text = text.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, '*$1*');

  // 3. Kembalikan tag miring ke sintaks WhatsApp (_teks_)
  text = text.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, '_$1_');

  // 4. Konversi tautan <a href="url">label</a>
  text = text.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, url, label) => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel || trimmedLabel === url) return url;
    return `${trimmedLabel}: ${url}`;
  });

  // 5. Bersihkan semua sisa tag HTML lainnya
  text = text.replace(/<[^>]+>/g, '');

  // 6. Decode entitas HTML umum
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': "'",
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
  };

  text = text.replace(/&(?:amp|lt|gt|quot|#039|apos|nbsp|#8211|#8212|#8216|#8217|#8220|#8221);/g, (match) => {
    return entities[match] || match;
  });

  // 7. Bersihkan baris kosong berlebih
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

/**
 * Generator draf teks siaran WhatsApp standar untuk kajian
 * Digunakan sebagai fallback jika kajian lama belum memiliki teks broadcast tersimpan.
 */
export function generateDefaultKajianBroadcast(params: {
  judul: string;
  ustadz?: string;
  kitab?: string;
  waktu?: string;
  waktuKeterangan?: string;
  namaMasjid?: string;
  alamatMasjid?: string;
  linkStreaming?: string;
  slug?: string;
}): string {
  const lines: string[] = [
    '﷽',
    '',
    '*INFO JADWAL KAJIAN ISLAM ILMIAH*',
    'Propinsi Banten',
    '',
    `📌 *Tema / Judul:* ${params.judul}`,
    `🎙️ *Pemateri:* ${params.ustadz || 'Asatidz'}`,
  ];

  if (params.kitab && params.kitab !== '-') {
    lines.push(`📖 *Kitab:* ${params.kitab}`);
  }

  if (params.waktu) {
    const detailWaktu = params.waktuKeterangan ? ` (${params.waktuKeterangan})` : '';
    lines.push(`🗓️ *Waktu:* ${params.waktu}${detailWaktu}`);
  }

  if (params.namaMasjid) {
    lines.push(`🕌 *Tempat:* ${params.namaMasjid}`);
  }

  if (params.alamatMasjid) {
    lines.push(`📍 *Alamat:* ${params.alamatMasjid}`);
  }

  if (params.linkStreaming) {
    lines.push(`🎥 *Live Streaming:* ${params.linkStreaming}`);
  }

  lines.push('');
  lines.push('Mari raih pahala dengan menyebarkan informasi kebaikan ini.');
  lines.push('Barakallahu fiikum.');

  if (params.slug) {
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://banten-mengaji.vercel.app';
    lines.push('');
    lines.push(`🔗 *Detail Lengkap & Simpan Jadwal:*`);
    lines.push(`${host.replace(/\/$/, '')}/jadwal-kajian/${params.slug}`);
  }

  return lines.join('\n');
}
