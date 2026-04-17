const http = require('http');

const testLogin = async () => {
  try {
    console.log('Testing admin login...\n');
    
    const postData = JSON.stringify({
      email: 'yammanuruharish456@gmail.com',
      password: 'admin@123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ Login successful!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Response:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Token: ${response.token.substring(0, 50)}...`);
            console.log(`User ID: ${response.user.id}`);
            console.log(`Name: ${response.user.name}`);
            console.log(`Email: ${response.user.email}`);
            console.log(`Role: ${response.user.role}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          } else {
            console.log('❌ Login failed!\n');
            console.log('Error:', response.message);
          }
        } catch (e) {
          console.log('❌ Error parsing response:', e.message);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Connection error!\n');
      console.log('Error:', error.message);
      console.log('\nMake sure:');
      console.log('1. Backend server is running on http://localhost:5000');
      console.log('2. MongoDB is connected');
      console.log('3. Admin account exists in database');
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testLogin();
