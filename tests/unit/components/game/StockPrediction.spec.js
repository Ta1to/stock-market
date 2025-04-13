import { mount } from '@vue/test-utils';
import StockPrediction from '@/components/game/StockPrediction.vue';
import StockChart from '@/components/StockChart.vue';

// Mock StockChart component to simplify testing
jest.mock('@/components/StockChart.vue', () => ({
  name: 'StockChart',
  render: () => {}
}));

// Mock stockDataUtils
jest.mock('@/utils/stockDataUtils', () => ({
  getLimitedStockData: jest.fn(stockData => stockData)
}));

describe('StockPrediction.vue', () => {
  // Mock data for testing
  const defaultProps = {
    visible: true,
    stockData: {
      name: 'Apple Inc.',
      symbol: 'AAPL',
      dates: ['2023-04-01', '2023-04-02', '2023-04-03'],
      prices: [150.25, 152.50, 151.75],
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
      sector: 'Technology',
      industry: 'Consumer Electronics'
    },
    roundNumber: 1
  };

  const createWrapper = (props = {}) => {
    return mount(StockPrediction, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          StockChart: true
        }
      }
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe('Stock Price Prediction');
    expect(wrapper.find('.company-info').exists()).toBe(true);
  });

  it('does not render when not visible', () => {
    const wrapper = createWrapper({ visible: false });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('displays company information from stock data', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.description').text()).toBe(defaultProps.stockData.description);
    expect(wrapper.find('.info-grid').text()).toContain(defaultProps.stockData.sector);
    expect(wrapper.find('.info-grid').text()).toContain(defaultProps.stockData.industry);
  });

  it('handles missing company information gracefully', () => {
    const wrapper = createWrapper({
      stockData: {
        name: 'Unknown Stock',
        symbol: 'UNKN',
        dates: ['2023-04-01', '2023-04-02'],
        prices: [100, 101]
      }
    });
    
    expect(wrapper.find('.description').text()).toBe('No description available');
    expect(wrapper.find('.info-grid').text()).toContain('N/A'); // For sector and industry
  });

  it('includes the StockChart component when stock data is provided', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.findComponent(StockChart).exists()).toBe(true);
  });

  it('allows users to enter and submit predictions', async () => {
    const wrapper = createWrapper();
    
    // Initially shows input field and no submitted prediction
    expect(wrapper.find('.prediction-input').exists()).toBe(true);
    expect(wrapper.find('.prediction-submitted').exists()).toBe(false);
    
    // Enter a prediction
    await wrapper.find('input[type="number"]').setValue('160.50');
    
    // Submit the prediction
    await wrapper.find('.prediction-input button').trigger('click');
    
    // Check that UI changes to show the submitted prediction
    expect(wrapper.find('.prediction-input').exists()).toBe(false);
    expect(wrapper.find('.prediction-submitted').exists()).toBe(true);
    expect(wrapper.find('.prediction-submitted').text()).toContain('160.5');
    
    // Check that the submit event was emitted with correct value
    expect(wrapper.emitted().submit).toBeTruthy();
    expect(wrapper.emitted().submit[0]).toEqual([160.5]);
  });

  it('validates that prediction input is a number', async () => {
    const wrapper = createWrapper();
    
    // Enter an invalid prediction (non-number)
    await wrapper.find('input[type="number"]').setValue('invalid');
    
    // Submit the prediction
    await wrapper.find('.prediction-input button').trigger('click');
    
    // Check that no event was emitted and UI did not change
    expect(wrapper.emitted().submit).toBeFalsy();
    expect(wrapper.find('.prediction-input').exists()).toBe(true);
    expect(wrapper.find('.prediction-submitted').exists()).toBe(false);
  });

  it('resets prediction state when round number changes', async () => {
    const wrapper = createWrapper();
    
    // Submit a prediction first
    await wrapper.find('input[type="number"]').setValue('160.50');
    await wrapper.find('.prediction-input button').trigger('click');
    
    // Verify prediction was submitted
    expect(wrapper.find('.prediction-submitted').exists()).toBe(true);
    
    // Change the round number
    await wrapper.setProps({ roundNumber: 2 });
    
    // Verify prediction state was reset
    expect(wrapper.find('.prediction-input').exists()).toBe(true);
    expect(wrapper.find('.prediction-submitted').exists()).toBe(false);
  });

  it('resets prediction state when visibility changes', async () => {
    const wrapper = createWrapper();
    
    // Submit a prediction first
    await wrapper.find('input[type="number"]').setValue('160.50');
    await wrapper.find('.prediction-input button').trigger('click');
    
    // Hide component
    await wrapper.setProps({ visible: false });
    
    // Show component again
    await wrapper.setProps({ visible: true });
    
    // Verify prediction state was reset
    expect(wrapper.find('.prediction-input').exists()).toBe(true);
    expect(wrapper.find('.prediction-submitted').exists()).toBe(false);
  });
});