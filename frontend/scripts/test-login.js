// scripts/test-login.js
// Test script para verificar que el login rápido funciona

const BASE_URL = 'http://localhost:3002';

const testUsers = [
  {
    email: 'super.admin@lapublica.cat',
    password: 'superadmin123',
    role: 'SUPER_ADMIN',
    name: 'Super Admin'
  },
  {
    email: 'admin@lapublica.cat',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Admin'
  }
];

async function testLogin(user) {
  console.log(`\n🔐 Testing login for ${user.name} (${user.email})...`);

  try {
    // Simular el login con credentials
    const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: user.email,
        password: user.password,
        redirect: 'false',
        callbackUrl: '/admin'
      })
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      console.log(`✅ Login successful for ${user.name}`);
      return true;
    } else {
      console.log(`❌ Login failed for ${user.name}`);
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login error for ${user.name}:`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting login tests...\n');

  const results = [];

  for (const user of testUsers) {
    const success = await testLogin(user);
    results.push({ user: user.name, success });

    // Esperar un poco entre tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Test Results:');
  console.log('─'.repeat(40));

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.user}`);
  });

  const passCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`\nTotal: ${passCount}/${totalCount} tests passed`);

  if (passCount === totalCount) {
    console.log('\n🎉 All login tests passed! The 401 error has been fixed.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs.');
  }
}

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    await fetch(BASE_URL);
    console.log(`✅ Server is running on ${BASE_URL}`);
    return true;
  } catch (error) {
    console.log(`❌ Server is not accessible on ${BASE_URL}`);
    console.log(`   Please make sure 'npm run dev' is running`);
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
}

main().catch(console.error);