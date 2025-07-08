import express from 'express';
import footballApi from './src/routs/api';
import { LOCAL_PORT } from './src/config/index.js';

const app = express();

app.use(express.json());
app.use('/api/football', footballApi);

app.listen(LOCAL_PORT, () => {
  console.log(`🚀 Server running on port ${LOCAL_PORT}`);
});
