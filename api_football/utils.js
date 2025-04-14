const axios = require('axios');
require('dotenv').config();

const API_BASE = `https://${process.env.APIFOOTBALL_HOST}`;

async function fetchFootballData(endpoint) {
  const config = {
    method: 'get',
    url: `${API_BASE}/${endpoint}`,
    headers: {
      'x-rapidapi-key': process.env.APIFOOTBALL_API_KEY,
      'x-rapidapi-host': process.env.APIFOOTBALL_HOST
    }
  };

  try {
    const response = await axios(config);
    return response.data.response;
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err.response?.data || err.message);
    throw err;
  }
}

module.exports = { fetchFootballData };

