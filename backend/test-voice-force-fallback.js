// test-voice-force-fallback.js - Force test with mock fallback
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

async function testForcedFallback() {
  console.log('🧪 Testing Forced Mock Fallback...\n');

  try {
    // Reset the Google Cloud available cache first
    console.log('1. Resetting Google Cloud availability cache...');
    await axios.get(`${API_BASE_URL}/api/voice/status`);

    // Test the voice query endpoint with specific parameters that should trigger fallback
    console.log('2. Testing voice query endpoint with fallback scenario...');
    
    const formData = new FormData();
    // Use a very small audio buffer that should definitely fail speech recognition
    const testAudioBuffer = Buffer.from([0x00, 0x01, 0x02]);
    const audioBlob = new Blob([testAudioBuffer], { type: 'audio/webm;codecs=opus' });
    formData.append('audio', audioBlob, 'tiny-recording.webm');
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
      console.log('✅ Voice endpoint response received!');
      console.log(`   User Query: "${response.data.data.userQuery}"`);
      console.log(`   AI Response: "${response.data.data.response}"`);
      console.log(`   Language: ${response.data.data.language}`);
      console.log(`   Is Mock Mode: ${response.data.data.isMock}`);
      console.log(`   Has Audio: ${response.data.data.audio ? 'Yes' : 'No'}`);
      
      if (response.data.info) {
        console.log(`   Info: ${response.data.info}`);
      }
      
      if (response.data.warning) {
        console.log(`   Warning: ${response.data.warning}`);
      }

      // Check if we're getting a proper mock response
      if (response.data.data.isMock) {
        console.log('\n🎯 SUCCESS: Mock fallback is working correctly!');
      } else if (response.data.data.userQuery && response.data.data.userQuery.length > 0) {
        console.log('\n🎯 SUCCESS: Real speech recognition is working!');
      } else {
        console.log('\n⚠️ Issue: Neither mock nor real recognition is working properly');
      }
      
    } else {
      console.log('❌ Voice endpoint failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', error.response.data?.error || 'Unknown error');
    }
  }
}

// Run the test
testForcedFallback();
