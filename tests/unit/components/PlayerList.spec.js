import { mount } from '@vue/test-utils';
import PlayerList from '@/components/PlayerList.vue';

describe('PlayerList.vue', () => {
  // Sample player data for testing
  const mockPlayers = [
    { uid: 'player1', name: 'John Doe' },
    { uid: 'player2', name: 'Jane Smith' },
    { uid: 'player3', name: 'Robert Johnson' }
  ];
  
  const creatorId = 'player1';
  
  let wrapper;
  
  // Helper function to create the component with different props
  const createComponent = (props = {}) => {
    return mount(PlayerList, {
      props: {
        players: mockPlayers,
        creator: creatorId,
        isCreator: false,
        ...props
      }
    });
  };

  beforeEach(() => {
    wrapper = createComponent();
  });

  it('renders the correct number of players', () => {
    // Check if the title displays the correct player count
    expect(wrapper.find('.players-title').text()).toContain('(3)');
    
    // Check if all player cards are rendered
    const playerCards = wrapper.findAll('.player-card');
    expect(playerCards.length).toBe(3);
  });

  it('displays player names correctly', () => {
    const playerNames = wrapper.findAll('.player-name');
    expect(playerNames[0].text()).toBe('John Doe');
    expect(playerNames[1].text()).toBe('Jane Smith');
    expect(playerNames[2].text()).toBe('Robert Johnson');
  });

  it('shows crown icon for the creator', () => {
    // First player is the creator and should have the crown icon
    const firstPlayerCard = wrapper.findAll('.player-card')[0];
    expect(firstPlayerCard.find('.fa-crown').exists()).toBe(true);
    
    // Other players should not have the crown icon
    const secondPlayerCard = wrapper.findAll('.player-card')[1];
    expect(secondPlayerCard.find('.fa-crown').exists()).toBe(false);
  });

  it('does not show remove buttons when user is not the creator', () => {
    // By default isCreator is false
    const removeButtons = wrapper.findAll('.remove-player-btn');
    expect(removeButtons.length).toBe(0);
  });

  it('shows remove buttons for all players except creator when user is the creator', async () => {
    // Update the component to mark current user as creator
    await wrapper.setProps({ isCreator: true });
    
    // Check that remove buttons are present for non-creator players
    const removeButtons = wrapper.findAll('.remove-player-btn');
    expect(removeButtons.length).toBe(2); // Only 2 players can be removed (not the creator)
    
    // Double check that the creator doesn't have a remove button
    const firstPlayerCard = wrapper.findAll('.player-card')[0];
    expect(firstPlayerCard.find('.remove-player-btn').exists()).toBe(false);
  });

  it('emits remove-player event with the correct player ID when remove button is clicked', async () => {
    // Set current user as creator to see the remove buttons
    await wrapper.setProps({ isCreator: true });
    
    // Get the first remove button (for the second player)
    const removeButton = wrapper.findAll('.remove-player-btn')[0];
    
    // Trigger a click
    await removeButton.trigger('click');
    
    // Check that the correct event was emitted with the correct player ID
    expect(wrapper.emitted('remove-player')).toBeTruthy();
    expect(wrapper.emitted('remove-player')[0]).toEqual(['player2']);
  });

  it('handles empty player list', async () => {
    await wrapper.setProps({ players: [] });
    
    // Check that the count is updated
    expect(wrapper.find('.players-title').text()).toContain('(0)');
    
    // Check that no player cards are rendered
    const playerCards = wrapper.findAll('.player-card');
    expect(playerCards.length).toBe(0);
  });

  it('updates when players prop changes', async () => {
    // Start with 3 players
    expect(wrapper.findAll('.player-card').length).toBe(3);
    
    // Change to 2 players
    const newPlayers = [
      { uid: 'player1', name: 'John Doe' },
      { uid: 'player2', name: 'Jane Smith' }
    ];
    await wrapper.setProps({ players: newPlayers });
    
    // Check that the list was updated
    expect(wrapper.findAll('.player-card').length).toBe(2);
    expect(wrapper.find('.players-title').text()).toContain('(2)');
  });
});