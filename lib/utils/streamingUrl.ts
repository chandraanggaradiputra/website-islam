/**
 * Utilitas parser dan pendeteksi URL streaming siaran kajian multi-platform
 * Mendukung YouTube (video/live/shorts/embed), Facebook Live / Video, dan tautan platform lain.
 */

export type StreamingPlatform = 'youtube' | 'facebook' | 'other' | null;

export interface StreamingInfo {
  platform: StreamingPlatform;
  embedUrl: string | null;
  originalUrl: string;
  videoId?: string;
}

/**
 * Mem-parse URL streaming siaran kajian dan menghasilkan metadata embed yang sesuai.
 *
 * @param url URL yang dimasukkan pengurus DKM atau Super Admin
 * @returns Metadata StreamingInfo atau null jika URL tidak valid / kosong
 */
export function parseStreamingUrl(url: string | undefined | null): StreamingInfo | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const cleanUrl = url.trim();

  // 1. Deteksi YouTube (youtube.com, youtu.be, shorts, live, embed)
  const ytMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/|shorts\/))([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      originalUrl: cleanUrl,
    };
  }

  // 2. Deteksi Facebook Video / Live (facebook.com/.../videos/, fb.watch/, facebook.com/live)
  if (/facebook\.com|fb\.watch/i.test(cleanUrl)) {
    const fbEmbedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&autoplay=false&width=auto`;
    return {
      platform: 'facebook',
      embedUrl: fbEmbedUrl,
      originalUrl: cleanUrl,
    };
  }

  // 3. Platform lain (Zoom, Instagram, dsb.)
  return {
    platform: 'other',
    embedUrl: null,
    originalUrl: cleanUrl,
  };
}
