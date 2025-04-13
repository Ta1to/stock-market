import { getLimitedStockData, getChartConfig } from '@/utils/stockDataUtils';

describe('stockDataUtils', () => {
  describe('getLimitedStockData', () => {
    it('should return null if stockData is undefined', () => {
      expect(getLimitedStockData()).toBeNull();
    });

    it('should return null if stockData has no dates or prices', () => {
      expect(getLimitedStockData({})).toBeNull();
      expect(getLimitedStockData({ dates: [] })).toBeNull();
      expect(getLimitedStockData({ prices: [] })).toBeNull();
    });

    it('should return limited stock data correctly', () => {
      const mockStockData = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
        prices: [100, 105, 110, 115, 120, 125, 130]
      };
      
      const result = getLimitedStockData(mockStockData);
      
      expect(result.dates.length).toBe(mockStockData.dates.length - 2);
      expect(result.prices.length).toBe(mockStockData.prices.length - 5);
      expect(result.dates).toEqual(['2023-01-01', '2023-01-02', '2023-01-03']);
      expect(result.prices).toEqual([100, 105]);
    });
  });

  describe('getChartConfig', () => {
    it('should return correct configuration for dark mode', () => {
      const config = getChartConfig(true);
      
      expect(config.responsive).toBe(true);
      expect(config.scales.y.grid.color).toBe('rgba(255, 255, 255, 0.05)');
      expect(config.scales.y.ticks.color).toBe('rgba(255, 255, 255, 0.7)');
    });

    it('should return correct configuration for light mode', () => {
      const config = getChartConfig(false);
      
      expect(config.responsive).toBe(true);
      expect(config.scales.y.grid.color).toBe('rgba(0, 0, 0, 0.1)');
      expect(config.scales.y.ticks.color).toBe('rgba(0, 0, 0, 0.7)');
    });
    
    it('should format y-axis ticks with dollar sign and two decimals', () => {
      const config = getChartConfig(true);
      const ticksCallback = config.scales.y.ticks.callback;
      
      // Test the callback function for formatting ticks
      const formattedValue = ticksCallback(123.456);
      expect(formattedValue).toBe('$ 123.46');
      
      // Test with integer value
      const integerValue = ticksCallback(100);
      expect(integerValue).toBe('$ 100.00');
      
      // Test with zero
      const zeroValue = ticksCallback(0);
      expect(zeroValue).toBe('$ 0.00');
    });
  });
});