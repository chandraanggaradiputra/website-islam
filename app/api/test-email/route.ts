import { NextResponse } from 'next/server';
import { sendMailketingEmail } from '@/lib/mailketing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const recipients = ['admin@maschandigital.id', 'anggarasixteen@gmail.com'];
  const results: Record<string, unknown>[] = [];

  for (const recipient of recipients) {
    const res = await sendMailketingEmail({
      recipient,
      subject: 'Uji Coba Sistem Email Banten Mengaji via Mailketing API v1',
      content: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #093c96;">Tes Notifikasi Mailketing Berhasil!</h2>
          <p>Ini adalah email uji coba langsung dari platform <strong>Banten Mengaji</strong>.</p>
          <p>Waktu pengiriman: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p>
        </div>
      `,
    });
    results.push({ recipient, success: res });
  }

  return NextResponse.json({
    message: 'Pengujian pengiriman email selesai diproses',
    results,
  });
}
