import { computed } from 'vue';

export function useStockData(gameStore) {
  // Extract stock data from the current round
  const stockData = computed(() => {
    const currentRound = gameStore.currentRound;
    const roundData = gameStore.rounds?.[currentRound];
    
    if (!roundData?.stocks?.[0]) {
      console.warn("No stocks data available for current round");
      return null;
    }

    const stockDetails = roundData.stocks[0];
    if (!stockDetails.history) {
      console.warn("Stock history not available or not in correct format");
      return null;
    }

    return {
      name: stockDetails.name,
      symbol: stockDetails.symbol,
      description: stockDetails.description,
      sector: stockDetails.sector, 
      industry: stockDetails.industry,
      website: stockDetails.website,
      news: stockDetails.news || [],
      prices: stockDetails.history.map(entry => entry.price),
      dates: stockDetails.history.map(entry => entry.date),
    };
  });

  return {
    stockData
  };
}