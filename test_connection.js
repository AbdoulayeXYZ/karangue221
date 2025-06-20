/**
 * Test script to verify frontend-backend connection
 */

const testConnection = async () => {
  console.log('🔍 Testing Frontend-Backend Connection...\n');

  try {
    // Test 1: Backend API health
    console.log('1. Testing Backend API...');
    const apiResponse = await fetch('http://localhost:5001/api/drivers');
    console.log(`   ✅ Backend API Status: ${apiResponse.status}`);
    
    // Test 2: Login
    console.log('\n2. Testing Login...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@karangue221.com',
        password: 'karangue_owner_2025'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Login successful');
      console.log(`   📧 User: ${loginData.user.email}`);
      
      // Test 3: Authenticated API call
      console.log('\n3. Testing Authenticated API...');
      const authResponse = await fetch('http://localhost:5001/api/drivers', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      console.log(`   ✅ Authenticated API Status: ${authResponse.status}`);
      
      // Test 4: WebSocket connection
      console.log('\n4. Testing WebSocket...');
      const ws = new WebSocket('ws://localhost:5001/ws');
      
      ws.onopen = () => {
        console.log('   ✅ WebSocket connected');
        ws.close();
      };
      
      ws.onerror = (error) => {
        console.log('   ❌ WebSocket error:', error);
      };
      
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('   ⚠️ WebSocket connection timeout');
          ws.close();
        }
      }, 5000);
      
    } else {
      console.log('   ❌ Login failed');
    }
    
    // Test 5: Frontend accessibility
    console.log('\n5. Testing Frontend...');
    const frontendResponse = await fetch('http://localhost:4028');
    console.log(`   ✅ Frontend Status: ${frontendResponse.status}`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
};

// Run the test
testConnection(); 