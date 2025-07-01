import express from 'express';
import { generativeModel } from '../utils/vertex.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('Testing Vertex AI connection...');
    const result = await generativeModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Hello, please respond with "Connection successful!"' }]
      }]
    });

    console.log('Full result:', JSON.stringify(result, null, 2));
    
    let response = 'Unable to parse response';
    if (result && result.response && result.response.candidates && result.response.candidates[0]) {
      response = result.response.candidates[0].content.parts[0].text;
    } else if (result && result.candidates && result.candidates[0]) {
      response = result.candidates[0].content.parts[0].text;
    }
    
    console.log('Vertex AI test response:', response);
    
    res.json({ success: true, message: 'Vertex AI connection working', response });
  } catch (error) {
    console.error('Vertex AI test error:', error);
    res.status(500).json({ 
      error: 'Vertex AI connection failed', 
      details: error.message,
      stack: error.stack 
    });
  }
});

export default router;
