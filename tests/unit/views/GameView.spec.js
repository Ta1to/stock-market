// Mock Firebase modules and APIs before imports
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'user123', displayName: 'Test User' }
  })),
  onAuthStateChanged: jest.fn(callback => {
    callback({ uid: 'user123', displayName: 'Test User' });
    return jest.fn(); // Return unsubscribe function
  })
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(() => ({})),
  onValue: jest.fn(() => jest.fn()),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
  push: jest.fn(() => ({ key: 'new-key' }))
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  deleteDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn())
}));

jest.mock('@/api/firebase-api', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'user123', displayName: 'Test User' }
  },
  app: {}
}));

jest.mock('@/services/game-store', () => ({
  useGameStore: () => ({
    currentGame: {
      id: 'game123',
      players: [
        { id: 'user123', uid: 'user123', name: 'Test User', balance: 1000, chips: 1000 },
        { id: 'user456', uid: 'user456', name: 'Another Player', balance: 1200, chips: 1200 }
      ],
      currentRound: 1,
      maxRounds: 5,
      totalRounds: 3,
      status: 'in_progress',
      stockSymbol: 'AAPL'
    },
    gameLoading: false,
    predictionSubmitted: false,
    currentRound: 1,
    totalRounds: 3,
    currentPhase: 2,
    players: [
      { id: 'user123', uid: 'user123', name: 'Test User', balance: 1000, chips: 1000 },
      { id: 'user456', uid: 'user456', name: 'Another Player', balance: 1200, chips: 1200 }
    ],
    currentTurnIndex: 0,
    pot: 100,
    errorMessage: '',
    predictions: {},
    folds: {},
    allPlayersPredicted: true,
    rounds: {
      1: {
        stocks: [
          {
            name: 'Apple Inc',
            symbol: 'AAPL',
            description: 'Apple Inc. designs, manufactures...',
            sector: 'Technology',
            industry: 'Consumer Electronics',
            website: 'https://www.apple.com',
            history: [
              { date: '2025-04-01', price: 150 },
              { date: '2025-04-02', price: 155 }
            ],
            news: [
              { title: 'Apple News', summary: 'Latest news...', url: 'https://example.com', publishedDate: '2025-04-01' }
            ],
            technicalIndicators: { sma: '150', rsi: '60', macd: '5' }
          }
        ]
      }
    },
    creator: 'user123',
    subscribeToGame: jest.fn(),
    unsubscribeFromGame: jest.fn(),
    placeBet: jest.fn(),
    fold: jest.fn(),
    nextPhase: jest.fn(),
    setPlayerPrediction: jest.fn(),
    setSelectedStock: jest.fn(),
    addChipsToPlayer: jest.fn(),
    resetPot: jest.fn(),
    resetGame: jest.fn()
  })
}));

import { mount, shallowMount } from '@vue/test-utils';
import GameView from '@/views/GameView.vue';
import PokerTable from '@/components/game/PokerTable.vue';
import PokerHUD from '@/components/game/PokerHUD.vue';
import StockPrediction from '@/components/game/StockPrediction.vue';
import StockChart from '@/components/StockChart.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';

// Create mock router
const createMockRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home' },
      { path: '/lobby', name: 'lobby' },
      { path: '/game/:id', name: 'game' }
    ]
  });
};

describe('GameView.vue', () => {
  let router;
  let pinia;
  
  beforeEach(() => {
    // Create and set the Pinia instance
    pinia = createPinia();
    setActivePinia(pinia);
    
    router = createMockRouter();
    
    // Mock route params
    router.push('/game/game123');
    
    // Mock window functions
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the component with all game UI elements', () => {
    const wrapper = shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true,
          'mini-chart': true,
          'mini-news': true,
          'mini-indicators': true,
          'mini-price': true,
          'stock-news-hint': true,
          'technical-indicators-hint': true,
          'current-price-hint': true,
          'round-winner': true,
          'game-winner': true
        }
      }
    });
    
    expect(wrapper.find('.game-container').exists()).toBe(true);
    expect(wrapper.find('.game-title').text()).toContain('Stock Poker');
    expect(wrapper.find('.round-badge').exists()).toBe(true);
    expect(wrapper.find('.phase-badge').exists()).toBe(true);
  });
  
  it('subscribes to game data on mounted', () => {
    const wrapper = shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true
        }
      }
    });
    
    const { subscribeToGame } = wrapper.vm.gameStore;
    expect(subscribeToGame).toHaveBeenCalledWith('game123');
  });
  
  it('handles player actions', async () => {
    const wrapper = shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true
        }
      }
    });
    
    // Test bet action
    await wrapper.vm.handleBet(50);
    expect(wrapper.vm.gameStore.placeBet).toHaveBeenCalledWith('user123', 50);
    
    // Test check action
    await wrapper.vm.handleCheck();
    expect(wrapper.vm.gameStore.placeBet).toHaveBeenCalledWith('user123', 0);
    
    // Test fold action
    await wrapper.vm.handleFold();
    expect(wrapper.vm.gameStore.fold).toHaveBeenCalledWith('user123');
  });
  
  it('handles stock selection', async () => {
    const wrapper = shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true
        }
      }
    });
    
    const stock = { symbol: 'AAPL', name: 'Apple Inc' };
    await wrapper.vm.handleStockSelection(stock);
    expect(wrapper.vm.gameStore.setSelectedStock).toHaveBeenCalledWith(stock);
  });
  
  it('handles player prediction submission', async () => {
    const wrapper = shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true
        }
      }
    });
    
    await wrapper.vm.handlePrediction(160);
    expect(wrapper.vm.gameStore.setPlayerPrediction).toHaveBeenCalledWith('user123', 160);
  });
  
  it('handles phase transitions', async () => {
    const wrapper = shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true
        }
      }
    });
    
    await wrapper.vm.handleStockPhaseComplete();
    expect(wrapper.vm.gameStore.nextPhase).toHaveBeenCalled();
  });
  
  it('unsubscribes from game data on unmount', () => {
    const wrapper = shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true
        }
      }
    });
    
    wrapper.unmount();
    expect(wrapper.vm.gameStore.unsubscribeFromGame).toHaveBeenCalled();
  });
  
  it('sets up event listeners for page navigation', () => {
    shallowMount(GameView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'poker-table': true,
          'poker-hud': true,
          'stock-chart': true,
          'stock-prediction': true
        }
      }
    });
    
    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});