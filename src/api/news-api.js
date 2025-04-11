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
    console.log(`Fetching news for ${formattedSymbol}`);
    
    const params = {
      symbols: formattedSymbol,
      language: 'en',
      filter_entities: true,
      must_have_entities: true, 
      limit: Math.min(20, limit * 3), 
      api_token: MARKETAUX_API.KEY
    };
    
    params.search = `"${formattedSymbol}"`;
    
    console.log('API request params:', params);
    const response = await axios.get(MARKETAUX_API.BASE_URL, { params });

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

    let newsItems = response.data.data || [];
    console.log(`Received ${newsItems.length} news items for ${formattedSymbol}`);
    
    newsItems = newsItems.filter(item => 
      item.description && item.description.length > 35
    );
    
    if (newsItems.length === 0) {
      console.log(`No quality news found for ${formattedSymbol}, using fallback.`);
    }
    
    const processedNews = newsItems
      .slice(0, limit)
      .map(item => ({
        title: '',
        summary: item.description || ''
      }));

    return processedNews;

  } catch (error) {
    logError(error, 'NewsAPI:getStockNews');
    console.error('Error fetching news:', error.message);
  }
};
