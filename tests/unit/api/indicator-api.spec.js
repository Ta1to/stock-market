// Mock dependencies without functional implementations
jest.mock('axios');
jest.mock('@/config/api', () => ({
  TWELVE_DATA_API: {
    BASE_URL: 'https://api.twelvedata.com',
    KEY: 'test-api-key'
  }
}));

jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn()
}));

// Import modules under test after mocking
import { getTechnicalIndicators } from '@/api/indicator-api';
import { logError } from '@/utils/errorUtils';
import { TWELVE_DATA_API } from '@/config/api';
import axios from 'axios';

describe('Indicator API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });
  
  describe('fetchTechnicalIndicators', () => {
    const mockSmaResponse = {
      data: {
        'Technical Analysis: SMA': {
          '2025-04-01': {
            SMA: '150.25'
          },
          '2025-03-31': {
            SMA: '149.80'
          }
        }
      }
    };
    
    const mockRsiResponse = {
      data: {
        'Technical Analysis: RSI': {
          '2025-04-01': {
            RSI: '65.21'
          },
          '2025-03-31': {
            RSI: '62.45'
          }
        }
      }
    };
    
    const mockMacdResponse = {
      data: {
        'Technical Analysis: MACD': {
          '2025-04-01': {
            MACD: '2.5',
            MACD_Signal: '1.8',
            MACD_Hist: '0.7'
          },
          '2025-03-31': {
            MACD: '2.1',
            MACD_Signal: '1.6',
            MACD_Hist: '0.5'
          }
        }
      }
    };
    
    it('should fetch technical indicators successfully', async () => {
      // Mock each API call in sequence
      axios.get
        .mockResolvedValueOnce(mockSmaResponse)
        .mockResolvedValueOnce(mockRsiResponse)
        .mockResolvedValueOnce(mockMacdResponse);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(axios.get).toHaveBeenCalledTimes(3);
      
      // Check SMA call
      expect(axios.get).toHaveBeenNthCalledWith(1, ALPHA_VANTAGE_API.BASE_URL, {
        params: {
          function: 'SMA',
          symbol: 'AAPL',
          interval: 'daily',
          time_period: '20',
          series_type: 'close',
          apikey: ALPHA_VANTAGE_API.KEY
        }
      });
      
      // Check RSI call
      expect(axios.get).toHaveBeenNthCalledWith(2, ALPHA_VANTAGE_API.BASE_URL, {
        params: {
          function: 'RSI',
          symbol: 'AAPL',
          interval: 'daily',
          time_period: '14',
          series_type: 'close',
          apikey: ALPHA_VANTAGE_API.KEY
        }
      });
      
      // Check MACD call
      expect(axios.get).toHaveBeenNthCalledWith(3, ALPHA_VANTAGE_API.BASE_URL, {
        params: {
          function: 'MACD',
          symbol: 'AAPL',
          interval: 'daily',
          series_type: 'close',
          apikey: ALPHA_VANTAGE_API.KEY
        }
      });
      
      expect(result).toEqual({
        sma: '150.25',
        rsi: '65.21',
        macd: '2.5'
      });
    });
    
    it('should handle API errors for SMA', async () => {
      const error = new Error('API Error');
      axios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockRsiResponse)
        .mockResolvedValueOnce(mockMacdResponse);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'IndicatorAPI');
      expect(result).toEqual({
        sma: 'N/A',
        rsi: '65.21',
        macd: '2.5'
      });
    });
    
    it('should handle API errors for RSI', async () => {
      const error = new Error('API Error');
      axios.get
        .mockResolvedValueOnce(mockSmaResponse)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockMacdResponse);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'IndicatorAPI');
      expect(result).toEqual({
        sma: '150.25',
        rsi: 'N/A',
        macd: '2.5'
      });
    });
    
    it('should handle API errors for MACD', async () => {
      const error = new Error('API Error');
      axios.get
        .mockResolvedValueOnce(mockSmaResponse)
        .mockResolvedValueOnce(mockRsiResponse)
        .mockRejectedValueOnce(error);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'IndicatorAPI');
      expect(result).toEqual({
        sma: '150.25',
        rsi: '65.21',
        macd: 'N/A'
      });
    });
    
    it('should handle rate limiting', async () => {
      const rateLimitResponse = {
        data: {
          Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day.'
        }
      };
      
      axios.get
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(rateLimitResponse);
      
      const result = await fetchTechnicalIndicators('AAPL');
      
      expect(logError).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        sma: 'N/A',
        rsi: 'N/A',
        macd: 'N/A'
      });
    });
    
    it('should handle empty data', async () => {
      axios.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} });
      
      const result = await fetchTechnicalIndicators('INVALID');
      
      expect(result).toEqual({
        sma: 'N/A',
        rsi: 'N/A',
        macd: 'N/A'
      });
    });
  });
});