import { mount } from '@vue/test-utils';
import PokerHUD from '@/components/game/PokerHUD.vue';

describe('PokerHUD.vue', () => {
  const defaultProps = {
    coins: 1000,
    isMyTurn: true,
    isBettingDisabled: false
  };

  const createWrapper = (props = {}) => {
    return mount(PokerHUD, {
      props: { ...defaultProps, ...props }
    });
  };

  it('renders correctly with player information', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('.chip-count').text()).toBe('1000');
    expect(wrapper.find('.bet-input').element.value).toBe('0');
    expect(wrapper.find('.poker-hud').classes()).toContain('my-turn');
    expect(wrapper.find('.poker-hud').classes()).not.toContain('disabled');
  });
  
  it('applies disabled class when betting is disabled', () => {
    const wrapper = createWrapper({ isBettingDisabled: true });
    
    expect(wrapper.find('.poker-hud').classes()).toContain('disabled');
  });

  it('removes my-turn class when it is not the player\'s turn', () => {
    const wrapper = createWrapper({ isMyTurn: false });
    
    expect(wrapper.find('.poker-hud').classes()).not.toContain('my-turn');
  });
  
  it('increases bet amount when increment button is clicked', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.bet-btn:last-child').trigger('click');
    expect(wrapper.find('.bet-input').element.value).toBe('10');
    
    // Click multiple times
    await wrapper.find('.bet-btn:last-child').trigger('click');
    await wrapper.find('.bet-btn:last-child').trigger('click');
    expect(wrapper.find('.bet-input').element.value).toBe('30');
  });
  
  it('decreases bet amount when decrement button is clicked', async () => {
    const wrapper = createWrapper();
    
    // Set initial value first
    await wrapper.find('.bet-input').setValue(50);
    
    await wrapper.find('.bet-btn:first-child').trigger('click');
    expect(wrapper.find('.bet-input').element.value).toBe('40');
    
    // Click multiple times
    await wrapper.find('.bet-btn:first-child').trigger('click');
    await wrapper.find('.bet-btn:first-child').trigger('click');
    expect(wrapper.find('.bet-input').element.value).toBe('20');
  });
  
  it('prevents decrement below zero', async () => {
    const wrapper = createWrapper();
    
    // Ensure starting from 0
    await wrapper.find('.bet-input').setValue(0);
    
    await wrapper.find('.bet-btn:first-child').trigger('click');
    expect(wrapper.find('.bet-input').element.value).toBe('0');
  });
  
  it('prevents increment above available coins', async () => {
    const wrapper = createWrapper({ coins: 100 });
    
    // Set value close to maximum
    await wrapper.find('.bet-input').setValue(95);
    
    await wrapper.find('.bet-btn:last-child').trigger('click');
    expect(wrapper.find('.bet-input').element.value).toBe('100');
    
    // Try to increment beyond maximum
    await wrapper.find('.bet-btn:last-child').trigger('click');
    expect(wrapper.find('.bet-input').element.value).toBe('100');
  });
  
  it('emits bet-placed event when bet button is clicked', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.bet-input').setValue(100);
    await wrapper.find('.bet-button').trigger('click');
    
    expect(wrapper.emitted('bet-placed')).toBeTruthy();
    expect(wrapper.emitted('bet-placed')[0]).toEqual([100]);
  });
  
  it('resets bet amount after placing a bet', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.bet-input').setValue(100);
    await wrapper.find('.bet-button').trigger('click');
    
    expect(wrapper.find('.bet-input').element.value).toBe('0');
  });
  
  it('emits check event when check button is clicked', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.check-button').trigger('click');
    
    expect(wrapper.emitted('check')).toBeTruthy();
  });
  
  it('emits fold event when fold button is clicked', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('.fold-button').trigger('click');
    
    expect(wrapper.emitted('fold')).toBeTruthy();
  });
  
  it('disables buttons when it is not the player\'s turn', () => {
    const wrapper = createWrapper({ isMyTurn: false });
    
    expect(wrapper.find('.bet-button').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.check-button').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.fold-button').attributes('disabled')).toBeDefined();
  });
  
  it('disables buttons when betting is disabled', () => {
    const wrapper = createWrapper({ isBettingDisabled: true });
    
    expect(wrapper.find('.bet-button').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.check-button').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.fold-button').attributes('disabled')).toBeDefined();
  });
});