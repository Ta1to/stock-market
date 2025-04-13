import { mount } from '@vue/test-utils';
import PokerTable from '@/components/game/PokerTable.vue';
import PlayerCard from '@/components/game/PlayerCard.vue';

// Mock the PlayerCard component
jest.mock('@/components/game/PlayerCard.vue', () => ({
  name: 'PlayerCard',
  props: ['player', 'currentUserId'],
  template: '<div class="mock-player-card">{{ player.name }}</div>'
}));

describe('PokerTable.vue', () => {
  // Mock data for testing
  const defaultProps = {
    players: [
      { uid: 'player1', id: 'player1', name: 'Player 1', chips: 1000 },
      { uid: 'player2', id: 'player2', name: 'Player 2', chips: 1500 },
      { uid: 'player3', id: 'player3', name: 'Player 3', chips: 800 }
    ],
    currentUserId: 'player1',
    pot: 200,
    currentRound: 1,
    roundsData: {
      1: {
        bets: {
          player1: { bet: 50, folded: false },
          player2: { bet: 100, folded: false },
          player3: { bet: 0, folded: true }
        }
      }
    }
  };

  const createWrapper = (props = {}) => {
    return mount(PokerTable, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          PlayerCard: true
        }
      }
    });
  };

  it('renders the poker table with correct pot amount', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.table-surface').exists()).toBe(true);
    expect(wrapper.find('.pot-display').text()).toContain('Pot: 200');
  });

  it('renders player cards for each player', () => {
    const wrapper = createWrapper();
    
    const playerCards = wrapper.findAllComponents(PlayerCard);
    expect(playerCards.length).toBe(3);
  });

  it('correctly calculates player position styles', () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm;
    
    // Test for first player
    const style0 = vm.getPositionStyle(0, 3);
    expect(style0.position).toBe('absolute');
    expect(style0.transform).toBe('translate(-50%, -50%)');
    
    // Different positions for different indexes
    const style1 = vm.getPositionStyle(1, 3);
    const style2 = vm.getPositionStyle(2, 3);
    
    // Positions should be different for different players
    expect(style0).not.toEqual(style1);
    expect(style1).not.toEqual(style2);
  });

  it('correctly gets player bet amount', () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm;
    
    expect(vm.getPlayerBet('player1')).toBe(50);
    expect(vm.getPlayerBet('player2')).toBe(100);
    expect(vm.getPlayerBet('player3')).toBe(0);
    expect(vm.getPlayerBet('player4')).toBe(0); // Non-existent player
  });

  it('correctly determines if player has folded', () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm;
    
    expect(vm.hasPlayerFolded('player1')).toBe(false);
    expect(vm.hasPlayerFolded('player2')).toBe(false);
    expect(vm.hasPlayerFolded('player3')).toBe(true);
    expect(vm.hasPlayerFolded('player4')).toBe(false); // Non-existent player
  });

  it('generates chip stack correctly based on bet amount', () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm;
    
    // Test for 0 chips
    expect(vm.generateChipStack(0)).toEqual([]);
    
    // Test for 156 chips (1 gold, 2 silver, 1 blue, 1 red)
    const chipStack = vm.generateChipStack(156);
    expect(chipStack.length).toBe(5);
    expect(chipStack[0].type).toBe('gold-chip');
    expect(chipStack[0].value).toBe(100);
    expect(chipStack[1].type).toBe('silver-chip');
    expect(chipStack[1].value).toBe(25);
    expect(chipStack[2].type).toBe('silver-chip');
    expect(chipStack[2].value).toBe(25);
    expect(chipStack[3].type).toBe('blue-chip');
    expect(chipStack[3].value).toBe(5);
    expect(chipStack[4].type).toBe('red-chip');
    expect(chipStack[4].value).toBe(1);
    
    // Test maximum stack height limit
    const largeStack = vm.generateChipStack(2000);
    expect(largeStack.length).toBe(12); // Limited to 12 chips
  });

  it('renders fold indicators for folded players', () => {
    const wrapper = createWrapper();
    
    const foldIndicators = wrapper.findAll('.fold-indicator');
    expect(foldIndicators.length).toBe(1); // Only player3 has folded
    expect(foldIndicators[0].text()).toBe('Folded');
  });

  it('positions bets correctly on the table', () => {
    const wrapper = createWrapper();
    
    const bets = wrapper.findAll('.player-bet');
    expect(bets.length).toBe(3); // One for each player
  });
});