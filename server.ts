import express from 'express';
import footballApi from './sports/football/api/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/football', footballApi);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
