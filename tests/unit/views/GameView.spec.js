// Minimaler Test für GameView.vue

// Mock Firebase und andere Abhängigkeiten
jest.mock('@/api/firebase-api', () => ({
  auth: {
    currentUser: { uid: 'user123' }
  },
  db: {}
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(auth => callback => {
    callback({ uid: 'user123' });
    return jest.fn(); // Unsubscribe-Funktion
  })
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  deleteDoc: jest.fn(() => Promise.resolve())
}));

// Mock für GameStore
const mockGameStore = {
  currentRound: 1,
  totalRounds: 3,
  currentPhase: 3,
  players: [{ uid: 'user123', name: 'Test User' }],
  currentTurnIndex: 0,
  pot: 100,
  subscribeToGame: jest.fn(),
  unsubscribeFromGame: jest.fn(),
  rounds: {}
};

jest.mock('@/services/game-store', () => ({
  useGameStore: () => mockGameStore
}));

// Mock für Vue Router
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

// Mock für PopupEventBus
jest.mock('@/utils/popupEventBus', () => ({
  PopupState: {
    activePopup: null
  }
}));

// Importiere die Komponente selbst
import { shallowMount } from '@vue/test-utils';
import GameView from '@/views/GameView.vue';

describe('GameView.vue', () => {
  test('Komponente rendert ohne Fehler', () => {
    // Erstelle einen flachen Mount ohne komplexe Komponenten
    const wrapper = shallowMount(GameView, {
      global: {
        stubs: {
          // Füge alle Komponenten hinzu, die in der GameView verwendet werden
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
    
    // Überprüfe, ob die Komponente existiert
    expect(wrapper.exists()).toBe(true);
  });
});