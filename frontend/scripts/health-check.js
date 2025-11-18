// Using native fetch (Node 18+)

const BASEURL = 'http://localhost:3000';

const endpoints = [
  { name: 'Homepage', url: '/', expectedStatus: 200 },
  { name: 'Ofertas Públicas', url: '/api/ofertas', expectedStatus: 200 },
  { name: 'Dashboard Admin', url: '/api/admin/dashboard', expectedStatus: 401 }, // Sin auth
  { name: 'Audit Logs API', url: '/api/admin/logs', expectedStatus: 403 }, // Sin auth (403 expected)
  { name: 'Login Page', url: '/login', expectedStatus: 200 },
  { name: 'Admin Panel', url: '/admin', expectedStatus: 200 },
  { name: 'Dashboard User', url: '/dashboard', expectedStatus: 200 },
  { name: 'Empresa Panel', url: '/empresa', expectedStatus: 200 },
];

async function healthCheck() {
  console.log('🏥 HEALTH CHECK - LA PÚBLICA\n');
  console.log('═'.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(BASEURL + endpoint.url);
      const status = response.status;

      if (status === endpoint.expectedStatus) {
        console.log(`✅ ${endpoint.name.padEnd(30)} ${status}`);
        passed++;
      } else {
        console.log(`❌ ${endpoint.name.padEnd(30)} ${status} (expected ${endpoint.expectedStatus})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name.padEnd(30)} ERROR: ${error.message}`);
      failed++;
    }

    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('═'.repeat(60));
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('✅ All health checks passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some health checks failed!\n');
    process.exit(1);
  }
}

healthCheck();