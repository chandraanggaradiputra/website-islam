/**
 * Tipe data untuk Web Push Notification
 */

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
  createdAt: string;
  userAgent?: string;
}

export interface PushSubscriberStats {
  totalSubscribers: number;
  activeSubscribers: number;
}

export interface BroadcastNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export interface BroadcastResult {
  success: boolean;
  totalSubscribers: number;
  sentCount: number;
  failedCount: number;
  prunedCount: number;
  activeSubscribers?: number;
  message?: string;
  error?: string;
}
