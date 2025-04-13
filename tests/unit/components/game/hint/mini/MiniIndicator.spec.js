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
  
  it('toggles expansion when header is clicked', async () => {
    // Start not expanded
    PopupState.isActivePopup.mockReturnValue(false);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      }
    });
    
    // Initial state: not expanded
    expect(wrapper.find('.mini-indicators-container').classes()).not.toContain('expanded');
    
    // Click to expand
    await wrapper.find('.mini-indicators-header').trigger('click');
    expect(PopupState.activatePopup).toHaveBeenCalledWith('mini-indicators');
    
    // Manually update the mock to simulate the state change
    PopupState.isActivePopup.mockReturnValue(true);
    await wrapper.vm.$nextTick();
    
    // Now it should be expanded
    expect(wrapper.find('.mini-indicators-container').classes()).toContain('expanded');
    
    // Click again to collapse
    await wrapper.find('.mini-indicators-header').trigger('click');
    expect(PopupState.deactivatePopup).toHaveBeenCalledWith('mini-indicators');
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
  
  it('displays MACD with bullish class when MACD > 0 and above signal line', async () => {
    // Mock that popup is active to show content
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData, // Default mock has MACD value > signal
        roundNumber: 1
      }
    });
    
    // Wait for component to update
    await wrapper.vm.$nextTick();
    
    const macdValue = wrapper.find('.indicator-item:nth-child(2) .indicator-value');
    expect(macdValue.text()).toBe('2.50');
    expect(macdValue.classes()).toContain('bullish');
  });
  
  it('displays MACD with weak-bullish class when MACD < 0 but above signal line', async () => {
    // Mock that popup is active to show content
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: {
          ...mockStockData,
          technicalIndicators: {
            rsi: mockStockData.technicalIndicators.rsi,
            macd: { value: -0.5, signal: -1.8, histogram: 1.3 }
          }
        },
        roundNumber: 1
      }
    });
    
    // Wait for component to update
    await wrapper.vm.$nextTick();
    
    const macdValue = wrapper.find('.indicator-item:nth-child(2) .indicator-value');
    expect(macdValue.text()).toBe('-0.50');
    expect(macdValue.classes()).toContain('weak-bullish');
  });
  
  // Rest of the tests...
  it('handles case when no technical indicators are available', async () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: { symbol: 'AAPL', name: 'Apple Inc.' }, // No technicalIndicators property
        roundNumber: 1
      }
    });
    
    await wrapper.vm.$nextTick();
    
    expect(console.warn).toHaveBeenCalledWith("No technical indicators available for", "AAPL");
    expect(wrapper.findAll('.indicator-item').length).toBe(0);
  });
  
  it('reloads indicators when stockData changes', async () => {
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      }
    });
    
    const loadIndicatorsSpy = jest.spyOn(wrapper.vm, 'loadIndicators');
    
    // Update stock data
    await wrapper.setProps({
      stockData: {
        ...mockStockData,
        technicalIndicators: {
          rsi: 60,
          macd: { value: 3.0, signal: 2.0, histogram: 1.0 }
        }
      }
    });
    
    expect(loadIndicatorsSpy).toHaveBeenCalled();
  });
  
  it('reloads indicators when roundNumber changes', async () => {
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      }
    });
    
    const loadIndicatorsSpy = jest.spyOn(wrapper.vm, 'loadIndicators');
    
    // Update round number
    await wrapper.setProps({ roundNumber: 2 });
    
    expect(loadIndicatorsSpy).toHaveBeenCalled();
  });
  
  it('deactivates popup on unmount if expanded', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      }
    });
    
    wrapper.unmount();
    expect(PopupState.deactivatePopup).toHaveBeenCalledWith('mini-indicators');
  });
  
  it('hides when any modal is active', async () => {
    // Set modal to be active, which should hide the component
    PopupState.isAnyModalActive.mockReturnValue(true);
    
    const wrapper = mount(MiniIndicator, {
      props: {
        stockData: mockStockData,
        roundNumber: 1
      },
      attachTo: document.body // Attach to make isVisible work properly
    });
    
    // We can only check v-show state via the style attribute since component is rendered
    expect(wrapper.find('.mini-indicators-container').element.style.display).toBe('none');
    
    // Change modal visibility and force update
    PopupState.isAnyModalActive.mockReturnValue(false);
    await wrapper.vm.$nextTick();
    
    // Should now be visible
    expect(wrapper.find('.mini-indicators-container').element.style.display).not.toBe('none');
  });
});