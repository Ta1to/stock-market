import { mount } from '@vue/test-utils';
import StockNewsHint from '@/components/game/hint/StockNewsHint.vue';

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

describe('StockNewsHint.vue', () => {
  const defaultProps = {
    visible: true,
    stockData: { 
      name: 'Apple Inc.', 
      news: [
        { title: 'News 1', source: 'Source 1', summary: 'Summary 1' },
        { title: 'News 2', source: 'Source 2', summary: 'Summary 2' }
      ] 
    },
    roundNumber: 1
  };
  
  it('renders when visible is true', () => {
    const wrapper = mount(StockNewsHint, {
      props: defaultProps
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe('Latest News for Apple Inc.');
  });
  
  it('does not render when visible is false', () => {
    const wrapper = mount(StockNewsHint, {
      props: {
        ...defaultProps,
        visible: false
      }
    });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });
  
  it('displays news items correctly', () => {
    const wrapper = mount(StockNewsHint, {
      props: defaultProps
    });
    
    const newsItems = wrapper.findAll('.news-item');
    expect(newsItems.length).toBe(2);
    expect(newsItems[0].find('.news-summary').text()).toBe('Summary 1');
    expect(newsItems[0].find('.news-source-text').text()).toBe('Source: Source 1');
  });
});