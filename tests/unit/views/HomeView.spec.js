import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LogoutButton from '@/components/buttons/LogoutButton.vue';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { writeData, readData, updateData } from "@/services/database";

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: 'test-user-1' } })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'test-user-1' });
    return jest.fn(); // Return unsubscribe function
  })
}));

// Mock Database Service
jest.mock('@/services/database', () => ({
  writeData: jest.fn(() => Promise.resolve()),
  readData: jest.fn(),
  updateData: jest.fn(() => Promise.resolve())
}));

// Mock Router
const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/login', component: { template: '<div>Login</div>' } },
  { path: '/lobby/:id', component: { template: '<div>Lobby</div>' }, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Mock LogoutButton component
jest.mock('@/components/buttons/LogoutButton.vue', () => ({
  name: 'LogoutButton',
  template: '<button class="mock-logout-button">Logout</button>'
}));

describe('HomeView.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock responses
    readData.mockImplementation(async (path) => {
      if (path === 'users/test-user-1') {
        return { name: 'Test User' };
      }
      if (path === 'games') {
        return {
          'game1': { 
            isPublic: true, 
            code: 'GAME1', 
            players: [{ uid: 'player1', name: 'Player 1' }] 
          },
          'game2': { 
            isPublic: true, 
            code: 'GAME2', 
            players: [{ uid: 'player2', name: 'Player 2' }] 
          },
          'game3': { 
            isPublic: false, 
            code: 'GAME3', 
            players: [] 
          }
        };
      }
      return null;
    });

    // Mock Math.random for predictable game IDs
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.123456789);

    // Create component wrapper
    wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          LogoutButton: true
        }
      }
    });

    // Restore Math.random
    Math.random = originalRandom;
  });

  it('renders the component correctly', () => {
    expect(wrapper.find('.title').text()).toBe('Stock Poker');
    expect(wrapper.find('.logout-button').exists()).toBe(true);
    expect(wrapper.find('button.primary').text()).toBe('Create Game');
    expect(wrapper.find('button.secondary').text()).toBe('Join Game');
  });

  it('shows public/private toggle with correct default', () => {
    expect(wrapper.vm.isGamePublic).toBe(true);
    expect(wrapper.find('.toggle-container span:first-child').classes()).toContain('active');
    expect(wrapper.find('.toggle-container span:last-child').classes()).not.toContain('active');
  });

  it('toggles between public and private game', async () => {
    // Initially public
    expect(wrapper.vm.isGamePublic).toBe(true);
    
    // Click the toggle
    await wrapper.find('.toggle-switch').trigger('click');
    
    // Should now be private
    expect(wrapper.vm.isGamePublic).toBe(false);
    expect(wrapper.find('.toggle-container span:first-child').classes()).not.toContain('active');
    expect(wrapper.find('.toggle-container span:last-child').classes()).toContain('active');
    
    // Click on the "Public" text
    await wrapper.find('.toggle-container span:first-child').trigger('click');
    
    // Should be public again
    expect(wrapper.vm.isGamePublic).toBe(true);
  });

  it('fetches public games on creation', async () => {
    await flushPromises();
    
    expect(readData).toHaveBeenCalledWith('games');
    expect(wrapper.vm.publicGames.length).toBe(2); // Only the public games
    expect(wrapper.vm.publicGames[0].code).toBe('GAME1');
    expect(wrapper.vm.publicGames[1].code).toBe('GAME2');
  });

  it('displays public games', async () => {
    await flushPromises();
    
    const gameCards = wrapper.findAll('.game-card');
    expect(gameCards.length).toBe(2);
    expect(gameCards[0].find('h3').text()).toBe('GAME1');
    expect(gameCards[1].find('h3').text()).toBe('GAME2');
  });

  it('shows join game modal when Join Game is clicked', async () => {
    expect(wrapper.vm.showJoinGameModal).toBe(false);
    expect(wrapper.find('.modal').exists()).toBe(false);
    
    await wrapper.find('button.secondary').trigger('click');
    
    expect(wrapper.vm.showJoinGameModal).toBe(true);
    expect(wrapper.find('.modal').exists()).toBe(true);
  });

  it('closes join game modal when Cancel is clicked', async () => {
    // Open the modal first
    await wrapper.find('button.secondary').trigger('click');
    expect(wrapper.find('.modal').exists()).toBe(true);
    
    // Click cancel button
    await wrapper.find('.modal-buttons .secondary').trigger('click');
    
    expect(wrapper.vm.showJoinGameModal).toBe(false);
    expect(wrapper.find('.modal').exists()).toBe(false);
  });

  it('updates join code when input changes', async () => {
    // Open the modal
    await wrapper.find('button.secondary').trigger('click');
    
    // Set value in input
    const input = wrapper.find('.modal input');
    await input.setValue('ABC123');
    
    expect(wrapper.vm.joinCode).toBe('ABC123');
  });

  it('creates a new game when Create Game is clicked', async () => {
    // Set to private game
    wrapper.vm.isGamePublic = false;
    
    await wrapper.find('button.primary').trigger('click');
    await flushPromises();
    
    expect(writeData).toHaveBeenCalledWith(expect.stringMatching(/^games\/\w+/), expect.objectContaining({
      isPublic: false,
      creator: 'test-user-1',
      players: [{ uid: 'test-user-1', name: 'Test User', chips: 1000 }]
    }));
    
    // Should navigate to lobby
    expect(router.currentRoute.value.path).toMatch(/^\/lobby\/\w+/);
  });

  it('joins a game from the public list', async () => {
    await flushPromises(); // Wait for public games to load
    
    // Click join on the first game
    await wrapper.findAll('.game-card .join-btn')[0].trigger('click');
    await flushPromises();
    
    // Should update players in the game
    expect(updateData).toHaveBeenCalledWith('games/game1', {
      players: [
        { uid: 'player1', name: 'Player 1' },
        { uid: 'test-user-1', name: 'Test User', chips: 1000 }
      ]
    });
    
    // Should navigate to lobby
    expect(router.currentRoute.value.path).toBe('/lobby/game1');
  });

  it('joins a game using a code', async () => {
    // Mock game data for code lookup
    readData.mockImplementation(async (path) => {
      if (path === 'users/test-user-1') {
        return { name: 'Test User' };
      }
      if (path === 'games') {
        return {
          'game3': { isPublic: false, code: 'GAME3', players: [] }
        };
      }
    });

    // Open join modal
    await wrapper.find('button.secondary').trigger('click');
    
    // Enter code and join
    await wrapper.find('.modal input').setValue('GAME3');
    await wrapper.find('.modal-buttons .primary').trigger('click');
    await flushPromises();
    
    expect(updateData).toHaveBeenCalledWith('games/game3', {
      players: [
        { uid: 'test-user-1', name: 'Test User', chips: 1000 }
      ]
    });
    
    expect(router.currentRoute.value.path).toBe('/lobby/game3');
  });

  it('handles no game found for code', async () => {
    // Mock game data without matching code
    readData.mockImplementation(async (path) => {
      if (path === 'users/test-user-1') {
        return { name: 'Test User' };
      }
      if (path === 'games') {
        return {}; // Return empty games object to ensure code isn't found
      }
    });

    // Spy on console.error
    console.error = jest.fn();

    const initialPath = router.currentRoute.value.path;
    
    // Open join modal
    await wrapper.find('button.secondary').trigger('click');
    
    // Enter non-existent code and try to join
    await wrapper.find('.modal input').setValue('INVALID');
    await wrapper.find('.modal-buttons .primary').trigger('click');
    await flushPromises();
    
    // Should show error and not navigate
    expect(console.error).toHaveBeenCalledWith("No game found with the provided code!");
    
    // Since we're already on '/', we should still be there
    expect(router.currentRoute.value.path).toBe(initialPath);
  });

  it('redirects to login if user is not authenticated', async () => {
    // Mock auth state change to unauthenticated
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(null); // No user
      return jest.fn();
    });
    
    // Create component with unauthenticated state
    const unauthWrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          LogoutButton: true
        }
      }
    });
    
    await flushPromises();
    
    // Should navigate to login
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('handles error in fetchGames', async () => {
    // Mock error in readData
    readData.mockImplementationOnce(() => Promise.reject(new Error('Database error')));
    
    // Spy on console.error
    console.error = jest.fn();
    
    // Create component and wait for created hook
    mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          LogoutButton: true
        }
      }
    });
    
    await flushPromises();
    
    // Should log error
    expect(console.error).toHaveBeenCalledWith("Error while loading games:", expect.any(Error));
  });
});