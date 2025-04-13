jest.mock('axios');
jest.mock('@/config/api', () => ({
  ALPHA_VANTAGE_API: {
    BASE_URL: 'https://www.alphavantage.co/query',
    KEY: 'mock-key'
  }
}));

jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn()
}));

import { getCompanyInfo } from '@/api/company-api';
import { ALPHA_VANTAGE_API } from '@/config/api';
import { logError } from '@/utils/errorUtils';
import axios from 'axios';

describe('Company API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });

  describe('getCompanyInfo', () => {
    const mockResponse = {
      data: {
        Name: 'Apple Inc',
        Symbol: 'AAPL',
        Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        Exchange: 'NASDAQ',
        Sector: 'Technology',
        Industry: 'Consumer Electronics',
        MarketCapitalization: '2500000000000',
        Website: '',
        PERatio: '',
        DividendYield: '',
        EPS: ''
      }
    };
    
    it('should fetch company info successfully', async () => {
      // Setup axios mock
      axios.get.mockResolvedValue(mockResponse);
      
      // Call the function
      const result = await getCompanyInfo('AAPL');
      
      // Check axios was called correctly
      expect(axios.get).toHaveBeenCalledWith(ALPHA_VANTAGE_API.BASE_URL, {
        params: {
          function: 'OVERVIEW',
          symbol: 'AAPL',
          apikey: ALPHA_VANTAGE_API.KEY
        }
      });
      
      // Check result format to match expected output format from the actual implementation
      expect(result).toEqual({
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        website: '',
        marketCap: '2500000000000',
        peRatio: '',
        dividendYield: '',
        eps: '',
        exchange: 'NASDAQ',
        name: 'Apple Inc'
      });
    });
    
    it('should handle empty data', async () => {
      // Mock empty response
      axios.get.mockResolvedValue({ data: {} });
      
      // Call the function
      const result = await getCompanyInfo('INVALID');
      
      // The implementation returns an object with empty fields when data is empty
      expect(result).toEqual({
        description: '',
        sector: '',
        industry: '',
        website: '',
        marketCap: '',
        peRatio: '',
        dividendYield: '',
        eps: '',
        exchange: '',
        name: 'INVALID'
      });
    });
    
    it('should handle API errors', async () => {
      // Mock API error
      const error = new Error('API error');
      axios.get.mockRejectedValue(error);
      
      // Call the function
      const result = await getCompanyInfo('AAPL');
      
      // Check error was logged with the correct context
      expect(logError).toHaveBeenCalledWith(error, 'CompanyAPI:getCompanyInfo');
      
      // Check result is null
      expect(result).toBeNull();
    });
    
    it('should handle rate limiting', async () => {
      const rateLimitError = new Error('API rate limit: Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day.');

      // Mock rate limit response
      axios.get.mockResolvedValue({
        data: {
          Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day.'
        }
      });
      
      // Call the function
      const result = await getCompanyInfo('AAPL');
      
      // Check warning was logged
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('API rate limit')
        }), 
        'CompanyAPI:RateLimit'
      );
      
      // Based on the actual implementation, it should return an object with AAPL as the name
      expect(result).toEqual({
        description: '',
        sector: '',
        industry: '',
        website: '',
        marketCap: '',
        peRatio: '',
        dividendYield: '',
        eps: '',
        exchange: '',
        name: 'AAPL'
      });
    });
  });
});