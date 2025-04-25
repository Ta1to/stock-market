import { mount, flushPromises } from '@vue/test-utils';
import TechnicalIndicatorsHint from '@/components/game/hint/TechnicalIndicatorsHint.vue';

// Mock the dependencies
jest.mock('@/utils/timerUtils', () => ({
  useTimer: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn()
  }))
}));

jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
      activateModalPopup: jest.fn(),
      deactivateModalPopup: jest.fn()
  }
}));

jest.mock('@/utils/technicalIndicatorUtils', () => ({
  calculateRSI: jest.fn(() => 50),
  calculateMACD: jest.fn(() => ({ macd: 0, signal: 0, histogram: 0 })),
  extractClosingPrices: jest.fn(() => [100, 101, 102]),
  getRsiClass: jest.fn(() => 'neutral'),
  getMacdClass: jest.fn(() => 'neutral')
}));

describe('TechnicalIndicatorsHint.vue', () => {
  const defaultProps = {
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
      }
    },
    roundNumber: 1
  };

  it('renders header correctly when visible is true', () => {
    const wrapper = mount(TechnicalIndicatorsHint, {
      props: defaultProps
    });
    const header = wrapper.find('.indicators-header h2');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain(defaultProps.stockData.name);
  });
  
  it('does not render indicators popup when visible is false', () => {
    const wrapper = mount(TechnicalIndicatorsHint, {
      props: { ...defaultProps, visible: false }
    });

    expect(wrapper.find('.indicators-popup').exists()).toBe(false);
  });
  
  it('displays RSI value correctly', async () => {
    const wrapper = mount(TechnicalIndicatorsHint, {
      props: defaultProps
    });
    await flushPromises();
    const rsiValueEl = wrapper.find('.indicator-card:first-child .indicator-value');
    expect(rsiValueEl.exists()).toBe(true);
    expect(rsiValueEl.text()).toBe('55.00');
  });
  
});