import express, { type Request, type Response }from 'express';
import footballApi from './src/routs/api.js';
import { API_MODULE, LOCAL_PORT_BACKEND, LOCAL_PORT_FRONTEND, TEAMS_COLL_NAME } from './src/config/index.js';
import { Game, Country, League, Team } from './src/models/index.js';
import { GAMES_COLL_NAME, COUNTRIES_COLL_NAME, LEAGUES_COLL_NAME } from './src/config/index.js';
import cors from 'cors';
import type { Sport } from './src/utils/constants.utils.js';


const app = express();

const ft_sport: Sport = "football"

await Game.init(ft_sport, GAMES_COLL_NAME, API_MODULE);
await Country.init(ft_sport, COUNTRIES_COLL_NAME, API_MODULE);
await League.init(ft_sport, LEAGUES_COLL_NAME, API_MODULE);
await Team.init(ft_sport, TEAMS_COLL_NAME, API_MODULE), 

app.use(cors({
  origin: `http://localhost:${LOCAL_PORT_FRONTEND}`
}));

app.use(express.json());
app.use(`/api/${ft_sport}`, footballApi);
 
app.get(['/health','/api/health'], (_req: Request, res: Response) => {res.status(200).send('ok')});


app.listen(LOCAL_PORT_BACKEND, () => {
  console.log(`🚀 Server running on port ${LOCAL_PORT_BACKEND}`);
});
