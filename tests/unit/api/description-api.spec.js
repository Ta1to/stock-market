// Mock dependencies first without functional implementations
jest.mock('axios');
jest.mock('@/config/api', () => ({
  ALPHA_VANTAGE_API: {
    BASE_URL: 'https://www.alphavantage.co/query',
    KEY: 'test-api-key'
  }
}));

jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn()
}));

// Import modules under test after mocking
import { logError } from '@/utils/errorUtils';
import { ALPHA_VANTAGE_API } from '@/config/api';
import { getStockInfo } from '@/api/description-api';
import axios from 'axios';

describe('Description API', () => {
  // Setup mock implementation after importing the mocked module
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });
  
  describe('getStockInfo', () => {
    const mockResponse = {
      data: {
        Symbol: 'AAPL',
        Name: 'Apple Inc',
        Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        Exchange: 'NASDAQ',
        Sector: 'Technology',
        Industry: 'Consumer Electronics',
        MarketCapitalization: '2500000000000',
        DividendYield: '0.0065',
        EPS: '6.45',
        PERatio: '25.9',
        Website: 'https://www.apple.com'
      }
    };
    
    it('should fetch stock information successfully', async () => {
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getStockInfo('AAPL');
      
      expect(axios.get).toHaveBeenCalledWith(ALPHA_VANTAGE_API.BASE_URL, {
        params: {
          function: 'OVERVIEW',
          symbol: 'AAPL',
          apikey: ALPHA_VANTAGE_API.KEY
        }
      });
      
      expect(result).toEqual({
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        website: 'https://www.apple.com'
      });
    });
    
    it('should handle API errors', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValueOnce(error);
      
      const result = await getStockInfo('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'StockInfoAPI:getStockInfo');
      expect(result).toBeNull();
    });
    
    it('should handle symbol mismatch', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          Symbol: 'MSFT',
          Name: 'Microsoft',
          Description: 'Microsoft description',
          Sector: 'Technology',
          Industry: 'Software',
          Website: 'https://www.microsoft.com'
        }
      });
      
      const result = await getStockInfo('AAPL');
      
      expect(logError).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});