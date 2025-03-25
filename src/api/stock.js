import axios from 'axios';

const API_KEY = "0bcd08147d344c59af873d72bd752c38";
const BASE_URL = 'https://api.twelvedata.com';


// This function will return a list of random stock symbols
export const getRandomStock = async (amount) => {
    const stockList = [
        { name: 'Apple', symbol: 'AAPL' },
        { name: 'Google', symbol: 'GOOGL' },
        { name: 'Microsoft', symbol: 'MSFT' },
        { name: 'Amazon', symbol: 'AMZN' },
        { name: 'Tesla', symbol: 'TSLA' },
        { name: 'Facebook', symbol: 'META' },
        { name: 'NVIDIA', symbol: 'NVDA' },
        { name: 'Netflix', symbol: 'NFLX' },
        { name: 'Adobe', symbol: 'ADBE' },
        { name: 'Intel', symbol: 'INTC' },
        { name: 'Cisco', symbol: 'CSCO' },
        { name: 'Oracle', symbol: 'ORCL' },
        { name: 'IBM', symbol: 'IBM' },
        { name: 'Salesforce', symbol: 'CRM' },
        { name: 'PayPal', symbol: 'PYPL' },
        { name: 'Square', symbol: 'SQ' },
        { name: 'Shopify', symbol: 'SHOP' },
        { name: 'Zoom', symbol: 'ZM' },
        { name: 'Spotify', symbol: 'SPOT' },
        { name: 'Snap', symbol: 'SNAP' },
        { name: 'Twitter', symbol: 'TWTR' },
        { name: 'Uber', symbol: 'UBER' },
        { name: 'Lyft', symbol: 'LYFT' },
        { name: 'Pinterest', symbol: 'PINS' },
        { name: 'eBay', symbol: 'EBAY' },
        { name: 'Alibaba', symbol: 'BABA' },
        { name: 'Baidu', symbol: 'BIDU' },
        { name: 'JD.com', symbol: 'JD' },
        { name: 'Tencent', symbol: 'TCEHY' },
        { name: 'Samsung', symbol: 'SSNLF' },
        { name: 'Sony', symbol: 'SONY' },
        { name: 'LG', symbol: 'LPL' },
        { name: 'Qualcomm', symbol: 'QCOM' },
        { name: 'AMD', symbol: 'AMD' },
        { name: 'Micron', symbol: 'MU' },
        { name: 'Texas Instruments', symbol: 'TXN' },
        { name: 'Broadcom', symbol: 'AVGO' },
        { name: 'AT&T', symbol: 'T' },
        { name: 'Verizon', symbol: 'VZ' },
        { name: 'T-Mobile', symbol: 'TMUS' },
        { name: 'Disney', symbol: 'DIS' },
        { name: 'Coca-Cola', symbol: 'KO' },
        { name: 'PepsiCo', symbol: 'PEP' },
        { name: 'McDonald\'s', symbol: 'MCD' },
        { name: 'Starbucks', symbol: 'SBUX' },
        { name: 'Walmart', symbol: 'WMT' },
        { name: 'Target', symbol: 'TGT' },
        { name: 'Costco', symbol: 'COST' },
        { name: 'Home Depot', symbol: 'HD' },
        { name: 'Lowe\'s', symbol: 'LOW' }
    ];

    const randomStock = [];
    for (let index = 0; index < amount; index++) {
        randomStock.push(stockList[Math.floor(Math.random() * stockList.length)]);
    }

    console.log('Random stock:', randomStock);

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
