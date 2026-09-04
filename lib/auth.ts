'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { UserSession } from '@/types';
import { redirect } from 'next/navigation';
import { SECRET_KEY } from '@/lib/env';

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
  } catch {
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

      // Ambil masjid yang author-nya adalah user DKM yang sedang login
      if (role === 'dkm') {
        const resMasjid = await fetch(`https://salaf.maschandigital.id/wp-json/wp/v2/masjid?author=${userData.id}&_embed`);
        const userMasjidList = resMasjid.ok ? await resMasjid.json() : [];

        if (userMasjidList.length > 0) {
          masjidId = userMasjidList[0].id;
          masjidName = userMasjidList[0].title?.rendered;
        } else {
          masjidId = undefined;
          masjidName = undefined;
        }
      }
    }

    const session: UserSession = {
      username: username,
      name: user_display_name || username,
      email: user_email,
      role: role,
      masjidId: masjidId,
      masjidName: masjidName,
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
