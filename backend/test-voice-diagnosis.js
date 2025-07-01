// test-voice-diagnosis.js - Diagnose voice recognition issues
import fs from 'fs';
import path from 'path';
import { speechToText } from './utils/voiceAI.js';
import { processMockVoiceQuery } from './utils/mockVoiceAI.js';

async function diagnoseSpeechRecognition() {
  console.log('🔍 Diagnosing Voice Recognition Issues...\n');

  try {
    // Test 1: Check Google Cloud credentials
    console.log('1. Checking Google Cloud credentials...');
    const keyPath = './project-kisan-key.json';
    if (fs.existsSync(keyPath)) {
      console.log('✅ Service account key file found');
      
      const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      console.log(`   Project ID: ${keyData.project_id}`);
      console.log(`   Client Email: ${keyData.client_email}`);
      
      // Check if environment variable is set
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log(`✅ GOOGLE_APPLICATION_CREDENTIALS set to: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      } else {
        console.log('⚠️  GOOGLE_APPLICATION_CREDENTIALS not set');
        process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(keyPath);
        console.log(`   Setting it to: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      }
    } else {
      console.log('❌ Service account key file not found');
      console.log('   Expected location: ./project-kisan-key.json');
    }

    // Test 2: Create a simple audio buffer (simulate audio input)
    console.log('\n2. Creating test audio data...');
    
    // Create a minimal valid WebM audio buffer structure
    // This is just a placeholder - in real usage, this would be actual recorded audio
    const testAudioBuffer = Buffer.from([
      0x1A, 0x45, 0xDF, 0xA3, // EBML header
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, // Header size
      0x42, 0x86, 0x81, 0x01, // EBMLVersion = 1
      0x42, 0xF7, 0x81, 0x01, // EBMLReadVersion = 1
      0x42, 0xF2, 0x81, 0x04, // EBMLMaxIDLength = 4
      0x42, 0xF3, 0x81, 0x08, // EBMLMaxSizeLength = 8
      0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6D, // DocType = "webm"
      0x42, 0x87, 0x81, 0x02, // DocTypeVersion = 2
      0x42, 0x85, 0x81, 0x02  // DocTypeReadVersion = 2
    ]);
    
    console.log(`✅ Test audio buffer created (${testAudioBuffer.length} bytes)`);

    // Test 3: Try Google Cloud Speech-to-Text
    console.log('\n3. Testing Google Cloud Speech-to-Text...');
    try {
      const transcription = await speechToText(testAudioBuffer, 'en-IN', 'WEBM_OPUS', 48000);
      console.log(`✅ Speech-to-Text successful: "${transcription}"`);
    } catch (error) {
      console.log('❌ Speech-to-Text failed:');
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes('PERMISSION_DENIED')) {
        console.log('   🔧 Issue: Google Cloud Speech API is not enabled or permissions are insufficient');
        console.log('   Solution: Enable the Speech-to-Text API in Google Cloud Console');
      } else if (error.message.includes('INVALID_ARGUMENT')) {
        console.log('   🔧 Issue: Audio format or configuration problem');
        console.log('   Solution: The audio format might not be supported or the buffer is invalid');
      } else if (error.message.includes('UNAUTHENTICATED')) {
        console.log('   🔧 Issue: Authentication problem');
        console.log('   Solution: Check your service account key and credentials');
      }
    }

    // Test 4: Try mock voice processing as fallback
    console.log('\n4. Testing mock voice processing (fallback)...');
    try {
      const mockResult = await processMockVoiceQuery(testAudioBuffer, 'en-IN', {
        location: 'Test Location',
        season: 'Test Season',
        crop: 'Test Crop',
        experience: 'Test Experience'
      });
      
      console.log('✅ Mock voice processing successful:');
      console.log(`   Mock Query: "${mockResult.userQuery}"`);
      console.log(`   Mock Response: "${mockResult.text}"`);
      console.log(`   Audio Buffer Size: ${mockResult.audio.length} bytes`);
    } catch (error) {
      console.log('❌ Mock voice processing failed:');
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n📋 Diagnosis Summary:');
    console.log('🔧 Recommendations:');
    console.log('1. If Google Cloud APIs are not working, the system should automatically fall back to mock mode');
    console.log('2. Check that the voice route properly handles API failures and switches to mock processing');
    console.log('3. Ensure the frontend displays appropriate messages about demo/mock mode');
    console.log('4. Verify that audio recording is working properly in the browser');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

// Run the diagnosis
diagnoseSpeechRecognition();
