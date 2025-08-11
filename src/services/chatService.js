import { webhookService } from './webhookService';

class ChatService {
  constructor() {
    this.apiUrl = 'https://your-api-endpoint.com/api/chat';
    this.isConnected = false;
  }

  async sendMessage(message) {
    try {
      // Try webhook first if configured
      if (webhookService.isConfigured()) {
        return await webhookService.sendMessage(message);
      }

      // Fallback to demo response
      return await this.getDemoResponse(message);
    } catch (error) {
      console.error('Chat service error:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  async getDemoResponse(message) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const responses = [
      "Thanks for your message! This is a demo response.",
      "I understand your question. Here's how I can help...",
      "That's interesting! Let me think about that.",
      "I'm here to assist you with any questions you have.",
      "Great question! Here's what I think...",
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
    };
  }

  async testConnection() {
    try {
      // Test webhook connection
      if (webhookService.isConfigured()) {
        return await webhookService.testConnection();
      }
      return { success: true, message: 'Demo mode active' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export const chatService = new ChatService();