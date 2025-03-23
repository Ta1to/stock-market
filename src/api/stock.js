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
