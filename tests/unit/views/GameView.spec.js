// Minimal test for GameView.vue

// Mock Firebase and other dependencies
jest.mock('@/api/firebase-api', () => ({
  auth: {
    currentUser: { uid: 'user123' }
  },
  db: {}
}));

jest.mock('firebase/auth', () => ({  onAuthStateChanged: jest.fn(auth => callback => {
    callback({ uid: 'user123' });
    return jest.fn(); // Unsubscribe function
  })
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  deleteDoc: jest.fn(() => Promise.resolve())
}));

// Mock for GameStore
const mockGameStore = {
  currentRound: 1,
  totalRounds: 3,
  currentPhase: 3,
  players: [{ uid: 'user123', name: 'Test User' }],
  currentTurnIndex: 0,
  pot: 100,
  gameEnded: false,
  showGameWinner: false,
  errorMessage: null,
  subscribeToGame: jest.fn(),
  unsubscribeFromGame: jest.fn(),
  initializeAuth: jest.fn(),
  cleanup: jest.fn(),
  resetGame: jest.fn(),
  handleGameEnd: jest.fn(),
  nextPhase: jest.fn(),
  handlePhaseChange: jest.fn(),
  handleRoundChange: jest.fn(),
  rounds: {}
};

jest.mock('@/services/game-store', () => ({
  useGameStore: () => mockGameStore
}));

// Mock for Vue Router
jest.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      id: 'game123'
    }
  }),
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock for PopupEventBus
jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
    activePopup: null
  }
}));

// Import the component itself
import { shallowMount } from '@vue/test-utils';
import GameView from '@/views/GameView.vue';

describe('GameView.vue', () => {
  test('Component renders without errors', () => {
    // Create a shallow mount without complex components
    const wrapper = shallowMount(GameView, {
      global: {
        stubs: {
          // Add all components used in GameView
          PokerTable: true,
          PokerHUD: true,
          StockSelector: true,
          StockPrediction: true,
          MiniChart: true,
          StockNewsHint: true,
          MiniNews: true,
          TechnicalIndicatorsHint: true,
          MiniIndicators: true,
          CurrentPriceHint: true,
          MiniPrice: true,
          RoundWinner: true,
          GameWinner: true
        },
        mocks: {
          $route: { params: { id: 'game123' } }
        }
      }
    });
    
    // Check if the component exists
    expect(wrapper.exists()).toBe(true);
  });
});