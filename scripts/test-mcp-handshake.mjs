// Test suite for TASK-BM-005: MCP JSON-RPC 2.0 (HTTP 200) & Resources/Prompts Discovery
const BASE_URL = 'http://localhost:3000/api/mcp';
const AGENT_SECRET = process.env.AGENT_SECRET_KEY || 'bm_agent_sec_2026_banten';

async function runTests() {
  console.log('--- Memulai Test MCP Handshake, Resources/Prompts & HTTP 200 Standar ---');
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
        console.log(`[PASS] Test ${totalTests}: ${name} (HTTP Status: ${res.status})`);
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
    (res, data) => data.result?.serverInfo?.name === 'Banten Mengaji MCP' && data.result?.protocolVersion === '2024-11-05'
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

  // 5. resources/list tanpa auth
  await testCase(
    'resources/list tanpa otorisasi',
    { jsonrpc: '2.0', method: 'resources/list', id: 4 },
    {},
    200,
    (res, data) => Array.isArray(data.result?.resources) && data.result.resources.length === 0
  );

  // 6. resources/templates/list tanpa auth
  await testCase(
    'resources/templates/list tanpa otorisasi',
    { jsonrpc: '2.0', method: 'resources/templates/list', id: 5 },
    {},
    200,
    (res, data) => Array.isArray(data.result?.resourceTemplates) && data.result.resourceTemplates.length === 0
  );

  // 7. prompts/list tanpa auth
  await testCase(
    'prompts/list tanpa otorisasi',
    { jsonrpc: '2.0', method: 'prompts/list', id: 6 },
    {},
    200,
    (res, data) => Array.isArray(data.result?.prompts) && data.result.prompts.length === 0
  );

  // 8. Tool dakwah publik get_upcoming_kajian tanpa auth
  await testCase(
    'Tool dakwah get_upcoming_kajian tanpa otorisasi',
    { jsonrpc: '2.0', method: 'tools/call', id: 7, params: { name: 'get_upcoming_kajian', arguments: { limit: 2 } } },
    {},
    200,
    (res, data) => Array.isArray(data.result?.content)
  );

  // 9. Tool dakwah publik get_masjid_directory tanpa auth
  await testCase(
    'Tool dakwah get_masjid_directory tanpa otorisasi',
    { jsonrpc: '2.0', method: 'tools/call', id: 8, params: { name: 'get_masjid_directory', arguments: { limit: 2 } } },
    {},
    200,
    (res, data) => Array.isArray(data.result?.content)
  );

  // 10. Tool sensitif read_repo_file tanpa auth (harus HTTP 200 & error code -32000)
  await testCase(
    'Tool sensitif read_repo_file tanpa otorisasi (wajib HTTP 200 & code -32000)',
    { jsonrpc: '2.0', method: 'tools/call', id: 9, params: { name: 'read_repo_file', arguments: { path: 'package.json' } } },
    {},
    200,
    (res, data) => data.error?.code === -32000
  );

  // 11. Tool sensitif dispatch_agent_task tanpa auth (harus HTTP 200 & error code -32000)
  await testCase(
    'Tool sensitif dispatch_agent_task tanpa otorisasi (wajib HTTP 200 & code -32000)',
    { jsonrpc: '2.0', method: 'tools/call', id: 10, params: { name: 'dispatch_agent_task', arguments: { task_id: 'TASK-BM-005', title: 'Test', instructions: 'Test' } } },
    {},
    200,
    (res, data) => data.error?.code === -32000
  );

  // 12. Tool sensitif read_repo_file dengan auth valid (harus HTTP 200 & sukses)
  await testCase(
    'Tool sensitif read_repo_file dengan otorisasi valid Bearer token',
    { jsonrpc: '2.0', method: 'tools/call', id: 11, params: { name: 'read_repo_file', arguments: { path: 'package.json' } } },
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
