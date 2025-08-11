const ENV = {
  development: {
    API_URL: "http://localhost:3000/api",
    WEBHOOK_TIMEOUT: 30000,
    DEBUG: true,
  },
  production: {
    API_URL: "https://your-production-api.com/api",
    WEBHOOK_TIMEOUT: 30000,
    DEBUG: false,
  },
};

const currentEnv = __DEV__ ? "development" : "production";

export const config = ENV[currentEnv];

export const apiConfig = {
  timeout: config.WEBHOOK_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "ChatApp/1.0",
  },
};
