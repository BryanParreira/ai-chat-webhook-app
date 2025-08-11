import { storageService } from './storageService';

class WebhookService {
  constructor() {
    this.config = {
      url: null,
      apiKey: null,
      headers: {},
      timeout: 30000,
    };
    this.loadConfig();
  }

  async loadConfig() {
    try {
      const savedConfig = await storageService.getWebhookConfig();
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.log('Error loading webhook config:', error);
    }
  }

  async saveConfig(config) {
    try {
      this.config = { ...this.config, ...config };
      await storageService.saveWebhookConfig(this.config);
      return true;
    } catch (error) {
      console.error('Error saving webhook config:', error);
      throw new Error('Failed to save webhook configuration');
    }
  }

  isConfigured() {
    return Boolean(this.config.url);
  }

  async sendMessage(message) {
    if (!this.isConfigured()) {
      throw new Error('Webhook not configured');
    }

    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString(),
        }),
        timeout: this.config.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        message: data.message || data.response || 'No response from webhook',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new Error(`Webhook failed: ${error.message}`);
    }
  }

  async testConnection() {
    if (!this.isConfigured()) {
      throw new Error('Webhook not configured');
    }

    try {
      const response = await this.sendMessage('Connection test');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  getConfig() {
    return { ...this.config };
  }
}

export const webhookService = new WebhookService();