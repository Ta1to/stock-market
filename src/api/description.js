import axios from 'axios';

const API_KEY = "Y3MEMJTB2EGOJ0VS";
const BASE_URL = 'https://www.alphavantage.co/query';

export const getStockInfo = async (symbol) => {
  try {
    const formattedSymbol = symbol.toUpperCase();

    const response = await axios.get(BASE_URL, {
      params: {
        symbol: formattedSymbol,
        function: 'OVERVIEW',
        apikey: API_KEY
      }
    });

    if (response.data.Symbol !== symbol) {
      console.error('Symbol mismatch:', {
        requested: symbol,
        received: response.data.Symbol
      });
      return null;
    }

    if (!response.data || response.data['Error Message']) {
      console.warn(`No data found for symbol: ${symbol}`);
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
    console.error('Error fetching stock info:', error);
    return null;
  }
};