import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SECRET_KEY } from '@/lib/env';

// Batas maksimum payload request API (10MB) untuk mitigasi eksploitasi Memory OOM
const MAX_API_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 Megabytes

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Global Gateway Guard: Batasi ukuran payload untuk seluruh rute /api/:path*
  if (pathname.startsWith('/api/')) {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_API_PAYLOAD_BYTES) {
      return NextResponse.json(
        {
          error: 'Payload Too Large',
          message: 'Ukuran payload melebihi batas maksimum 10MB.',
        },
        { status: 413 }
      );
    }
  }

  // 2. Proteksi Akses & Role Dashboard
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
      
      // Role-based routing protection
      if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/dkm', request.url));
      }
      
      if (pathname.startsWith('/dashboard/dkm') && payload.role !== 'dkm' && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
      
      return NextResponse.next();
    } catch {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
