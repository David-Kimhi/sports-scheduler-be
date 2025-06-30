import express from 'express';
import footballApi from './sports/football/api/index.js';
import { PORT } from './config.js';

const app = express();

app.use(express.json());
app.use('/api/football', footballApi);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
