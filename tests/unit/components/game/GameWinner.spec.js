import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import GameWinner from '@/components/game/GameWinner.vue';

// Mock the Vue Router
const mockRouter = {
  push: jest.fn()
};

jest.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

describe('GameWinner.vue', () => {
  // Mock data for testing
  const defaultProps = {
    visible: true,
    players: [
      { uid: 'player1', name: 'Player 1', chips: 1500 },
      { uid: 'player2', name: 'Player 2', chips: 2000 },
      { uid: 'player3', name: 'Player 3', chips: 1000 },
      { uid: 'player4', name: 'Player 4', chips: 500 }
    ],
    gameId: 'game123',
    onGameEnd: jest.fn()
  };

  // Helper function to create wrapper with custom props
  const createWrapper = (props = {}) => {
    return mount(GameWinner, {
      props: { ...defaultProps, ...props },
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });
  };

  // Clear mock calls before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setInterval and clearInterval for countdown testing
    jest.useFakeTimers();
  });

  // Restore timers after tests
  afterEach(() => {
    jest.useRealTimers();
  });
  it('renders correctly when visible', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.game-winner-overlay').exists()).toBe(true);
    expect(wrapper.find('.winner-title').text()).toBe('Game Over');
    expect(wrapper.find('.countdown-timer').text()).toContain('All players returning to lobby in 30 seconds');
  });

  it('does not render when not visible', () => {
    const wrapper = createWrapper({ visible: false });
    
    expect(wrapper.find('.game-winner-overlay').exists()).toBe(false);
  });

  it('sorts players by chip count', () => {
    const wrapper = createWrapper();
    
    // First place should be player2 (most chips)
    const firstPlace = wrapper.find('.first-place');
    expect(firstPlace.find('.player-name').text()).toBe('Player 2');
    expect(firstPlace.find('.player-chips').text()).toBe('2000 chips');
    
    // Second place should be player1
    const secondPlace = wrapper.find('.second-place');
    expect(secondPlace.find('.player-name').text()).toBe('Player 1');
    expect(secondPlace.find('.player-chips').text()).toBe('1500 chips');
    
    // Third place should be player3
    const thirdPlace = wrapper.find('.third-place');
    expect(thirdPlace.find('.player-name').text()).toBe('Player 3');
    expect(thirdPlace.find('.player-chips').text()).toBe('1000 chips');
  });

  it('shows other players outside the top 3', () => {
    const wrapper = createWrapper();
    
    // Player4 should be in the "other players" section
    const otherPlayers = wrapper.find('.other-players');
    expect(otherPlayers.exists()).toBe(true);
    
    const playerItems = otherPlayers.findAll('.player-item');
    expect(playerItems.length).toBe(1);
    expect(playerItems[0].find('.player-name').text()).toBe('Player 4');
    expect(playerItems[0].find('.player-chips').text()).toBe('500 chips');
    expect(playerItems[0].find('.player-rank').text()).toBe('4');
  });

  it('does not show other players section if there are 3 or fewer players', () => {
    const wrapper = createWrapper({
      players: [
        { uid: 'player1', name: 'Player 1', chips: 1500 },
        { uid: 'player2', name: 'Player 2', chips: 2000 },
        { uid: 'player3', name: 'Player 3', chips: 1000 }
      ]
    });
    
    expect(wrapper.find('.other-players').exists()).toBe(false);
  });

  it('shows appropriate winner message when margin is narrow', () => {
    const wrapper = createWrapper({
      players: [
        { uid: 'player1', name: 'Player 1', chips: 1530 },
        { uid: 'player2', name: 'Player 2', chips: 1500 },
      ]
    });
    
    expect(wrapper.find('.winner-message').text()).toBe('Player 1 wins by a narrow margin!');
  });

  it('shows appropriate winner message when margin is large', () => {
    const wrapper = createWrapper({
      players: [
        { uid: 'player1', name: 'Player 1', chips: 2500 },
        { uid: 'player2', name: 'Player 2', chips: 1500 },
      ]
    });
    
    expect(wrapper.find('.winner-message').text()).toBe('Player 1 dominates the table as the ultimate Stock Poker champion!');
  });

  it('gets correct initial letter from player name', () => {
    const wrapper = createWrapper();
    
    // Check first place player initial
    expect(wrapper.findAll('.player-initial')[0].text()).toBe('P'); // For "Player 2"
  });

  it('returns to lobby when button is clicked', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.return-button').trigger('click');
    
    expect(defaultProps.onGameEnd).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('automatically returns to lobby when countdown reaches zero', async () => {
    createWrapper();
    
    // Fast-forward timer to end of countdown
    jest.advanceTimersByTime(30000);
    
    // Need to wait for Vue to process
    await flushPromises();
    
    expect(defaultProps.onGameEnd).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('starts countdown when becoming visible', async () => {
    const wrapper = createWrapper({ visible: false });
    
    // Update prop to make component visible
    await wrapper.setProps({ visible: true });
    
    expect(wrapper.find('.countdown-timer').text()).toContain('30 seconds');
    
    // Advance timer and check countdown decreases
    jest.advanceTimersByTime(5000);
    await nextTick();
    
    expect(wrapper.find('.countdown-timer').text()).toContain('25 seconds');
  });

  it('clears countdown when becoming invisible', async () => {
    const wrapper = createWrapper();
    
    // Make invisible
    await wrapper.setProps({ visible: false });
    
    // Advance timer
    jest.advanceTimersByTime(30000);
    
    // onGameEnd should not have been called since timer should be cleared
    expect(defaultProps.onGameEnd).not.toHaveBeenCalled();
  });
});