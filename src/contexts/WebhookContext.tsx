import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Webhook {
  id: string;
  name: string;
  url: string;
  method: string;
  headers: string;
  body: string;
  active: boolean;
  createdAt: string;
}

interface WebhookContextType {
  webhooks: Webhook[];
  addWebhook: (webhook: Omit<Webhook, 'id' | 'createdAt'>) => void;
  updateWebhook: (id: string, updates: Partial<Webhook>) => void;
  deleteWebhook: (id: string) => void;
  testWebhook: (webhook: Webhook) => Promise<{ success: boolean; status?: number; error?: string }>;
  isLoading: boolean;
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      const saved = await AsyncStorage.getItem('chatApp_webhooks');
      if (saved) {
        const parsedWebhooks = JSON.parse(saved);
        setWebhooks(parsedWebhooks);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWebhooks = async (newWebhooks: Webhook[]) => {
    try {
      setWebhooks(newWebhooks);
      await AsyncStorage.setItem('chatApp_webhooks', JSON.stringify(newWebhooks));
    } catch (error) {
      console.error('Failed to save webhooks:', error);
    }
  };

  const addWebhook = (webhook: Omit<Webhook, 'id' | 'createdAt'>) => {
    const newWebhook: Webhook = {
      ...webhook,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    saveWebhooks([...webhooks, newWebhook]);
  };

  const updateWebhook = (id: string, updates: Partial<Webhook>) => {
    const updated = webhooks.map(w => w.id === id ? { ...w, ...updates } : w);
    saveWebhooks(updated);
  };

  const deleteWebhook = (id: string) => {
    saveWebhooks(webhooks.filter(w => w.id !== id));
  };

  const testWebhook = async (webhook: Webhook): Promise<{ success: boolean; status?: number; error?: string }> => {
    try {
      // Parse headers safely
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (webhook.headers) {
        try {
          const parsedHeaders = JSON.parse(webhook.headers);
          headers = { ...headers, ...parsedHeaders };
        } catch (headerError) {
          console.warn('Failed to parse webhook headers:', headerError);
        }
      }

      // Parse body safely
      let body = JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
      });

      if (webhook.body) {
        try {
          const parsedBody = JSON.parse(webhook.body);
          body = JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            ...parsedBody,
          });
        } catch (bodyError) {
          console.warn('Failed to parse webhook body:', bodyError);
        }
      }

      const response = await fetch(webhook.url, {
        method: webhook.method || 'POST',
        headers,
        body: webhook.method.toUpperCase() === 'GET' ? undefined : body,
      });

      return { 
        success: response.ok, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const contextValue: WebhookContextType = {
    webhooks,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    isLoading,
  };

  return (
    <WebhookContext.Provider value={contextValue}>
      {children}
    </WebhookContext.Provider>
  );
};

export { WebhookContext };
export default WebhookProvider;