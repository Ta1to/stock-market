import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import LobbyView from '@/views/LobbyView.vue';
import PlayerList from '@/components/PlayerList.vue';

// Import modules first
import { db } from '@/api/firebase-api';
import { updateData, deleteData } from '@/services/database';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: 'user123', displayName: 'Test User' } })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'user123', displayName: 'Test User' });
    return jest.fn(); // Return unsubscribe function
  })
}));

// Create mock for database functions
const mockDbRef = {};
const mockDbSnapshot = {
  val: jest.fn().mockReturnValue({
    creator: 'user123',
    code: 'ABC123',
    isPublic: true,
    state: 'waiting',
    players: [
      { uid: 'user123', name: 'Creator User', chips: 1000 },
      { uid: 'user456', name: 'Player 1', chips: 1000 }
    ]
  })
};
const mockUnsubscribe = jest.fn();

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => mockDbRef),
  onValue: jest.fn((ref, callback) => {
    callback(mockDbSnapshot);
    return mockUnsubscribe;
  }),
  off: jest.fn()
}));

jest.mock('@/api/firebase-api', () => ({
  db: {},
  auth: { currentUser: { uid: 'user123', displayName: 'Test User' } }
}));

jest.mock('@/services/database', () => ({
  updateData: jest.fn(() => Promise.resolve()),
  deleteData: jest.fn(() => Promise.resolve())
}));

jest.mock('@/api/stock-api', () => ({
  getRandomStock: jest.fn(() => Promise.resolve([{ name: 'Apple Inc.', symbol: 'AAPL' }])),
  getStockHistory: jest.fn(() => Promise.resolve({ 
    dates: ['2025-04-01', '2025-04-02'], 
    prices: [150, 155] 
  }))
}));

jest.mock('@/api/description-api', () => ({
  getStockInfo: jest.fn(() => Promise.resolve({
    description: 'Apple Inc. designs, manufactures...',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    website: 'https://www.apple.com'
  }))
}));

jest.mock('@/api/news-api', () => ({
  getStockNews: jest.fn(() => Promise.resolve([
    { title: 'Apple News', summary: 'News about Apple', url: 'https://example.com', publishedDate: '2025-04-01' }
  ]))
}));

jest.mock('@/api/indicator-api', () => ({
  fetchTechnicalIndicators: jest.fn(() => Promise.resolve({
    sma: '150',
    rsi: '60',
    macd: '5'
  }))
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

// Mock PlayerList component
jest.mock('@/components/PlayerList.vue', () => ({
  name: 'PlayerList',
  template: '<div class="mock-player-list"></div>',
  props: ['players', 'creator', 'isCreator']
}));

describe('LobbyView.vue', () => {
  let wrapper;
  let router;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Create router with mocked push method for better tracking
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home' },
        { path: '/lobby/:id', name: 'lobby', component: LobbyView, props: true },
        { path: '/game/:id', name: 'game' },
        { path: '/login', name: 'login' }
      ]
    });
    
    // Override router push to avoid actual navigation in tests
    router.push = jest.fn();
    
    // Set initial route
    router.currentRoute = {
      value: {
        path: '/lobby/game123',
        params: { id: 'game123' }
      }
    };
    
    wrapper = mount(LobbyView, {
      global: {
        plugins: [router],
        stubs: {
          PlayerList: true
        },
        mocks: {
          $route: { params: { id: 'game123' } },
          $router: router
        }
      }
    });
    
    await flushPromises();
  });
  
  it('renders the lobby view correctly', () => {
    expect(wrapper.find('.lobby-title').text()).toBe('Lobby');
    expect(wrapper.find('.join-code').exists()).toBe(true);
    expect(wrapper.find('.join-code').text()).toContain('ABC123');
    expect(wrapper.find('.toggle-switch').exists()).toBe(true);
    expect(wrapper.find('button.action-button').exists()).toBe(true);
  });
  
  it('displays the correct join code from database', () => {
    expect(wrapper.vm.joinCode).toBe('ABC123');
    expect(wrapper.find('.join-code').text()).toContain('ABC123');
  });
  
  it('shows visibility toggle when user is creator', () => {
    expect(wrapper.vm.isCreator).toBe(true);
    expect(wrapper.find('.visibility-toggle').exists()).toBe(true);
  });

  it('handles visibility toggle correctly', async () => {
    expect(wrapper.vm.isPublic).toBe(true);
    
    // Click toggle button
    await wrapper.find('.toggle-switch').trigger('click');
    
    expect(wrapper.vm.isPublic).toBe(false);
    expect(updateData).toHaveBeenCalledWith('games/game123', {
      isPublic: false
    });
  });
  
  it('displays player list with correct props', () => {
    const playerListComponent = wrapper.findComponent(PlayerList);
    expect(playerListComponent.exists()).toBe(true);
    expect(playerListComponent.props('players').length).toBe(2);
    expect(playerListComponent.props('creator')).toBe('user123');
    expect(playerListComponent.props('isCreator')).toBe(true);
  });
  
  it('shows creator buttons when user is creator', () => {
    expect(wrapper.vm.isCreator).toBe(true);
    expect(wrapper.find('.delete-button').exists()).toBe(true);
    expect(wrapper.find('.start-button').exists()).toBe(true);
  });
  
  it('allows creator to remove players', async () => {
    await wrapper.vm.removePlayer('user456');
    
    expect(updateData).toHaveBeenCalledWith('games/game123', {
      players: [{ uid: 'user123', name: 'Creator User', chips: 1000 }]
    });
  });
  
  it('allows creator to delete game', async () => {
    await wrapper.find('.delete-button').trigger('click');
    
    expect(deleteData).toHaveBeenCalledWith('games/game123');
    expect(router.push).toHaveBeenCalledWith('/');
  });
  
  it('allows non-creator to leave game', async () => {
    // Mock as non-creator
    wrapper.vm.isCreator = false;
    wrapper.vm.creator = 'otherUser';
    
    // Force re-render to show leave button
    await wrapper.vm.$nextTick();
    
    // Find and click leave button (using vm directly since we modified data)
    await wrapper.vm.leaveGame();
    
    expect(updateData).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/');
  });
  
  it('starts game with sufficient players', async () => {
    await wrapper.find('.start-button').trigger('click');
    await flushPromises();
    
    // Check if game state was updated to 'started'
    expect(updateData).toHaveBeenCalledWith('games/game123', { state: 'started' });
  });
  
  it('unsubscribes from database listener when unmounted', () => {
    wrapper.unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});