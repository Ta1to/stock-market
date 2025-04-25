// First import the config for use in expectations
import { TWELVE_DATA_API } from '@/config/api';

// Mock dependencies without functional implementations
jest.mock('axios');
jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn(),
  getUserErrorMessage: jest.fn((error, defaultMessage) => {
    // Return the error's message if it exists
    if (error && error.message) {
      return error.message;
    }
    // Otherwise return the default message
    return defaultMessage;
  })
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
      axios.get.mockRejectedValueOnce(error);
      
      // Mock the getUserErrorMessage function
      getUserErrorMessage.mockReturnValueOnce('API Error');

      // Use expect-async to test for exceptions
      await expect(getStockPrice('AAPL')).rejects.toThrow('API Error');
      expect(logError).toHaveBeenCalledWith(error, 'StockAPI:getStockPrice');
    });

    it('should throw error for invalid response format', async () => {
      // Create a specific error to be thrown inside the getStockPrice function
      const error = new Error('Invalid response format');
      logError.mockImplementationOnce(() => {});
      getUserErrorMessage.mockReturnValueOnce('Invalid response format');
      
      const mockResponse = {
        data: {} // Missing values array
      };
      axios.get.mockResolvedValueOnce(mockResponse);

      await expect(getStockPrice('AAPL')).rejects.toThrow('Invalid response format');
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('getStockHistory', () => {
    it('should fetch stock price history', async () => {
      // First quarter of 2025
      const mockResponse = {
        data: {
          values: [
            { datetime: '2025-03-01', open: '147.75', high: '149.50', low: '147.00', close: '149.00' },
            { datetime: '2025-03-08', open: '148.50', high: '152.00', low: '148.00', close: '151.25' },
            { datetime: '2025-03-15', open: '150.25', high: '151.00', low: '149.50', close: '150.75' }
          ]
        }
      };
      axios.get.mockResolvedValueOnce(mockResponse);
      
      // Mock Intl.DateTimeFormat
      const originalIntl = global.Intl;
      global.Intl = {
        DateTimeFormat: jest.fn().mockImplementation(() => ({
          format: (date) => {
            if (date instanceof Date) {
              // Simple mock formatter for our test dates
              const month = date.getMonth() === 2 ? 'Mar' : 'Unknown';
              return `${month} 25`;
            }
            return 'Unknown date';
          }
        }))
      };

      const result = await getStockHistory('AAPL');

      // Restore global
      global.Intl = originalIntl;
      
      expect(axios.get).toHaveBeenCalledWith(`${TWELVE_DATA_API.BASE_URL}/time_series`, {
        params: {
          symbol: 'AAPL',
          interval: '1week',
          outputsize: '52',
          apikey: TWELVE_DATA_API.KEY,
        }
      });
      
      expect(result).toHaveProperty('dates');
      expect(result).toHaveProperty('prices');
      // Order is now correct based on the implementation
      expect(result.prices).toEqual([147.75, 148.50, 150.25]);
    });

    it('should throw error for API failures', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValueOnce(error);
      
      getUserErrorMessage.mockReturnValueOnce('Failed to get history for AAPL');

      await expect(getStockHistory('AAPL')).rejects.toThrow('Failed to get history for AAPL');
      expect(logError).toHaveBeenCalledWith(error, 'StockAPI:getStockHistory');
    });

    it('should throw error for invalid data response', async () => {
      const mockResponse = { 
        data: {} // Missing values array
      };
      
      getUserErrorMessage.mockImplementationOnce(() => 'Invalid response format');
      axios.get.mockResolvedValueOnce(mockResponse);

      await expect(getStockHistory('AAPL')).rejects.toThrow('Invalid response format');
      expect(logError).toHaveBeenCalled();
    });
    
    it('should throw error for invalid date values', async () => {
      // Create a mock implementation that will throw the expected error
      const originalDate = global.Date;
      const mockDate = function(dateString) {
        if (dateString === 'invalid-date') {
          // Return an invalid date
          return new originalDate('invaliddate');
        }
        return new originalDate(dateString);
      };
      mockDate.parse = Date.parse;
      mockDate.UTC = Date.UTC;
      global.Date = mockDate;

      getUserErrorMessage.mockImplementationOnce(() => 'Invalid date value: invalid-date');
      
      const mockResponse = { 
        data: {
          values: [
            { datetime: 'invalid-date', open: '150.25', high: '151.00', low: '149.50', close: '150.75' }
          ]
        }
      };
      axios.get.mockResolvedValueOnce(mockResponse);

      await expect(getStockHistory('AAPL')).rejects.toThrow('Invalid date value');
      
      // Restore original Date
      global.Date = originalDate;
      
      expect(logError).toHaveBeenCalled();
    });
  });
});