// test-voice.js - Test voice AI functionality
import { processVoiceQuery, textToSpeech, speechToText, SUPPORTED_LANGUAGES } from './utils/voiceAI.js';
import fs from 'fs';
import path from 'path';

async function testVoiceAI() {
  console.log('🧪 Testing Voice AI functionality...\n');

  try {
    // Test 1: Text-to-Speech
    console.log('🔊 Test 1: Text-to-Speech');
    const testText = "नमस्कार किसान भाई! मैं आपका कृषि सहायक हूं। आप मुझसे खेती के बारे में कुछ भी पूछ सकते हैं।";
    console.log(`Text: ${testText}`);
    
    const audioBuffer = await textToSpeech(testText, 'hi-IN');
    console.log(`✅ Generated audio buffer of ${audioBuffer.length} bytes`);
    
    // Save test audio file
    const audioPath = path.join(process.cwd(), 'test_tts.mp3');
    fs.writeFileSync(audioPath, audioBuffer);
    console.log(`💾 Saved test audio to: ${audioPath}\n`);

    // Test 2: Supported Languages
    console.log('🌍 Test 2: Supported Languages');
    console.log(`Total languages supported: ${Object.keys(SUPPORTED_LANGUAGES).length}`);
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, name]) => {
      console.log(`  ${code}: ${name}`);
    });
    console.log('');

    // Test 3: Voice Query Processing (simulated)
    console.log('🤖 Test 3: Voice Query Processing (simulated)');
    const mockContext = {
      location: 'Punjab',
      season: 'Rabi',
      crop: 'Wheat',
      experience: 'Experienced'
    };

    // Create a mock audio buffer (in real scenario, this would be actual audio)
    const mockAudioBuffer = Buffer.from('mock audio data');
    console.log('Context:', mockContext);
    console.log('⚠️  Note: This would normally process actual audio, but we\'re using mock data for testing');

    // Test 4: Error Handling
    console.log('\n🚨 Test 4: Error Handling');
    try {
      await speechToText(Buffer.from('invalid audio'), 'hi-IN');
    } catch (error) {
      console.log(`✅ Error handling works: ${error.message}`);
    }

    // Test 5: Multi-language TTS
    console.log('\n🗣️  Test 5: Multi-language Text-to-Speech');
    const testPhrases = {
      'hi-IN': 'आपकी फसल कैसी है?',
      'en-IN': 'How is your crop?',
      'bn-IN': 'আপনার ফসল কেমন?',
      'te-IN': 'మీ పంట ఎలా ఉంది?'
    };

    for (const [lang, text] of Object.entries(testPhrases)) {
      try {
        const audio = await textToSpeech(text, lang);
        console.log(`✅ ${SUPPORTED_LANGUAGES[lang]}: Generated ${audio.length} bytes`);
        
        // Save sample for each language
        const langAudioPath = path.join(process.cwd(), `test_${lang}.mp3`);
        fs.writeFileSync(langAudioPath, audio);
      } catch (error) {
        console.log(`❌ ${SUPPORTED_LANGUAGES[lang]}: ${error.message}`);
      }
    }

    console.log('\n🎉 Voice AI testing completed!');
    console.log('\nNext steps:');
    console.log('1. Start your backend server: npm run dev');
    console.log('2. Test the voice endpoints using the frontend');
    console.log('3. Make sure your Google Cloud credentials are properly configured');
    console.log('4. Test with real audio recordings from different languages');

  } catch (error) {
    console.error('❌ Voice AI test failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Google Cloud credentials');
    console.log('2. Ensure Speech-to-Text and Text-to-Speech APIs are enabled');
    console.log('3. Verify your project ID and location in .env file');
    console.log('4. Make sure you have the required packages installed');
  }
}

// Run the test
testVoiceAI();
