import axios from 'axios';
import { TWELVE_DATA_API } from '../config/api';
import { logError, getUserErrorMessage } from '../utils/errorUtils';
import { stockList } from '../utils/stock-list';

/**
 * StockAPI provides functions for fetching stock data from external services
 */

/**
 * Get a list of random stock symbols
 * @param {number} amount - Number of random stocks to return
 * @returns {Promise<Array>} Array of stock objects with name and symbol
 */
export const getRandomStock = async (amount) => {
    const randomStock = [];
    for (let index = 0; index < amount; index++) {
        const stock = stockList[Math.floor(Math.random() * stockList.length)];
        randomStock.push({ name: stock.name, symbol: stock.symbol });
    }
    return randomStock;
};

/**
 * Get latest stock price for a symbol
 * @param {string} symbol - Stock symbol to fetch
 * @returns {Promise<number>} Latest stock price
 */
export const getStockPrice = async (symbol) => {
    try {
        const response = await axios.get(`${TWELVE_DATA_API.BASE_URL}/time_series`, {
            params: {
                symbol,
                interval: '1min',
                apikey: TWELVE_DATA_API.KEY,
            },
        });
        const data = response.data;
        
        if (!data || !data.values) {
            const error = new Error('Invalid response format');
            logError(error, 'StockAPI');
            throw error;
        }
        
        const latestPrice = data.values[0].open;
        return latestPrice;
    } catch (error) {
        logError(error, 'StockAPI:getStockPrice');
        throw new Error(getUserErrorMessage(error, `Failed to get price for ${symbol}`));
    }
};

/**
 * Get stock price history
 * @param {string} symbol - Stock symbol to fetch
 * @returns {Promise<Object>} Object with dates and prices arrays
 */
export const getStockHistory = async (symbol) => {
    try {
        const response = await axios.get(`${TWELVE_DATA_API.BASE_URL}/time_series`, {
            params: {
                symbol,
                interval: '1week',
                outputsize: '52',
                apikey: TWELVE_DATA_API.KEY,
            },
        });
        const data = response.data;
        
        if (!data || !data.values) {
            const error = new Error('Invalid response format');
            logError(error, 'StockAPI');
            throw error;
        }
        
        const timeSeries = data.values;
        const dates = timeSeries
            .reverse()
            .map(entry => {
                const d = new Date(entry.datetime);
                if (isNaN(d)) {
                    const error = new Error('Invalid date value: ' + entry.datetime);
                    logError(error, 'StockAPI');
                    throw error;
                }
                return new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    year: '2-digit'
                }).format(d);
            });
        const prices = timeSeries
            .reverse()
            .map(entry => parseFloat(entry.open));
        
        return { dates, prices };
    } catch (error) {
        logError(error, 'StockAPI:getStockHistory');
        throw new Error(getUserErrorMessage(error, `Failed to get history for ${symbol}`));
    }
};
