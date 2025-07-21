import express from 'express';
import footballApi from './src/routs/api.js';
import { API_MODULE, LOCAL_PORT_BACKEND, LOCAL_PORT_FRONTEND, TEAMS_COLL_NAME } from './src/config/index.js';
import { Game, Country, League, Team } from './src/models/index.js';
import { SPORT, GAMES_COLL_NAME, COUNTRIES_COLL_NAME, LEAGUES_COLL_NAME } from './src/config/index.js';
import cors from 'cors';


const app = express();

await Game.init(SPORT, GAMES_COLL_NAME, API_MODULE);
await Country.init(SPORT, COUNTRIES_COLL_NAME, API_MODULE);
await League.init(SPORT, LEAGUES_COLL_NAME, API_MODULE);
await Team.init(SPORT, TEAMS_COLL_NAME, API_MODULE), 

app.use(cors({
  origin: `http://localhost:${LOCAL_PORT_FRONTEND}`
}));
app.use(express.json());
app.use('/api/football', footballApi);

app.listen(LOCAL_PORT_BACKEND, () => {
  console.log(`🚀 Server running on port ${LOCAL_PORT_BACKEND}`);
});
