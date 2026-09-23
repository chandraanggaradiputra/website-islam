/**
 * Helper Otomasi Cross-Posting Artikel Dakwah ke Media Sosial
 * Banten Mengaji (banten-mengaji.vercel.app)
 * Standard: Next.js 16 App Router, TypeScript 7 Strict
 */

import { decodeHtmlEntities } from '@/lib/utils/text';

export interface GenerateSocialCaptionsParams {
  title: string;
  excerpt?: string;
  content?: string;
  url: string;
  imageUrl?: string;
}

export interface SocialCaptions {
  facebook: string;
  instagram: string;
  threads: string;
}

export interface PlatformPublishResult {
  status: 'success' | 'simulated' | 'error';
  id?: string;
  message?: string;
  error?: string;
}

export interface PublishResult {
  dry_run: boolean;
  platforms: {
    facebook: PlatformPublishResult;
    instagram: PlatformPublishResult;
    threads: PlatformPublishResult;
  };
}

/**
 * Membersihkan tag HTML dan karakter entitas dari teks artikel
 */
export function cleanHtmlText(rawText?: string): string {
  if (!rawText) return '';
  const decoded = decodeHtmlEntities(rawText);
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Menghasilkan 3 variasi copywriting dakwah bersyariat via Gemini API
 */
export async function generateSocialCaptions(
  params: GenerateSocialCaptionsParams
): Promise<SocialCaptions> {
  const { title, excerpt, content, url } = params;
  const cleanTitle = cleanHtmlText(title);
  const cleanExcerpt = cleanHtmlText(excerpt);
  const cleanContent = cleanHtmlText(content);
  const snippet = cleanContent ? cleanContent.slice(0, 1500) : cleanExcerpt;

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Defensive fallback jika API key tidak tersedia
  if (!apiKey) {
    return generateFallbackCaptions(cleanTitle, snippet, url);
  }

  const prompt = `
Anda adalah asisten dakwah Islam bermanhaj Salafus Shalih untuk portal dakwah resmi "Banten Mengaji" (banten-mengaji.vercel.app).
Tugas Anda: Buat 3 variasi copywriting dakwah yang beradab syar'i, santun, tidak berlebih-lebihan, berlandaskan dalil shahih, dan sesuai manhaj Salaf berdasarkan materi artikel berikut:

Judul Artikel: "${cleanTitle}"
Ringkasan/Faedah: "${snippet}"
Tautan Baca Lengkap: ${url}

Panduan Spesifik Tiap Platform:
1. Facebook:
   - Tulisan faedah ilmiah yang mendalam dan berbobot.
   - Sertakan kutipan dalil (Al-Qur'an / Hadits shahih / perkataan Sahabat atau Ulama Salaf).
   - Nada bicara santun, mengajak pada kebaikan dan ilmu yang bermanfaat.
   - Wajib menyematkan kalimat ajakan membaca artikel lengkap di website: "Baca selengkapnya di: ${url}".

2. Instagram:
   - Caption visual padat hikmah mutiara Salaf, tidak bertele-tele.
   - Format rapi dengan jeda baris yang nyaman dibaca di layar ponsel.
   - Wajib menyertakan tagar dakwah lokal resmi:
     #BantenMengaji #KajianSunnahBanten #SerangMengaji #CilegonMengaji #FaedahSalaf

3. Threads:
   - Gaya percakapan nasihat ringkas yang mengalir (thread-friendly).
   - Menyentuh hati dan reflektif tanpa kesan menggurui.
   - Ajak audiens untuk merenungi faidah tersebut.

KEMBALIKAN OUTPUT HANYA DALAM FORMAT JSON BERIKUT (tanpa markdown backtick jika memungkinkan):
{
  "facebook": "teks copywriting facebook...",
  "instagram": "teks copywriting instagram...",
  "threads": "teks copywriting threads..."
}
`.trim();

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(
        `[SocialShare] Gemini API error status ${response.status}: ${errText}. Menggunakan fallback caption.`
      );
      return generateFallbackCaptions(cleanTitle, snippet, url);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      return generateFallbackCaptions(cleanTitle, snippet, url);
    }

    const parsed = JSON.parse(rawJson) as Partial<SocialCaptions>;
    return {
      facebook: parsed.facebook || generateFacebookFallback(cleanTitle, snippet, url),
      instagram: parsed.instagram || generateInstagramFallback(cleanTitle, snippet),
      threads: parsed.threads || generateThreadsFallback(cleanTitle, snippet),
    };
  } catch (err: unknown) {
    console.error('[SocialShare] Gagal memanggil Gemini API:', err);
    return generateFallbackCaptions(cleanTitle, snippet, url);
  }
}

/**
 * Fallback Captions Generator jika API eksternal belum siap
 */
function generateFallbackCaptions(
  title: string,
  snippet: string,
  url: string
): SocialCaptions {
  return {
    facebook: generateFacebookFallback(title, snippet, url),
    instagram: generateInstagramFallback(title, snippet),
    threads: generateThreadsFallback(title, snippet),
  };
}

function generateFacebookFallback(
  title: string,
  snippet: string,
  url: string
): string {
  return `Bismillah.\n\n📖 ${title}\n\n${snippet}\n\nFaedah ilmiah ini disarikan untuk menambah wawasan dan ketakwaan kita kepada Allah Ta'ala. Semoga Allah memberikan taufik kepada kita untuk senantiasa menuntut ilmu syar'i di atas pemahaman Salafus Shalih.\n\n🔗 Baca artikel selengkapnya di portal Banten Mengaji:\n${url}`;
}

function generateInstagramFallback(title: string, snippet: string): string {
  return `Bismillah.\n\n✨ ${title}\n\n"${snippet}"\n\nSimak artikel dan faedah kajian sunnah lainnya di banten-mengaji.vercel.app.\n\n#BantenMengaji #KajianSunnahBanten #SerangMengaji #CilegonMengaji #FaedahSalaf`;
}

function generateThreadsFallback(title: string, snippet: string): string {
  return `Renungan ilmu hari ini:\n\n"${title}"\n\n${snippet}\n\nSemoga menjadi pengingat yang bermanfaat bagi hati kita di tengah kesibukan duniawi.`;
}

/**
 * Mendistribusikan postingan ke Meta Graph API & Threads API
 * Mendukung Defensive Mode / Dry-Run jika token belum tersedia.
 */
export async function publishToSocialPlatforms(params: {
  captions: SocialCaptions;
  url: string;
  imageUrl?: string;
}): Promise<PublishResult> {
  const { captions, url, imageUrl } = params;

  const metaPageId = process.env.META_PAGE_ID?.trim();
  const metaAccessToken = process.env.META_ACCESS_TOKEN?.trim();
  const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID?.trim();
  const threadsUserId = process.env.THREADS_USER_ID?.trim();
  const threadsAccessToken = process.env.THREADS_ACCESS_TOKEN?.trim();

  let hasDryRun = false;

  // 1. Eksekusi / Simulasi Facebook
  let fbResult: PlatformPublishResult;
  if (!metaPageId || !metaAccessToken) {
    hasDryRun = true;
    fbResult = {
      status: 'simulated',
      message:
        'META_PAGE_ID atau META_ACCESS_TOKEN belum disetel. Postingan disimulasikan secara aman (Dry-Run).',
    };
  } else {
    try {
      const fbUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
        metaPageId
      )}/feed`;
      const fbRes = await fetch(fbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: captions.facebook,
          link: url,
          access_token: metaAccessToken,
        }),
      });

      const fbData = (await fbRes.json()) as { id?: string; error?: { message?: string } };
      if (!fbRes.ok || fbData.error) {
        fbResult = {
          status: 'error',
          error: fbData.error?.message || `Facebook API error HTTP ${fbRes.status}`,
        };
      } else {
        fbResult = {
          status: 'success',
          id: fbData.id,
        };
      }
    } catch (err: unknown) {
      fbResult = {
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // 2. Eksekusi / Simulasi Instagram
  let igResult: PlatformPublishResult;
  if (!igAccountId || !metaAccessToken) {
    hasDryRun = true;
    igResult = {
      status: 'simulated',
      message:
        'INSTAGRAM_ACCOUNT_ID atau META_ACCESS_TOKEN belum disetel. Postingan disimulasikan secara aman (Dry-Run).',
    };
  } else {
    try {
      const validImage =
        imageUrl || 'https://banten-mengaji.vercel.app/images/og-banten-mengaji.png';
      // Step A: Buat media container
      const containerUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
        igAccountId
      )}/media`;
      const containerRes = await fetch(containerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: validImage,
          caption: captions.instagram,
          access_token: metaAccessToken,
        }),
      });

      const containerData = (await containerRes.json()) as {
        id?: string;
        error?: { message?: string };
      };
      if (!containerRes.ok || !containerData.id) {
        igResult = {
          status: 'error',
          error:
            containerData.error?.message ||
            `Instagram Container error HTTP ${containerRes.status}`,
        };
      } else {
        // Step B: Publish container
        const publishUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          igAccountId
        )}/media_publish`;
        const publishRes = await fetch(publishUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: metaAccessToken,
          }),
        });
        const publishData = (await publishRes.json()) as {
          id?: string;
          error?: { message?: string };
        };
        if (!publishRes.ok || !publishData.id) {
          igResult = {
            status: 'error',
            error:
              publishData.error?.message ||
              `Instagram Publish error HTTP ${publishRes.status}`,
          };
        } else {
          igResult = {
            status: 'success',
            id: publishData.id,
          };
        }
      }
    } catch (err: unknown) {
      igResult = {
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // 3. Eksekusi / Simulasi Threads
  let threadsResult: PlatformPublishResult;
  if (!threadsUserId || !threadsAccessToken) {
    hasDryRun = true;
    threadsResult = {
      status: 'simulated',
      message:
        'THREADS_USER_ID atau THREADS_ACCESS_TOKEN belum disetel. Postingan disimulasikan secara aman (Dry-Run).',
    };
  } else {
    try {
      // Step A: Buat thread container
      const threadContainerUrl = `https://graph.threads.net/v1.0/${encodeURIComponent(
        threadsUserId
      )}/threads`;
      const threadPayload: Record<string, string> = {
        media_type: imageUrl ? 'IMAGE' : 'TEXT',
        text: captions.threads,
        access_token: threadsAccessToken,
      };
      if (imageUrl) {
        threadPayload.image_url = imageUrl;
      }

      const threadRes = await fetch(threadContainerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threadPayload),
      });

      const threadData = (await threadRes.json()) as {
        id?: string;
        error?: { message?: string };
      };
      if (!threadRes.ok || !threadData.id) {
        threadsResult = {
          status: 'error',
          error:
            threadData.error?.message ||
            `Threads Container error HTTP ${threadRes.status}`,
        };
      } else {
        // Step B: Publish thread container
        const threadPubUrl = `https://graph.threads.net/v1.0/${encodeURIComponent(
          threadsUserId
        )}/threads_publish`;
        const threadPubRes = await fetch(threadPubUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: threadData.id,
            access_token: threadsAccessToken,
          }),
        });

        const threadPubData = (await threadPubRes.json()) as {
          id?: string;
          error?: { message?: string };
        };
        if (!threadPubRes.ok || !threadPubData.id) {
          threadsResult = {
            status: 'error',
            error:
              threadPubData.error?.message ||
              `Threads Publish error HTTP ${threadPubRes.status}`,
          };
        } else {
          threadsResult = {
            status: 'success',
            id: threadPubData.id,
          };
        }
      }
    } catch (err: unknown) {
      threadsResult = {
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return {
    dry_run: hasDryRun,
    platforms: {
      facebook: fbResult,
      instagram: igResult,
      threads: threadsResult,
    },
  };
}
