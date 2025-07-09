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
    // Enhanced request configuration for better recognition
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
        maxAlternatives: 1,
        speechContexts: [
          {
            phrases: [
              "farming", "crop", "disease", "pest", "fertilizer", "irrigation", "harvest", "seed", "soil", "weather",
              "wheat", "rice", "cotton", "tomato", "potato", "onion", "maize", "sugarcane", "millet",
              "yellowing", "wilting", "spots", "insects", "fungus", "drought", "water", "market", "price"
            ],
            boost: 20.0
          }
        ]
      },
    };

    console.log(`🎤 Processing speech in ${SUPPORTED_LANGUAGES[languageCode] || languageCode}...`);
    console.log(`📊 Audio buffer size: ${audioBuffer.length} bytes`);
    
    const [response] = await speechClient.recognize(request);
    
    if (!response.results || response.results.length === 0) {
      console.log('⚠️ No speech detected in audio');
      throw new Error('No speech detected in the audio. Please speak clearly and try again.');
    }
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n')
      .trim();

    if (!transcription || transcription.length === 0) {
      console.log('⚠️ Empty transcription received');
      throw new Error('Could not understand the speech. Please speak clearly and try again.');
    }

    console.log(`📝 Transcribed text: "${transcription}"`);
    console.log(`🎯 Confidence: ${response.results[0]?.alternatives[0]?.confidence || 'N/A'}`);
    
    return transcription;
  } catch (error) {
    console.error('Speech-to-Text error:', error);
    
    // Enhanced error handling
    if (error.code === 3) { // INVALID_ARGUMENT
      throw new Error('Audio format not supported. Please check your microphone settings.');
    } else if (error.code === 7) { // PERMISSION_DENIED
      throw new Error('Speech recognition service not available. Using demo mode.');
    } else if (error.code === 14) { // UNAVAILABLE
      throw new Error('Speech recognition service temporarily unavailable.');
    }
    
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
        speakingRate: 1.3, // Fast for super brief responses
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
    let aiResponse = result.response.candidates[0].content.parts[0].text;
    
    // Step 3.5: Ensure response is concise and within limits
    aiResponse = optimizeResponseLength(aiResponse, inputLanguage);
    
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
  
  return `You are "FarmMitra" (फार्म मित्र), an expert agricultural advisor with 20+ years of experience helping Indian farmers. You understand:

🌾 CROPS: Wheat, Rice, Cotton, Sugarcane, Corn, Vegetables, Fruits, Pulses, Oilseeds
🐛 PESTS: Bollworm, Aphids, Whitefly, Stem borer, Leaf curl virus, Bacterial blight
💊 TREATMENTS: Neem oil, Copper fungicide, Imidacloprid, Carbendazim, Bio-pesticides
🌱 SEASONS: Kharif (June-Oct), Rabi (Nov-April), Zaid (April-June)
🌧️ WEATHER: Monsoon patterns, drought management, flood protection
💰 SCHEMES: PM-KISAN, Crop insurance, Soil health cards, DBT

FARMER CONTEXT:
Location: ${context.location || 'India'} | Season: ${context.season || 'Current'} | Crop: ${context.crop || 'Mixed farming'} | Experience: ${context.experience || 'Moderate'}

FARMER'S QUESTION: "${userQuery}"

ANALYSIS: First, identify if this is about:
- Pest/Disease (symptoms, treatment, prevention)
- Crop Management (planting, irrigation, harvesting)
- Market/Prices (selling, buying, storage)
- Weather/Climate (rain, drought, temperature)
- Government Schemes (subsidies, loans, insurance)
- General Farming (seeds, fertilizers, equipment)

CRITICAL RESPONSE RULES:
✅ Use ONLY ${language} language 
✅ Maximum 20-30 words TOTAL
✅ Give ONLY 1-2 actions
✅ NO greetings, NO long introductions
✅ Direct answer ONLY

STRICT FORMAT:
"[problem]. करें: [action]. लागत: [cost]."

EXAMPLE: "पत्ती पीली है। यूरिया 10kg छिड़कें। लागत: 200 रुपये।"

WORD LIMIT: 30 WORDS MAXIMUM - COUNT EVERY WORD!

Respond in ${language} (MAX 30 WORDS):`;
}

/**
 * Optimize response length to ensure concise, efficient answers
 */
function optimizeResponseLength(response, languageCode) {
  // Remove excessive whitespace and line breaks
  let optimized = response.replace(/\s+/g, ' ').trim();
  
  // Word count limits based on language (approximate)
  const MAX_WORDS = {
    'hi-IN': 25,     // Hindi - super compact
    'en-IN': 30,     // English - slightly longer
    'bn-IN': 25,     // Bengali
    'te-IN': 25,     // Telugu
    'mr-IN': 25,     // Marathi
    'ta-IN': 25,     // Tamil
    'gu-IN': 25,     // Gujarati
    'kn-IN': 25,     // Kannada
    'ml-IN': 25,     // Malayalam
    'pa-IN': 25,     // Punjabi
    'or-IN': 25      // Odia
  };
  
  const maxWords = MAX_WORDS[languageCode] || 30;
  const words = optimized.split(' ');
  
  // If response is too long, truncate aggressively
  if (words.length > maxWords) {
    const truncated = words.slice(0, maxWords - 2).join(' ');
    
    // Add brief ending based on language
    const endings = {
      'hi-IN': '... और?',
      'en-IN': '... more?',
      'bn-IN': '... আরো?',
      'te-IN': '... మరింత?',
      'mr-IN': '... अधिक?',
      'ta-IN': '... மேலும்?',
      'gu-IN': '... વધુ?',
      'kn-IN': '... ಹೆಚ್ಚು?',
      'ml-IN': '... കൂടുതൽ?',
      'pa-IN': '... ਹੋਰ?',
      'or-IN': '... ଅଧିକ?'
    };
    
    optimized = truncated + (endings[languageCode] || endings['en-IN']);
  }
  
  // Remove redundant phrases and filler words aggressively
  const fillerPhrases = {
    'hi-IN': [
      'मैं समझ गया', 'आपकी समस्या', 'जैसा कि', 'इसके अलावा', 'यह जरूरी है कि',
      'नमस्ते', 'हैलो', 'धन्यवाद', 'आपका', 'स्वागत', 'मुझे लगता है', 'शायद',
      'संभवतः', 'निश्चित रूप से', 'बिल्कुल', 'वास्तव में', 'अच्छा सवाल'
    ],
    'en-IN': [
      'I understand', 'your problem', 'as you know', 'in addition', 'it is important that',
      'hello', 'hi', 'thank you', 'welcome', 'I think', 'maybe', 'probably',
      'definitely', 'absolutely', 'really', 'good question'
    ],
  };
  
  const fillers = fillerPhrases[languageCode] || [];
  fillers.forEach(filler => {
    optimized = optimized.replace(new RegExp(filler, 'gi'), '');
  });
  
  // Clean up extra spaces
  optimized = optimized.replace(/\s+/g, ' ').trim();
  
  console.log(`📏 Response optimized: ${words.length} → ${optimized.split(' ').length} words`);
  
  return optimized;
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
