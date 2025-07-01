// utils/voiceAI.js - Voice-first interaction using Vertex AI Speech services
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import { generativeModel } from './vertex.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Speech-to-Text client
const speechClient = new speech.SpeechClient();

// Initialize Text-to-Speech client
const ttsClient = new textToSpeech.TextToSpeechClient();

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

/**
 * Convert speech audio buffer to text using Vertex AI Speech-to-Text
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} languageCode - Language code (e.g., 'hi-IN', 'en-IN')
 * @param {string} encoding - Audio encoding (e.g., 'WEBM_OPUS', 'MP3', 'WAV')
 * @param {number} sampleRateHertz - Sample rate of audio
 * @returns {Promise<string>} Transcribed text
 */
async function speechToText(audioBuffer, languageCode = 'hi-IN', encoding = 'WEBM_OPUS', sampleRateHertz = 48000) {
  try {
    const request = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        alternativeLanguageCodes: ['en-IN', 'hi-IN'], // Fallback languages
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        model: 'latest_long', // Use latest model for better accuracy
        useEnhanced: true, // Enhanced model for better accuracy
      },
    };

    console.log(`🎤 Processing speech in ${SUPPORTED_LANGUAGES[languageCode] || languageCode}...`);
    
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    console.log(`📝 Transcribed text: ${transcription}`);
    return transcription;
  } catch (error) {
    console.error('Speech-to-Text error:', error);
    throw new Error(`Speech recognition failed: ${error.message}`);
  }
}

/**
 * Convert text to speech using Vertex AI Text-to-Speech
 * @param {string} text - Text to convert to speech
 * @param {string} languageCode - Language code for output speech
 * @param {string} voiceName - Specific voice name (optional)
 * @param {string} gender - Voice gender ('NEUTRAL', 'MALE', 'FEMALE')
 * @returns {Promise<Buffer>} Audio buffer
 */
async function convertTextToSpeech(text, languageCode = 'hi-IN', voiceName = null, gender = 'NEUTRAL') {
  try {
    // Voice configuration based on language
    const voiceConfig = {
      languageCode: languageCode,
      ssmlGender: gender,
    };

    // Use specific voice if provided, otherwise let Google choose
    if (voiceName) {
      voiceConfig.name = voiceName;
    }

    const request = {
      input: { text: text },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Slightly slower for better comprehension
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    };

    console.log(`🔊 Generating speech in ${SUPPORTED_LANGUAGES[languageCode] || languageCode}...`);
    
    const [response] = await ttsClient.synthesizeSpeech(request);
    console.log('✅ Speech generated successfully');
    
    return response.audioContent;
  } catch (error) {
    console.error('Text-to-Speech error:', error);
    throw new Error(`Speech synthesis failed: ${error.message}`);
  }
}

/**
 * Process farmer's voice query using AI and return voice response
 * @param {Buffer} audioBuffer - Input audio from farmer
 * @param {string} inputLanguage - Farmer's language
 * @param {object} context - Additional context (location, crop, etc.)
 * @returns {Promise<{text: string, audio: Buffer, language: string}>}
 */
async function processVoiceQuery(audioBuffer, inputLanguage = 'hi-IN', context = {}) {
  try {
    // Step 1: Convert speech to text
    const userQuery = await speechToText(audioBuffer, inputLanguage);
    
    if (!userQuery || userQuery.trim().length === 0) {
      throw new Error('Could not understand the audio. Please try again.');
    }

    // Step 2: Create enhanced prompt for AI with agricultural context
    const enhancedPrompt = createAgriculturalPrompt(userQuery, context, inputLanguage);
    
    // Step 3: Get AI response using Vertex AI
    console.log('🤖 Processing with Vertex AI...');
    const result = await generativeModel.generateContent(enhancedPrompt);
    const aiResponse = result.response.text();
    
    console.log(`💬 AI Response: ${aiResponse}`);

    // Step 4: Convert AI response back to speech
    const responseAudio = await convertTextToSpeech(aiResponse, inputLanguage);
    
    return {
      userQuery: userQuery,
      text: aiResponse,
      audio: responseAudio,
      language: inputLanguage,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Voice query processing error:', error);
    
    // Generate error message in user's language
    const errorMessage = getErrorMessage(inputLanguage);
    const errorAudio = await convertTextToSpeech(errorMessage, inputLanguage);
    
    return {
      userQuery: '',
      text: errorMessage,
      audio: errorAudio,
      language: inputLanguage,
      error: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Create agricultural-focused prompt for better AI responses
 */
function createAgriculturalPrompt(userQuery, context, languageCode) {
  const language = SUPPORTED_LANGUAGES[languageCode] || 'English';
  
  return `You are an expert agricultural advisor helping Indian farmers. Respond in ${language} language.

Context Information:
- Farmer's Location: ${context.location || 'India'}
- Current Season: ${context.season || 'Current season'}
- Crop Interest: ${context.crop || 'General farming'}
- Farmer's Experience: ${context.experience || 'Varied'}

Farmer's Question: "${userQuery}"

Instructions:
1. Provide practical, actionable advice suitable for Indian farming conditions
2. Use simple, clear language that a farmer can easily understand
3. Include specific steps or recommendations when possible
4. If discussing crops, consider Indian climate and soil conditions
5. For market prices, mention checking local mandis or government sources
6. Keep response concise but helpful (under 150 words)
7. Be encouraging and supportive in tone
8. If you need more information, ask specific follow-up questions

Please respond in ${language}:`;
}

/**
 * Get error messages in different languages
 */
function getErrorMessage(languageCode) {
  const errorMessages = {
    'hi-IN': 'माफ करें, मुझे आपकी बात समझने में कुछ परेशानी हुई है। कृपया दोबारा कोशिश करें।',
    'en-IN': 'Sorry, I had trouble understanding you. Please try again.',
    'bn-IN': 'দুঃখিত, আমি আপনার কথা বুঝতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    'te-IN': 'క్షమించండి, మీ మాట అర్థం చేసుకోవడంలో నాకు ఇబ్బంది ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి।',
    'mr-IN': 'माफ करा, मला तुमचे म्हणणे समजण्यात अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.',
    'ta-IN': 'மன்னிக்கவும், உங்கள் பேச்சைப் புரிந்துகொள்வதில் எனக்கு சிரமம் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    'gu-IN': 'માફ કરશો, મને તમારી વાત સમજવામાં મુશ્કેલી પડી છે. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    'kn-IN': 'ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಮಾತನ್ನು ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳುವಲ್ಲಿ ನನಗೆ ತೊಂದರೆ ಆಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'ml-IN': 'ക്ഷമിക്കണം, നിങ്ങളുടെ സംസാരം മനസ്സിലാക്കാൻ എനിക്ക് ബുദ്ധിമുട്ട് ഉണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    'pa-IN': 'ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਤੁਹਾਡੀ ਗੱਲ ਸਮਝਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੋਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'or-IN': 'ଦୁଃଖିତ, ମୁଁ ଆପଣଙ୍କ କଥା ବୁଝିବାରେ ଅସୁବିଧା ଭୋଗୁଛି। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।'
  };
  
  return errorMessages[languageCode] || errorMessages['en-IN'];
}

/**
 * Get available voices for a language
 */
async function getAvailableVoices(languageCode) {
  try {
    const [result] = await ttsClient.listVoices({ languageCode });
    return result.voices.filter(voice => voice.languageCodes.includes(languageCode));
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
}

/**
 * Save voice interaction to file for debugging/logging
 */
async function saveVoiceInteraction(interaction, filename) {
  try {
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logFile = path.join(logsDir, `voice_${filename}_${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(interaction, null, 2));
    
    if (interaction.audio) {
      const audioFile = path.join(logsDir, `voice_${filename}_${Date.now()}.mp3`);
      fs.writeFileSync(audioFile, interaction.audio);
    }
  } catch (error) {
    console.error('Error saving voice interaction:', error);
  }
}

export {
  speechToText,
  convertTextToSpeech as textToSpeech,
  processVoiceQuery,
  getAvailableVoices,
  saveVoiceInteraction,
  SUPPORTED_LANGUAGES
};
