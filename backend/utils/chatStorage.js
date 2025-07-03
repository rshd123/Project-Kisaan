// Simple in-memory storage for chat messages
// In a production environment, you would use a proper database

export class ChatStorage {
  constructor() {
    this.messages = [];
    this.maxMessages = 100; // Keep only last 100 messages
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      id: Date.now() + Math.random(),
      timestamp: new Date()
    });

    // Keep only the last maxMessages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    return this.messages[this.messages.length - 1];
  }

  getRecentMessages(count = 50) {
    return this.messages.slice(-count);
  }

  getAllMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}

export const chatStorage = new ChatStorage();
