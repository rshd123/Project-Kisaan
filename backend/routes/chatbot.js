import express from 'express';
import { generativeModel, firestore } from '../utils/vertex.js';

const router = express.Router();

// Start or continue chat conversation
router.post('/chat', async (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }
  
  try {
    console.log(`Processing chat for user: ${userId}`);
    console.log(`Project ID: ${process.env.PROJECT_ID}`);
    
    // 1. Get existing conversation history from Firestore
    console.log('Attempting to access conversations collection...');
    const conversationRef = firestore.collection('conversations').doc(userId);
    console.log(`Document reference created for: ${userId}`);
    
    const doc = await conversationRef.get();
    console.log(`Document fetch result - exists: ${doc.exists}`);
    
    let chatHistory = [];
    if (doc.exists) {
      chatHistory = doc.data().messages || [];
      console.log(`Found ${chatHistory.length} previous messages`);
    } else {
      console.log('Starting new conversation');
    }
    
    // 2. Add current user message to history
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    chatHistory.push(userMessage);
    
    // 3. Prepare conversation context for AI (last 10 messages for efficiency)
    const recentMessages = chatHistory.slice(-10);
    
    // Build context string from history
    const conversationContext = recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    // 4. Generate AI response with conversation context
    const prompt = `You are a helpful farming assistant for Karnataka farmers. You speak both English and Kannada.

Previous conversation:
${conversationContext}

Current question: ${message}

Instructions:
- Provide clear, well-formatted responses
- Use bullet points for lists
- Keep responses concise but informative
- Format your response with proper line breaks for readability
- Avoid repeating information unnecessarily
- Focus on practical farming advice

Please respond naturally, considering our conversation history. If this is a follow-up question, reference previous topics discussed.`;

    const result = await generativeModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });
    
    let aiResponse = result.response.candidates[0].content.parts[0].text;
    
    // Clean up the response to remove any potential duplicates or formatting issues
    aiResponse = aiResponse
      .replace(/(.+)\1+/g, '$1')  // Remove immediate duplicates
      .replace(/\n{3,}/g, '\n\n') // Limit multiple line breaks
      .trim();
    
    console.log('AI response generated and cleaned');
    
    // 5. Add AI response to history
    const aiMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    chatHistory.push(aiMessage);
    
    // 6. Save updated conversation back to Firestore
    console.log('Attempting to save conversation to Firestore...');
    console.log('Data to save:', {
      userId: userId,
      messageCount: chatHistory.length,
      hasMessages: chatHistory.length > 0
    });
    
    await conversationRef.set({
      userId: userId,
      messages: chatHistory,
      lastUpdated: new Date(),
      messageCount: chatHistory.length
    });
    
    console.log('✅ Conversation saved to Firestore successfully');
    
    res.json({ 
      success: true,
      response: aiResponse, 
      conversationId: userId,
      messageCount: chatHistory.length,
      isNewConversation: !doc.exists
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat', 
      details: error.message 
    });
  }
});

// Get full conversation history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Getting history for user: ${userId}`);
    
    const doc = await firestore.collection('conversations').doc(userId).get();
    
    if (doc.exists) {
      const data = doc.data();
      res.json({ 
        success: true,
        history: data.messages || [],
        messageCount: data.messageCount || 0,
        lastUpdated: data.lastUpdated
      });
    } else {
      res.json({ 
        success: true,
        history: [],
        messageCount: 0,
        message: 'No conversation history found'
      });
    }
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      error: 'Failed to get conversation history',
      details: error.message 
    });
  }
});

// Clear conversation history
router.delete('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await firestore.collection('conversations').doc(userId).delete();
    
    res.json({ 
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to clear history',
      details: error.message 
    });
  }
});

// Get recent conversations for a user
router.get('/recent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    const doc = await firestore.collection('conversations').doc(userId).get();
    
    if (doc.exists) {
      const messages = doc.data().messages || [];
      const recentMessages = messages.slice(-limit * 2); // Get last few exchanges
      
      res.json({ 
        success: true,
        recentMessages,
        totalMessages: messages.length
      });
    } else {
      res.json({ 
        success: true,
        recentMessages: [],
        totalMessages: 0
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get recent messages',
      details: error.message 
    });
  }
});

// Test Firestore connection and collection creation
router.get('/test-firestore', async (req, res) => {
  try {
    console.log('Testing Firestore connection and collection creation...');
    
    // Test 1: Simple write to conversations collection
    const testUserId = 'test-user-' + Date.now();
    const conversationRef = firestore.collection('conversations').doc(testUserId);
    
    console.log('Attempting to write to conversations collection...');
    await conversationRef.set({
      userId: testUserId,
      messages: [{
        role: 'user',
        content: 'Test message',
        timestamp: new Date()
      }],
      lastUpdated: new Date(),
      messageCount: 1,
      isTest: true
    });
    
    console.log('✅ Successfully wrote to conversations collection');
    
    // Test 2: Read back the data
    const doc = await conversationRef.get();
    if (doc.exists) {
      console.log('✅ Successfully read from conversations collection');
      const data = doc.data();
      
      res.json({
        success: true,
        message: 'Firestore conversations collection working!',
        testData: data,
        docId: testUserId
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Could not read back the test document'
      });
    }
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Firestore test failed',
      details: error.message,
      code: error.code
    });
  }
});

export default router;
