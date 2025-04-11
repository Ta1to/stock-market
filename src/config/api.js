/**
 * API Configuration
 * Centralizes all API endpoints and keys in one place
 * Uses environment variables for sensitive information
 */

// Stock API configs
export const TWELVE_DATA_API = {
  BASE_URL: 'https://api.twelvedata.com',
  KEY: process.env.VUE_APP_TWELVE_DATA_API_KEY
};

// Alpha Vantage API configs
export const ALPHA_VANTAGE_API = {
  BASE_URL: 'https://www.alphavantage.co/query',
  KEY: process.env.VUE_APP_ALPHA_VANTAGE_API_KEY
};

//Marketaux API configs
export const MARKETAUX_API = {
  BASE_URL: 'https://api.marketaux.com/v1/news/all',
  KEY: process.env.VUE_APP_MARKETAUX_APIKEY
};

// Firebase configs
export const FIREBASE_CONFIG = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
};