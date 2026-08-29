'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { UserSession } from '@/types';
import { redirect } from 'next/navigation';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-development-only-12345');

export async function createSession(sessionData: UserSession) {
  const token = await new SignJWT({ ...sessionData })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Session lasts for 1 day
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  });
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
    return payload as unknown as UserSession;
  } catch (error) {
    return null; // Invalid or expired token
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Mock Authentication Fallback
  if (username === 'admin' && password === 'admin123') {
    const session: UserSession = {
      username: 'admin',
      name: 'Super Admin',
      email: 'admin@websiteislam.com',
      role: 'admin',
    };
    await createSession(session);
    return { success: true, redirect: '/dashboard/admin' };
  }

  if (username === 'dkm_wildan' && password === 'dkm123') {
    const session: UserSession = {
      username: 'dkm_wildan',
      name: 'Pengurus Masjid Wildan',
      email: 'dkm@wildan.com',
      role: 'dkm',
      masjidId: 30,
      masjidName: 'Masjid At Taqwa Wildan'
    };
    await createSession(session);
    return { success: true, redirect: '/dashboard/dkm' };
  }

  return { success: false, error: 'Username atau password salah.' };
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
