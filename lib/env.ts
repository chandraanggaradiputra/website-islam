// lib/env.ts

const KNOWN_INSECURE_FALLBACKS = [
  'super-secret-key-for-development-only-12345',
  'super-secret-key-for-website-islam-2024-change-in-prod',
];

const jwtSecret = process.env.JWT_SECRET?.trim();

if (!jwtSecret || KNOWN_INSECURE_FALLBACKS.includes(jwtSecret)) {
  throw new Error('JWT_SECRET environment variable is required and must not use a default fallback.');
}

export const SECRET_KEY = new TextEncoder().encode(jwtSecret);
