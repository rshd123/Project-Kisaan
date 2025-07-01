// test-vertex-response.js - Test Vertex AI response structure
import { generativeModel } from './utils/vertex.js';

async function testVertexResponse() {
  try {
    console.log('Testing Vertex AI response structure...');
    
    const prompt = "Hello, how are you?";
    const result = await generativeModel.generateContent(prompt);
    
    console.log('Full result object:', JSON.stringify(result, null, 2));
    console.log('Response object:', JSON.stringify(result.response, null, 2));
    
    // Try different ways to access the text
    console.log('\nTrying different access methods:');
    
    try {
      console.log('Method 1 - result.response.text():', await result.response.text());
    } catch (e) {
      console.log('Method 1 failed:', e.message);
    }
    
    try {
      console.log('Method 2 - result.response.text:', result.response.text);
    } catch (e) {
      console.log('Method 2 failed:', e.message);
    }
    
    try {
      console.log('Method 3 - result.response.candidates[0].content.parts[0].text:', 
        result.response.candidates[0].content.parts[0].text);
    } catch (e) {
      console.log('Method 3 failed:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testVertexResponse();
