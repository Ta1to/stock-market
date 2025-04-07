import axios from 'axios';
import { ALPHA_VANTAGE_API } from '../config/api';
import { logError } from '../utils/errorUtils';

/**
 * NewsAPI provides functions for fetching stock news and sentiment analysis
 */

/**
 * Get news articles and sentiment for a specific stock
 * @param {string} symbol - Stock symbol to fetch news for
 * @param {number} limit - Maximum number of news items to return
 * @returns {Promise<Array>} Array of news objects with title, summary and sentiment
 */
export const getStockNews = async (symbol, limit = 3) => {
  try {
    const formattedSymbol = symbol.toUpperCase();
    
    const response = await axios.get(ALPHA_VANTAGE_API.BASE_URL, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: formattedSymbol,
        apikey: ALPHA_VANTAGE_API.KEY
      }
    });

    if (!response.data) {
      const error = new Error(`No data returned for symbol: ${symbol}`);
      logError(error, 'NewsAPI');
      return [];
    }

    if (response.data['Error Message']) {
      const error = new Error(response.data['Error Message']);
      logError(error, 'NewsAPI');
      return [];
    }

    // Check for API rate limit
    if (response.data.Note) {
      const warning = new Error(`API rate limit: ${response.data.Note}`);
      logError(warning, 'NewsAPI:RateLimit');
    }

    const newsItems = response.data.feed || [];
    const limitedItems = newsItems.slice(0, limit);

    const processedNews = limitedItems.map(item => ({
      title: item.title || '',
      summary: item.summary || '',
      sentiment: item.overall_sentiment_score || 0
    }));

    return processedNews;

  } catch (error) {
    logError(error, 'NewsAPI:getStockNews');
    // Return empty array instead of failing to prevent blocking the app
    return [];
  }
};