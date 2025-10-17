import express, { type Request, type Response }from 'express';
import footballApi from './src/routs/football.routs.js';
import { API_MODULE, LOCAL_PORT_BACKEND, LOCAL_PORT_FRONTEND, TEAMS_COLL_NAME } from './src/config/index.js';
import { Game, Country, League, Team } from './src/models/index.js';
import { SPORT, GAMES_COLL_NAME, COUNTRIES_COLL_NAME, LEAGUES_COLL_NAME } from './src/config/index.js';
import cors from 'cors';
import "dotenv/config";
import analyticsApi from './src/routs/analytics.routs.js';



const app = express();
const MONGO_URI = 


await Game.init(SPORT, GAMES_COLL_NAME, API_MODULE);
await Country.init(SPORT, COUNTRIES_COLL_NAME, API_MODULE);
await League.init(SPORT, LEAGUES_COLL_NAME, API_MODULE);
await Team.init(SPORT, TEAMS_COLL_NAME, API_MODULE), 

app.use(cors({
  origin: [
    `http://localhost:${LOCAL_PORT_FRONTEND}`,
    "https://sports-scheduler.com",
    "https://www.sports-scheduler.com"
  ],
  credentials: true,                      
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());
app.use('/football', footballApi);
app.use('/analytics', analyticsApi);


app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
app.listen(LOCAL_PORT_BACKEND, () => {
  console.log(`🚀 Server running on port ${LOCAL_PORT_BACKEND}. Ready`);
});
