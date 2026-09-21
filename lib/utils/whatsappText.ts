/**
 * Utilitas pemformatan teks pesan WhatsApp untuk Jadwal Kajian
 */

/**
 * Mengonversi teks format WhatsApp (*bold*, _italic_, link URL) menjadi markup HTML yang aman
 */
export function formatWhatsAppText(text: string): string {
  if (!text) return '';

  // 1. Normalisasi newline sistem operasi & batasi baris kosong berlebih
  let clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 2. Amankan karakter HTML dasar untuk mencegah XSS
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Format Tebal WhatsApp: *teks* -> <strong>teks</strong>
  // Mendukung kata diapit tanda kutip, emoji, dan aksara Arab
  clean = clean.replace(/(?<!\w)\*([^\s*](?:.*?[^\s*])?)\*(?!\w)/g, '<strong>$1</strong>');

  // 4. Format Miring WhatsApp: _teks_ -> <em>teks</em>
  clean = clean.replace(/(?<!\w)_([^\s_](?:.*?[^\s_])?)_(?!\w)/g, '<em>$1</em>');

  // 5. Format Coret WhatsApp: ~teks~ -> <del>teks</del>
  clean = clean.replace(/(?<!\w)~([^\s~](?:.*?[^\s~])?)~(?!\w)/g, '<del>$1</del>');

  // 6. Format Tautan URL aktif
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  clean = clean.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 break-all font-medium">$1</a>'
  );

  return clean;
}

import { decodeHtmlEntities } from './text';

export { decodeHtmlEntities };

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
    const trimmedLabel = label.trim().replace(/<[^>]+>/g, '');
    if (!trimmedLabel || trimmedLabel === url) return url;
    return `${trimmedLabel}: ${url}`;
  });

  // 4. Kembalikan tag tebal (*teks*), miring (_teks_), dan coret (~teks~) ke format WhatsApp
  text = text.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, '*$1*');
  text = text.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, '_$1_');
  text = text.replace(/<(?:del|s|strike)[^>]*>(.*?)<\/(?:del|s|strike)>/gi, '~$1~');

  // 5. Ganti pemisah baris & blok HTML
  // Catatan: wpautop secara default menyisipkan \n setelah <br /> sehingga <br />\n harus diubah menjadi 1 \n
  text = text.replace(/<\/(?:p|div)>\s*<(?:p|div)[^>]*>/gi, '\n\n');
  text = text.replace(/<br\s*[\/]?>[ \t]*\n?/gi, '\n');
  text = text.replace(/<\/?(?:p|div)[^>]*>/gi, '\n');

  // 6. Bersihkan semua sisa tag HTML lainnya
  text = text.replace(/<[^>]+>/g, '');

  // 7. Decode seluruh entitas HTML baik bernama maupun numerik desimal/heksadesimal (&#038;, &#8217;, dsb)
  text = decodeHtmlEntities(text);

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
  const cleanJudul = decodeHtmlEntities(params.judul);
  const cleanUstadz = params.ustadz ? decodeHtmlEntities(params.ustadz) : undefined;
  const cleanKitab = params.kitab ? decodeHtmlEntities(params.kitab) : undefined;
  const cleanNamaMasjid = params.namaMasjid ? decodeHtmlEntities(params.namaMasjid) : undefined;
  const cleanAlamatMasjid = params.alamatMasjid ? decodeHtmlEntities(params.alamatMasjid) : undefined;

  const lines: string[] = [
    '﷽',
    '',
    '*INFO JADWAL KAJIAN ISLAM ILMIAH*',
    'Propinsi Banten',
    '',
    `📌 *Tema / Judul:* ${cleanJudul}`,
    `🎙️ *Pemateri:* ${cleanUstadz || 'Asatidz'}`,
  ];

  if (cleanKitab && cleanKitab !== '-') {
    lines.push(`📖 *Kitab:* ${cleanKitab}`);
  }

  if (params.waktu) {
    const detailWaktu = params.waktuKeterangan ? ` (${decodeHtmlEntities(params.waktuKeterangan)})` : '';
    lines.push(`🗓️ *Waktu:* ${decodeHtmlEntities(params.waktu)}${detailWaktu}`);
  }

  if (cleanNamaMasjid) {
    lines.push(`🕌 *Tempat:* ${cleanNamaMasjid}`);
  }

  if (cleanAlamatMasjid) {
    lines.push(`📍 *Alamat:* ${cleanAlamatMasjid}`);
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
