import axios from 'axios';

const API_KEY = "0bcd08147d344c59af873d72bd752c38";
const BASE_URL = 'https://api.twelvedata.com';

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

export const getStockData = async (symbol) => {
    try {
        const response = await axios.get(`${BASE_URL}/time_series`, {
            params: {
                symbol,
                interval: '1month',
                outputsize: '12',
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
