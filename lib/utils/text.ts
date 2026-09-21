/**
 * Utilitas manipulasi dan pembersihan teks
 */

/**
 * Mendecode seluruh entitas HTML baik bernama maupun numerik desimal/heksadesimal
 * Menangani karakter ampersand (&), tanda petik tunggal/ganda, kurung siku, dan dash.
 * Contoh: &#038; -> &, &#8217; -> ', &quot; -> ", &#039; -> '
 */
export function decodeHtmlEntities(str?: string): string {
  if (!str) return '';

  return str
    // 1. Entitas bernama umum
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;|&#038;|&#38;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;|&#8220;|&#8221;/g, '"')
    .replace(/&apos;|&#039;|&#39;|&#8216;|&#8217;/g, "'")
    .replace(/&ndash;|&#8211;/g, '–')
    .replace(/&mdash;|&#8212;/g, '—')
    .replace(/&hellip;|&#8230;/g, '…')
    // 2. Generic numeric decimal & hex entity decoder
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(Number(dec));
      } catch {
        return String.fromCharCode(Number(dec));
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return String.fromCharCode(parseInt(hex, 16));
      }
    });
}
