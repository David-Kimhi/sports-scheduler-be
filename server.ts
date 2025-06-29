// import express from 'express';
// import cors from 'cors';
// import { searchEntities } from './mongodb/fetchers'; // You'll create this

// const app = express();
// app.use(cors());

// app.get('/api/search', async (req, res) => {
//   const q = String(req.query.q || '').trim();

//   if (!q) return res.json([]);

//   try {
//     const results = await searchEntities(q);
//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Search failed' });
//   }
// });

// const PORT = 3001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
