const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

const getTeamNextEvents = async (teamId) => {
  const url = `${BASE_URL}/${process.env.SPORTSDB_API_KEY}/eventsnext.php?id=${teamId}`;
  const response = await axios.get(url);
  return response.data.events;
};

const searchTeamByName = async (teamName) => {
  const url = `${BASE_URL}/${process.env.SPORTSDB_API_KEY}/searchteams.php?t=${teamName}`;
  const response = await axios.get(url);
  return response.data.teams?.[0];
};

module.exports = {
  getTeamNextEvents,
  searchTeamByName,
};
