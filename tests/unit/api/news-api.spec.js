// Mock dependencies without functional implementations
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
import { getStockNews } from '@/api/news-api';
import { logError } from '@/utils/errorUtils';
import { ALPHA_VANTAGE_API } from '@/config/api';
import axios from 'axios';

describe('News API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });
  
  describe('getStockNews', () => {
    const mockResponse = {
      data: {
        feed: [
          {
            title: 'Apple Reports Record Quarter',
            url: 'https://example.com/news/1',
            summary: 'Apple Inc. reported a record quarter with strong iPhone sales.',
            banner_image: 'https://example.com/images/1.jpg',
            time_published: '20250101T120000'
          },
          {
            title: 'Apple Announces New Products',
            url: 'https://example.com/news/2',
            summary: 'Apple Inc. announced new products at their annual event.',
            banner_image: 'https://example.com/images/2.jpg',
            time_published: '20250102T130000'
          }
        ]
      }
    };
    
    it('should fetch stock news successfully', async () => {
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getStockNews('AAPL');
      
      expect(axios.get).toHaveBeenCalledWith(ALPHA_VANTAGE_API.BASE_URL, {
        params: {
          function: 'NEWS_SENTIMENT',
          tickers: 'AAPL',
          apikey: ALPHA_VANTAGE_API.KEY
        }
      });
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: 'Apple Reports Record Quarter',
        url: 'https://example.com/news/1',
        summary: 'Apple Inc. reported a record quarter with strong iPhone sales.',
        image: 'https://example.com/images/1.jpg',
        publishedDate: '20250101T120000'
      });
    });
    
    it('should handle API errors', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValueOnce(error);
      
      const result = await getStockNews('AAPL');
      
      expect(logError).toHaveBeenCalledWith(error, 'NewsAPI');
      expect(result).toEqual([]);
    });
    
    it('should handle rate limiting', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day.'
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
    
    it('should limit the number of news items returned', async () => {
      // Create a response with many news items
      const manyNewsItems = {
        data: {
          feed: Array(20).fill(0).map((_, i) => ({
            title: `News ${i}`,
            url: `https://example.com/news/${i}`,
            summary: `Summary ${i}`,
            banner_image: `https://example.com/images/${i}.jpg`,
            time_published: `2025010${i % 10}T120000`
          }))
        }
      };
      
      axios.get.mockResolvedValueOnce(manyNewsItems);
      
      const result = await getStockNews('AAPL', 5);
      
      expect(result).toHaveLength(5);
    });
  });
});