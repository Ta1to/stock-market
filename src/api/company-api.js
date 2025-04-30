import axios from 'axios';
import {ALPHA_VANTAGE_API} from '@/config/api';
import {logError} from '@/utils/errorUtils';

/**
 * CompanyAPI provides functions for fetching company information
 */

/**
 * Get company overview information
 * @param {string} symbol - Stock symbol to fetch info for
 * @returns {Promise<Object|null>} Company info object or null if not found
 */
export const getCompanyInfo = async (symbol) => {
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
      logError(error, 'CompanyAPI');
      return null;
    }

    if (response.data['Error Message']) {
      const error = new Error(response.data['Error Message']);
      logError(error, 'CompanyAPI');
      return null;
    }
    
    // Check for API rate limit
    if (response.data.Note) {
      const warning = new Error(`API rate limit: ${response.data.Note}`);
      logError(warning, 'CompanyAPI:RateLimit');
    }

    // Verify we got the requested symbol data
    if (response.data.Symbol && response.data.Symbol !== symbol) {
      const error = new Error(`Symbol mismatch: requested ${symbol}, received ${response.data.Symbol}`);
      logError(error, 'CompanyAPI');
      return null;
    }

    return {
      description: response.data.Description || '',
      sector: response.data.Sector || '',
      industry: response.data.Industry || '',
      website: response.data.Website || '',
      marketCap: response.data.MarketCapitalization || '',
      peRatio: response.data.PERatio || '',
      dividendYield: response.data.DividendYield || '',
      eps: response.data.EPS || '',
      exchange: response.data.Exchange || '',
      name: response.data.Name || symbol
    };

  } catch (error) {
    logError(error, 'CompanyAPI:getCompanyInfo');
    return null;
  }
};