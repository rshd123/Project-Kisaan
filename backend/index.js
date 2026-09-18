import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diagnosisRoutes from './routes/diagnosis.js';
import pricesRoutes from './routes/prices.js';
import voiceRoutes from './routes/voice.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Project Kisan API is running!',
    status: 'OK',
    features: ['Voice AI', 'Crop Diagnosis', 'Price Information'],
    timestamp: new Date().toISOString()
  });
});

app.use('/api/diagnose', diagnosisRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/voice', voiceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
