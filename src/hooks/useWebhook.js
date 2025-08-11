import { useState, useCallback } from 'react';
import { webhookService } from '../services/webhookService';

export const useWebhook = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');

    try {
      const result = await webhookService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'error');
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      setConnectionStatus('error');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (config) => {
    setIsLoading(true);
    setError(null);

    try {
      await webhookService.saveConfig(config);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getConfig = useCallback(() => {
    return webhookService.getConfig();
  }, []);

  return {
    isLoading,
    error,
    connectionStatus,
    testConnection,
    saveConfig,
    getConfig,
    isConfigured: webhookService.isConfigured(),
  };
};