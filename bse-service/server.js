// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDb from './db/conn.js';
import bseRouter from './routes/index.js';

const app = express();

app.use(cors());               // You can restrict origins later
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bse-services' });
});

// BSE routes
// app.use('/api/bse', bseRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('BSE-SERVICE ERROR:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`BSE services running on http://localhost:${PORT}`);
  });
});
