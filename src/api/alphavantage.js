import axios from 'axios';

const API_KEY = "Y3MEMJTB2EGOJ0VS";
const BASE_URL = 'https://www.alphavantage.co/query';

export const getStockInfo = async (symbol) => {
  try {
    console.log('Fetching data for symbol:', symbol); // Debug log 1

    const response = await axios.get(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: API_KEY
      }
    });

    // Überprüfen ob die Daten für das richtige Symbol zurückkommen
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

    console.log('Processed stock info:', stockInfo); // Debug log 4
    return stockInfo;

  } catch (error) {
    console.error('Error fetching stock info:', error);
    return null;
  }
};