import { mount } from '@vue/test-utils';
import PlayerCard from '@/components/game/PlayerCard.vue';

describe('PlayerCard.vue', () => {
  // Mock data for testing
  const defaultProps = {
    player: {
      uid: 'player1',
      id: 'player1',
      name: 'Test Player',
      chips: 1000
    },
    currentTurnId: 'player2' // Different from player.id by default
  };

  const createWrapper = (props = {}) => {
    return mount(PlayerCard, {
      props: { ...defaultProps, ...props }
    });
  };

  it('renders player information correctly', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.player-name').text()).toBe('Test Player');
    expect(wrapper.find('.player-chips').text()).toBe('Chips: 1000');
  });

  it('uses id as fallback when name is not provided', () => {
    const wrapper = createWrapper({
      player: {
        uid: 'player1',
        id: 'player_id',
        chips: 1000
      }
    });
    
    expect(wrapper.find('.player-name').text()).toBe('player_id');
  });

  it('shows default avatar when profilePicture is not provided', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.default-avatar').exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('shows profile picture when provided', () => {
    const wrapper = createWrapper({
      player: {
        ...defaultProps.player,
        profilePicture: 'https://example.com/profile.jpg'
      }
    });
    
    expect(wrapper.find('.default-avatar').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/profile.jpg');
  });

  it('does not apply current-player class when player is not current turn', () => {
    const wrapper = createWrapper(); // Using default props where ids are different
    
    expect(wrapper.classes()).not.toContain('current-player');
  });
  
  it('applies current-player class when player is current turn', () => {
    const wrapper = createWrapper({
      player: {
        uid: 'current-player',
        name: 'Current Player',
        chips: 1000
      },
      currentTurnId: 'current-player'
    });
    
    expect(wrapper.classes()).toContain('current-player');
  });
});