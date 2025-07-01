// test-direct-functions.js - Test voice functions directly
import { processVoiceQuery } from './utils/voiceAI.js';
import { processMockVoiceQuery } from './utils/mockVoiceAI.js';

async function testDirectFunctions() {
  console.log('🧪 Testing Voice Functions Directly...\n');

  // Create test audio buffer
  const testAudioBuffer = Buffer.from([0x00, 0x01, 0x02]);
  const context = {
    location: 'Karnataka',
    season: 'Monsoon',
    crop: 'Tomato',
    experience: 'Beginner'
  };

  console.log('1. Testing processVoiceQuery (Google Cloud)...');
  try {
    const result1 = await processVoiceQuery(testAudioBuffer, 'en-IN', context);
    console.log('✅ processVoiceQuery result:');
    console.log(`   User Query: "${result1.userQuery}"`);
    console.log(`   AI Response: "${result1.text}"`);
    console.log(`   Has Error: ${result1.error || false}`);
    console.log(`   Is Mock: ${result1.isMock || false}`);
  } catch (error) {
    console.log('❌ processVoiceQuery failed:', error.message);
  }

  console.log('\n2. Testing processMockVoiceQuery...');
  try {
    const result2 = await processMockVoiceQuery(testAudioBuffer, 'en-IN', context);
    console.log('✅ processMockVoiceQuery result:');
    console.log(`   User Query: "${result2.userQuery}"`);
    console.log(`   AI Response: "${result2.text}"`);
    console.log(`   Has Error: ${result2.error || false}`);
    console.log(`   Is Mock: ${result2.isMock || false}`);
  } catch (error) {
    console.log('❌ processMockVoiceQuery failed:', error.message);
  }

  console.log('\n3. Testing with larger audio buffer...');
  const largerBuffer = Buffer.alloc(1024, 0);
  try {
    const result3 = await processMockVoiceQuery(largerBuffer, 'en-IN', context);
    console.log('✅ processMockVoiceQuery with larger buffer:');
    console.log(`   User Query: "${result3.userQuery}"`);
    console.log(`   AI Response: "${result3.text.substring(0, 100)}..."`);
    console.log(`   Is Mock: ${result3.isMock || false}`);
  } catch (error) {
    console.log('❌ processMockVoiceQuery with larger buffer failed:', error.message);
  }
}

testDirectFunctions();
