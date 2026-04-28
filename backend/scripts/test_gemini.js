const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function testGemini() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  console.log('Testing Gemini API Key:', apiKey ? 'Key found' : 'Key missing');
  
  if (!apiKey) return;

  const model = 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: 'Hello, are you operational?' }] }]
    });
    console.log('Gemini Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Gemini API Error:', error.response?.status, error.response?.data || error.message);
  }
}

testGemini();
