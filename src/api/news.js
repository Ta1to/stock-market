import axios from 'axios';

const API_KEY = "0bcd08147d344c59af873d72bd752c38";
const BASE_URL = 'https://www.alphavantage.co/query';

export const getStockNews = async (symbol, limit=3) => {
    try {
      console.log('Fetching news for symbol:', symbol);
      
      const formattedSymbol = symbol.toUpperCase();
      
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'NEWS_SENTIMENT',
          tickers: formattedSymbol,
          apikey: API_KEY
        }
      });
  
      if (!response.data || response.data['Error Message']) {
        console.warn(`No news data found for symbol: ${symbol}`);
        return [];
      }
  
      // check for api limit rate 
      if (response.data.Note) {
        console.warn(`API Note: ${response.data.Note}`);
      }
  
      const newsItems = response.data.feed || [];
      const limitedItems = newsItems.slice(0, limit);

      const processedNews = limitedItems.map(item => ({
        title: item.title || '',
        summary: item.summary || '',
        sentiment: item.overall_sentiment_score || 0
      }));
  
      return processedNews;
  
    } catch (error) {
      console.error('Error fetching stock news:', error);
      return [];
    }
  };