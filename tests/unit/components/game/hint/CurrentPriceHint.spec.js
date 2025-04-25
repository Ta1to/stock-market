import { mount } from '@vue/test-utils';
import CurrentPriceHint from '@/components/game/hint/CurrentPriceHint.vue';

// Mock dependencies
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

describe('CurrentPriceHint.vue', () => {
  const defaultProps = {
    visible: true,
    stockData: { 
      prices: [150.25, 152.50, 155.75]
    },
    roundNumber: 1
  };
  
  it('does not render when not visible', () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        ...defaultProps,
        visible: false
      }
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });
  
  it('renders when visible with correct price', () => {
    const wrapper = mount(CurrentPriceHint, {
      props: defaultProps
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe('The Current Stock Price');
    expect(wrapper.find('.price-value').text()).toBe('$155.75');
  });
  
  it('shows N/A when stockData has no prices', () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        ...defaultProps,
        stockData: { prices: [] }
      }
    });
    
    expect(wrapper.find('.price-value').text()).toBe('$N/A');
  });
});