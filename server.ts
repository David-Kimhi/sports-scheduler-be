import express from 'express';
import footballApi from './src/routs/api.js';
import { LOCAL_PORT } from './src/config/index.js';
import { Game, Country, League } from './src/models/index.js';
import { SPORT, GAMES_COLL_NAME, COUNTRIES_COLL_NAME, LEAGUES_COLL_NAME } from './src/config/index.js';

const app = express();

await Game.init(SPORT, GAMES_COLL_NAME, 'api');
await Country.init(SPORT, COUNTRIES_COLL_NAME, 'api');
await League.init(SPORT, LEAGUES_COLL_NAME, 'api');

app.use(express.json());
app.use('/api/football', footballApi);

app.listen(LOCAL_PORT, () => {
  console.log(`🚀 Server running on port ${LOCAL_PORT}`);
});
