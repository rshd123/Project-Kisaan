// test-voice-endpoint.js - Test the complete voice endpoint flow
import axios from 'axios';
import fs from 'fs';

const API_BASE_URL = 'http://localhost:5000';

async function testVoiceEndpoint() {
  console.log('🧪 Testing Complete Voice Endpoint Flow...\n');

  try {
    // Create a small test audio file (simulating a user recording)
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

    // Test the voice query endpoint
    console.log('1. Testing voice query endpoint...');
    
    const formData = new FormData();
    const audioBlob = new Blob([testAudioBuffer], { type: 'audio/webm;codecs=opus' });
    formData.append('audio', audioBlob, 'test-recording.webm');
    formData.append('language', 'en-IN');
    formData.append('location', 'Karnataka');
    formData.append('season', 'Monsoon');
    formData.append('crop', 'Tomato');
    formData.append('experience', 'Beginner');

    const response = await axios.post(`${API_BASE_URL}/api/voice/query`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000
    });

    if (response.data.success) {
      console.log('✅ Voice endpoint working successfully!');
      console.log(`   User Query: "${response.data.data.userQuery}"`);
      console.log(`   AI Response: "${response.data.data.response}"`);
      console.log(`   Language: ${response.data.data.language}`);
      console.log(`   Audio Size: ${response.data.data.audio.length} characters (base64)`);
      console.log(`   Is Mock Mode: ${response.data.data.isMock}`);
      
      if (response.data.info) {
        console.log(`   Info: ${response.data.info}`);
      }
      
      if (response.data.warning) {
        console.log(`   Warning: ${response.data.warning}`);
      }
      
      console.log('\n🎯 This confirms the voice system is working in demo mode!');
      console.log('   Users will receive helpful agricultural advice even without Google Cloud APIs.');
    } else {
      console.log('❌ Voice endpoint failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testVoiceEndpoint();
