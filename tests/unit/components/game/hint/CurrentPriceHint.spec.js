import { mount } from '@vue/test-utils';
import CurrentPriceHint from '@/components/game/hint/CurrentPriceHint.vue';
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

describe('CurrentPriceHint.vue', () => {
  let mockTimer;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup timer mock
    mockTimer = {
      start: jest.fn(),
      stop: jest.fn()
    };
    useTimer.mockReturnValue(mockTimer);
  });
  
  it('does not render when not visible', () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: false,
        stockData: { prices: [150.25, 152.50, 155.75] },
        roundNumber: 1
      }
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });
  
  it('renders when visible with correct price', () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: true,
        stockData: { prices: [150.25, 152.50, 155.75] },
        roundNumber: 1
      }
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe('The Current Stock Price');
    expect(wrapper.find('.price-value').text()).toBe('$155.75');
  });
  
  it('shows N/A when stockData has no prices', () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: true,
        stockData: { prices: [] },
        roundNumber: 1
      }
    });
    
    expect(wrapper.find('.price-value').text()).toBe('$N/A');
  });
  
  it('starts timer and activates popup when becomes visible', async () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: false,
        stockData: { prices: [150.25, 152.50, 155.75] },
        roundNumber: 1
      }
    });
    
    await wrapper.setProps({ visible: true });
    
    expect(useTimer).toHaveBeenCalled();
    expect(mockTimer.start).toHaveBeenCalled();
    expect(PopupState.activateModalPopup).toHaveBeenCalledWith('currentPrice');
  });
  
  it('stops timer and deactivates popup when becomes invisible', async () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: true,
        stockData: { prices: [150.25, 152.50, 155.75] },
        roundNumber: 1
      }
    });
    
    await wrapper.setProps({ visible: false });
    
    expect(mockTimer.stop).toHaveBeenCalled();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('currentPrice');
  });
  
  it('updates remaining time when timer callback is triggered', async () => {
    // Capture the callback function
    let timeCallback;
    useTimer.mockImplementation((duration, timeCb) => {
      timeCallback = timeCb;
      return mockTimer;
    });
    
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: true,
        stockData: { prices: [150.25, 152.50, 155.75] },
        roundNumber: 1
      }
    });
    
    // Simulate time update
    timeCallback(5);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.timer').text()).toBe('5s');
  });
  
  it('emits close event when timer completes', () => {
    // Capture the completion callback
    let completionCallback;
    useTimer.mockImplementation((duration, timeCb, completionCb) => {
      completionCallback = completionCb;
      return mockTimer;
    });
    
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: true,
        stockData: { prices: [150.25, 152.50, 155.75] },
        roundNumber: 1
      }
    });
    
    // Simulate timer completion
    completionCallback();
    
    expect(wrapper.emitted().close).toBeTruthy();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('currentPrice');
  });
  
  it('stops timer and deactivates popup when component is unmounted', () => {
    const wrapper = mount(CurrentPriceHint, {
      props: {
        visible: true,
        stockData: { prices: [150.25, 152.50, 155.75] },
        roundNumber: 1
      }
    });
    
    wrapper.unmount();
    
    expect(mockTimer.stop).toHaveBeenCalled();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('currentPrice');
  });
});