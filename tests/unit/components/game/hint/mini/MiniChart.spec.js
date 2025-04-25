import { mount } from '@vue/test-utils';
import MiniChart from '@/components/game/hint/mini/MiniChart.vue';
import StockChart from '@/components/StockChart.vue';
import { getLimitedStockData } from '@/utils/stockDataUtils';
import { PopupState } from '@/utils/popupEventBus';

// Mock dependencies
jest.mock('@/utils/stockDataUtils', () => ({
  getLimitedStockData: jest.fn()
}));

jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
    isActivePopup: jest.fn(),
    activatePopup: jest.fn(),
    deactivatePopup: jest.fn(),
    isAnyModalActive: jest.fn()
  }
}));

// Mock StockChart component
jest.mock('@/components/StockChart.vue', () => ({
  name: 'StockChart',
  render: () => {}
}));

describe('MiniChart.vue', () => {
  const mockStockData = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    prices: [150, 155, 160]
  };
  
  const mockLimitedStockData = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    prices: [155, 160]
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    PopupState.isActivePopup.mockReturnValue(false);
    PopupState.isAnyModalActive.mockReturnValue(false);
    getLimitedStockData.mockReturnValue(mockLimitedStockData);
  });
  
  it('renders collapsed by default', () => {
    const wrapper = mount(MiniChart, {
      props: {
        stockData: mockStockData
      },
      global: {
        stubs: {
          StockChart: true
        }
      }
    });
    
    expect(wrapper.find('.mini-chart-container').exists()).toBe(true);
    expect(wrapper.find('.mini-chart-header').text()).toBe('Stock Chart ▶');
    expect(wrapper.find('.chart-content').isVisible()).toBe(false);
  });
  
  it('shows expanded view when PopupState.isActivePopup returns true', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniChart, {
      props: {
        stockData: mockStockData
      },
      global: {
        stubs: {
          StockChart: true
        }
      }
    });
    
    expect(wrapper.find('.mini-chart-container').classes()).toContain('expanded');
    expect(wrapper.find('.mini-chart-header').text()).toBe('Stock Chart ▼');
    expect(wrapper.find('.chart-content').isVisible()).toBe(true);
  });
  
  it('deactivates popup on unmount if expanded', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniChart, {
      props: {
        stockData: mockStockData
      },
      global: {
        stubs: {
          StockChart: true
        }
      }
    });
    
    wrapper.unmount();
    expect(PopupState.deactivatePopup).toHaveBeenCalledWith('mini-chart');
  });
  
});