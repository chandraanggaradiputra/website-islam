import { NextResponse } from 'next/server';
import {
  generateSocialCaptions,
  publishToSocialPlatforms,
  cleanHtmlText,
} from '@/lib/socialShare';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      status: 'online',
      service: 'Banten Mengaji Social Share Webhook',
      description:
        'Menerima sinyal webhook saat artikel dakwah atau faedah baru diterbitkan di WordPress salaf.maschandigital.id untuk cross-posting otomatis ke media sosial.',
      usage:
        'Kirimkan HTTP POST dengan header "x-webhook-secret" atau query param "?secret=".',
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}

interface WebhookArticlePayload {
  id?: number | string;
  title?: string | { rendered?: string };
  slug?: string;
  content?: string | { rendered?: string };
  excerpt?: string | { rendered?: string };
  featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
  };
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const secretFromQuery = url.searchParams.get('secret');
  const secretFromHeader = request.headers.get('x-webhook-secret');
  const providedSecret = secretFromHeader || secretFromQuery;

  const expectedSecret =
    process.env.WEBHOOK_SECRET || 'banten_mengaji_secret_2026';

  // 1. Validasi Otorisasi Webhook (Zero Silent Fallback)
  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Unauthorized: Webhook secret tidak valid atau tidak disertakan.',
      },
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }

  // 2. Ekstraksi Payload Artikel WordPress
  let payload: WebhookArticlePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid Request: Payload body bukan JSON yang valid.',
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const rawTitle =
    typeof payload.title === 'object'
      ? payload.title?.rendered
      : payload.title;

  const rawContent =
    typeof payload.content === 'object'
      ? payload.content?.rendered
      : payload.content;

  const rawExcerpt =
    typeof payload.excerpt === 'object'
      ? payload.excerpt?.rendered
      : payload.excerpt;

  const title = cleanHtmlText(rawTitle || '');
  if (!title) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unprocessable Entity: Judul artikel tidak ditemukan dalam payload.',
      },
      {
        status: 422,
        headers: corsHeaders,
      }
    );
  }

  const articleId = payload.id || Date.now();
  const slug =
    payload.slug ||
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://banten-mengaji.vercel.app';
  const articleUrl = `${siteBaseUrl}/artikel/${slug}`;

  // Gambar unggulan (featured media)
  const imageUrl =
    payload.featured_media_url ||
    payload._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  // 3. Jalankan Generator Copywriting Dakwah via Gemini API
  const captions = await generateSocialCaptions({
    title,
    excerpt: rawExcerpt,
    content: rawContent,
    url: articleUrl,
    imageUrl,
  });

  // 4. Publikasikan ke Platform Sosial Media (Meta Graph & Threads API)
  const publishResult = await publishToSocialPlatforms({
    captions,
    url: articleUrl,
    imageUrl,
  });

  // 5. Kembalikan Respons Sukses
  return NextResponse.json(
    {
      success: true,
      article_id: articleId,
      article_url: articleUrl,
      captions,
      status: publishResult.dry_run ? 'dry_run' : 'published',
      details: publishResult,
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}
