import { mount } from '@vue/test-utils';
import RoundWinner from '@/components/game/RoundWinner.vue';

describe('RoundWinner.vue', () => {
  const defaultProps = {
    visible: true,
    winner: { name: 'Test Player', id: 'player1', chips: 1500 },
    roundNumber: 2,
    pot: 200,
    totalRounds: 3
  };

  const createWrapper = (props = {}) => {
    return mount(RoundWinner, {
      props: { ...defaultProps, ...props }
    });
  };

  it('renders correctly when visible', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.winner-popup-overlay').exists()).toBe(true);
    expect(wrapper.find('.winner-title').text()).toContain('Round 2 Winner!');
    expect(wrapper.find('.winner-name').text()).toBe('Test Player');
    expect(wrapper.find('.pot-amount').text()).toContain('200 chips');
    expect(wrapper.find('.continue-btn').text()).toContain('Next Round');
  });

  it('does not render when not visible', () => {
    const wrapper = createWrapper({ visible: false });
    
    expect(wrapper.find('.winner-popup-overlay').exists()).toBe(false);
  });

  it('shows "Final Results" text when it is the last round', () => {
    const wrapper = createWrapper({
      roundNumber: 3,
      totalRounds: 3
    });
    
    expect(wrapper.find('.continue-btn').text()).toContain('Final Results');
  });

  it('shows "Next Round" text when it is not the last round', () => {
    const wrapper = createWrapper({
      roundNumber: 2,
      totalRounds: 3
    });
    
    expect(wrapper.find('.continue-btn').text()).toContain('Next Round');
  });

  it('uses id as fallback when name is not provided', () => {
    const wrapper = createWrapper({
      winner: { id: 'player1', chips: 1500 }
    });
    
    expect(wrapper.find('.winner-name').text()).toBe('player1');
  });

  it('emits continue event when continue button is clicked', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.continue-btn').trigger('click');
    
    expect(wrapper.emitted().continue).toBeTruthy();
    expect(wrapper.emitted().continue.length).toBe(1);
  });
});