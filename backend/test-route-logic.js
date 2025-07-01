// test-route-logic.js - Test the route fallback logic
import { processVoiceQuery } from './utils/voiceAI.js';
import { processMockVoiceQuery } from './utils/mockVoiceAI.js';

async function testRouteLogic() {
  console.log('🧪 Testing Route Fallback Logic...\n');

  const testAudioBuffer = Buffer.from([0x00, 0x01, 0x02]);
  const language = 'en-IN';
  const context = {
    location: 'Karnataka',
    season: 'Monsoon',
    crop: 'Tomato',
    experience: 'Beginner'
  };

  console.log('1. Simulating the exact route logic...');
  
  let result;
  const isGoogleCloudAvailable = true; // Simulate that Google Cloud is available
  
  if (isGoogleCloudAvailable) {
    try {
      console.log('📡 Attempting Google Cloud processing...');
      // Use real Google Cloud services
      result = await processVoiceQuery(testAudioBuffer, language, context);
      console.log(`🎯 Google Cloud result - Query: "${result.userQuery}", Error: ${result.error || 'None'}`);
      
      // Check if the result contains an error (speech recognition failed)
      if (result.error) {
        console.log('⚠️ Google Cloud speech recognition failed, falling back to mock mode');
        console.log(`Error in result: ${result.text}`);
        // Fall back to mock implementation
        result = await processMockVoiceQuery(testAudioBuffer, language, context);
        result.isMock = true;
        console.log(`🎭 Mock result - Query: "${result.userQuery}"`);
      }
    } catch (error) {
      console.log('⚠️ Google Cloud processing failed, falling back to mock mode');
      console.log(`Error: ${error.message}`);
      // Fall back to mock implementation
      result = await processMockVoiceQuery(testAudioBuffer, language, context);
      result.isMock = true;
      console.log(`🎭 Mock result - Query: "${result.userQuery}"`);
    }
  } else {
    console.log('🎭 Using mock implementation (Google Cloud not available)');
    // Use mock implementation for testing
    result = await processMockVoiceQuery(testAudioBuffer, language, context);
    result.isMock = true;
    console.log(`🎭 Mock result - Query: "${result.userQuery}"`);
  }

  console.log('\n📊 Final Result:');
  console.log(`   User Query: "${result.userQuery}"`);
  console.log(`   AI Response: "${result.text.substring(0, 100)}..."`);
  console.log(`   Is Mock: ${result.isMock || false}`);
  console.log(`   Has Error: ${result.error || false}`);

  // Simulate the API response structure
  const response = {
    success: true,
    data: {
      userQuery: result.userQuery,
      response: result.text,
      language: result.language,
      timestamp: result.timestamp,
      audio: result.audio.toString('base64'),
      context: context,
      isMock: result.isMock || false
    }
  };

  if (result.error) {
    response.warning = 'Voice processing had issues, but response was generated';
  }

  if (result.isMock || !isGoogleCloudAvailable) {
    response.info = 'Using demo mode. Enable Google Cloud APIs for full functionality.';
  }

  console.log('\n🎯 Final API Response Structure:');
  console.log(`   Success: ${response.success}`);
  console.log(`   Is Mock: ${response.data.isMock}`);
  console.log(`   Has Warning: ${!!response.warning}`);
  console.log(`   Has Info: ${!!response.info}`);
}

testRouteLogic();
