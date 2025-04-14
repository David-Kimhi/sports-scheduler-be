require('dotenv').config()

const { fetchFootballData } = require('../api_football/utils')
const { writeToMongo } = require('../mongodb/utils');

async function main() {
  const data = await fetchFootballData('leagues');
  await writeToMongo('football', 'leagues', data)
}
main();
//writeToMongo('football', 'matches', matchData);



