/**
 * Test Suite: [TASK-BM-008] Validasi Bidirectional Text Alignment (LTR/RTL) & Left Alignment pada Pesan Kajian
 */

import { formatWhatsAppText, stripHtmlToWhatsAppText } from '../lib/utils/whatsappText';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

console.log('--- Memulai Pengujian TASK-BM-008 Bidirectional Text & LTR/RTL Alignment ---');

const sampleMessage = `﷽

*INFO JADWAL KAJIAN ISLAM ILMIAH*
Propinsi Banten

📌 *Tema / Judul:* "Kajian Fiqih M.H" 99 Masalah Sholat
🎙️ *Pemateri:* Ustadz Dr. Fulan, Lc., M.A. حفظه الله تعالى
📖 *Kitab:* Al-Umm
🗓️ *Waktu:* Sabtu, 26 September 2026 / 14 Rabiul Awwal 1448 H
⏰ *Pukul:* 09.00 - 11.00 WIB
🕌 *Tempat:* Masjid Agung Al-Amjad (Lantai 2)
📍 *Alamat:* Jl. KH. Syekh Nawawi No. 99, Tigaraksa
🎥 *Live Streaming:* https://youtube.com/live/banten-kajian

Mari raih pahala dengan menyebarkan informasi kebaikan ini.
Barakallahu fiikum.`;

const htmlOutput = formatWhatsAppText(sampleMessage);

// Test 1: Basmalah terisolasi dalam blok RTL dan rata tengah font-arabic
assert(
  htmlOutput.includes('dir="rtl"') &&
  htmlOutput.includes('text-center font-arabic') &&
  htmlOutput.includes('﷽'),
  'Test 1: Baris Basmalah terdeteksi aksara Arab murni dan dibungkus dir="rtl" text-center font-arabic'
);

// Test 2: Baris Latin dengan tanda kutip "M.H" dan angka 99 berada dalam kontainer dir="ltr" text-left
assert(
  htmlOutput.includes('dir="ltr" class="text-left') &&
  htmlOutput.includes('&quot;Kajian Fiqih M.H&quot; 99 Masalah Sholat') ||
  htmlOutput.includes('"Kajian Fiqih M.H" 99 Masalah Sholat'),
  'Test 2: Baris Latin judul dengan tanda kutip "M.H" dan angka 99 berada dalam blok dir="ltr" text-left'
);

// Test 3: Frasa doa Arab di dalam baris Latin diisolasi dengan <bdi class="font-arabic">
assert(
  htmlOutput.includes('<bdi class="font-arabic">حفظه الله تعالى</bdi>'),
  'Test 3: Frasa Arab sisipan (doa hafizhahullah) diisolasi dengan <bdi class="font-arabic">'
);

// Test 4: Emoji kalender, jam, dan pin tetap berada di awal baris Latin
assert(
  htmlOutput.includes('📌 <strong>Tema / Judul:</strong>') &&
  htmlOutput.includes('🎙️ <strong>Pemateri:</strong>') &&
  htmlOutput.includes('🗓️ <strong>Waktu:</strong>') &&
  htmlOutput.includes('⏰ <strong>Pukul:</strong>'),
  'Test 4: Emoji penanda waktu, tema, dan pemateri tetap berada di sisi kiri mendahului teks'
);

// Test 5: Format tautan URL aktif dengan atribut keamanan yang benar
assert(
  htmlOutput.includes('<a href="https://youtube.com/live/banten-kajian" target="_blank" rel="noopener noreferrer"') &&
  htmlOutput.includes('class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 break-all font-medium"'),
  'Test 5: Tautan live streaming otomatis dikonversi menjadi link aktif yang aman'
);

// Test 6: Round-trip lossless ke format teks asli WhatsApp via stripHtmlToWhatsAppText
const reconvertedText = stripHtmlToWhatsAppText(htmlOutput);
assert(
  sampleMessage.trim() === reconvertedText.trim(),
  'Test 6: Konversi bolak-balik (round-trip) HTML ke teks WhatsApp 100% cocok tanpa kehilangan karakter'
);

// Test 7: Uji teks kosong atau undefined ditangani dengan aman
assert(formatWhatsAppText('') === '', 'Test 7: Teks kosong mengembalikan string kosong tanpa error');

// Test 8: Uji teks Arab hadits / ayat multibaris
const arabicHadits = `قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ:
مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ`;
const arabicHtml = formatWhatsAppText(arabicHadits);
assert(
  arabicHtml.includes('dir="rtl"') && arabicHtml.includes('font-arabic'),
  'Test 8: Hadits aksara Arab multibaris terformat dir="rtl" secara utuh'
);

console.log('\nSeluruh 8 pengujian unit TASK-BM-008 berhasil 100%!');
