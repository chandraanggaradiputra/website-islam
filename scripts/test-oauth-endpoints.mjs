// Test suite for TASK-BM-006: OAuth 2.0 & Dynamic Client Registration for Gemini MCP
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Memulai Test Endpoint OAuth 2.0 & Dynamic Registration ---');
  let passCount = 0;
  let totalTests = 0;

  async function testCase(name, runner) {
    totalTests++;
    try {
      const ok = await runner();
      if (ok) {
        passCount++;
        console.log(`[PASS] Test ${totalTests}: ${name}`);
      } else {
        console.error(`[FAIL] Test ${totalTests}: ${name}`);
      }
    } catch (err) {
      console.error(`[ERROR] Test ${totalTests}: ${name} ->`, err.message);
    }
  }

  // 1. Discovery Server Metadata
  await testCase('GET /.well-known/oauth-authorization-server (RFC 8414)', async () => {
    const res = await fetch(`${BASE_URL}/.well-known/oauth-authorization-server`);
    if (res.status !== 200) return false;
    const data = await res.json();
    return (
      data.issuer === 'https://banten-mengaji.vercel.app' &&
      data.authorization_endpoint.includes('/api/oauth/authorize') &&
      data.token_endpoint.includes('/api/oauth/token') &&
      data.registration_endpoint.includes('/api/oauth/register') &&
      Array.isArray(data.scopes_supported)
    );
  });

  // 2. Discovery Protected Resource Metadata
  await testCase('GET /.well-known/oauth-protected-resource (RFC 9728)', async () => {
    const res = await fetch(`${BASE_URL}/.well-known/oauth-protected-resource`);
    if (res.status !== 200) return false;
    const data = await res.json();
    return (
      data.resource.includes('/api/mcp') &&
      Array.isArray(data.authorization_servers) &&
      data.authorization_servers.length > 0
    );
  });

  // 3. Dynamic Client Registration (RFC 7591)
  await testCase('POST /api/oauth/register (RFC 7591 Dynamic Registration)', async () => {
    const res = await fetch(`${BASE_URL}/api/oauth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Google Gemini Spark Test',
        redirect_uris: ['https://gemini.google.com/spark/apps'],
      }),
    });
    if (res.status !== 201) return false;
    const data = await res.json();
    return (
      typeof data.client_id === 'string' &&
      data.client_id.startsWith('gemini-spark-') &&
      typeof data.client_secret === 'string' &&
      Array.isArray(data.redirect_uris)
    );
  });

  // 4. Authorize Endpoint Auto-Redirect
  await testCase('GET /api/oauth/authorize (Auto-Redirect 302 with code & state)', async () => {
    const targetRedirect = 'https://gemini.google.com/spark/apps';
    const stateParam = 'xyz987state';
    const res = await fetch(
      `${BASE_URL}/api/oauth/authorize?redirect_uri=${encodeURIComponent(targetRedirect)}&state=${stateParam}`,
      { redirect: 'manual' }
    );
    if (res.status !== 302) return false;
    const location = res.headers.get('location') || '';
    const locUrl = new URL(location);
    return (
      locUrl.origin + locUrl.pathname === targetRedirect &&
      locUrl.searchParams.get('code')?.startsWith('bm_auth_') &&
      locUrl.searchParams.get('state') === stateParam
    );
  });

  // 5. Authorize Endpoint Validation: Missing redirect_uri
  await testCase('GET /api/oauth/authorize (Missing redirect_uri -> 400)', async () => {
    const res = await fetch(`${BASE_URL}/api/oauth/authorize`);
    return res.status === 400;
  });

  // 6. Token Exchange
  await testCase('POST /api/oauth/token (Token Exchange -> Bearer Token)', async () => {
    const res = await fetch(`${BASE_URL}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: 'bm_auth_sample_code',
      }),
    });
    if (res.status !== 200) return false;
    const data = await res.json();
    return (
      typeof data.access_token === 'string' &&
      data.token_type === 'Bearer' &&
      data.expires_in === 315360000 &&
      typeof data.refresh_token === 'string'
    );
  });

  // 7. CORS Preflight OPTIONS
  await testCase('OPTIONS preflight on OAuth endpoints', async () => {
    const endpoints = [
      '/.well-known/oauth-authorization-server',
      '/.well-known/oauth-protected-resource',
      '/api/oauth/register',
      '/api/oauth/authorize',
      '/api/oauth/token',
    ];
    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`, { method: 'OPTIONS' });
      if (res.status !== 204) return false;
      if (res.headers.get('access-control-allow-origin') !== '*') return false;
    }
    return true;
  });

  console.log(`\nHasil: ${passCount} dari ${totalTests} pengujian berhasil (${Math.round((passCount / totalTests) * 100)}%).`);
  if (passCount !== totalTests) {
    process.exit(1);
  }
}

runTests();
