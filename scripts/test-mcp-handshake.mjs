// Test suite for TASK-BM-004: MCP Gemini Handshake & Tools Access Control
const BASE_URL = 'http://localhost:3000/api/mcp';
const AGENT_SECRET = process.env.AGENT_SECRET_KEY || 'bm_agent_sec_2026_banten';

async function runTests() {
  console.log('--- Memulai Test Handshake & Access Control MCP ---');
  let passCount = 0;
  let totalTests = 0;

  async function testCase(name, payload, headers = {}, expectedStatus, expectedChecker) {
    totalTests++;
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      const statusMatch = res.status === expectedStatus;
      const data = await res.json().catch(() => ({}));
      const checkPassed = expectedChecker(res, data);

      if (statusMatch && checkPassed) {
        passCount++;
        console.log(`[PASS] Test ${totalTests}: ${name} (Status: ${res.status})`);
      } else {
        console.error(`[FAIL] Test ${totalTests}: ${name}`);
        console.error(`  Expected Status: ${expectedStatus}, Actual: ${res.status}`);
        console.error(`  Response Body:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error(`[ERROR] Test ${totalTests}: ${name} ->`, err.message);
    }
  }

  // 1. Handshake initialize tanpa auth
  await testCase(
    'Handshake initialize tanpa otorisasi',
    { jsonrpc: '2.0', method: 'initialize', id: 1, params: { protocolVersion: '2024-11-05' } },
    {},
    200,
    (res, data) => data.result?.serverInfo?.name === 'banten-mengaji-mcp' && data.result?.protocolVersion === '2024-11-05'
  );

  // 2. notifications/initialized tanpa auth
  await testCase(
    'notifications/initialized tanpa otorisasi',
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    {},
    200,
    (res, data) => data.jsonrpc === '2.0'
  );

  // 3. ping tanpa auth
  await testCase(
    'ping tanpa otorisasi',
    { jsonrpc: '2.0', method: 'ping', id: 2 },
    {},
    200,
    (res, data) => data.result !== undefined
  );

  // 4. tools/list tanpa auth
  await testCase(
    'tools/list tanpa otorisasi',
    { jsonrpc: '2.0', method: 'tools/list', id: 3 },
    {},
    200,
    (res, data) => Array.isArray(data.result?.tools) && data.result.tools.length >= 6
  );

  // 5. Tool dakwah publik get_upcoming_kajian tanpa auth
  await testCase(
    'Tool dakwah get_upcoming_kajian tanpa otorisasi',
    { jsonrpc: '2.0', method: 'tools/call', id: 4, params: { name: 'get_upcoming_kajian', arguments: { limit: 2 } } },
    {},
    200,
    (res, data) => Array.isArray(data.result?.content)
  );

  // 6. Tool dakwah publik get_masjid_directory tanpa auth
  await testCase(
    'Tool dakwah get_masjid_directory tanpa otorisasi',
    { jsonrpc: '2.0', method: 'tools/call', id: 5, params: { name: 'get_masjid_directory', arguments: { limit: 2 } } },
    {},
    200,
    (res, data) => Array.isArray(data.result?.content)
  );

  // 7. Tool sensitif read_repo_file tanpa auth (harus ditolak 401 & code -32000)
  await testCase(
    'Tool sensitif read_repo_file tanpa otorisasi (wajib ditolak 401)',
    { jsonrpc: '2.0', method: 'tools/call', id: 6, params: { name: 'read_repo_file', arguments: { path: 'package.json' } } },
    {},
    401,
    (res, data) => data.error?.code === -32000
  );

  // 8. Tool sensitif dispatch_agent_task tanpa auth (harus ditolak 401 & code -32000)
  await testCase(
    'Tool sensitif dispatch_agent_task tanpa otorisasi (wajib ditolak 401)',
    { jsonrpc: '2.0', method: 'tools/call', id: 7, params: { name: 'dispatch_agent_task', arguments: { task_id: 'TASK-BM-004', title: 'Test', instructions: 'Test' } } },
    {},
    401,
    (res, data) => data.error?.code === -32000
  );

  // 9. Tool sensitif read_repo_file dengan auth valid (harus sukses 200)
  await testCase(
    'Tool sensitif read_repo_file dengan otorisasi valid Bearer token',
    { jsonrpc: '2.0', method: 'tools/call', id: 8, params: { name: 'read_repo_file', arguments: { path: 'package.json' } } },
    { Authorization: `Bearer ${AGENT_SECRET}` },
    200,
    (res, data) => Array.isArray(data.result?.content)
  );

  console.log(`\nHasil: ${passCount} dari ${totalTests} pengujian berhasil (${Math.round(passCount/totalTests*100)}%).`);
  if (passCount !== totalTests) {
    process.exit(1);
  }
}

runTests();
