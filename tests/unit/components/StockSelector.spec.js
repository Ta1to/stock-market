import { mount, flushPromises } from '@vue/test-utils';
import StockSelector from '@/components/StockSelector.vue';
import { stockList } from '@/utils/stock-list';
import { ref, onValue, get } from "firebase/database";
import { db } from '@/api/firebase-api';
import { updateData } from '@/services/database';

// Mock dependencies
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
  get: jest.fn()
}));

jest.mock('@/api/firebase-api', () => ({
  db: {}
}));

jest.mock('@/services/database', () => ({
  updateData: jest.fn()
}));

jest.mock('@/utils/stock-list', () => ({
  stockList: [
    { symbol: 'AAPL', name: 'Apple Inc' },
    { symbol: 'MSFT', name: 'Microsoft Corp' },
    { symbol: 'GOOGL', name: 'Alphabet Inc' }
  ]
}));

describe('StockSelector.vue', () => {
  let wrapper;
  let mockGetPromise;
  let mockOnValueCallback;

  // Helper function to create the component with props
  const createComponent = (props = {}) => {
    return mount(StockSelector, {
      props: {
        visible: true,
        gameId: 'test-game-1',
        roundNumber: 1,
        isCreator: false,
        ...props
      }
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock the get function to return a Promise
    mockGetPromise = Promise.resolve({
      val: () => ({
        phase: 1,
        isSpinning: false,
        stocks: [{ symbol: 'AAPL', name: 'Apple Inc' }]
      })
    });
    get.mockReturnValue(mockGetPromise);
    
    // Set up the onValue mock to capture the callback
    onValue.mockImplementation((ref, callback) => {
      mockOnValueCallback = callback;
      return () => {}; // Return unsubscribe function
    });
    
    // Spy on console methods
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    wrapper = createComponent();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders correctly when visible', async () => {
    expect(wrapper.find('.stock-selector').exists()).toBe(true);
    expect(wrapper.find('.slot-machine').exists()).toBe(true);
    expect(wrapper.find('.stock').text()).toBe('Apple Inc (AAPL)');
  });

  it('does not render when not visible', async () => {
    await wrapper.setProps({ visible: false });
    expect(wrapper.find('.stock-selector').exists()).toBe(false);
  });
  
  it('sets up a database listener on creation', () => {
    expect(ref).toHaveBeenCalledWith(db, 'games/test-game-1/rounds/1');
    expect(get).toHaveBeenCalled();
    expect(onValue).toHaveBeenCalled();
  });

  it('resets state when round number changes', async () => {
    // Initial setup
    await wrapper.setProps({ roundNumber: 1 });
    
    // Change the round number
    await wrapper.setProps({ roundNumber: 2 });
    
    // Check that the component was reset
    expect(wrapper.vm.stockSelected).toBe(false);
    expect(wrapper.vm.countdown).toBe(5);
    expect(wrapper.vm.spinning).toBe(false);
    
    // Check that the listener was set up for the new round
    expect(ref).toHaveBeenCalledWith(db, 'games/test-game-1/rounds/2');
  });

  it('shows the spin button only for game creator when not spinning', async () => {
    // Initially not a creator, so button should not be visible
    expect(wrapper.find('.spin-button').exists()).toBe(false);
    
    // Set as creator
    await wrapper.setProps({ isCreator: true });
    
    // Button should now be visible
    expect(wrapper.find('.spin-button').exists()).toBe(true);
    
    // Simulate spinning
    wrapper.vm.spinning = true;
    await wrapper.vm.$nextTick();
    
    // Button should not be visible while spinning
    expect(wrapper.find('.spin-button').exists()).toBe(false);
  });

  it('initiates spin when button is clicked by creator', async () => {
    // Set as creator
    await wrapper.setProps({ isCreator: true });
    
    // Ensure we have a pre-selected stock
    wrapper.vm.preSelectedStock = { symbol: 'AAPL', name: 'Apple Inc' };
    
    // Click the spin button
    await wrapper.find('.spin-button').trigger('click');
    
    // Check that the database was updated
    expect(updateData).toHaveBeenCalledWith(
      'games/test-game-1/rounds/1',
      { isSpinning: true }
    );
    
    // Wait for the timeout to complete
    jest.advanceTimersByTime(3000);
    
    // Check that spinning was stopped in the database
    expect(updateData).toHaveBeenCalledWith(
      'games/test-game-1/rounds/1',
      { isSpinning: false }
    );
  });

  it('does not initiate spin if not creator', async () => {
    // Ensure not creator
    await wrapper.setProps({ isCreator: false });
    
    // Try to call the method directly
    await wrapper.vm.initiateSpin();
    
    // Check that the database was not updated
    expect(updateData).not.toHaveBeenCalled();
  });

  it('starts spin animation when database indicates spinning', async () => {
    // Mock starting animation
    wrapper.vm.startSpinAnimation = jest.fn();
    
    // Simulate a database update that starts spinning
    const mockSnapshot = {
      val: () => ({
        isSpinning: true
      })
    };
    mockOnValueCallback(mockSnapshot);
    
    // Check that animation was started
    expect(wrapper.vm.startSpinAnimation).toHaveBeenCalled();
  });

  it('stops spin animation when database indicates not spinning', async () => {
    // Set up initial state
    wrapper.vm.spinning = true;
    wrapper.vm.stopSpinAnimation = jest.fn();
    
    // Simulate a database update that stops spinning
    const mockSnapshot = {
      val: () => ({
        isSpinning: false
      })
    };
    mockOnValueCallback(mockSnapshot);
    
    // Check that animation was stopped
    expect(wrapper.vm.stopSpinAnimation).toHaveBeenCalled();
  });

  it('updates displayed stock during spin animation', () => {
    // Start a spin animation 
    wrapper.vm.startSpinAnimation();
    
    // Check initial state
    const initialStock = wrapper.vm.displayedStock;
    
    // Advance the timer to trigger an interval
    jest.advanceTimersByTime(100);
    
    // Stock should have changed
    expect(wrapper.vm.displayedStock).not.toEqual(initialStock);
  });

  it('emits stock-selected event when spin stops', () => {
    // Set preSelectedStock
    wrapper.vm.preSelectedStock = { symbol: 'GOOGL', name: 'Alphabet Inc' };
    
    // Stop the animation
    wrapper.vm.stopSpinAnimation();
    
    // Check that the event was emitted with the selected stock
    expect(wrapper.emitted('stock-selected')).toBeTruthy();
    expect(wrapper.emitted('stock-selected')[0][0]).toEqual({ 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc' 
    });
  });

  it('starts countdown after stock is selected', () => {
    // Stop the animation which starts the countdown
    wrapper.vm.stopSpinAnimation();
    
    // Check initial countdown value
    expect(wrapper.vm.countdown).toBe(5);
    
    // Advance timer by 1 second
    jest.advanceTimersByTime(1000);
    expect(wrapper.vm.countdown).toBe(4);
    
    // Advance timer to completion
    jest.advanceTimersByTime(4000);
    
    // Check countdown is complete
    expect(wrapper.vm.countdown).toBe(0);
    expect(wrapper.vm.stockSelected).toBe(false);
    
    // Check that phase-complete event was emitted
    expect(wrapper.emitted('phase-complete')).toBeTruthy();
  });

  it('clears interval on beforeUnmount', () => {
    // Create an interval
    wrapper.vm.spinInterval = setInterval(() => {}, 100);
    
    // Spy on clearInterval
    jest.spyOn(global, 'clearInterval');
    
    // Trigger beforeUnmount
    wrapper.unmount();
    
    // Check that interval was cleared
    expect(clearInterval).toHaveBeenCalled();
  });
});