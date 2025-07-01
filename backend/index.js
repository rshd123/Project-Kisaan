import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diagnosisRoutes from './routes/diagnosis.js';
import pricesRoutes from './routes/prices.js';
import testRoutes from './routes/test.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Project Kisan API is running!', status: 'OK' });
});

app.use('/api/diagnose', diagnosisRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/test', testRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
