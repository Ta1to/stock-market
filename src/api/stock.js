import axios from 'axios';
import { stockList } from '../utils/stock-list';

const API_KEY = "0bcd08147d344c59af873d72bd752c38";
const BASE_URL = 'https://api.twelvedata.com';

// This function will return a list of random stock symbols
export const getRandomStock = async (amount) => {
    const randomStock = [];
    for (let index = 0; index < amount; index++) {
        const stock = stockList[Math.floor(Math.random() * stockList.length)];
        randomStock.push({ name: stock.name, symbol: stock.symbol });
    }

    return randomStock;
};

// This function will return the latest stock price for a given symbol
export const getStockPrice = async (symbol) => {
    try {
        const response = await axios.get(`${BASE_URL}/time_series`, {
            params: {
                symbol,
                interval: '1min',
                apikey: API_KEY,
            },
        });
        const data = response.data;
        console.log('API response:', data);
        if (!data || !data.values) {
            throw new Error('Invalid response format');
        }
        const latestPrice = data.values[0].open;
        return latestPrice;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        throw error;
    }
};

// This function will return the stock data for a given symbol
export const getStockData = async (symbol) => {
    try {
        const response = await axios.get(`${BASE_URL}/time_series`, {
            params: {
                symbol,
                interval: '1week',
                outputsize: '52',
                apikey: API_KEY,
            },
        });
        const data = response.data;
        console.log('API response:', data);
        if (!data || !data.values) {
            throw new Error('Invalid response format');
        }
        const timeSeries = data.values;
        const dates = timeSeries
            .reverse()
            .map(entry => {
                const d = new Date(entry.datetime);
                console.log('Parsed date:', d);
                if (isNaN(d)) {
                    console.error('Invalid date value:', entry.datetime);
                    throw new Error('Invalid date value');
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
        console.error('Error fetching stock data:', error);
        throw error;
    }
};
