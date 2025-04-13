import { mount } from '@vue/test-utils';
import MiniPrice from '@/components/game/hint/mini/MiniPrice.vue';
import { PopupState } from '@/utils/popupEventBus';

// Mock dependencies
jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
    isAnyModalActive: jest.fn()
  }
}));

describe('MiniPrice.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PopupState.isAnyModalActive.mockReturnValue(false);
  });
  
  it('does not render when stockData is null', () => {
    const wrapper = mount(MiniPrice, {
      props: {
        stockData: null
      }
    });
    
    expect(wrapper.find('.mini-price-container').exists()).toBe(false);
  });
  
  it('renders with correct current price', () => {
    const wrapper = mount(MiniPrice, {
      props: {
        stockData: { prices: [145.75, 146.50, 147.25] }
      }
    });
    
    expect(wrapper.find('.mini-price-container').exists()).toBe(true);
    expect(wrapper.find('.mini-price-label').text()).toBe('Current Price:');
    expect(wrapper.find('.mini-price-value').text()).toBe('$147.25');
  });
  
  it('shows N/A when prices array is empty', () => {
    const wrapper = mount(MiniPrice, {
      props: {
        stockData: { prices: [] }
      }
    });
    
    expect(wrapper.find('.mini-price-value').text()).toBe('$N/A');
  });
  
  it('hides when any modal is active', async () => {
    PopupState.isAnyModalActive.mockReturnValue(true);
    
    const wrapper = mount(MiniPrice, {
      props: {
        stockData: { prices: [145.75, 146.50, 147.25] }
      }
    });
    
    // Should be in the DOM but hidden
    expect(wrapper.find('.mini-price-container').exists()).toBe(true);
    expect(wrapper.find('.mini-price-container').isVisible()).toBe(false);
    
    // Change state of modal visibility
    PopupState.isAnyModalActive.mockReturnValue(false);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.mini-price-container').isVisible()).toBe(true);
  });
});