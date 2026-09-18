// utils/mockVoiceAI.js - Temporary mock implementation for testing
import { ai } from './vertex.js';

/**
 * Mock speech-to-text for testing without Google Cloud Speech API
 */
async function mockSpeechToText(audioBuffer, languageCode = 'hi-IN') {
  // Return varied realistic farming queries based on language
  const sampleQueries = {
    'hi-IN': [
      'मेरी गेहूं की फसल में पीले धब्बे आ गए हैं, क्या करना चाहिए?',
      'टमाटर के पौधे मुरझा रहे हैं, क्या समस्या हो सकती है?',
      'कपास में सफेद मक्खी का अटैक है, कैसे रोकूं?',
      'धान की बुआई का सही समय क्या है?',
      'आज मंडी में प्याज का भाव क्या है?',
      'खाद की कमी से पत्ते पीले हो रहे हैं, क्या डालूं?'
    ],
    'en-IN': [
      'My wheat crop has yellow spots appearing, what should I do?',
      'The tomato plants are wilting, what could be the problem?',
      'There is a whitefly attack on cotton, how do I control it?',
      'What is the right time for rice sowing?',
      'What is today\'s onion price in the market?',
      'Leaves are turning yellow due to nutrient deficiency, what fertilizer should I use?'
    ],
    'bn-IN': [
      'আমার গমের ফসলে হলুদ দাগ দেখা দিয়েছে, কী করব?',
      'টমেটো গাছ শুকিয়ে যাচ্ছে, সমস্যা কী হতে পারে?',
      'তুলায় সাদা মাছি আক্রমণ করেছে, কীভাবে রোধ করব?'
    ],
    'te-IN': [
      'నా గోధుమ పంటలో పసుపు మచ్చలు కనిపిస్తున్নాయి, ఏమి చేయాలి?',
      'టమాటో మొక్కలు వాడిపోతున్నాయి, సమస్య ఏమిటి?',
      'పత్తిలో తెల్ల ఈగలు దాడి చేస్తున్నాయి, ఎలా నియంత్రించాలి?'
    ]
  };
  
  const queries = sampleQueries[languageCode] || sampleQueries['en-IN'];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
  console.log(`🎤 Mock query: ${randomQuery}`);
  return randomQuery;
}

/**
 * Mock text-to-speech for testing without Google Cloud TTS API
 */
async function mockTextToSpeech(text, languageCode = 'hi-IN') {
  // Return a small audio buffer placeholder
  const audioData = new ArrayBuffer(1024);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
  return Buffer.from(audioData);
}

/**
 * Enhanced prompt for agricultural advice
 */
function createAgriculturalPrompt(userQuery, context, languageCode) {
  const language = {
    'hi-IN': 'Hindi',
    'en-IN': 'English',
    'bn-IN': 'Bengali',
    'te-IN': 'Telugu',
    'mr-IN': 'Marathi',
    'ta-IN': 'Tamil'
  }[languageCode] || 'English';
  
  return `You are "FarmMitra", an expert agricultural advisor with deep knowledge of Indian farming.

EXPERTISE AREAS:
🌾 Crops: Rice, Wheat, Cotton, Sugarcane, Vegetables, Fruits
🐛 Pest Control: Bollworm, Aphids, Fungal diseases, Bacterial infections  
💊 Treatments: Organic & chemical solutions with proper dosages
🌧️ Weather: Monsoon, drought, temperature management
💰 Economics: Market prices, government schemes, cost optimization

CONTEXT:
Location: ${context.location || 'India'} | Season: ${context.season || 'Current'} | Crop: ${context.crop || 'General'} | Experience: ${context.experience || 'Moderate'}

FARMER ASKS: "${userQuery}"

INSTRUCTIONS:
- Respond ONLY in ${language}
- Give specific, actionable advice
- Include quantities, timing, and costs
- Be encouraging and practical
- Keep response 80-120 words
- End with a helpful follow-up question

Respond as expert FarmMitra in ${language}:`;
}

/**
 * Process voice query using mock services (for testing)
 */
async function processMockVoiceQuery(audioBuffer, inputLanguage = 'hi-IN', context = {}) {
  try {
    console.log('🎤 Using mock voice processing for testing...');
    
    // Step 1: Mock speech-to-text
    const userQuery = await mockSpeechToText(audioBuffer, inputLanguage);
    console.log(`📝 Mock transcription: ${userQuery}`);
    
    // Step 2: Get AI response
    const enhancedPrompt = createAgriculturalPrompt(userQuery, context, inputLanguage);
    console.log('🤖 Getting AI response...');
    
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: enhancedPrompt
      });
      const aiResponse = result.text;
      console.log(`💬 AI Response: ${aiResponse}`);
      
      // Step 3: Mock text-to-speech
      const responseAudio = await mockTextToSpeech(aiResponse, inputLanguage);
      
      return {
        userQuery: userQuery,
        text: aiResponse,
        audio: responseAudio,
        language: inputLanguage,
        timestamp: new Date().toISOString(),
        isMock: true
      };
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Fallback response if AI fails
      const fallbackResponses = {
        'hi-IN': 'नमस्कार किसान भाई! मैं आपकी मदद करने के लिए यहाँ हूँ। कृपया अपने खेती से जुड़े सवाल पूछें। चाहे वो बीज, खाद, पानी, या कीड़े-मकोड़े की समस्या हो, मैं आपको सही सलाह दूंगा।',
        'en-IN': 'Hello farmer! I am here to help you with your farming questions. Please ask me about seeds, fertilizers, irrigation, pest control, or any other agricultural concerns you may have.',
        'bn-IN': 'নমস্কার কৃষক ভাই! আমি আপনার কৃষি সমস্যার সমাধানে সাহায্য করতে এসেছি। বীজ, সার, জল বা কীটপতঙ্গ নিয়ন্ত্রণ সম্পর্কে যে কোনো প্রশ্ন করুন।',
        'te-IN': 'నమస్కారం రైతు గారు! నేను మీ వ్యవసాయ సమస్యలకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను. విత్తనాలు, ఎరువులు, నీటిపారుదల లేదా కీటక నియంత్రణ గురించి ప్రశ్నలు అడగండి।'
      };
      
      const fallbackResponse = fallbackResponses[inputLanguage] || fallbackResponses['en-IN'];
      const responseAudio = await mockTextToSpeech(fallbackResponse, inputLanguage);
      
      return {
        userQuery: userQuery,
        text: fallbackResponse,
        audio: responseAudio,
        language: inputLanguage,
        timestamp: new Date().toISOString(),
        isMock: true
      };
    }
    
  } catch (error) {
    console.error('Mock voice processing error:', error);
    
    const errorMessages = {
      'hi-IN': 'नमस्कार! मैं आपका FarmMitra हूँ। अभी मैं डेमो मोड में काम कर रहा हूँ। कृपया Google Cloud APIs को सक्रिय करें पूरी सुविधा के लिए।',
      'en-IN': 'Hello! I am your FarmMitra. Currently working in demo mode. Please enable Google Cloud APIs for full functionality.',
      'bn-IN': 'নমস্কার! আমি আপনার FarmMitra। এখন আমি ডেমো মোডে কাজ করছি। সম্পূর্ণ কার্যকারিতার জন্য Google Cloud APIs সক্রিয় করুন।',
      'te-IN': 'నమస్కారం! నేను మీ FarmMitra. ప్రస్তుతం డెమో మోడ్‌లో పని చేస్తున్నాను. పూర్తి కార్యాచరణ కోసం Google Cloud APIs ని ప్రారంభించండి।'
    };
    
    const errorMessage = errorMessages[inputLanguage] || errorMessages['en-IN'];
    const errorAudio = await mockTextToSpeech(errorMessage, inputLanguage);
    
    return {
      userQuery: 'Sample question about farming',
      text: errorMessage,
      audio: errorAudio,
      language: inputLanguage,
      error: false, // Not actually an error, just demo mode
      timestamp: new Date().toISOString(),
      isMock: true
    };
  }
}

export {
  mockSpeechToText,
  mockTextToSpeech,
  processMockVoiceQuery
};
