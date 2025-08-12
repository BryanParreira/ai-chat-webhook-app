export const validators = {
  required: (value, message = 'This field is required') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },

  email: (value, message = 'Invalid email address') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  url: (value, message = 'Invalid URL') => {
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Minimum ${min} characters required`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Maximum ${max} characters allowed`;
    }
    return null;
  },

  number: (value, message = 'Must be a valid number') => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  range: (min, max, message) => (value) => {
    const num = Number(value);
    if (value && (num < min || num > max)) {
      return message || `Value must be between ${min} and ${max}`;
    }
    return null;
  },
};