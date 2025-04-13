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
  
  it('calls leaveGame function when button is clicked', async () => {
    const wrapper = mount(LeaveGameButton);
    const leaveGameSpy = jest.spyOn(wrapper.vm, 'leaveGame');
    
    await wrapper.find('.leave-button').trigger('click');
    
    expect(leaveGameSpy).toHaveBeenCalled();
  });
  
  it('redirects to home if no user is logged in', async () => {
    // Mock no current user
    getAuth.mockReturnValueOnce({ currentUser: null });
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    expect(console.log).toHaveBeenCalledWith('No user logged in.');
  });
  
  it('handles case when user document does not exist', async () => {
    // Mock database response - user not found
    ref.mockReturnValueOnce('user-ref');
    get.mockResolvedValueOnce({ exists: () => false });
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    expect(ref).toHaveBeenCalledWith(mockDb, 'users/test-user-id');
    expect(console.error).toHaveBeenCalledWith('User document does not exist.');
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
  
  it('redirects to home if game does not exist', async () => {
    // Mock user with gameId but game not found
    ref.mockReturnValueOnce('user-ref')
       .mockReturnValueOnce('game-ref');
       
    get.mockResolvedValueOnce({ 
      exists: () => true,
      val: () => ({ gameId: 'test-game-id' })
    }).mockResolvedValueOnce({
      exists: () => false
    });
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    expect(ref).toHaveBeenCalledWith(mockDb, 'games/test-game-id');
    expect(console.log).toHaveBeenCalledWith('Game not found.');
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
  
  it('reassigns creator role if current user is creator and other players exist', async () => {
    // Setup mocks for user being game creator with other players
    ref.mockReturnValueOnce('user-ref') // User ref
       .mockReturnValueOnce('game-ref') // Game ref
       .mockReturnValueOnce('players-ref'); // Players query ref
       
    // Mock user data
    get.mockResolvedValueOnce({ 
      exists: () => true,
      val: () => ({ gameId: 'test-game-id' })
    })
    // Mock game data
    .mockResolvedValueOnce({
      exists: () => true,
      val: () => ({ creatorId: 'test-user-id' }) // Current user is creator
    })
    // Mock players data
    .mockResolvedValueOnce({
      forEach: (callback) => {
        callback({ key: 'test-user-id', val: () => ({ name: 'Current User' }) });
        callback({ key: 'other-user-id', val: () => ({ name: 'Other User' }) });
      }
    });
    
    // Mock database queries
    query.mockReturnValueOnce('players-ref');
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    // Check if creator role was reassigned
    expect(update).toHaveBeenCalledWith('game-ref', { creatorId: 'other-user-id' });
    // Check if user's gameId was cleared
    expect(update).toHaveBeenCalledWith('user-ref', { gameId: null });
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
  
  it('deletes game if current user is creator and no other players exist', async () => {
    // Setup mocks for user being game creator with no other players
    ref.mockReturnValueOnce('user-ref') // User ref
       .mockReturnValueOnce('game-ref') // Game ref
       .mockReturnValueOnce('players-ref'); // Players query ref
       
    // Mock user data
    get.mockResolvedValueOnce({ 
      exists: () => true,
      val: () => ({ gameId: 'test-game-id' })
    })
    // Mock game data
    .mockResolvedValueOnce({
      exists: () => true,
      val: () => ({ creatorId: 'test-user-id' }) // Current user is creator
    })
    // Mock players data - only current user
    .mockResolvedValueOnce({
      forEach: (callback) => {
        callback({ key: 'test-user-id', val: () => ({ name: 'Current User' }) });
      }
    });
    
    // Mock database queries
    query.mockReturnValueOnce('players-ref');
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    // Check if game was deleted
    expect(remove).toHaveBeenCalledWith('game-ref');
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
  
  it('clears user gameId if user is not the creator', async () => {
    // Setup mocks for user not being creator
    ref.mockReturnValueOnce('user-ref') // User ref
       .mockReturnValueOnce('game-ref'); // Game ref
       
    // Mock user data
    get.mockResolvedValueOnce({ 
      exists: () => true,
      val: () => ({ gameId: 'test-game-id' })
    })
    // Mock game data
    .mockResolvedValueOnce({
      exists: () => true,
      val: () => ({ creatorId: 'other-user-id' }) // Another user is creator
    });
    
    const wrapper = mount(LeaveGameButton);
    await wrapper.find('.leave-button').trigger('click');
    
    // Should not update creator or remove game
    expect(update).not.toHaveBeenCalledWith('game-ref', expect.any(Object));
    expect(remove).not.toHaveBeenCalled();
    
    // Should just update user's gameId
    expect(update).toHaveBeenCalledWith('user-ref', { gameId: null });
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});