import express from 'express';
import { FirebaseDataService } from '../utils/firebaseDataService.js';

const router = express.Router();

// Save location feedback
router.post('/location-feedback', async (req, res) => {
  try {
    const { location, isCorrect } = req.body;
    
    const data = {
      location,
      isCorrect,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    const result = await FirebaseDataService.saveLocationFeedback(data);
    res.json({ success: true, message: 'Location feedback saved', id: result.id });
  } catch (error) {
    console.error('Error saving location feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save weather feedback
router.post('/weather-feedback', async (req, res) => {
  try {
    const { weather, location, isCorrect } = req.body;
    
    const data = {
      weather,
      location,
      isCorrect,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    const result = await FirebaseDataService.saveWeatherFeedback(data);
    res.json({ success: true, message: 'Weather feedback saved', id: result.id });
  } catch (error) {
    console.error('Error saving weather feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save manual location
router.post('/manual-location', async (req, res) => {
  try {
    const { userInput, resolvedLocation, success } = req.body;
    
    const data = {
      userInput,
      resolvedLocation,
      success,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    const result = await FirebaseDataService.saveManualLocation(data);
    res.json({ success: true, message: 'Manual location saved', id: result.id });
  } catch (error) {
    console.error('Error saving manual location:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save voice chat
router.post('/voice-chat', async (req, res) => {
  try {
    const { userMessage, botResponse } = req.body;
    
    const data = {
      userMessage,
      botResponse,
      messageLength: userMessage?.length || 0,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    const result = await FirebaseDataService.saveVoiceChat(data);
    res.json({ success: true, message: 'Voice chat saved', id: result.id });
  } catch (error) {
    console.error('Error saving voice chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save crop diagnosis
router.post('/crop-diagnosis', async (req, res) => {
  try {
    const { input, result } = req.body;
    
    const data = {
      input,
      result,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    const firestoreResult = await FirebaseDataService.saveCropDiagnosis(data);
    res.json({ success: true, message: 'Crop diagnosis saved', id: firestoreResult.id });
  } catch (error) {
    console.error('Error saving crop diagnosis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save price search
router.post('/price-search', async (req, res) => {
  try {
    const { commodity, location, result } = req.body;
    
    const data = {
      commodity,
      location,
      result,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    const firestoreResult = await FirebaseDataService.savePriceSearch(data);
    res.json({ success: true, message: 'Price search saved', id: firestoreResult.id });
  } catch (error) {
    console.error('Error saving price search:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get data statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await FirebaseDataService.getDataStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get collection data
router.get('/collection/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const data = await FirebaseDataService.getAllData(name, limit);
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Error getting collection data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
