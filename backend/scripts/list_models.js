const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log('Available Models:', response.data.models.map(m => m.name));
  } catch (error) {
    console.error('Error listing models:', error.response?.status, error.response?.data || error.message);
  }
}

listModels();
