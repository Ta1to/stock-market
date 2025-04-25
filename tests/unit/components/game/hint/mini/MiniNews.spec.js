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
  const popupId = 'mini-news'; // Define the expected popupId

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    PopupState.isActivePopup.mockImplementation((id) => false); // Default to false for any ID
    PopupState.isAnyModalActive.mockReturnValue(false);
  });

  // Test 1: Renders collapsed by default
  it('renders collapsed by default', () => {
    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });

    expect(wrapper.find('.mini-news-container').exists()).toBe(true);
    expect(wrapper.find('.mini-news-header').text()).toBe('Latest News ▶');
    // Use isVisible() for elements controlled by v-show
    expect(wrapper.find('.news-content').isVisible()).toBe(false);
  });

  // Test 3: Displays news items when expanded and news is available
  it('displays news items when expanded and news is available', async () => {
    // Simulate expanded state for this test
    PopupState.isActivePopup.mockImplementation((id) => id === popupId);

    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });
    await wrapper.vm.$nextTick(); // Ensure component updates based on mocked state

    expect(wrapper.find('.news-content').isVisible()).toBe(true); // Check visibility
    expect(wrapper.find('.news-list').exists()).toBe(true);
    expect(wrapper.findAll('.news-item').length).toBe(2);

    const newsItems = wrapper.findAll('.news-item');
    expect(newsItems[0].find('.news-summary').text()).toBe('Apple announces new MacBook Pro with M3 chip');
    expect(newsItems[1].find('.news-summary').text()).toBe('iPhone sales exceed expectations in Q3');
    expect(wrapper.find('.no-news').exists()).toBe(false);
  });

  // Test 4: Displays no-news message when expanded but no news is available
  it('displays no-news message when expanded but no news is available', async () => {
    // Simulate expanded state for this test
    PopupState.isActivePopup.mockImplementation((id) => id === popupId);

    const wrapper = mount(MiniNews, {
      props: {
        stockData: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          news: [] // Empty news array
        }
      }
    });
    await wrapper.vm.$nextTick(); // Ensure component updates based on mocked state

    expect(wrapper.find('.news-content').isVisible()).toBe(true); // Check visibility
    expect(wrapper.find('.news-list').exists()).toBe(false);
    expect(wrapper.find('.no-news').exists()).toBe(true);
    expect(wrapper.find('.no-news p').text()).toBe('No news available for this stock.');
  });

  // Test 5: Hides when any modal is active
  it('hides when any modal is active', async () => {
    PopupState.isAnyModalActive.mockReturnValue(true); // Modal is active

    const wrapper = mount(MiniNews, {
      props: {
        stockData: mockStockData
      }
    });
    await wrapper.vm.$nextTick();

    // Check computed property directly
    expect(wrapper.vm.isAnyModalActive).toBe(true);
    // Check visibility of the main container
    expect(wrapper.find('.mini-news-container').isVisible()).toBe(false);
  });
});