import { mount } from '@vue/test-utils';
import PredictionResult from '@/components/game/PredictionResult.vue';

describe('PredictionResult.vue', () => {
  // Mock data for testing
  const defaultProps = {
    visible: true,
    stockData: {
      name: 'Apple Inc.',
      symbol: 'AAPL',
      prices: [150.25, 152.50, 155.75]
    },
    roundNumber: 2,
    predictions: {
      'player1': 156.50, // closest to actual (155.75)
      'player2': 160.25,
      'player3': 152.00
    },
    roundsData: {
      2: {
        bets: {
          'player1': { bet: 50, folded: false },
          'player2': { bet: 75, folded: false },
          'player3': { bet: 100, folded: false },
          'player4': { bet: 0, folded: true }
        }
      }
    },
    players: [
      { uid: 'player1', name: 'Player 1', chips: 1000 },
      { uid: 'player2', name: 'Player 2', chips: 1500 },
      { uid: 'player3', name: 'Player 3', chips: 800 },
      { uid: 'player4', name: 'Player 4', chips: 500 }
    ],
    potAmount: 225, // sum of bets (50 + 75 + 100)
    winner: { uid: 'player1', name: 'Player 1', chips: 1000 }
  };

  const createWrapper = (props = {}) => {
    return mount(PredictionResult, {
      props: { ...defaultProps, ...props }
    });
  };

  it('renders correctly when visible', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.result-header h2').text()).toBe('Round 2 Results');
    expect(wrapper.find('.stock-info h3').text()).toBe('Apple Inc. (AAPL)');
  });

  it('does not render when not visible', () => {
    const wrapper = createWrapper({ visible: false });
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('displays the current stock price correctly', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.current-price .price-value').text()).toBe('$155.75');
  });

  it('displays the winner announcement correctly', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.winner-announcement h3').text()).toBe('Player 1 wins the round!');
    expect(wrapper.find('.winner-announcement p').text()).toContain('$156.50');
    expect(wrapper.find('.winner-announcement p').text()).toContain('$155.75');
  });

  it('displays all active players in the table', () => {
    const wrapper = createWrapper();
    
    // There should be 3 active players (excluding the folded player)
    const playerRows = wrapper.findAll('tbody tr');
    expect(playerRows.length).toBe(3);
    
    // The first row should be the winner
    expect(playerRows[0].classes()).toContain('winner-row');
    expect(playerRows[0].find('td:first-child').text()).toBe('Player 1');
  });

  it('shows correct predictions and differences for each player', () => {
    const wrapper = createWrapper();
    
    const playerRows = wrapper.findAll('tbody tr');
    
    // Check Player 1 (winner)
    expect(playerRows[0].findAll('td')[1].text()).toBe('$156.50'); // prediction
    expect(playerRows[0].findAll('td')[2].text()).toBe('$0.75');   // difference from actual
    expect(playerRows[0].findAll('td')[3].text()).toBe('+225 chips'); // winnings
    
    // Check Player 2
    expect(playerRows[1].findAll('td')[1].text()).toBe('$160.25'); // prediction
    expect(playerRows[1].findAll('td')[2].text()).toBe('$4.50');   // difference from actual
    expect(playerRows[1].findAll('td')[3].text()).toBe('-75 chips'); // lost bet
  });

  it('handles case with no winner correctly', () => {
    const wrapper = createWrapper({
      winner: null
    });
    
    expect(wrapper.find('.no-winner').exists()).toBe(true);
    expect(wrapper.find('.no-winner h3').text()).toBe('No winner for this round');
  });

  it('displays only active players who did not fold', () => {
    const wrapper = createWrapper();
    
    // Player 4 folded and should not be in the table
    const playerRows = wrapper.findAll('tbody tr');
    const playerNames = Array.from(playerRows).map(row => 
      row.find('td:first-child').text()
    );
    
    expect(playerNames).toContain('Player 1');
    expect(playerNames).toContain('Player 2');
    expect(playerNames).toContain('Player 3');
    expect(playerNames).not.toContain('Player 4');
  });

  it('emits close event when continue button is clicked', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.continue-button').trigger('click');
    
    expect(wrapper.emitted().close).toBeTruthy();
  });

  it('calculates player bets correctly', () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm;
    
    expect(vm.playerBet('player1')).toBe(50);
    expect(vm.playerBet('player2')).toBe(75);
    expect(vm.playerBet('player3')).toBe(100);
    expect(vm.playerBet('player4')).toBe(0); // Folded player
    expect(vm.playerBet('nonexistent')).toBe(0); // Non-existent player
  });

  it('determines if a player has folded correctly', () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm;
    
    expect(vm.playerFolded('player1')).toBe(false);
    expect(vm.playerFolded('player2')).toBe(false);
    expect(vm.playerFolded('player3')).toBe(false);
    expect(vm.playerFolded('player4')).toBe(true);
    expect(vm.playerFolded('nonexistent')).toBe(false); // Non-existent player
  });
});