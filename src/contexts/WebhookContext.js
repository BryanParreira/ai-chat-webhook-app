import React, { createContext, useContext, useState } from 'react';

const WebhookContext = createContext();

export const WebhookProvider = ({ children }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const connectWebhook = (url, key) => {
    setWebhookUrl(url);
    setApiKey(key);
    setIsConnected(true);
  };

  const disconnectWebhook = () => {
    setWebhookUrl('');
    setApiKey('');
    setIsConnected(false);
  };

  return (
    <WebhookContext.Provider
      value={{
        webhookUrl,
        setWebhookUrl,
        isConnected,
        setIsConnected,
        apiKey,
        setApiKey,
        connectWebhook,
        disconnectWebhook,
      }}
    >
      {children}
    </WebhookContext.Provider>
  );
};

export const useWebhook = () => {
  const context = useContext(WebhookContext);
  if (!context) {
    throw new Error('useWebhook must be used within a WebhookProvider');
  }
  return context;
};