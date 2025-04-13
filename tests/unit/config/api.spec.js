import { 
  TWELVE_DATA_API, 
  ALPHA_VANTAGE_API, 
  MARKETAUX_API, 
  FIREBASE_CONFIG 
} from '@/config/api';

// Mock the api.js module
jest.mock('@/config/api', () => ({
  TWELVE_DATA_API: {
    BASE_URL: 'https://api.twelvedata.com',
    KEY: 'mock-twelve-data-key'
  },
  ALPHA_VANTAGE_API: {
    BASE_URL: 'https://www.alphavantage.co/query',
    KEY: 'mock-alpha-vantage-key'
  },
  MARKETAUX_API: {
    BASE_URL: 'https://api.marketaux.com/v1/news/all',
    KEY: 'mock-marketaux-key'
  },
  FIREBASE_CONFIG: {
    apiKey: 'mock-firebase-api-key',
    authDomain: 'mock-domain.firebaseapp.com',
    databaseURL: 'https://mock-database.firebaseio.com',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-messaging-sender-id',
    appId: 'mock-app-id'
  }
}));

describe('API Configuration', () => {
  describe('TWELVE_DATA_API', () => {
    it('should have the correct structure', () => {
      expect(TWELVE_DATA_API).toBeDefined();
      expect(TWELVE_DATA_API.BASE_URL).toBe('https://api.twelvedata.com');
      expect(TWELVE_DATA_API.KEY).toBe('mock-twelve-data-key');
    });
  });
  
  describe('ALPHA_VANTAGE_API', () => {
    it('should have the correct structure', () => {
      expect(ALPHA_VANTAGE_API).toBeDefined();
      expect(ALPHA_VANTAGE_API.BASE_URL).toBe('https://www.alphavantage.co/query');
      expect(ALPHA_VANTAGE_API.KEY).toBe('mock-alpha-vantage-key');
    });
  });
  
  describe('MARKETAUX_API', () => {
    it('should have the correct structure', () => {
      expect(MARKETAUX_API).toBeDefined();
      expect(MARKETAUX_API.BASE_URL).toBe('https://api.marketaux.com/v1/news/all');
      expect(MARKETAUX_API.KEY).toBe('mock-marketaux-key');
    });
  });
  
  describe('FIREBASE_CONFIG', () => {
    it('should have the correct structure', () => {
      expect(FIREBASE_CONFIG).toBeDefined();
      expect(FIREBASE_CONFIG.apiKey).toBe('mock-firebase-api-key');
      expect(FIREBASE_CONFIG.authDomain).toBe('mock-domain.firebaseapp.com');
      expect(FIREBASE_CONFIG.databaseURL).toBe('https://mock-database.firebaseio.com');
      expect(FIREBASE_CONFIG.projectId).toBe('mock-project-id');
      expect(FIREBASE_CONFIG.storageBucket).toBe('mock-storage-bucket');
      expect(FIREBASE_CONFIG.messagingSenderId).toBe('mock-messaging-sender-id');
      expect(FIREBASE_CONFIG.appId).toBe('mock-app-id');
    });
  });
});