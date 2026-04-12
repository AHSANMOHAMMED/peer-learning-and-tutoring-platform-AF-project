const axios = require('axios');

async function testRegister() {
  try {
    console.log('Testing registration...');
    const response = await axios.post('http://localhost:5001/api/auth/register', {
      username: 'testuser_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'Password123!',
      role: 'student',
      district: 'Colombo',
      stream: 'Combined Mathematics',
      grade: '12'
    });
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegister();
