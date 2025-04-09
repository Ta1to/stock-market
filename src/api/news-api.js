
import axios from 'axios';
import { logError } from '../utils/errorUtils';
import { MARKETAUX_API } from '../config/api';

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
    
    const response = await axios.get(MARKETAUX_API.BASE_URL, {
      params: {
        symbols: formattedSymbol,
        language: 'en',
        filter_entities: true,
        limit: limit,
        api_token: MARKETAUX_API.KEY
      }
    });

    if (!response.data) {
      const error = new Error(`No data returned for symbol: ${symbol}`);
      logError(error, 'NewsAPI');
      return [];
    }

    if (response.data.error) {
      const error = new Error(response.data.error.message || 'API Error');
      logError(error, 'NewsAPI');
      return [];
    }

    // Extract and process news items
    const newsItems = response.data.data || [];
    
    const processedNews = newsItems.map(item => ({
      title: '',
      summary: item.description || '',
    }));

    return processedNews;

  } catch (error) {
    logError(error, 'NewsAPI:getStockNews');
    // Return empty array instead of failing to prevent blocking the app
    return [];
  }
};