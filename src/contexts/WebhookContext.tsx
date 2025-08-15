import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Webhook Configuration and Validation
export const defaultWebhookConfig = {
  url: '',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

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

  validateHeaders: (headers: Record<string, string>) => {
    if (!headers || typeof headers !== 'object') {
      return { valid: true, message: 'Headers are optional' };
    }
    
    for (const [key, value] of Object.entries(headers)) {
      if (typeof key !== 'string' || typeof value !== 'string') {
        return { valid: false, message: 'Headers must be key-value string pairs' };
      }
    }
    
    return { valid: true, message: 'Valid headers' };
  },

  validateTimeout: (timeout: number) => {
    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum < 1000 || timeoutNum > 120000) {
      return { valid: false, message: 'Timeout must be between 1000ms and 120000ms' };
    }
    return { valid: true, message: 'Valid timeout' };
  },

  validateMethod: (method: string) => {
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (!validMethods.includes(method.toUpperCase())) {
      return { valid: false, message: 'Invalid HTTP method' };
    }
    return { valid: true, message: 'Valid HTTP method' };
  },

  validateRetries: (retries: number) => {
    const retriesNum = Number(retries);
    if (isNaN(retriesNum) || retriesNum < 0 || retriesNum > 10) {
      return { valid: false, message: 'Retries must be between 0 and 10' };
    }
    return { valid: true, message: 'Valid retry count' };
  },

  validateBody: (body: string) => {
    if (!body) return { valid: true, message: 'Body is optional' };
    
    try {
      JSON.parse(body);
      return { valid: true, message: 'Valid JSON body' };
    } catch (error) {
      return { valid: false, message: 'Body must be valid JSON' };
    }
  },
};

// Types
interface Webhook {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  body: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  lastStatus?: number;
  lastError?: string;
  triggerCount: number;
  successCount: number;
  failureCount: number;
  timeout: number;
  retries: number;
  retryDelay: number;
}

interface WebhookCreateData {
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  active?: boolean;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface WebhookTestResult {
  success: boolean;
  status?: number;
  error?: string;
  responseTime: number;
  timestamp: string;
}

interface WebhookStats {
  totalWebhooks: number;
  activeWebhooks: number;
  totalTriggers: number;
  successRate: number;
  averageResponseTime: number;
}

interface WebhookContextType {
  webhooks: Webhook[];
  addWebhook: (data: WebhookCreateData) => Promise<string>;
  updateWebhook: (id: string, data: Partial<WebhookCreateData>) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  toggleWebhook: (id: string) => Promise<void>;
  testWebhook: (webhook: Webhook) => Promise<WebhookTestResult>;
  triggerWebhooks: (message: string, user?: string) => Promise<void>;
  getWebhookStats: () => WebhookStats;
  validateWebhookData: (data: Partial<WebhookCreateData>) => { valid: boolean; errors: string[] };
  clearWebhookStats: (id: string) => Promise<void>;
  exportWebhooks: () => Promise<string>;
  importWebhooks: (data: string) => Promise<{ success: number; errors: string[] }>;
  isLoading: boolean;
  error: string | null;
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = '@app_webhooks';

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

  const validateWebhookData = (data: Partial<WebhookCreateData>) => {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Name is required');
    }

    if (data.url) {
      const urlValidation = webhookValidation.validateUrl(data.url);
      if (!urlValidation.valid) {
        errors.push(urlValidation.message);
      }
    } else {
      errors.push('URL is required');
    }

    if (data.method) {
      const methodValidation = webhookValidation.validateMethod(data.method);
      if (!methodValidation.valid) {
        errors.push(methodValidation.message);
      }
    }

    if (data.headers) {
      const headersValidation = webhookValidation.validateHeaders(data.headers);
      if (!headersValidation.valid) {
        errors.push(headersValidation.message);
      }
    }

    if (data.body) {
      const bodyValidation = webhookValidation.validateBody(data.body);
      if (!bodyValidation.valid) {
        errors.push(bodyValidation.message);
      }
    }

    if (data.timeout !== undefined) {
      const timeoutValidation = webhookValidation.validateTimeout(data.timeout);
      if (!timeoutValidation.valid) {
        errors.push(timeoutValidation.message);
      }
    }

    if (data.retries !== undefined) {
      const retriesValidation = webhookValidation.validateRetries(data.retries);
      if (!retriesValidation.valid) {
        errors.push(retriesValidation.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const addWebhook = async (data: WebhookCreateData): Promise<string> => {
    const validation = validateWebhookData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const now = new Date().toISOString();
    const newWebhook: Webhook = {
      id: generateId(),
      name: data.name.trim(),
      url: data.url,
      method: data.method || defaultWebhookConfig.method as 'POST',
      headers: data.headers || defaultWebhookConfig.headers,
      body: data.body || JSON.stringify({
        message: '{{message}}',
        user: '{{user}}',
        timestamp: '{{timestamp}}'
      }),
      active: data.active !== undefined ? data.active : true,
      timeout: data.timeout || defaultWebhookConfig.timeout,
      retries: data.retries || defaultWebhookConfig.retries,
      retryDelay: data.retryDelay || defaultWebhookConfig.retryDelay,
      createdAt: now,
      updatedAt: now,
      triggerCount: 0,
      successCount: 0,
      failureCount: 0,
    };

    const updatedWebhooks = [...webhooks, newWebhook];
    setWebhooks(updatedWebhooks);
    await saveWebhooks(updatedWebhooks);
    
    return newWebhook.id;
  };

  const updateWebhook = async (id: string, data: Partial<WebhookCreateData>): Promise<void> => {
    const validation = validateWebhookData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
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

  const testWebhook = async (webhook: Webhook): Promise<WebhookTestResult> => {
    const startTime = Date.now();
    
    try {
      const testData = {
        message: 'Test message from Neural AI',
        user: 'Test User',
        timestamp: new Date().toISOString(),
      };

      let body = webhook.body;
      body = body.replace(/\{\{message\}\}/g, testData.message);
      body = body.replace(/\{\{user\}\}/g, testData.user);
      body = body.replace(/\{\{timestamp\}\}/g, testData.timestamp);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: webhook.headers,
        body: webhook.method === 'GET' ? undefined : body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        success: response.ok,
        status: response.status,
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const triggerWebhook = async (webhook: Webhook, message: string, user?: string): Promise<void> => {
    if (!webhook.active) return;

    const startTime = Date.now();
    let attempt = 0;
    let success = false;

    while (attempt <= webhook.retries && !success) {
      try {
        let body = webhook.body;
        body = body.replace(/\{\{message\}\}/g, message);
        body = body.replace(/\{\{user\}\}/g, user || 'Anonymous');
        body = body.replace(/\{\{timestamp\}\}/g, new Date().toISOString());

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

        const response = await fetch(webhook.url, {
          method: webhook.method,
          headers: webhook.headers,
          body: webhook.method === 'GET' ? undefined : body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          success = true;
          // Update success stats
          const updatedWebhooks = webhooks.map(w => {
            if (w.id === webhook.id) {
              return {
                ...w,
                triggerCount: w.triggerCount + 1,
                successCount: w.successCount + 1,
                lastTriggered: new Date().toISOString(),
                lastStatus: response.status,
                lastError: undefined,
              };
            }
            return w;
          });
          setWebhooks(updatedWebhooks);
          await saveWebhooks(updatedWebhooks);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        attempt++;
        if (attempt <= webhook.retries) {
          await new Promise(resolve => setTimeout(resolve, webhook.retryDelay));
        } else {
          // Update failure stats
          const updatedWebhooks = webhooks.map(w => {
            if (w.id === webhook.id) {
              return {
                ...w,
                triggerCount: w.triggerCount + 1,
                failureCount: w.failureCount + 1,
                lastTriggered: new Date().toISOString(),
                lastError: error instanceof Error ? error.message : 'Unknown error',
              };
            }
            return w;
          });
          setWebhooks(updatedWebhooks);
          await saveWebhooks(updatedWebhooks);
        }
      }
    }
  };

  const triggerWebhooks = async (message: string, user?: string): Promise<void> => {
    const activeWebhooks = webhooks.filter(w => w.active);
    
    // Trigger all webhooks in parallel
    const promises = activeWebhooks.map(webhook => 
      triggerWebhook(webhook, message, user).catch(error => 
        console.error(`Webhook ${webhook.name} failed:`, error)
      )
    );

    await Promise.allSettled(promises);
  };

  const getWebhookStats = (): WebhookStats => {
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter(w => w.active).length;
    const totalTriggers = webhooks.reduce((sum, w) => sum + w.triggerCount, 0);
    const totalSuccesses = webhooks.reduce((sum, w) => sum + w.successCount, 0);
    const successRate = totalTriggers > 0 ? (totalSuccesses / totalTriggers) * 100 : 0;

    return {
      totalWebhooks,
      activeWebhooks,
      totalTriggers,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: 0, // Could be calculated from stored response times
    };
  };

  const clearWebhookStats = async (id: string): Promise<void> => {
    const updatedWebhooks = webhooks.map(webhook => {
      if (webhook.id === id) {
        return {
          ...webhook,
          triggerCount: 0,
          successCount: 0,
          failureCount: 0,
          lastTriggered: undefined,
          lastStatus: undefined,
          lastError: undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return webhook;
    });

    setWebhooks(updatedWebhooks);
    await saveWebhooks(updatedWebhooks);
  };

  const exportWebhooks = async (): Promise<string> => {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      webhooks: webhooks.map(({ triggerCount, successCount, failureCount, lastTriggered, lastStatus, lastError, ...webhook }) => webhook),
    };

    return JSON.stringify(exportData, null, 2);
  };

  const importWebhooks = async (data: string): Promise<{ success: number; errors: string[] }> => {
    try {
      const importData = JSON.parse(data);
      const errors: string[] = [];
      let successCount = 0;

      if (!importData.webhooks || !Array.isArray(importData.webhooks)) {
        throw new Error('Invalid import format');
      }

      const newWebhooks: Webhook[] = [];

      for (const webhookData of importData.webhooks) {
        try {
          const validation = validateWebhookData(webhookData);
          if (!validation.valid) {
            errors.push(`Webhook "${webhookData.name}": ${validation.errors.join(', ')}`);
            continue;
          }

          const now = new Date().toISOString();
          const webhook: Webhook = {
            id: generateId(),
            name: webhookData.name,
            url: webhookData.url,
            method: webhookData.method || 'POST',
            headers: webhookData.headers || defaultWebhookConfig.headers,
            body: webhookData.body || '{"message": "{{message}}"}',
            active: webhookData.active !== undefined ? webhookData.active : true,
            timeout: webhookData.timeout || defaultWebhookConfig.timeout,
            retries: webhookData.retries || defaultWebhookConfig.retries,
            retryDelay: webhookData.retryDelay || defaultWebhookConfig.retryDelay,
            createdAt: now,
            updatedAt: now,
            triggerCount: 0,
            successCount: 0,
            failureCount: 0,
          };

          newWebhooks.push(webhook);
          successCount++;
        } catch (error) {
          errors.push(`Webhook "${webhookData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (newWebhooks.length > 0) {
        const updatedWebhooks = [...webhooks, ...newWebhooks];
        setWebhooks(updatedWebhooks);
        await saveWebhooks(updatedWebhooks);
      }

      return { success: successCount, errors };
    } catch (error) {
      return { 
        success: 0, 
        errors: [error instanceof Error ? error.message : 'Failed to parse import data'] 
      };
    }
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
    validateWebhookData,
    clearWebhookStats,
    exportWebhooks,
    importWebhooks,
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