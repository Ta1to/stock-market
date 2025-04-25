// Mock dependencies without functional implementations
jest.mock('axios');
jest.mock('@/config/api', () => ({
  MARKETAUX_API: {
    BASE_URL: 'https://api.marketaux.com/v1/news/all',
    KEY: 'test-api-key'
  }
}));

jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn()
}));

// Import modules under test after mocking
import { getStockNews } from '@/api/news-api';
import { logError } from '@/utils/errorUtils';
import { MARKETAUX_API } from '@/config/api';
import axios from 'axios';

describe('News API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });
  
  describe('getStockNews', () => {
    const mockResponse = {
      data: {
        data: [
          {
            title: 'Apple Reports Record Quarter',
            url: 'https://example.com/news/1',
            description: 'Apple Inc. reported a record quarter with strong iPhone sales.',
            source: 'TechNews',
          },
          {
            title: 'Apple Announces New Products',
            url: 'https://example.com/news/2',
            description: 'Apple Inc. announced new products at their annual event.',
            source: 'BusinessDaily',
          }
        ]
      }
    };
    
    it('should fetch stock news successfully', async () => {
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getStockNews('AAPL');
      
      expect(axios.get).toHaveBeenCalledWith(MARKETAUX_API.BASE_URL, {
        params: {
          symbols: 'AAPL',
          language: 'en',
          filter_entities: true,
          must_have_entities: true,
          limit: expect.any(Number),
          api_token: MARKETAUX_API.KEY,
          search: '"AAPL"'
        }
      });
      
      expect(result[0]).toEqual({
        title: 'Apple Reports Record Quarter',
        url: 'https://example.com/news/1',
        summary: 'Apple Inc. reported a record quarter with strong iPhone sales.',
        source: 'TechNews'
      });
    });
    
    it('should handle API errors', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValueOnce(error);
      
      const result = await getStockNews('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'NewsAPI:getStockNews');
      expect(result).toEqual([]);
    });
    
    it('should handle error responses', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          error: {
            message: 'API Error'
          }
        }
      });
      
      const result = await getStockNews('AAPL');
      
      expect(logError).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    
    it('should handle empty data', async () => {
      axios.get.mockResolvedValueOnce({ data: {} });
      
      const result = await getStockNews('INVALID');
      
      expect(result).toEqual([]);
    });
  });
});