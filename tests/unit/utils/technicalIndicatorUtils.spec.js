import {
  calculateRSI,
  calculateEMA,
  calculateMACD,
  getRsiClass,
  getMacdClass,
  extractClosingPrices
} from '@/utils/technicalIndicatorUtils';

describe('technicalIndicatorUtils.js', () => {
  describe('calculateRSI', () => {
    it('should return 50 if not enough data is provided', () => {
      expect(calculateRSI([])).toBe(50);
      expect(calculateRSI([100], 14)).toBe(50);
    });

    it('should calculate RSI correctly', () => {
      const prices = [45, 46, 47, 46, 45, 44, 43, 44, 45, 46, 47, 48, 49, 50, 51];
      const rsi = calculateRSI(prices);
      expect(rsi).toBeGreaterThan(0);
      expect(rsi).toBeLessThan(100);
    });
  });

  describe('getRsiClass', () => {
    it('should return correct CSS class based on RSI value', () => {
      expect(getRsiClass(75)).toBe('overbought');
      expect(getRsiClass(50)).toBe('neutral');
      expect(getRsiClass(20)).toBe('oversold');
    });
  });

  describe('extractClosingPrices', () => {
    it('should extract closing prices from different data formats', () => {
      const historyData = [
        { close: 100 },
        { c: 200 },
        300,
        null
      ];
      const result = extractClosingPrices(historyData);
      expect(result).toEqual([100, 200, 300]);
    });

    it('should return empty array for invalid input', () => {
      expect(extractClosingPrices(null)).toEqual([]);
      expect(extractClosingPrices(undefined)).toEqual([]);
      expect(extractClosingPrices('not an array')).toEqual([]);
    });
  });
});