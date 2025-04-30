import axios from 'axios';
import {ALPHA_VANTAGE_API} from '@/config/api';
import {logError} from '@/utils/errorUtils';

/**
 * Fetches stock information from the Alpha Vantage API.
 * 
 * @param {string} symbol - The stock symbol (e.g. AAPL for Apple)
 * @returns {Promise<Object|null>} An object with stock information or null on errors
 * @property {string} description - Description of the company
 * @property {string} sector - Sector in which the company operates
 * @property {string} industry - Industry of the company
 * @property {string} website - Website URL of the company
 */
export const getStockInfo = async (symbol) => {
  try {
    const formattedSymbol = symbol.toUpperCase();

    /**
     * Alpha Vantage API request for company overview
     */
    const response = await axios.get(ALPHA_VANTAGE_API.BASE_URL, {
      params: {
        symbol: formattedSymbol,
        function: 'OVERVIEW',
        apikey: ALPHA_VANTAGE_API.KEY
      }
    });

    // Error check: no data
    if (!response.data) {
      const error = new Error(`No data returned for symbol: ${symbol}`);
      logError(error, 'StockInfoAPI');
      return null;
    }

    // Error check: API error message
    if (response.data['Error Message']) {
      const error = new Error(response.data['Error Message']);
      logError(error, 'StockInfoAPI');
      return null;
    }
    
    // Check for API rate limit
    if (response.data.Note) {
      const warning = new Error(`API rate limit: ${response.data.Note}`);
      logError(warning, 'StockInfoAPI:RateLimit');
    }

    // Verification of symbol data
    if (response.data.Symbol && response.data.Symbol !== symbol) {
      const error = new Error(`Symbol mismatch: requested ${symbol}, received ${response.data.Symbol}`);
      logError(error, 'StockInfoAPI');
      return null;
    }

    return {
      description: response.data.Description || '',
      sector: response.data.Sector || '',
      industry: response.data.Industry || '',
      website: response.data.Website || ''
    };

  } catch (error) {
    /**
     * Logs unexpected errors
     */
    logError(error, 'StockInfoAPI:getStockInfo');
    return null;
  }
};