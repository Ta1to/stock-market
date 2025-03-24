import axios from 'axios';

const API_KEY = "7J4SSSGH7LBAV1BT";
const BASE_URL = 'https://www.alphavantage.co/query';

export const getStockPrice = async (symbol) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol,
                interval: '1min',
                apikey: API_KEY,
            },
        });
        const data = response.data;
        console.log('API response:', data);
        if (!data || !data['Time Series (1min)']) {
            throw new Error('Invalid response format');
        }
        const timeSeries = data['Time Series (1min)'];
        const latestTime = Object.keys(timeSeries)[0];
        const latestPrice = timeSeries[latestTime]['1. open'];
        return latestPrice;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        throw error;
    }
};

export const getStockData = async (symbol, months = 12) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'TIME_SERIES_MONTHLY',
                symbol,
                apikey: API_KEY,
            },
        });
        const data = response.data;
        console.log('API response:', data);
        if (!data || !data['Monthly Time Series']) {
            throw new Error('Invalid response format');
        }
        const timeSeries = data['Monthly Time Series'];
        const dates = Object.keys(timeSeries)
            .slice(0, months)
            .reverse()
            .map(date => {
                const d = new Date(date);
                return new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    year: '2-digit'
                }).format(d);
            });
        const prices = Object.keys(timeSeries)
            .slice(0, months)
            .reverse()
            .map(date => parseFloat(timeSeries[date]['1. open']));
        
        return { dates, prices };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
};
