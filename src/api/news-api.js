import axios from 'axios';
import {logError} from '@/utils/errorUtils';
import {MARKETAUX_API} from '@/config/api';

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
    const params = {
      symbols: formattedSymbol,
      language: 'en',
      filter_entities: true,
      must_have_entities: true, 
      limit: Math.min(50, limit * 10), 
      api_token: MARKETAUX_API.KEY
    };
    
    params.search = `"${formattedSymbol}"`;
    
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
    
    // enhanced quality filtering
    newsItems = newsItems.filter(item => {
      // filter out too short descriptions
      if (!item.description || item.description.length < 35) {
        return false;
      }
      
      // filter out news that don't mention the stock symbol
      if (!item.description.includes(formattedSymbol)) {
        return false;
      }
      
      // filter out descriptions that don't end with a period
      const trimmedDesc = item.description.trim();
      if (!trimmedDesc.endsWith('.') && !trimmedDesc.endsWith('!') && !trimmedDesc.endsWith('?')) {
        return false;
      }
      
      // filter out descriptions that seem to be cut off (end with "..." or similar)
      if (trimmedDesc.endsWith('...') || trimmedDesc.endsWith('…')) {
        return false;
      }
      
      // filter out common junk phrases
      const junkPhrases = [
        "click here",
        "read more",
        "subscribe to",
        "sign up for",
        "please see", 
        "can be downloaded here", 
        "download"
      ];
      
      if (junkPhrases.some(phrase => item.description.toLowerCase().includes(phrase))) {
        return false;
      }
      
      return true;
    });
    
    if (newsItems.length === 0) {
      // fall back to less strict filtering, but still require a period at the end
      newsItems = response.data.data?.filter(item => {
        if (!item.description || item.description.length < 60) return false;
        const trimmedDesc = item.description.trim();
        return trimmedDesc.endsWith('.') || trimmedDesc.endsWith('!') || trimmedDesc.endsWith('?');
      }) || [];
    }

    return newsItems
        .slice(0, limit)
        .map(item => {
          let summary = item.description || item.summary || '';

          if (summary.endsWith('...') || summary.endsWith('…')) {
            summary = summary.slice(0, -3) + '.';
          }

          return {
            title: item.title || '',
            summary: summary,
            source: item.source || '',
            url: item.url || ''
          };
        });

  } catch (error) {
    logError(error, 'NewsAPI:getStockNews');
    return [];
  }
};
