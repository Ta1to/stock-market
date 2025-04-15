import axios from 'axios';
import {TWELVE_DATA_INDICATORS_API } from '../config/api';
import { logError } from '../utils/errorUtils';

/**
 * Fetch the two most important technical indicators for buy/sell decisions
 * @param {string} symbol - Stock symbol to fetch indicator for
 * @returns {Promise<object>} Object containing indicator values
 */
export const fetchTechnicalIndicators = async (symbol) => {
  try {    
    const macdPromise = fetchIndicator(symbol, 'macd');
    const rsiPromise = fetchIndicator(symbol, 'rsi');
    
    const [macdData, rsiData] = await Promise.all([
      macdPromise, rsiPromise
    ]);
    
    return {
      macd: macdData ? {
        value: parseFloat(macdData.macd),
        signal: parseFloat(macdData.macd_signal),
        histogram: parseFloat(macdData.macd_hist)
      } : null,
      rsi: rsiData ? parseFloat(rsiData.rsi) : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logError(error, 'TechnicalIndicatorUtils:fetchTechnicalIndicators');
    return {
      macd: null,
      rsi: null,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Fetch a technical indicator from Twelve Data API
 * @param {string} symbol - Stock symbol to fetch indicator for
 * @param {string} indicator - Indicator type (macd, rsi)
 * @param {string} interval - Time interval (default: 1day)
 * @returns {Promise<object|null>} Latest indicator value or null if error
 */
const fetchIndicator = async (symbol, indicator, interval = '1day') => {
  try {    
    const response = await axios.get(`${TWELVE_DATA_INDICATORS_API.BASE_URL}/${indicator}`, {
      params: {
        symbol,
        interval,
        apikey: TWELVE_DATA_INDICATORS_API.KEY,
        outputsize: 1  // only need the latest value
      }
    });
    
    if (!response.data || response.data.status === 'error') {
      const errorMsg = response.data?.message || 'Unknown API error';
      return null;
    }
    
    return response.data.values?.[0] || null;
  } catch (error) {
    logError(error, `TechnicalIndicatorUtils:fetch${indicator.toUpperCase()}`);
    return null;
  }
};