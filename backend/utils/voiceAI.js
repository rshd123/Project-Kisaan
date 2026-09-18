// utils/voiceAI.js - Voice-first interaction using Google Cloud Speech services
import { ai } from './vertex.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-load Google Cloud clients (only when actually needed)
let speechClient = null;
let ttsClient = null;
let speechModule = null;
let ttsModule = null;

async function getSpeechClient() {
  if (speechClient) return speechClient;
  try {
    speechModule = await import('@google-cloud/speech');
    speechClient = new speechModule.SpeechClient();
    return speechClient;
  } catch (error) {
    console.error('Failed to load @google-cloud/speech:', error.message);
    throw new Error('Speech-to-Text service not available. Please install @google-cloud/speech.');
  }
}

async function getTtsClient() {
  if (ttsClient) return ttsClient;
  try {
    ttsModule = await import('@google-cloud/text-to-speech');
    ttsClient = new ttsModule.TextToSpeechClient();
    return ttsClient;
  } catch (error) {
    console.error('Failed to load @google-cloud/text-to-speech:', error.message);
    throw new Error('Text-to-Speech service not available. Please install @google-cloud/text-to-speech.');
  }
}

// Supported languages/dialects for Indian farmers
const SUPPORTED_LANGUAGES = {
  'hi-IN': 'Hindi',
  'en-IN': 'English (India)',
  'bn-IN': 'Bengali',
  'te-IN': 'Telugu',
  'mr-IN': 'Marathi',
  'ta-IN': 'Tamil',
  'gu-IN': 'Gujarati',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'pa-IN': 'Punjabi',
  'or-IN': 'Odia'
};

async function speechToText(audioBuffer, languageCode = 'hi-IN', encoding = 'WEBM_OPUS', sampleRateHertz = 48000) {
  const client = await getSpeechClient();
  const request = {
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding,
      sampleRateHertz,
      languageCode,
      alternativeLanguageCodes: ['en-IN', 'hi-IN'],
      enableAutomaticPunctuation: true,
      model: 'latest_long',
      useEnhanced: true,
      maxAlternatives: 1,
      speechContexts: [{
        phrases: [
          "farming", "crop", "disease", "pest", "fertilizer", "irrigation", "harvest",
          "wheat", "rice", "cotton", "tomato", "potato", "onion", "maize", "sugarcane",
          "yellowing", "wilting", "spots", "fungus", "drought", "water", "market", "price"
        ],
        boost: 20.0
      }]
    },
  };

  const [response] = await client.recognize(request);
  if (!response.results || response.results.length === 0) {
    throw new Error('No speech detected in the audio. Please speak clearly and try again.');
  }

  return response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n')
    .trim();
}

async function convertTextToSpeech(text, languageCode = 'hi-IN', voiceName = null, gender = 'NEUTRAL') {
  const client = await getTtsClient();
  const voiceConfig = { languageCode, ssmlGender: gender };
  if (voiceName) voiceConfig.name = voiceName;

  const request = {
    input: { text },
    voice: voiceConfig,
    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, pitch: 0.0, volumeGainDb: 0.0 },
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
}

async function processVoiceQuery(audioBuffer, inputLanguage = 'hi-IN', context = {}) {
  try {
    const userQuery = await speechToText(audioBuffer, inputLanguage);
    if (!userQuery || userQuery.trim().length === 0) {
      throw new Error('Could not understand the audio. Please try again.');
    }

    const enhancedPrompt = createAgriculturalPrompt(userQuery, context, inputLanguage);
    const result = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: enhancedPrompt
    });
    const aiResponse = result.text;

    const responseAudio = await convertTextToSpeech(aiResponse, inputLanguage);

    return { userQuery, text: aiResponse, audio: responseAudio, language: inputLanguage, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Voice query processing error:', error);
    const errorMessage = getErrorMessage(inputLanguage);
    const errorAudio = await convertTextToSpeech(errorMessage, inputLanguage);
    return { userQuery: '', text: errorMessage, audio: errorAudio, language: inputLanguage, error: true, timestamp: new Date().toISOString() };
  }
}

function createAgriculturalPrompt(userQuery, context, languageCode) {
  const language = SUPPORTED_LANGUAGES[languageCode] || 'English';
  return `You are "FarmMitra", an expert agricultural advisor helping Indian farmers. Respond in ${language} using simple, farmer-friendly words. Keep response practical (100-150 words).

FARMER'S QUESTION: "${userQuery}"
CONTEXT: Location: ${context.location || 'India'} | Crop: ${context.crop || 'Mixed farming'}

Give specific, actionable advice with cost estimates where possible.`;
}

function getErrorMessage(languageCode) {
  const messages = {
    'hi-IN': 'माफ करें, मुझे आपकी बात समझने में परेशानी हुई। कृपया दोबारा कोशिश करें।',
    'kn-IN': 'ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಮಾತನ್ನು ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳುವಲ್ಲಿ ತೊಂದರೆ ಆಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'en-IN': 'Sorry, I had trouble understanding you. Please try again.',
  };
  return messages[languageCode] || messages['en-IN'];
}

async function getAvailableVoices(languageCode) {
  try {
    const client = await getTtsClient();
    const [result] = await client.listVoices({ languageCode });
    return result.voices.filter(v => v.languageCodes.includes(languageCode));
  } catch {
    return [];
  }
}

export {
  speechToText,
  convertTextToSpeech as textToSpeech,
  processVoiceQuery,
  getAvailableVoices,
  SUPPORTED_LANGUAGES
};
