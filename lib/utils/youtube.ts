/**
 * Helper utilitas parser dan converter URL YouTube
 * Digunakan untuk menyematkan rekaman kajian sunnah secara aman & responsif.
 */

/**
 * Mengekstrak 11-karakter YouTube Video ID dari berbagai format URL:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 *
 * @param url String URL yang dimasukkan pengurus DKM atau jamaah
 * @returns Video ID (string 11 karakter) atau null jika format tidak valid
 */
export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const regExp = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  return match ? match[1] : null;
}

/**
 * Mengonversi URL YouTube menjadi URL Embed privacy-enhanced (youtube-nocookie.com)
 *
 * @param url String URL YouTube asli
 * @returns URL Embed iframe (misal: https://www.youtube-nocookie.com/embed/{id}) atau null jika tidak valid
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
