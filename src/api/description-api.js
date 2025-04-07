import axios from 'axios';
import { ALPHA_VANTAGE_API } from '../config/api';
import { logError } from '../utils/errorUtils';

export const getStockInfo = async (symbol) => {
  try {
    const formattedSymbol = symbol.toUpperCase();

    const response = await axios.get(ALPHA_VANTAGE_API.BASE_URL, {
      params: {
        symbol: formattedSymbol,
        function: 'OVERVIEW',
        apikey: ALPHA_VANTAGE_API.KEY
      }
    });

    if (!response.data) {
      const error = new Error(`No data returned for symbol: ${symbol}`);
      logError(error, 'StockInfoAPI');
      return null;
    }

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

    // Verify we got the requested symbol data
    if (response.data.Symbol && response.data.Symbol !== symbol) {
      const error = new Error(`Symbol mismatch: requested ${symbol}, received ${response.data.Symbol}`);
      logError(error, 'StockInfoAPI');
      return null;
    }

    const stockInfo = {
      description: response.data.Description || '',
      sector: response.data.Sector || '',
      industry: response.data.Industry || '',
      website: response.data.Website || ''
    };

    return stockInfo;

  } catch (error) {
    logError(error, 'StockInfoAPI:getStockInfo');
    return null;
  }
};