import { mount } from '@vue/test-utils';
import StockNewsHint from '@/components/game/hint/StockNewsHint.vue';
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

describe('StockNewsHint.vue', () => {
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
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: false,
        stockData: { 
          name: 'Apple Inc.', 
          news: [{ title: 'Test News', source: 'Test Source', summary: 'Test Summary' }] 
        },
        roundNumber: 1
      }
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });
  
  it('renders with news items when visible and news are available', () => {
    const testNews = [
      { title: 'News 1', source: 'Source 1', summary: 'Summary 1' },
      { title: 'News 2', source: 'Source 2', summary: 'Summary 2' }
    ];
    
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: true,
        stockData: { 
          name: 'Apple Inc.', 
          news: testNews
        },
        roundNumber: 1
      }
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe('Latest News for Apple Inc.');
    
    // Check if news items are rendered
    const newsItems = wrapper.findAll('.news-item');
    expect(newsItems.length).toBe(2);
    
    // Check first news item content
    expect(newsItems[0].find('.news-title').text()).toBe('News 1');
    expect(newsItems[0].find('.news-source').text()).toBe('Source 1');
    expect(newsItems[0].find('.news-summary').text()).toBe('Summary 1');
    
    // Verify no-news message is not shown
    expect(wrapper.find('.no-news').exists()).toBe(false);
  });
  
  it('displays no-news message when no news are available', () => {
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: true,
        stockData: { 
          name: 'Apple Inc.', 
          news: [] 
        },
        roundNumber: 1
      }
    });
    
    // Verify no news items are rendered
    expect(wrapper.findAll('.news-item').length).toBe(0);
    
    // Verify no-news message is shown
    expect(wrapper.find('.no-news').exists()).toBe(true);
    expect(wrapper.find('.no-news p').text()).toBe('No news available for this stock.');
  });
  
  it('starts timer with 20s duration when news are available', async () => {
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: false,
        stockData: { 
          name: 'Apple Inc.', 
          news: [{ title: 'Test News', source: 'Test Source', summary: 'Test Summary' }]
        },
        roundNumber: 1
      }
    });
    
    await wrapper.setProps({ visible: true });
    
    expect(useTimer).toHaveBeenCalledWith(
      20,
      expect.any(Function),
      expect.any(Function)
    );
    expect(mockTimer.start).toHaveBeenCalled();
    expect(PopupState.activateModalPopup).toHaveBeenCalledWith('stockNews');
  });
  
  it('starts timer with 3s duration when no news are available', async () => {
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: false,
        stockData: { 
          name: 'Apple Inc.', 
          news: []
        },
        roundNumber: 1
      }
    });
    
    await wrapper.setProps({ visible: true });
    
    expect(useTimer).toHaveBeenCalledWith(
      3,
      expect.any(Function),
      expect.any(Function)
    );
    expect(mockTimer.start).toHaveBeenCalled();
  });
  
  it('stops timer and deactivates popup when becomes invisible', async () => {
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: true,
        stockData: { 
          name: 'Apple Inc.', 
          news: [{ title: 'Test News', source: 'Test Source', summary: 'Test Summary' }]
        },
        roundNumber: 1
      }
    });
    
    await wrapper.setProps({ visible: false });
    
    expect(mockTimer.stop).toHaveBeenCalled();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('stockNews');
  });
  
  it('updates remaining time when timer callback is triggered', async () => {
    // Capture the callback function
    let timeCallback;
    useTimer.mockImplementation((duration, timeCb) => {
      timeCallback = timeCb;
      return mockTimer;
    });
    
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: true,
        stockData: { 
          name: 'Apple Inc.', 
          news: [{ title: 'Test News', source: 'Test Source', summary: 'Test Summary' }]
        },
        roundNumber: 1
      }
    });
    
    // Simulate time update
    timeCallback(15);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.timer').text()).toBe('15s');
  });
  
  it('emits close event when timer completes', () => {
    // Capture the completion callback
    let completionCallback;
    useTimer.mockImplementation((duration, timeCb, completionCb) => {
      completionCallback = completionCb;
      return mockTimer;
    });
    
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: true,
        stockData: { 
          name: 'Apple Inc.', 
          news: [{ title: 'Test News', source: 'Test Source', summary: 'Test Summary' }]
        },
        roundNumber: 1
      }
    });
    
    // Simulate timer completion
    completionCallback();
    
    expect(wrapper.emitted().close).toBeTruthy();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('stockNews');
  });
  
  it('stops timer and deactivates popup when component is unmounted', () => {
    const wrapper = mount(StockNewsHint, {
      props: {
        visible: true,
        stockData: { 
          name: 'Apple Inc.', 
          news: [{ title: 'Test News', source: 'Test Source', summary: 'Test Summary' }]
        },
        roundNumber: 1
      }
    });
    
    wrapper.unmount();
    
    expect(mockTimer.stop).toHaveBeenCalled();
    expect(PopupState.deactivateModalPopup).toHaveBeenCalledWith('stockNews');
  });
});