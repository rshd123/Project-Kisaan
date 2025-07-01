// routes/voice.js - Voice interaction API routes
import express from 'express';
import multer from 'multer';
import { processVoiceQuery, SUPPORTED_LANGUAGES, getAvailableVoices } from '../utils/voiceAI.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

/**
 * POST /api/voice/query
 * Process voice query from farmer
 */
router.post('/query', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    const { language = 'hi-IN', location, season, crop, experience } = req.body;

    // Validate language
    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`,
        supportedLanguages: SUPPORTED_LANGUAGES
      });
    }

    const context = {
      location: location || 'India',
      season: season || 'Current season',
      crop: crop || 'General farming',
      experience: experience || 'Varied'
    };

    console.log(`🎤 Processing voice query in ${SUPPORTED_LANGUAGES[language]}...`);
    console.log(`📍 Context:`, context);

    // Process the voice query
    const result = await processVoiceQuery(req.file.buffer, language, context);

    // Return response with audio as base64
    const response = {
      success: true,
      data: {
        userQuery: result.userQuery,
        response: result.text,
        language: result.language,
        timestamp: result.timestamp,
        audio: result.audio.toString('base64'), // Convert audio buffer to base64
        context: context
      }
    };

    if (result.error) {
      response.warning = 'Voice processing had issues, but error message was generated';
    }

    res.json(response);

  } catch (error) {
    console.error('Voice query error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process voice query'
    });
  }
});

/**
 * GET /api/voice/languages
 * Get supported languages
 */
router.get('/languages', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        languages: SUPPORTED_LANGUAGES,
        total: Object.keys(SUPPORTED_LANGUAGES).length
      }
    });
  } catch (error) {
    console.error('Languages endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported languages'
    });
  }
});

/**
 * GET /api/voice/voices/:language
 * Get available voices for a specific language
 */
router.get('/voices/:language', async (req, res) => {
  try {
    const { language } = req.params;

    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`,
        supportedLanguages: SUPPORTED_LANGUAGES
      });
    }

    const voices = await getAvailableVoices(language);
    
    res.json({
      success: true,
      data: {
        language: language,
        languageName: SUPPORTED_LANGUAGES[language],
        voices: voices.map(voice => ({
          name: voice.name,
          gender: voice.ssmlGender,
          naturalSampleRateHertz: voice.naturalSampleRateHertz
        }))
      }
    });

  } catch (error) {
    console.error('Voices endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available voices'
    });
  }
});

/**
 * POST /api/voice/synthesize
 * Convert text to speech
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, language = 'hi-IN', voiceName, gender = 'NEUTRAL' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`,
        supportedLanguages: SUPPORTED_LANGUAGES
      });
    }

    const { textToSpeech } = await import('../utils/voiceAI.js');
    const audioBuffer = await textToSpeech(text, language, voiceName, gender);

    res.json({
      success: true,
      data: {
        text: text,
        language: language,
        languageName: SUPPORTED_LANGUAGES[language],
        audio: audioBuffer.toString('base64'),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to synthesize speech'
    });
  }
});

/**
 * POST /api/voice/transcribe
 * Convert speech to text only
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    const { language = 'hi-IN', encoding = 'WEBM_OPUS', sampleRate = 48000 } = req.body;

    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`,
        supportedLanguages: SUPPORTED_LANGUAGES
      });
    }

    const { speechToText } = await import('../utils/voiceAI.js');
    const transcription = await speechToText(
      req.file.buffer, 
      language, 
      encoding, 
      parseInt(sampleRate)
    );

    res.json({
      success: true,
      data: {
        transcription: transcription,
        language: language,
        languageName: SUPPORTED_LANGUAGES[language],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe speech'
    });
  }
});

/**
 * GET /api/voice/test
 * Test voice AI functionality
 */
router.get('/test', async (req, res) => {
  try {
    const testText = "नमस्कार! मैं आपका कृषि सहायक हूं। आप मुझसे खेती के बारे में कुछ भी पूछ सकते हैं।";
    const { textToSpeech } = await import('../utils/voiceAI.js');
    
    const audioBuffer = await textToSpeech(testText, 'hi-IN');
    
    res.json({
      success: true,
      message: 'Voice AI is working correctly',
      data: {
        testText: testText,
        audio: audioBuffer.toString('base64'),
        supportedLanguages: SUPPORTED_LANGUAGES,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Voice AI test error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Voice AI test failed'
    });
  }
});

export default router;
