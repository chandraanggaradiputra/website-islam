/**
 * Utilitas pemformatan teks pesan WhatsApp untuk Jadwal Kajian
 */

/**
 * Mengonversi teks format WhatsApp (*bold*, _italic_, link URL) menjadi markup HTML yang aman
 */
export function formatWhatsAppText(text: string): string {
  if (!text) return '';

  // 1. Normalisasi newline sistem operasi & batasi baris kosong berlebih
  let formatted = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 2. Amankan karakter HTML dasar untuk mencegah XSS
  formatted = formatted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Ubah *teks* menjadi <strong>teks</strong> (format tebal WhatsApp)
  formatted = formatted.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');

  // 4. Ubah _teks_ menjadi <em>teks</em> (format miring WhatsApp)
  formatted = formatted.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // 5. Ubah URL aktif (http/https) menjadi tautan yang bisa diklik
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  formatted = formatted.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 break-all">$1</a>'
  );

  return formatted;
}

/**
 * Mengonversi konten HTML (misal dari post_content WordPress atau wpautop)
 * kembali menjadi teks bersih berformat WhatsApp untuk disalin ke clipboard
 * dan ditampilkan di antarmuka web.
 */
export function stripHtmlToWhatsAppText(html: string): string {
  if (!html) return '';

  let text = html;

  // 1. Normalisasi newline sistem operasi (\r\n -> \n, \r -> \n)
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Bersihkan wrapper paragraf kosong khas wpautop (<p>&nbsp;</p>, <p></p>, <p><br></p>)
  text = text.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*[\/]?>|\s)*<\/p>/gi, '');

  // 3. Konversi tautan <a href="url">label</a> sebelum tag HTML dibersihkan
  text = text.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, url, label) => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel || trimmedLabel === url) return url;
    return `${trimmedLabel}: ${url}`;
  });

  // 4. Kembalikan tag tebal (*teks*) dan miring (_teks_) ke format WhatsApp
  text = text.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, '*$1*');
  text = text.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, '_$1_');

  // 5. Ganti pemisah baris & blok HTML
  // Catatan: wpautop secara default menyisipkan \n setelah <br /> sehingga <br />\n harus diubah menjadi 1 \n
  text = text.replace(/<\/(?:p|div)>\s*<(?:p|div)[^>]*>/gi, '\n\n');
  text = text.replace(/<br\s*[\/]?>[ \t]*\n?/gi, '\n');
  text = text.replace(/<\/?(?:p|div)[^>]*>/gi, '\n');

  // 6. Bersihkan semua sisa tag HTML lainnya
  text = text.replace(/<[^>]+>/g, '');

  // 7. Decode entitas HTML umum
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

  // 8. Hapus spasi pada baris yang hanya berisi whitespace
  text = text.replace(/^[ \t]+$/gm, '');

  // 9. Bersihkan baris kosong berlebih (maksimal 2 newline berturut-turut = 1 baris kosong antar-paragraf)
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
