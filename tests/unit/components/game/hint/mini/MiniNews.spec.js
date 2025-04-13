import { mount } from '@vue/test-utils';
import MiniNews from '@/components/game/hint/mini/MiniNews.vue';
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

describe('MiniNews.vue', () => {
  // Mock stock data with news
  const mockStockData = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    news: [
      { summary: 'Apple announces new MacBook Pro with M3 chip' },
      { summary: 'iPhone sales exceed expectations in Q3' }
    ]
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    PopupState.isActivePopup.mockReturnValue(false);
    PopupState.isAnyModalActive.mockReturnValue(false);
  });
  
  it('renders collapsed by default', () => {
    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });
    
    expect(wrapper.find('.mini-news-container').exists()).toBe(true);
    expect(wrapper.find('.mini-news-header').text()).toBe('Latest News ▶');
    expect(wrapper.find('.news-content').exists()).toBe(false);
  });
  
  it('shows expanded view when PopupState.isActivePopup returns true', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });
    
    expect(wrapper.find('.mini-news-container').classes()).toContain('expanded');
    expect(wrapper.find('.mini-news-header').text()).toBe('Latest News ▼');
    expect(wrapper.find('.news-content').exists()).toBe(true);
  });
  
  it('toggles expansion when header is clicked', async () => {
    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });
    
    // Initial state: not expanded
    expect(wrapper.find('.mini-news-container').classes()).not.toContain('expanded');
    
    // Click to expand
    await wrapper.find('.mini-news-header').trigger('click');
    expect(PopupState.activatePopup).toHaveBeenCalledWith('mini-news');
    
    // Simulate expanded state
    PopupState.isActivePopup.mockReturnValue(true);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.mini-news-container').classes()).toContain('expanded');
    
    // Click again to collapse
    await wrapper.find('.mini-news-header').trigger('click');
    expect(PopupState.deactivatePopup).toHaveBeenCalledWith('mini-news');
  });
  
  it('displays news items when expanded and news is available', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });
    
    expect(wrapper.find('.news-list').exists()).toBe(true);
    expect(wrapper.findAll('.news-item').length).toBe(2);
    
    const newsItems = wrapper.findAll('.news-item');
    expect(newsItems[0].find('.news-summary').text()).toBe('Apple announces new MacBook Pro with M3 chip');
    expect(newsItems[1].find('.news-summary').text()).toBe('iPhone sales exceed expectations in Q3');
    
    // No-news message should not be shown
    expect(wrapper.find('.no-news').exists()).toBe(false);
  });
  
  it('displays no-news message when expanded but no news is available', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniNews, {
      props: {
        stockData: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          news: [] // Empty news array
        }
      }
    });
    
    expect(wrapper.find('.news-list').exists()).toBe(false);
    expect(wrapper.find('.no-news').exists()).toBe(true);
    expect(wrapper.find('.no-news p').text()).toBe('No news available for this stock.');
  });
  
  it('handles case when news property is undefined', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniNews, {
      props: {
        stockData: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
          // No news property
        }
      }
    });
    
    expect(wrapper.find('.news-list').exists()).toBe(false);
    expect(wrapper.find('.no-news').exists()).toBe(true);
  });
  
  it('deactivates popup on unmount if expanded', () => {
    PopupState.isActivePopup.mockReturnValue(true);
    
    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });
    
    wrapper.unmount();
    expect(PopupState.deactivatePopup).toHaveBeenCalledWith('mini-news');
  });
  
  it('hides when any modal is active', async () => {
    // Set modal to be active, which should hide the component
    PopupState.isAnyModalActive.mockReturnValue(true);
    
    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      },
      attachTo: document.body // Attach to make style visibility checks work properly
    });
    
    // We can check v-show state via the style attribute
    expect(wrapper.find('.mini-news-container').element.style.display).toBe('none');
    
    // Change modal visibility and force update
    PopupState.isAnyModalActive.mockReturnValue(false);
    await wrapper.vm.$nextTick();
    
    // Should now be visible
    expect(wrapper.find('.mini-news-container').element.style.display).not.toBe('none');
  });
});