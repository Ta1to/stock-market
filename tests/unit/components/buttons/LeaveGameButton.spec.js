import { mount } from '@vue/test-utils';
import LeaveGameButton from '@/components/buttons/LeaveGameButton.vue';
import { getDatabase, ref, get, update, remove, query } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  equalTo: jest.fn()
}));

jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('LeaveGameButton.vue', () => {
  let mockAuth;
  let mockRouter;
  let mockDb;
  
  beforeEach(() => {
    // Setup mocks
    mockAuth = {
      currentUser: {
        uid: 'test-user-id'
      }
    };
    mockRouter = {
      push: jest.fn()
    };
    mockDb = {};
    
    // Reset mocks
    getAuth.mockReturnValue(mockAuth);
    getDatabase.mockReturnValue(mockDb);
    
    // Mock vue-router
    jest.spyOn(require('vue-router'), 'useRouter').mockReturnValue(mockRouter);
    
    // Reset console mocks
    console.log = jest.fn();
    console.error = jest.fn();
  });
  
  it('renders the leave button correctly', () => {
    const wrapper = mount(LeaveGameButton);
    expect(wrapper.find('.leave-button').exists()).toBe(true);
    expect(wrapper.find('i.fa-sign-out-alt').exists()).toBe(true);
    expect(wrapper.find('span').text()).toBe('Leave');
  });
  
  it('redirects to home if no user is logged in', async () => {
    // Mock no current user
    getAuth.mockReturnValueOnce({ currentUser: null });
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    expect(console.log).toHaveBeenCalledWith('No user logged in.');
  });
  
  it('redirects to home if user is not in a game', async () => {
    // Mock user with no gameId
    ref.mockReturnValueOnce('user-ref');
    get.mockResolvedValueOnce({ 
      exists: () => true,
      val: () => ({ name: 'Test User' }) // No gameId property
    });
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    expect(console.log).toHaveBeenCalledWith('User is not in a game.');
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});