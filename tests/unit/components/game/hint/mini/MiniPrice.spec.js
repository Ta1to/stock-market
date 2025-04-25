import { mount } from '@vue/test-utils';
import MiniPrice from '@/components/game/hint/mini/MiniPrice.vue';
import { PopupState } from '@/utils/popupEventBus';

// Mock dependencies
jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
    isAnyModalActive: jest.fn().mockReturnValue(false) // Default mock value
  }
}));

describe('MiniPrice.vue', () => {
  // Test 1: Does not render the container when stockData is null
  it('does not render when stockData is null', () => {
    const wrapper = mount(MiniPrice, {
      props: {
        stockData: null
      }
    });
    expect(wrapper.find('.mini-price-container').exists()).toBe(false);
  });

  // Test 2: Renders correctly with valid stock data
  it('renders with correct current price when stockData is valid', () => {
    const wrapper = mount(MiniPrice, {
      props: {
        stockData: { prices: [145.75, 146.50, 147.25] }
      }
    });
    expect(wrapper.find('.mini-price-container').exists()).toBe(true);
    expect(wrapper.find('.mini-price-label').text()).toBe('Current Price:');
    expect(wrapper.find('.mini-price-value').text()).toBe('$147.25');
  });

  // Test 3: Shows 'N/A' when the prices array is empty
  it('shows N/A when prices array is empty', () => {
    const wrapper = mount(MiniPrice, {
      props: {
        stockData: { prices: [] }
      }
    });
    expect(wrapper.find('.mini-price-container').exists()).toBe(true); // Container should still render
    expect(wrapper.find('.mini-price-value').text()).toBe('$N/A');
  });
});