import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diagnosisRoutes from './routes/diagnosis.js';
import pricesRoutes from './routes/prices.js';

import voiceRoutes from './routes/voice.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for audio files
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
