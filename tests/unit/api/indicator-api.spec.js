// Mock dependencies without functional implementations
jest.mock('axios');
jest.mock('@/config/api', () => ({
  TWELVE_DATA_INDICATORS_API: {
    BASE_URL: 'https://api.twelvedata.com',
    KEY: 'test-api-key'
  }
}));

jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn()
}));

// Import modules under test after mocking
import { fetchTechnicalIndicators } from '@/api/indicator-api';
import { logError } from '@/utils/errorUtils';
import { TWELVE_DATA_INDICATORS_API } from '@/config/api';
import axios from 'axios';

describe('Indicator API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });
  
  describe('fetchTechnicalIndicators', () => {
    const mockMacdResponse = {
      data: {
        values: [{
          macd: '2.5',
          macd_signal: '1.8',
          macd_hist: '0.7'
        }]
      }
    };
    
    const mockRsiResponse = {
      data: {
        values: [{
          rsi: '65.21'
        }]
      }
    };
    
    it('should fetch technical indicators successfully', async () => {
      // Mock each API call in sequence
      axios.get
        .mockResolvedValueOnce(mockMacdResponse)
        .mockResolvedValueOnce(mockRsiResponse);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(axios.get).toHaveBeenCalledTimes(2);
      
      // Check MACD call
      expect(axios.get).toHaveBeenNthCalledWith(
        1, 
        `${TWELVE_DATA_INDICATORS_API.BASE_URL}/macd`, 
        {
          params: {
            symbol: 'AAPL',
            interval: '1day',
            apikey: TWELVE_DATA_INDICATORS_API.KEY,
            outputsize: 1
          }
        }
      );
      
      // Check RSI call
      expect(axios.get).toHaveBeenNthCalledWith(
        2, 
        `${TWELVE_DATA_INDICATORS_API.BASE_URL}/rsi`, 
        {
          params: {
            symbol: 'AAPL',
            interval: '1day',
            apikey: TWELVE_DATA_INDICATORS_API.KEY,
            outputsize: 1
          }
        }
      );
      
      expect(result).toEqual({
        macd: {
          value: 2.5,
          signal: 1.8,
          histogram: 0.7
        },
        rsi: 65.21,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle API errors for MACD', async () => {
      const error = new Error('API Error');
      axios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockRsiResponse);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'TechnicalIndicatorUtils:fetchMACD');
      expect(result).toEqual({
        macd: null,
        rsi: 65.21,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle API errors for RSI', async () => {
      const error = new Error('API Error');
      axios.get
        .mockResolvedValueOnce(mockMacdResponse)
        .mockRejectedValueOnce(error);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'TechnicalIndicatorUtils:fetchRSI');
      expect(result).toEqual({
        macd: {
          value: 2.5,
          signal: 1.8,
          histogram: 0.7
        },
        rsi: null,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle rate limiting', async () => {
      const errorResponse = {
        data: {
          status: 'error',
          message: 'Rate limit exceeded'
        }
      };
      
      axios.get
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(result).toEqual({
        macd: null,
        rsi: null,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle empty data', async () => {
      axios.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} });
      
      const result = await fetchTechnicalIndicators('INVALID');
      
      expect(result).toEqual({
        macd: null,
        rsi: null,
        timestamp: expect.any(String)
      });
    });
  });
});