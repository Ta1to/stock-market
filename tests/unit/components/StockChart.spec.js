import { mount } from '@vue/test-utils';
import StockChart from '@/components/StockChart.vue';
import { getChartConfig } from '@/utils/stockDataUtils';

// Mock the chartjs component to avoid canvas rendering issues in tests
jest.mock('vue-chartjs', () => ({
  Line: {
    props: ['data', 'options'],
    template: '<div class="mock-chart"></div>'
  }
}));

// Mock the stockDataUtils to control chart config
jest.mock('@/utils/stockDataUtils', () => ({
  getChartConfig: jest.fn().mockReturnValue({
    responsive: true,
    maintainAspectRatio: false
  })
}));

describe('StockChart.vue', () => {
  let wrapper;
  let mockStockData;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock stock data
    mockStockData = {
      dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
      prices: [150, 155, 153]
    };
    
    // Create the component wrapper
    wrapper = mount(StockChart, {
      props: {
        stockData: mockStockData
      }
    });
  });

  it('renders correctly with stock data', () => {
    // Component should be rendered
    expect(wrapper.exists()).toBe(true);
    
    // Chart container should be visible
    expect(wrapper.find('.chart-container').exists()).toBe(true);
    
    // Mock chart should be rendered
    expect(wrapper.find('.mock-chart').exists()).toBe(true);
    
    // Loading message should not be visible
    expect(wrapper.find('.no-data').exists()).toBe(false);
  });

  it('shows loading message when no data is available', async () => {
    await wrapper.setProps({
      stockData: { dates: [], prices: [] }
    });
    
    // Chart container should not be visible
    expect(wrapper.find('.chart-container').exists()).toBe(false);
    
    // Loading message should be visible
    expect(wrapper.find('.no-data').exists()).toBe(true);
    expect(wrapper.find('.no-data').text()).toBe('Loading stock data...');
  });

  it('processes chartData correctly', () => {
    // Access the computed property directly
    const chartData = wrapper.vm.chartData;
    
    // Check that labels match the dates from props
    expect(chartData.labels).toEqual(['2023-01-01', '2023-01-02', '2023-01-03']);
    
    // Check that prices are correctly set
    expect(chartData.datasets[0].data).toEqual([150, 155, 153]);
    
    // Check some styling properties
    expect(chartData.datasets[0].label).toBe('Stock Price');
    expect(chartData.datasets[0].borderColor).toBe('#3b82f6');
    expect(chartData.datasets[0].backgroundColor).toBe('rgba(59, 130, 246, 0.1)');
  });

  it('uses the chart config from stockDataUtils', () => {
    // Check that getChartConfig was called with the dark mode parameter
    expect(getChartConfig).toHaveBeenCalledWith(true);
    
    // Check that chartOptions returns the value from getChartConfig
    expect(wrapper.vm.chartOptions).toEqual({
      responsive: true,
      maintainAspectRatio: false
    });
  });
});