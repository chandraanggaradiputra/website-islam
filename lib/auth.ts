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

  try {
    // 1. Dapatkan JWT Token dari WordPress
    const authRes = await fetch('https://salaf.maschandigital.id/wp-json/jwt-auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      // Bersihkan tag HTML dari pesan error WordPress
      const errorMsg = authData.message 
        ? authData.message.replace(/<[^>]*>?/gm, '') 
        : 'Username atau password salah.';
      return { success: false, error: errorMsg };
    }

    const { token, user_email, user_display_name } = authData;

    // 2. Ambil detail user (Role & ACF) dari endpoint /users/me
    const userRes = await fetch('https://salaf.maschandigital.id/wp-json/wp/v2/users/me?context=edit', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    let role: 'admin' | 'dkm' = 'dkm';
    let masjidId: number | undefined = undefined;
    let masjidName: string | undefined = undefined;

    if (userRes.ok) {
      const userData = await userRes.json();
      
      // Deteksi role
      if (userData.roles && userData.roles.includes('administrator')) {
        role = 'admin';
      } else {
        role = 'dkm';
      }

      // Deteksi masjid_terkait dari ACF jika tersedia (asumsi ACF fields diekspos di REST API)
      if (userData.acf && userData.acf.masjid_terkait) {
        if (typeof userData.acf.masjid_terkait === 'object') {
          masjidId = userData.acf.masjid_terkait.ID || userData.acf.masjid_terkait.id;
          masjidName = userData.acf.masjid_terkait.post_title;
        } else {
          masjidId = Number(userData.acf.masjid_terkait);
        }
      }
    }

    const session: UserSession = {
      username: username,
      name: user_display_name || username,
      email: user_email,
      role: role,
      masjidId: masjidId,
      masjidName: masjidName || (role === 'admin' ? undefined : 'Masjid Anda'),
      token: token // Simpan WP JWT untuk keperluan mutasi API di masa depan
    };

    await createSession(session);
    
    const redirectUrl = role === 'admin' ? '/dashboard/admin' : '/dashboard/dkm';
    return { success: true, redirect: redirectUrl };
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat mencoba login.' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
