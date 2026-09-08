export async function notifySearchEngines(urlList: string[]) {
  const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'banten-mengaji.vercel.app';
  const key = process.env.INDEXNOW_KEY || 'banten-mengaji-key';

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.warn('[IndexNow] Gagal mengirim sinyal ping:', err);
  }
}
