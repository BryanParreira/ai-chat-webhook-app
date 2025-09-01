import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Webhook Configuration
export const defaultWebhookConfig = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'MobileApp/1.0',
  },
  timeout: 30000, // Increased for n8n responses
  retries: 2,
  retryDelay: 1000,
};

// Validation utilities
export const webhookValidation = {
  validateUrl: (url: string) => {
    if (!url) return { valid: false, message: 'URL is required' };
    
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, message: 'URL must use HTTP or HTTPS protocol' };
      }
      return { valid: true, message: 'Valid URL' };
    } catch (error) {
      return { valid: false, message: 'Invalid URL format' };
    }
  },

  isN8nUrl: (url: string) => {
    try {
      const urlObj = new URL(url);
      return url.includes('/webhook/') || 
             urlObj.hostname.includes('n8n') || 
             url.includes('/api/webhook/');
    } catch {
      return false;
    }
  },

  generateName: (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      if (hostname.includes('n8n')) {
        return 'n8n Workflow';
      } else if (hostname.includes('zapier')) {
        return 'Zapier Workflow';
      } else if (hostname.includes('make')) {
        return 'Make Workflow';
      } else if (hostname.includes('integromat')) {
        return 'Make Workflow';
      } else {
        return `Webhook (${hostname})`;
      }
    } catch {
      return 'My Webhook';
    }
  },
};

// Types
interface Webhook {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  body: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  lastStatus?: number;
  lastError?: string;
  lastResponse?: any;
  successCount: number;
  failureCount: number;
  timeout: number;
  retries: number;
}

interface WebhookCreateData {
  name?: string;
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  active?: boolean;
  timeout?: number;
  retries?: number;
}

interface WebhookTestResult {
  success: boolean;
  status?: number;
  error?: string;
  responseTime: number;
  timestamp: string;
  responseData?: any;
  testing?: boolean;
}

interface WebhookResponse {
  success: boolean;
  status?: number;
  responseData?: any;
  responseTime: number;
  error?: string;
}

interface WebhookStats {
  totalWebhooks: number;
  activeWebhooks: number;
  totalTriggers: number;
  successRate: number;
}

interface WebhookContextType {
  webhooks: Webhook[];
  addWebhook: (data: WebhookCreateData) => Promise<string>;
  updateWebhook: (id: string, data: Partial<WebhookCreateData>) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  toggleWebhook: (id: string) => Promise<void>;
  testWebhook: (webhook: Webhook | { id: string; url: string; method: string; headers: Record<string, string>; body: string; testPayload?: any }) => Promise<WebhookTestResult>;
  triggerWebhooks: (message: string, user?: string, channel?: string, messageId?: string) => Promise<WebhookResponse[]>;
  getWebhookStats: () => WebhookStats;
  isLoading: boolean;
  error: string | null;
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = '@app_webhooks_v3';

export const useWebhookContext = () => {
  const context = useContext(WebhookContext);
  if (!context) {
    throw new Error('useWebhookContext must be used within a WebhookProvider');
  }
  return context;
};

interface WebhookProviderProps {
  children: ReactNode;
}

export const WebhookProvider: React.FC<WebhookProviderProps> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedWebhooks = JSON.parse(stored);
        setWebhooks(parsedWebhooks);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
      setError('Failed to load webhooks');
    } finally {
      setIsLoading(false);
    }
  };

  const saveWebhooks = async (webhooksToSave: Webhook[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(webhooksToSave));
    } catch (error) {
      console.error('Error saving webhooks:', error);
      setError('Failed to save webhooks');
    }
  };

  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addWebhook = async (data: WebhookCreateData): Promise<string> => {
    const validation = webhookValidation.validateUrl(data.url);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const now = new Date().toISOString();
    const finalName = data.name?.trim() || webhookValidation.generateName(data.url);
    
    const newWebhook: Webhook = {
      id: generateId(),
      name: finalName,
      url: data.url.trim(),
      method: data.method || 'POST',
      headers: data.headers || defaultWebhookConfig.headers,
      body: data.body || JSON.stringify({
        message: '{{message}}',
        user: '{{user}}',
        timestamp: '{{timestamp}}',
        channel: '{{channel}}',
        messageId: '{{messageId}}',
        app: 'mobile'
      }, null, 2),
      active: data.active !== undefined ? data.active : true,
      timeout: data.timeout || defaultWebhookConfig.timeout,
      retries: data.retries || defaultWebhookConfig.retries,
      createdAt: now,
      updatedAt: now,
      successCount: 0,
      failureCount: 0,
    };

    const updatedWebhooks = [...webhooks, newWebhook];
    setWebhooks(updatedWebhooks);
    await saveWebhooks(updatedWebhooks);
    
    return newWebhook.id;
  };

  const updateWebhook = async (id: string, data: Partial<WebhookCreateData>): Promise<void> => {
    if (data.url) {
      const validation = webhookValidation.validateUrl(data.url);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
    }

    const updatedWebhooks = webhooks.map(webhook => {
      if (webhook.id === id) {
        return {
          ...webhook,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      return webhook;
    });

    setWebhooks(updatedWebhooks);
    await saveWebhooks(updatedWebhooks);
  };

  const deleteWebhook = async (id: string): Promise<void> => {
    const updatedWebhooks = webhooks.filter(webhook => webhook.id !== id);
    setWebhooks(updatedWebhooks);
    await saveWebhooks(updatedWebhooks);
  };

  const toggleWebhook = async (id: string): Promise<void> => {
    const updatedWebhooks = webhooks.map(webhook => {
      if (webhook.id === id) {
        return {
          ...webhook,
          active: !webhook.active,
          updatedAt: new Date().toISOString(),
        };
      }
      return webhook;
    });

    setWebhooks(updatedWebhooks);
    await saveWebhooks(updatedWebhooks);
  };

  const testWebhook = async (webhook: any): Promise<WebhookTestResult> => {
    const startTime = Date.now();
    
    try {
      const testData = webhook.testPayload || {
        message: 'Test message from your mobile app',
        user: 'TestUser',
        timestamp: new Date().toISOString(),
        channel: 'test-channel',
        messageId: `test-${Date.now()}`,
        app: 'mobile',
        test: true
      };

      let body = webhook.body;
      if (typeof body === 'string') {
        Object.keys(testData).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          body = body.replace(regex, testData[key]);
        });
      } else {
        body = JSON.stringify(testData);
      }

      console.log('Testing webhook:', {
        url: webhook.url,
        method: webhook.method,
        headers: webhook.headers,
        body: body
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout || 30000);

      const response = await fetch(webhook.url, {
        method: webhook.method || 'POST',
        headers: webhook.headers || { 'Content-Type': 'application/json' },
        body: body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // Get response data from n8n
      let responseData = null;
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }
        }
      } catch (error) {
        console.log('No response body or failed to parse');
      }

      const result = {
        success: response.ok,
        status: response.status,
        responseTime,
        timestamp: new Date().toISOString(),
        responseData: responseData
      };

      console.log('Webhook test result:', result);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        timestamp: new Date().toISOString(),
      };

      console.log('Webhook test error:', result);
      return result;
    }
  };

  const triggerWebhook = async (
    webhook: Webhook, 
    message: string, 
    user?: string, 
    channel?: string, 
    messageId?: string
  ): Promise<WebhookResponse> => {
    if (!webhook.active) {
      return { success: false, error: 'Webhook is inactive', responseTime: 0 };
    }

    let attempt = 0;
    let lastError = '';
    const startTime = Date.now();

    while (attempt <= webhook.retries) {
      try {
        const data = {
          message,
          user: user || 'Anonymous',
          timestamp: new Date().toISOString(),
          channel: channel || 'general',
          messageId: messageId || `msg-${Date.now()}`,
          app: 'mobile'
        };

        let body = webhook.body;
        Object.keys(data).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          body = body.replace(regex, data[key]);
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

        const response = await fetch(webhook.url, {
          method: webhook.method,
          headers: webhook.headers,
          body: body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        // Get response data from n8n (important for bidirectional communication)
        let responseData = null;
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              responseData = JSON.parse(responseText);
            } catch {
              responseData = responseText;
            }
          }
        } catch (error) {
          console.log('No response body from webhook');
        }

        if (response.ok) {
          // Update success stats
          const updatedWebhooks = webhooks.map(w => {
            if (w.id === webhook.id) {
              return {
                ...w,
                successCount: w.successCount + 1,
                lastTriggered: new Date().toISOString(),
                lastStatus: response.status,
                lastResponse: responseData,
                lastError: undefined,
              };
            }
            return w;
          });
          setWebhooks(updatedWebhooks);
          await saveWebhooks(updatedWebhooks);

          return {
            success: true,
            status: response.status,
            responseData: responseData,
            responseTime: responseTime
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        attempt++;
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (attempt <= webhook.retries) {
          await new Promise(resolve => setTimeout(resolve, webhook.retryDelay));
        }
      }
    }

    // Update failure stats
    const updatedWebhooks = webhooks.map(w => {
      if (w.id === webhook.id) {
        return {
          ...w,
          failureCount: w.failureCount + 1,
          lastTriggered: new Date().toISOString(),
          lastError: lastError,
        };
      }
      return w;
    });
    setWebhooks(updatedWebhooks);
    await saveWebhooks(updatedWebhooks);

    return {
      success: false,
      error: lastError,
      responseTime: Date.now() - startTime
    };
  };

  const triggerWebhooks = async (
    message: string, 
    user?: string, 
    channel?: string, 
    messageId?: string
  ): Promise<WebhookResponse[]> => {
    const activeWebhooks = webhooks.filter(w => w.active);
    
    // Trigger all webhooks and collect responses
    const promises = activeWebhooks.map(webhook => 
      triggerWebhook(webhook, message, user, channel, messageId)
    );

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Webhook ${activeWebhooks[index].name} failed:`, result.reason);
        return {
          success: false,
          error: result.reason?.message || 'Promise rejected',
          responseTime: 0
        };
      }
    });
  };

  const getWebhookStats = (): WebhookStats => {
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter(w => w.active).length;
    const totalTriggers = webhooks.reduce((sum, w) => sum + w.successCount + w.failureCount, 0);
    const totalSuccesses = webhooks.reduce((sum, w) => sum + w.successCount, 0);
    const successRate = totalTriggers > 0 ? (totalSuccesses / totalTriggers) * 100 : 0;

    return {
      totalWebhooks,
      activeWebhooks,
      totalTriggers,
      successRate: Math.round(successRate * 100) / 100,
    };
  };

  const contextValue: WebhookContextType = {
    webhooks,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    triggerWebhooks,
    getWebhookStats,
    isLoading,
    error,
  };

  return (
    <WebhookContext.Provider value={contextValue}>
      {children}
    </WebhookContext.Provider>
  );
};

// Utility hooks
export const useActiveWebhooks = () => {
  const { webhooks } = useWebhookContext();
  return webhooks.filter(w => w.active);
};

export const useWebhookStats = () => {
  const { getWebhookStats } = useWebhookContext();
  return getWebhookStats();
};

export { WebhookContext };
export default WebhookProvider;