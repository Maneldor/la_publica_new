// Test login with credentials
async function testLogin() {
  try {
    const response = await fetch('http://localhost:3003/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'contacte@lapublica.es',
        password: 'crm123',
        csrfToken: 'test', // Simplified for testing
        callbackUrl: 'http://localhost:3003/gestor-empreses/tasques',
        json: 'true'
      })
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));

    const result = await response.text();
    console.log('Response Body:', result);

    if (response.status === 200) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Also test the API endpoint directly
async function testTasksAPI() {
  try {
    const response = await fetch('http://localhost:3003/api/crm/tasks');
    console.log('\n--- Testing Tasks API ---');
    console.log('Status:', response.status);

    const result = await response.text();
    console.log('Response:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

console.log('🧪 Testing login...');
testLogin().then(() => testTasksAPI());