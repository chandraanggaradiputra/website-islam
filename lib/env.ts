// lib/env.ts
/**
 * Sentralisasi Validasi Environment Variables & Penegakan Keamanan
 * Sesuai Standar Keamanan Proyek (Prinsip 1: Zero Default Secret & Prinsip 7)
 */

const KNOWN_INSECURE_JWT_FALLBACKS = [
  'super-secret-key-for-development-only-12345',
  'super-secret-key-for-banten-mengaji-2024-change-in-prod',
];

const jwtSecret = process.env.JWT_SECRET?.trim();

if (!jwtSecret || KNOWN_INSECURE_JWT_FALLBACKS.includes(jwtSecret)) {
  throw new Error(
    '[FATAL SECURITY ERROR] JWT_SECRET environment variable is required and must not use a default fallback. Generate with: openssl rand -base64 32'
  );
}

export const SECRET_KEY = new TextEncoder().encode(jwtSecret);

/**
 * Validasi dan ambil VAPID Keys untuk Web Push Notification
 */
export function getVapidKeys(): {
  publicKey: string;
  privateKey: string;
  subject: string;
} {
  const publicKey = (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY
  )?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || 'mailto:admin@maschandigital.id';

  if (!publicKey || !privateKey) {
    throw new Error(
      '[FATAL SECURITY ERROR] VAPID_PUBLIC_KEY dan VAPID_PRIVATE_KEY wajib diset di environment variables. Nilai default hardcoded dilarang.'
    );
  }

  return { publicKey, privateKey, subject };
}

/**
 * Validasi dan ambil API Token Mailketing
 */
export function getMailketingApiToken(): string {
  const token = process.env.MAILKETING_API_TOKEN?.trim();
  if (!token) {
    throw new Error(
      '[FATAL SECURITY ERROR] MAILKETING_API_TOKEN wajib diset di environment variables. Nilai default hardcoded dilarang.'
    );
  }
  return token;
}

/**
 * Validasi dan ambil Webhook Secret untuk Cross-Posting Media Sosial
 */
export function getWebhookSecret(): string {
  const secret = process.env.WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error(
      '[FATAL SECURITY ERROR] WEBHOOK_SECRET wajib diset di environment variables. Nilai default hardcoded dilarang.'
    );
  }
  return secret;
}

/**
 * Validasi dan ambil Agent Secret Key untuk Remote MCP Server & OAuth
 */
export function getAgentSecretKey(): string {
  const secret = process.env.AGENT_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error(
      '[FATAL SECURITY ERROR] AGENT_SECRET_KEY wajib diset di environment variables. Nilai default hardcoded dilarang.'
    );
  }
  return secret;
}
