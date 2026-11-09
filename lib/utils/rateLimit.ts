// lib/utils/rateLimit.ts
/**
 * In-Memory Sliding Window Rate Limiter untuk Endpoint Otentikasi & Login
 * Sesuai Standar Keamanan Proyek (Prinsip 5: Rate Limit di Semua Endpoint Auth)
 */

interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 menit
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 menit

/**
 * Membersihkan data kedaluwarsa secara berkala
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (now > record.lockoutUntil && now - record.lastAttempt > WINDOW_DURATION_MS) {
      loginAttempts.delete(key);
    }
  }
}

/**
 * Cek status rate limit untuk login identifier (username/email)
 */
export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockoutSeconds: number;
} {
  cleanupExpiredRecords();
  const normalizedKey = identifier.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttempts.get(normalizedKey);

  if (!record) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      lockoutSeconds: 0,
    };
  }

  // Jika sedang dalam masa lockout
  if (record.lockoutUntil > now) {
    const lockoutSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutSeconds,
    };
  }

  // Jika window sudah lewat dari percobaan terakhir, reset
  if (now - record.lastAttempt > WINDOW_DURATION_MS) {
    loginAttempts.delete(normalizedKey);
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      lockoutSeconds: 0,
    };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
    lockoutSeconds: 0,
  };
}

/**
 * Catat kegagalan login dan berlakukan lockout jika mencapai MAX_ATTEMPTS
 */
export function recordFailedLogin(identifier: string): {
  isLocked: boolean;
  lockoutMinutes: number;
} {
  const normalizedKey = identifier.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttempts.get(normalizedKey) || {
    attempts: 0,
    lockoutUntil: 0,
    lastAttempt: now,
  };

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(normalizedKey, record);
    return { isLocked: true, lockoutMinutes: Math.round(LOCKOUT_DURATION_MS / 60000) };
  }

  loginAttempts.set(normalizedKey, record);
  return { isLocked: false, lockoutMinutes: 0 };
}

/**
 * Reset counter jika login berhasil
 */
export function resetLoginRateLimit(identifier: string) {
  const normalizedKey = identifier.toLowerCase().trim();
  loginAttempts.delete(normalizedKey);
}
