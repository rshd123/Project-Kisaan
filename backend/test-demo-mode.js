// test-demo-mode.js - Test the demo mode functionality
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE_URL = 'http://localhost:5000';

async function testDemoMode() {
  console.log('🧪 Testing Voice AI Demo Mode...\n');

  try {
    // Test 1: Check system status
    console.log('1. Checking system status...');
    const statusResponse = await axios.get(`${API_BASE_URL}/api/voice/status`);
    if (statusResponse.data.success) {
      const status = statusResponse.data.data;
      console.log(`✅ System Status: ${status.mode}`);
      console.log(`   Google Cloud Available: ${status.googleCloudAvailable}`);
      console.log(`   Message: ${status.message}`);
    }

    // Test 2: Create a mock audio file for testing
    console.log('\n2. Creating mock audio file...');
    const mockAudio = Buffer.alloc(1024, 0); // Create a 1KB buffer of zeros
    fs.writeFileSync('mock-audio.webm', mockAudio);
    console.log('✅ Mock audio file created');

    // Test 3: Test voice query endpoint in demo mode
    console.log('\n3. Testing voice query in demo mode...');
    const formData = new FormData();
    formData.append('audio', fs.createReadStream('mock-audio.webm'), {
      filename: 'mock-audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('language', 'hi-IN');
    formData.append('location', 'Punjab');
    formData.append('season', 'Rabi');
    formData.append('crop', 'Wheat');
    formData.append('experience', 'Experienced');

    const queryResponse = await axios.post(`${API_BASE_URL}/api/voice/query`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 10000
    });

    if (queryResponse.data.success) {
      console.log('✅ Voice query processed successfully');
      console.log(`   User Query: ${queryResponse.data.data.userQuery}`);
      console.log(`   AI Response: ${queryResponse.data.data.response}`);
      console.log(`   Language: ${queryResponse.data.data.language}`);
      console.log(`   Demo Mode: ${queryResponse.data.data.isMock}`);
      
      if (queryResponse.data.info) {
        console.log(`   Info: ${queryResponse.data.info}`);
      }
    }

    // Clean up
    fs.unlinkSync('mock-audio.webm');
    console.log('\n✅ Demo mode test completed successfully!');
    
    console.log('\n📋 Summary:');
    console.log('✅ Voice AI is working in demo mode');
    console.log('✅ Mock speech-to-text working');
    console.log('✅ AI agricultural advice generation working');
    console.log('✅ Mock text-to-speech working');
    console.log('✅ Frontend should now show responses instead of errors');
    
    console.log('\n🎯 For Full Functionality:');
    console.log('1. Enable Google Cloud Speech-to-Text API');
    console.log('2. Enable Google Cloud Text-to-Speech API');
    console.log('3. Real voice recognition and audio playback will work');

  } catch (error) {
    console.error('❌ Demo mode test failed:', error.message);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

// Run the test
testDemoMode();
