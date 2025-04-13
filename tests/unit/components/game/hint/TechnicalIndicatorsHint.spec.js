import { mount } from '@vue/test-utils';
import TechnicalIndicatorsHint from '@/components/game/hint/TechnicalIndicatorsHint.vue';
import { useTimer } from '@/utils/timerUtils';
import { PopupState } from '@/utils/popupEventBus';

// Mock dependencies
jest.mock('@/utils/timerUtils', () => ({
  useTimer: jest.fn()
}));

jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
    activateModalPopup: jest.fn(),
    deactivateModalPopup: jest.fn()
  }
}));

describe('TechnicalIndicatorsHint.vue', () => {
  let mockTimer;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockTimer = {
      start: jest.fn(),
      stop: jest.fn()
    };
    useTimer.mockReturnValue(mockTimer);
    console.warn = jest.fn();
  });
  
  const createComponent = (props = {}) => {
    return mount(TechnicalIndicatorsHint, {
      props: {
        visible: true,
        stockData: {
          name: 'Apple Inc.',
          symbol: 'AAPL',
          technicalIndicators: {
            rsi: 55,
            macd: {
              value: 2.5,
              signal: 1.8,
              histogram: 0.7
            }
          },
          ...props.stockData
        },
        roundNumber: 1,
        ...props
      }
    });
  };
  
  it('does not render when not visible', () => {
    const wrapper = createComponent({ visible: false });
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });
  
  it('renders with stock information in header', () => {
    const wrapper = createComponent();
    expect(wrapper.find('.indicators-header h2').text()).toBe('Technical Indicators - Apple Inc. (AAPL)');
  });
  
  it('displays RSI indicator with correct styling for neutral condition', () => {
    const wrapper = createComponent();
    
    const rsiValue = wrapper.find('.indicator-card:first-child .indicator-value');
    expect(rsiValue.text()).toBe('55.00');
    expect(rsiValue.classes()).toContain('neutral');
  });
  
  it('displays RSI indicator with correct styling for overbought condition', () => {
    const wrapper = createComponent({
      stockData: {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        technicalIndicators: {
          rsi: 75,
          macd: { value: 2.5, signal: 1.8, histogram: 0.7 }
        }
      }
    });
    
    const rsiValue = wrapper.find('.indicator-card:first-child .indicator-value');
    expect(rsiValue.text()).toBe('75.00');
    expect(rsiValue.classes()).toContain('overbought');
  });
  
  it('displays RSI indicator with correct styling for oversold condition', () => {
    const wrapper = createComponent({
      stockData: {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        technicalIndicators: {
          rsi: 25,
          macd: { value: 2.5, signal: 1.8, histogram: 0.7 }
        }
      }
    });
    
    const rsiValue = wrapper.find('.indicator-card:first-child .indicator-value');
    expect(rsiValue.text()).toBe('25.00');
    expect(rsiValue.classes()).toContain('oversold');
  });
  
  it('displays MACD indicator with bullish class when MACD > 0 and above signal line', () => {
    const wrapper = createComponent({
      stockData: {
        technicalIndicators: {
          rsi: 55,
          macd: { value: 2.5, signal: 1.8, histogram: 0.7 }
        }
      }
    });
    
    const macdValue = wrapper.find('.indicator-card:nth-child(2) .indicator-value');
    expect(macdValue.text()).toBe('2.50');
    expect(macdValue.classes()).toContain('bullish');
  });
  
  it('displays MACD indicator with weak-bullish class when MACD < 0 but above signal line', () => {
    const wrapper = createComponent({
      stockData: {
        technicalIndicators: {
          rsi: 55,
          macd: { value: -0.5, signal: -1.8, histogram: 1.3 }
        }
      }
    });
    
    const macdValue = wrapper.find('.indicator-card:nth-child(2) .indicator-value');
    expect(macdValue.text()).toBe('-0.50');
    expect(macdValue.classes()).toContain('weak-bullish');
  });
  
  it('displays MACD indicator with weak-bearish class when MACD > 0 but below signal line', () => {
    const wrapper = createComponent({
      stockData: {
        technicalIndicators: {
          rsi: 55,
          macd: { value: 0.5, signal: 1.8, histogram: -1.3 }
        }
      }
    });
    
    const macdValue = wrapper.find('.indicator-card:nth-child(2) .indicator-value');
    expect(macdValue.text()).toBe('0.50');
    expect(macdValue.classes()).toContain('weak-bearish');
  });
  
  it('displays MACD indicator with bearish class when MACD < 0 and below signal line', () => {
    const wrapper = createComponent({
      stockData: {
        technicalIndicators: {
          rsi: 55,
          macd: { value: -1.5, signal: -0.8, histogram: -0.7 }
        }
      }
    });
    
    const macdValue = wrapper.find('.indicator-card:nth-child(2) .indicator-value');
    expect(macdValue.text()).toBe('-1.50');
    expect(macdValue.classes()).toContain('bearish');
  });
  
  it('generates analysis text for overbought conditions', () => {
    const wrapper = createComponent({
      stockData: {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        technicalIndicators: {
          rsi: 75,
          macd: { value: 2.5, signal: 1.8, histogram: 0.7 }
        }
      }
    });
    
    const analysis = wrapper.find('.indicator-analysis p').text();
    expect(analysis).toContain('overbought conditions');
    expect(analysis).toContain('bullish momentum');
    expect(analysis).toContain('might be better to avoid buying');
  });
  
  it('generates analysis text for oversold conditions', () => {
    const wrapper = createComponent({
      stockData: {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        technicalIndicators: {
          rsi: 25,
          macd: { value: -1.5, signal: -0.8, histogram: -0.7 }
        }
      }
    });
    
    const analysis = wrapper.find('.indicator-analysis p').text();
    expect(analysis).toContain('oversold conditions');
    expect(analysis).toContain('below the signal line');
    expect(analysis).toContain('potential buying opportunity');
  });
  
  it('shows loading error when indicators are not available', () => {
    const wrapper = createComponent({
      stockData: {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        // No technicalIndicators property
      }
    });
    
    expect(wrapper.find('.loading-error').exists()).toBe(true);
    expect(console.warn).toHaveBeenCalledWith("No prefetched indicators available for", 'AAPL');
  });
  
  it('starts timer and activates popup when becomes visible', async () => {
    const wrapper = createComponent({ visible: false });
    
    await wrapper.setProps({ visible: true });
    
    expect(useTimer).toHaveBeenCalledWith(
      15,
      expect.any(Function),
      expect.any(Function)
    );
    expect(mockTimer.start).toHaveBeenCalled();
    expect(PopupState.activateModalPopup).toHaveBeenCalledWith('technicalIndicators');
  });
  
  it('stops timer and deactivates popup when becomes invisible', async () => {
    const wrapper = createComponent();
    
    await wrapper.setProps({ visible: false });
    
    expect(mockTimer.stop).toHaveBeenCalled();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('technicalIndicators');
  });
  
  it('updates countdown when timer callback is triggered', async () => {
    // Capture the time callback function
    let timeCallback;
    useTimer.mockImplementation((duration, timeCb) => {
      timeCallback = timeCb;
      return mockTimer;
    });
    
    const wrapper = createComponent();
    
    // Simulate timer update
    timeCallback(10);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.countdown').text()).toBe('10s');
  });
  
  it('emits close event and deactivates popup when timer completes', () => {
    // Capture the completion callback
    let completionCallback;
    useTimer.mockImplementation((duration, timeCb, completionCb) => {
      completionCallback = completionCb;
      return mockTimer;
    });
    
    const wrapper = createComponent();
    
    // Simulate timer completion
    completionCallback();
    
    expect(wrapper.emitted().close).toBeTruthy();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('technicalIndicators');
  });
  
  it('stops timer and deactivates popup when component is unmounted', () => {
    const wrapper = createComponent();
    
    wrapper.unmount();
    
    expect(mockTimer.stop).toHaveBeenCalled();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('technicalIndicators');
  });
});