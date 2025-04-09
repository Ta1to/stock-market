/**
 * API Configuration
 * Centralizes all API endpoints and keys in one place
 * Uses environment variables for sensitive information
 */

// Stock API configs
export const TWELVE_DATA_API = {
  BASE_URL: 'https://api.twelvedata.com',
  KEY: process.env.VUE_APP_TWELVE_DATA_API_KEY || '0bcd08147d344c59af873d72bd752c38' // Fallback for development
};

// Alpha Vantage API configs
export const ALPHA_VANTAGE_API = {
  BASE_URL: 'https://www.alphavantage.co/query',
  KEY: process.env.VUE_APP_ALPHA_VANTAGE_API_KEY || 'Y3MEMJTB2EGOJ0VS' // Fallback for development
};

//Marketaux API configs
export const MARKETAUX_API = {
  BASE_URL: 'https://api.marketaux.com/v1/news/all',
  KEY: process.env.VUE_APP_MARKETAUX_APIKEY || 'NJXVskMbqWHqAYFDwz8HJ6CHMf3R9A9V811IVDOd'//fallback for development
};

// Firebase configs
export const FIREBASE_CONFIG = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN || "stock-market-2e8d5.firebaseapp.com",
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL || "https://stock-market-2e8d5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID || "stock-market-2e8d5",
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET || "stock-market-2e8d5.firebasestorage.app",
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID || "949922389072",
  appId: process.env.VUE_APP_FIREBASE_APP_ID || "1:949922389072:web:6281cb9234d2a8ed584555",
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID || "G-X3FBBKH17Z"
};