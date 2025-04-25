import { mount } from '@vue/test-utils';
import MiniIndicator from '@/components/game/hint/mini/MiniIndicator.vue';
import { PopupState } from '@/utils/popupEventBus';

// Mock dependencies
jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
    isActivePopup: jest.fn(),
    activatePopup: jest.fn(),
    deactivatePopup: jest.fn(),
    isAnyModalActive: jest.fn()
  }
}));

describe('MiniIndicator.vue', () => {
  // Mock stock data with technical indicators
  const mockStockData = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    technicalIndicators: {
      rsi: 55,
      macd: {
        value: 2.5,
        signal: 1.8,
        histogram: 0.7
      }
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    PopupState.isActivePopup.mockReturnValue(false);
    PopupState.isAnyModalActive.mockReturnValue(false);
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });
  
  it('renders collapsed by default', () => {
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      }
    });
    
    expect(wrapper.find('.mini-indicators-container').exists()).toBe(true);
    expect(wrapper.find('.mini-indicators-header').exists()).toBe(true);
    expect(wrapper.find('.mini-indicators-content').exists()).toBe(false);
  });
  
  it('displays expanded view when PopupState.isActivePopup returns true', () => {
    // Mock that popup is active
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      }
    });
    
    // Expanded class should be applied based on the isExpanded computed property
    expect(wrapper.find('.mini-indicators-container').classes()).toContain('expanded');
    expect(wrapper.find('.mini-indicators-content').exists()).toBe(true);
  });
  
  it('displays RSI with correct styling for neutral condition', async () => {
    // Mock that popup is active to show content
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      }
    });
    
    // Wait for component to update
    await wrapper.vm.$nextTick();
    
    const rsiValue = wrapper.find('.indicator-item:first-child .indicator-value');
    expect(rsiValue.text()).toBe('55.00');
    expect(rsiValue.classes()).toContain('neutral');
  });
  
  it('displays RSI with correct styling for overbought condition', async () => {
    // Mock that popup is active to show content
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: {
          ...mockStockData,
          technicalIndicators: {
            rsi: 75,
            macd: mockStockData.technicalIndicators.macd
          }
        },
        roundNumber: 1
      }
    });
    
    // Wait for component to update
    await wrapper.vm.$nextTick();
    
    const rsiValue = wrapper.find('.indicator-item:first-child .indicator-value');
    expect(rsiValue.text()).toBe('75.00');
    expect(rsiValue.classes()).toContain('overbought');
  });
  
  it('displays RSI with correct styling for oversold condition', async () => {
    // Mock that popup is active to show content
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: {
          ...mockStockData,
          technicalIndicators: {
            rsi: 25,
            macd: mockStockData.technicalIndicators.macd
          }
        },
        roundNumber: 1
      }
    });
    
    // Wait for component to update
    await wrapper.vm.$nextTick();
    
    const rsiValue = wrapper.find('.indicator-item:first-child .indicator-value');
    expect(rsiValue.text()).toBe('25.00');
    expect(rsiValue.classes()).toContain('oversold');
  });
    
});