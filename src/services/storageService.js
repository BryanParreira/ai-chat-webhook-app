import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  constructor() {
    this.keys = {
      WEBHOOK_CONFIG: '@chat_app_webhook_config',
      THEME: '@chat_app_theme',
      CHAT_HISTORY: '@chat_app_chat_history',
      USER_SETTINGS: '@chat_app_user_settings',
    };
  }

  async saveWebhookConfig(config) {
    try {
      await AsyncStorage.setItem(this.keys.WEBHOOK_CONFIG, JSON.stringify(config));
    } catch (error) {
      throw new Error('Failed to save webhook configuration');
    }
  }

  async getWebhookConfig() {
    try {
      const config = await AsyncStorage.getItem(this.keys.WEBHOOK_CONFIG);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error getting webhook config:', error);
      return null;
    }
  }

  async saveTheme(theme) {
    try {
      await AsyncStorage.setItem(this.keys.THEME, theme);
    } catch (error) {
      throw new Error('Failed to save theme');
    }
  }

  async getTheme() {
    try {
      return await AsyncStorage.getItem(this.keys.THEME);
    } catch (error) {
      console.error('Error getting theme:', error);
      return null;
    }
  }

  async saveChatHistory(messages) {
    try {
      await AsyncStorage.setItem(this.keys.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  async getChatHistory() {
    try {
      const history = await AsyncStorage.getItem(this.keys.CHAT_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(this.keys));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const storageService = new StorageService();