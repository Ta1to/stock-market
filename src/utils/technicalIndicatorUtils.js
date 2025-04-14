/**
 * Utility functions for technical indicators calculations
 */

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array<number>} prices - Array of price values
 * @param {number} period - Period for RSI calculation, defaults to 14
 * @returns {number} - Calculated RSI value between 0-100
 */
export function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i-1]);
  }
  
  let gains = 0;
  let losses = 0;
  
  for (const change of changes.slice(-period)) {
    if (change > 0) gains += change;
    else if (change < 0) losses -= change;
  }
  
  if (losses === 0) return 100;
  
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array<number>} prices - Array of price values
 * @param {number} period - Period for EMA calculation
 * @returns {number|null} - Calculated EMA value or null if not enough data
 */
export function calculateEMA(prices, period) {
  if (!prices || prices.length < period) return null;
  
  const k = 2 / (period + 1);
  
  // Simple Moving Average
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[prices.length - 1 - i];
  }
  let ema = sum / period;
  
  // Apply EMA formula to remaining prices
  for (let i = prices.length - period - 1; i >= 0; i--) {
    ema = prices[i] * k + ema * (1 - k);
  }
  
  return ema;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param {Array<number>} prices - Array of price values
 * @param {number} fastPeriod - Fast EMA period, defaults to 12
 * @param {number} slowPeriod - Slow EMA period, defaults to 26
 * @returns {Object} - Object containing MACD line, signal line, and histogram values
 */
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26) {
  const defaultResult = {
    macd: 0,
    signal: 0,
    histogram: 0
  };
  
  if (!prices || prices.length < Math.max(fastPeriod, slowPeriod)) {
    return defaultResult;
  }
  
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);
  
  if (ema12 === null || ema26 === null) {
    return defaultResult;
  }
  
  const macd = ema12 - ema26;
  
  const signal = macd * 0.2 + (macd * 0.8); 
  const histogram = macd - signal;
  
  return {
    macd,
    signal,
    histogram
  };
}

/**
 * Get class for RSI value styling
 * @param {number} rsi - RSI value
 * @returns {string} - CSS class name
 */
export function getRsiClass(rsi) {
  if (rsi > 70) return 'overbought';
  if (rsi < 30) return 'oversold';
  return 'neutral';
}

/**
 * Get class for MACD value styling
 * @param {number} macdValue - MACD line value
 * @param {number} signalValue - Signal line value
 * @returns {string} - CSS class name
 */
export function getMacdClass(macdValue, signalValue) {
  if (macdValue > 0 && macdValue > signalValue) return 'bullish';
  if (macdValue <= 0 && macdValue > signalValue) return 'weak-bullish';
  if (macdValue > 0 && macdValue <= signalValue) return 'weak-bearish';
  return 'bearish';
}

/**
 * Extract closing prices from historical data
 * @param {Array} historyData - Historical data points
 * @returns {Array<number>} - Array of closing prices
 */
export function extractClosingPrices(historyData) {
  if (!historyData || !Array.isArray(historyData)) return [];
  
  return historyData.map(dataPoint => {
    if (!dataPoint) return null;
    if (dataPoint.close) return dataPoint.close;
    if (dataPoint.c) return dataPoint.c;
    if (typeof dataPoint === 'number') return dataPoint;
    return null;
  }).filter(price => price !== null);
}