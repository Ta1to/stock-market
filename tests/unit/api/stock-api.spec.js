// First import the config for use in expectations
import { TWELVE_DATA_API } from '@/config/api';
import { stockList } from '@/utils/stock-list';

// Mock dependencies without functional implementations
jest.mock('axios');
jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn(),
  getUserErrorMessage: jest.fn()
}));

jest.mock('@/utils/stock-list', () => ({
  stockList: [
    { name: 'Apple Inc.', symbol: 'AAPL' },
    { name: 'Microsoft Corporation', symbol: 'MSFT' },
    { name: 'Amazon.com Inc.', symbol: 'AMZN' },
    { name: 'Alphabet Inc.', symbol: 'GOOGL' },
    { name: 'Tesla Inc.', symbol: 'TSLA' }
  ]
}));

// Import the modules under test after mocking dependencies
import axios from 'axios';
import { getRandomStock, getStockPrice, getStockHistory } from '@/api/stock-api';
import { logError, getUserErrorMessage } from '@/utils/errorUtils';

describe('Stock API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });

  describe('getRandomStock', () => {
    it('should return the requested number of random stocks', async () => {
      const amount = 3;
      // Mock Math.random to always return the same value for predictable tests
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // Will always pick the same stock

      const result = await getRandomStock(amount);

      expect(result.length).toBe(amount);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('symbol');
      
      // Reset Math.random
      Math.random = originalRandom;
    });

    it('should return different stocks when called multiple times', async () => {
      // For this test we'll use the real Math.random
      const result1 = await getRandomStock(1);
      
      // Mock Math.random to return a different value
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9);
      
      const result2 = await getRandomStock(1);
      
      // Reset Math.random
      Math.random = originalRandom;
      
      // Since we've mocked random to different values, the results should be different
      expect(result1[0].symbol === result2[0].symbol).toBe(false);
    });

    it('should return an empty array when 0 requested', async () => {
      const result = await getRandomStock(0);
      expect(result).toEqual([]);
    });

    it('should return stocks from the stockList', async () => {
      const amount = 1;
      // Mock Math.floor to return a specific index
      const originalFloor = Math.floor;
      Math.floor = jest.fn(() => 2); // Always return index 2
      
      const result = await getRandomStock(amount);
      
      expect(result[0]).toEqual({
        name: 'Amazon.com Inc.',
        symbol: 'AMZN'
      });
      
      // Reset Math.floor
      Math.floor = originalFloor;
    });
  });

  describe('getStockPrice', () => {
    it('should fetch the latest stock price', async () => {
      const mockResponse = {
        data: {
          values: [
            { datetime: '2025-04-12 12:00:00', open: '150.25', high: '151.00', low: '149.50', close: '150.75' }
          ]
        }
      };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await getStockPrice('AAPL');

      expect(axios.get).toHaveBeenCalledWith(`${TWELVE_DATA_API.BASE_URL}/time_series`, {
        params: {
          symbol: 'AAPL',
          interval: '1min',
          apikey: TWELVE_DATA_API.KEY,
        }
      });
      expect(result).toBe('150.25'); // Should be the 'open' value
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      error.response = { data: { message: 'Rate limit exceeded' } };
      axios.get.mockRejectedValueOnce(error);
      
      getUserErrorMessage.mockReturnValue('Rate limit exceeded');

      try {
        await getStockPrice('AAPL');
        fail('Should have thrown an error');
      } catch (e) {
        expect(e.message).toContain('Rate limit exceeded');
        expect(logError).toHaveBeenCalledWith(error, 'StockAPI:getStockPrice');
      }
    });

    it('should handle invalid response format', async () => {
      const mockResponse = { data: {} }; // Missing 'values' array
      axios.get.mockResolvedValueOnce(mockResponse);

      try {
        await getStockPrice('AAPL');
        fail('Should have thrown an error');
      } catch (e) {
        expect(e.message).toContain('Failed to get price for AAPL');
        expect(logError).toHaveBeenCalled();
      }
    });
  });

  describe('getStockHistory', () => {
    it('should fetch stock price history', async () => {
      const mockResponse = {
        data: {
          values: [
            { datetime: '2025-04-05', open: '150.25', high: '151.00', low: '149.50', close: '150.75' },
            { datetime: '2025-03-29', open: '148.50', high: '152.00', low: '148.00', close: '151.25' },
            { datetime: '2025-03-22', open: '147.75', high: '149.50', low: '147.00', close: '149.00' }
          ]
        }
      };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await getStockHistory('AAPL');

      expect(axios.get).toHaveBeenCalledWith(`${TWELVE_DATA_API.BASE_URL}/time_series`, {
        params: {
          symbol: 'AAPL',
          interval: '1day',
          outputsize: '30',
          apikey: TWELVE_DATA_API.KEY,
        }
      });
      
      // Check that dates and prices are returned correctly
      expect(result.dates).toEqual(['2025-03-22', '2025-03-29', '2025-04-05']);
      expect(result.prices).toEqual([149.0, 151.25, 150.75]);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      error.response = { data: { message: 'Invalid API key' } };
      axios.get.mockRejectedValueOnce(error);
      
      getUserErrorMessage.mockReturnValue('Invalid API key');

      const result = await getStockHistory('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'StockAPI');
      expect(result).toEqual({ dates: [], prices: [] });
    });

    it('should handle empty data', async () => {
      const mockResponse = { data: {} }; // Missing 'values' array
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await getStockHistory('AAPL');
      
      expect(logError).toHaveBeenCalled();
      expect(result).toEqual({ dates: [], prices: [] });
    });
  });
});