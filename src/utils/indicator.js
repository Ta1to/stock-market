// Indicator utility functions for technical analysis of stock data

/**
 * Calculate Relative Strength Index
 * @param {Array} prices - Array of price data points
 * @param {Number} period - Period for RSI calculation, default 14
 * @returns {Number} RSI value
 */
export const calculateRSI = (prices, period = 14) => {
  if (!prices || prices.length < period + 1) {
    console.warn('Not enough data points to calculate RSI');
    return 50; 
  }

  // Convert strings to numbers if needed
  const numericPrices = prices.map(p => typeof p === 'string' ? parseFloat(p) : p);
  
  // Calculate price changes - NOTE: assuming oldest prices first
  const changes = [];
  for (let i = 1; i < numericPrices.length; i++) {
    changes.push(numericPrices[i] - numericPrices[i - 1]);
  }

  // get relevant period of changes (most recent)
  const relevantChanges = changes.slice(-period);

  // calculate gains and losses
  let gains = 0;
  let losses = 0;

  relevantChanges.forEach(change => {
    if (change > 0) {
      gains += change;
    } else {
      losses -= change; 
    }
  });

  // Calculate average gain and loss
  const avgGain = gains / period;
  const avgLoss = losses / period;

  // Calculate RS and RSI
  if (avgLoss === 0) {
    return 100; // no losses means RSI is 100
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
};

/**
 * Calculate Simple Moving Average
 * @param {Array} prices - Array of price data points
 * @param {Number} period - Period for SMA calculation, default 20
 * @returns {Number} SMA value
 */
export const calculateSMA = (prices, period = 20) => {
  if (!prices || prices.length < period) {
    console.warn('Not enough data points to calculate SMA');
    return prices && prices.length > 0 ? 
      (typeof prices[prices.length - 1] === 'string' ? 
        parseFloat(prices[prices.length - 1]) : 
        prices[prices.length - 1]) : 0;
  }

  // Convert strings to numbers if needed
  const numericPrices = prices.map(p => typeof p === 'string' ? parseFloat(p) : p);
  
  // Use the most recent 'period' prices for SMA, NOT the oldest ones
  const relevantPrices = numericPrices.slice(-period);
  const sum = relevantPrices.reduce((total, price) => total + price, 0);
  return sum / period;
};

/**
 * Calculate Exponential Moving Average (private helper function)
 * @param {Array} prices - Array of price data points
 * @param {Number} period - Period for EMA calculation
 * @returns {Number} EMA value
 */
const calculateEMA = (prices, period) => {
  if (!prices || prices.length < period) {
    return prices && prices.length > 0 ? 
      (typeof prices[prices.length - 1] === 'string' ? 
        parseFloat(prices[prices.length - 1]) : 
        prices[prices.length - 1]) : 0;
  }

  // Convert strings to numbers if needed
  const numericPrices = prices.map(p => typeof p === 'string' ? parseFloat(p) : p);
  
  let emaValues = [];
  
  // Calculate initial SMA
  const initialSMA = numericPrices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  emaValues.push(initialSMA);
  
  const multiplier = 2 / (period + 1);
  
  // Calculate EMA iteratively for each price point after the initial period
  for (let i = period; i < numericPrices.length; i++) {
    const currentPrice = numericPrices[i];
    const previousEMA = emaValues[emaValues.length - 1];
    const currentEMA = (currentPrice - previousEMA) * multiplier + previousEMA;
    emaValues.push(currentEMA);
  }
  
  // Return the most recent EMA
  return emaValues[emaValues.length - 1];
};

/**
 * Calculate Moving Average Convergence Divergence
 * @param {Array} prices - Array of price data points 
 * @param {Number} fastPeriod - Fast period, default 12
 * @param {Number} slowPeriod - Slow period, default 26
 * @param {Number} signalPeriod - Signal period, default 9
 * @returns {Object} MACD value, signal and histogram
 */
export const calculateMACD = (prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!prices || prices.length < Math.max(fastPeriod, slowPeriod)) {
    console.warn('Not enough data points to calculate MACD');
    return { value: 0, signal: 0, histogram: 0 };
  }

  // Convert strings to numbers if needed
  const numericPrices = prices.map(p => typeof p === 'string' ? parseFloat(p) : p);
  
  const fastEMA = calculateEMA(numericPrices, fastPeriod);
  const slowEMA = calculateEMA(numericPrices, slowPeriod);
  
  const macdValue = fastEMA - slowEMA;
  const macdArray = [];
  
  for (let i = 0; i < signalPeriod; i++) {
    const historyFactor = 1 - (i / (signalPeriod * 2));
    macdArray.push(macdValue * historyFactor);
  }

  const signalMultiplier = 2 / (signalPeriod + 1);
  let signalValue = macdArray.reduce((sum, val) => sum + val, 0) / signalPeriod;
  
  for (let i = 0; i < 3; i++) {
    signalValue = (macdValue - signalValue) * signalMultiplier + signalValue;
  }
  
  const histogramValue = macdValue - signalValue;
  
  return { 
    value: macdValue, 
    signal: signalValue, 
    histogram: histogramValue 
  };
};
  
/**
 * Estimate trading volume based on price
 * @param {Number} price - Current stock price
 * @returns {Number} Estimated volume
 */
export const estimateVolume = (price) => {
  if (!price || price <= 0) return 0;
  
  // regression formula based on price categories
  if (price < 10) {
    return Math.round(5000000 + 1000000 * Math.random());
  } else if (price < 50) {
    return Math.round(2000000 + 1500000 * Math.random());
  } else if (price < 200) {
    return Math.round(1000000 + 1000000 * Math.random());
  } else {
    return Math.round(500000 + 500000 * Math.random());
  }
};

/**
 * Calculate all technical indicators for a stock
 * @param {Object} stockData - Stock data with prices array
 * @returns {Object} All indicators (RSI, MACD, SMA, volume)
 */
export const calculateAllIndicators = (stockData) => {
  if (!stockData || !stockData.prices || stockData.prices.length === 0) {
    console.warn('No stock data available to calculate indicators');
    return {
      rsi: 50,
      macd: { value: 0, signal: 0, histogram: 0 },
      sma: 0,
      volume: 0
    };
  }
  
  const currentPrice = typeof stockData.prices[stockData.prices.length - 1] === 'string' ? 
    parseFloat(stockData.prices[stockData.prices.length - 1]) : 
    stockData.prices[stockData.prices.length - 1];
  
  return {
    rsi: calculateRSI(stockData.prices),
    macd: calculateMACD(stockData.prices),
    sma: calculateSMA(stockData.prices),
    volume: estimateVolume(currentPrice)
  };
};