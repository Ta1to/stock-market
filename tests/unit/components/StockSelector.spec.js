import { shallowMount } from '@vue/test-utils'
import StockSelector from '@/components/StockSelector.vue'
import { stockList } from '@/utils/stock-list'

// Mock Firebase dependencies
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    // Simulate a database snapshot with no data initially
    callback({
      val: () => null
    });
    return jest.fn(); // Return a function to simulate unsubscribe
  }),
  get: jest.fn(() => Promise.resolve({
    val: () => ({
      stocks: [{
        name: 'Test Stock',
        symbol: 'TEST'
      }]
    })
  }))
}));

jest.mock('@/api/firebase-api', () => ({
  db: {}
}));

jest.mock('@/services/database', () => ({
  updateData: jest.fn().mockResolvedValue(true)
}));

describe('StockSelector.vue', () => {
  let wrapper;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    wrapper = shallowMount(StockSelector, {
      props: {
        visible: true,
        gameId: 'test-game',
        roundNumber: 1,
        isCreator: true
      }
    });
  });
  
  it('renders when visible prop is true', () => {
    expect(wrapper.find('.stock-selector').exists()).toBe(true);
  });
  
  it('does not render when visible prop is false', async () => {
    await wrapper.setProps({ visible: false });
    expect(wrapper.find('.stock-selector').exists()).toBe(false);
  });
  
  it('displays spin button only for creator', () => {
    expect(wrapper.find('.spin-button').exists()).toBe(true);
    
    wrapper = shallowMount(StockSelector, {
      props: {
        visible: true,
        gameId: 'test-game',
        roundNumber: 1,
        isCreator: false
      }
    });
    
    expect(wrapper.find('.spin-button').exists()).toBe(false);
  });
  
  it('initializes with correct default state', () => {
    expect(wrapper.vm.spinning).toBe(false);
    expect(wrapper.vm.stockSelected).toBe(false);
    expect(wrapper.vm.countdown).toBe(5);
    expect(wrapper.vm.displayedStock).toEqual(stockList[0]);
  });
});