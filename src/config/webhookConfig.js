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
  validateUrl: (url) => {
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

  validateHeaders: (headers) => {
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

  validateTimeout: (timeout) => {
    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum < 1000 || timeoutNum > 120000) {
      return { valid: false, message: 'Timeout must be between 1000ms and 120000ms' };
    }
    return { valid: true, message: 'Valid timeout' };
  },
};