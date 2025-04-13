import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/services/game-store';
import * as gameDatabase from '@/services/game-database';

// Mock all the game database functions
jest.mock('@/services/game-database', () => ({
  subscribeToGameData: jest.fn(),
  createGame: jest.fn(),
  updateRoundPhase: jest.fn(),
  updateCurrentRound: jest.fn(),
  updateCurrentTurnIndex: jest.fn(),
  updatePlayerChips: jest.fn(),
  updateHighestBet: jest.fn(),
  setPlayerPrediction: jest.fn(),
  placeBet: jest.fn(),
  fold: jest.fn(),
  updatePot: jest.fn(),
  addLogEntry: jest.fn(),
  getPlayerBet: jest.fn(),
  updateData: jest.fn(),
}));

describe('Game Store', () => {
  let store;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Create a fresh pinia instance and make it active
    const pinia = createPinia();
    setActivePinia(pinia);
    
    // Get a fresh store instance
    store = useGameStore();
    
    // Mock console methods
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      expect(store.currentRound).toBe(1);
      expect(store.currentPhase).toBe(1);
      expect(store.totalRounds).toBe(3);
      expect(store.totalPhases).toBe(10);
      expect(store.gameId).toBeNull();
      expect(store.creator).toBeNull();
      expect(store.players).toEqual([]);
      expect(store.predictions).toEqual({});
      expect(store.bets).toEqual({});
      expect(store.folds).toEqual({});
      expect(store.highestBet).toBe(0);
      expect(store.pot).toBe(0);
      expect(store.rounds).toEqual({});
      expect(store.unsubscribers).toEqual([]);
      expect(store.currentTurnIndex).toBe(0);
      expect(store.errorMessage).toBeNull();
      expect(store.selectedStock).toBeNull();
    });
  });

  describe('Getters', () => {
    it('isGameComplete should return true when currentRound > totalRounds', () => {
      store.currentRound = 4;
      store.totalRounds = 3;
      expect(store.isGameComplete).toBe(true);
    });

    it('isGameComplete should return false when currentRound <= totalRounds', () => {
      store.currentRound = 3;
      store.totalRounds = 3;
      expect(store.isGameComplete).toBe(false);

      store.currentRound = 2;
      expect(store.isGameComplete).toBe(false);
    });
  });

  describe('Actions', () => {
    describe('subscribeToGame', () => {
      it('should set the gameId and subscribe to game data', async () => {
        const gameId = 'test-game-1';
        const unsubscribeMock = jest.fn();
        gameDatabase.subscribeToGameData.mockReturnValue(unsubscribeMock);

        await store.subscribeToGame(gameId);

        expect(store.gameId).toBe(gameId);
        expect(gameDatabase.subscribeToGameData).toHaveBeenCalledWith(gameId, expect.any(Function));
        expect(store.unsubscribers).toEqual([unsubscribeMock]);
      });

      it('should update store state when data is received', async () => {
        const gameId = 'test-game-1';
        let callbackFunction;
        
        gameDatabase.subscribeToGameData.mockImplementation((id, callback) => {
          callbackFunction = callback;
          return jest.fn();
        });

        await store.subscribeToGame(gameId);

        // Simulate receiving game data
        const mockGameData = {
          creator: 'user-123',
          currentRound: 2,
          rounds: {
            2: {
              phase: 3,
              pot: 200,
              highestBet: 50,
              selectedStock: { symbol: 'AAPL', name: 'Apple Inc' },
              predictions: { 'player-1': 150, 'player-2': 155 }
            }
          },
          players: [
            { uid: 'player-1', name: 'Player 1', chips: 800 },
            { uid: 'player-2', name: 'Player 2', chips: 850 }
          ],
          currentTurnIndex: 1
        };
        
        callbackFunction(mockGameData);

        // Check that store state is updated correctly
        expect(store.creator).toBe('user-123');
        expect(store.currentRound).toBe(2);
        expect(store.currentPhase).toBe(3);
        expect(store.players).toEqual([
          { uid: 'player-1', name: 'Player 1', chips: 800 },
          { uid: 'player-2', name: 'Player 2', chips: 850 }
        ]);
        expect(store.pot).toBe(200);
        expect(store.highestBet).toBe(50);
        expect(store.selectedStock).toEqual({ symbol: 'AAPL', name: 'Apple Inc' });
        expect(store.predictions).toEqual({ 'player-1': 150, 'player-2': 155 });
        expect(store.currentTurnIndex).toBe(1);
      });

      it('should handle missing data gracefully', async () => {
        const gameId = 'test-game-1';
        let callbackFunction;
        
        gameDatabase.subscribeToGameData.mockImplementation((id, callback) => {
          callbackFunction = callback;
          return jest.fn();
        });

        await store.subscribeToGame(gameId);

        // Simulate receiving null data
        callbackFunction(null);

        expect(console.warn).toHaveBeenCalledWith("Game not found or no data at this path");
      });
    });

    describe('unsubscribeFromGame', () => {
      it('should call all unsubscribe functions and clear the array', () => {
        const unsubscribe1 = jest.fn();
        const unsubscribe2 = jest.fn();
        store.unsubscribers = [unsubscribe1, unsubscribe2];

        store.unsubscribeFromGame();

        expect(unsubscribe1).toHaveBeenCalled();
        expect(unsubscribe2).toHaveBeenCalled();
        expect(store.unsubscribers).toEqual([]);
      });
    });

    describe('createGameInDB', () => {
      it('should call createGame with the provided gameId and initialData', async () => {
        const gameId = 'test-game-1';
        const initialData = { isPublic: true };

        await store.createGameInDB(gameId, initialData);

        expect(gameDatabase.createGame).toHaveBeenCalledWith(gameId, initialData);
      });
    });

    describe('nextPhase', () => {
      it('should increment phase when not at the end of phases', async () => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 5;
        store.totalPhases = 10;

        await store.nextPhase();

        expect(gameDatabase.updateRoundPhase).toHaveBeenCalledWith('test-game-1', 2, 6);
        expect(gameDatabase.updateCurrentRound).toHaveBeenCalledWith('test-game-1', 2);
        expect(store.currentRound).toBe(2);
        expect(store.currentPhase).toBe(6);
      });

      it('should advance to next round when at the end of phases', async () => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 10;
        store.totalPhases = 10;
        store.selectedStock = { symbol: 'AAPL' };

        await store.nextPhase();

        expect(gameDatabase.updateData).toHaveBeenCalledWith('games/test-game-1/rounds/3', {
          phase: 1,
          isSpinning: false
        });
        expect(gameDatabase.updateRoundPhase).toHaveBeenCalledWith('test-game-1', 3, 1);
        expect(gameDatabase.updateCurrentRound).toHaveBeenCalledWith('test-game-1', 3);
        expect(store.currentRound).toBe(3);
        expect(store.currentPhase).toBe(1);
        expect(store.selectedStock).toBeNull();
        expect(store.predictions).toEqual({});
      });

      it('should do nothing if gameId is not set', async () => {
        store.gameId = null;
        store.currentRound = 2;
        store.currentPhase = 5;

        await store.nextPhase();

        expect(gameDatabase.updateRoundPhase).not.toHaveBeenCalled();
        expect(gameDatabase.updateCurrentRound).not.toHaveBeenCalled();
      });
    });

    describe('startStockSelection', () => {
      it('should update phase to 1 if not already', async () => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 2;

        await store.startStockSelection('test-game-1');

        expect(gameDatabase.updateRoundPhase).toHaveBeenCalledWith('test-game-1', 2, 1);
      });

      it('should not update phase if already at phase 1', async () => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 1;

        await store.startStockSelection('test-game-1');

        expect(gameDatabase.updateRoundPhase).not.toHaveBeenCalled();
      });
    });

    describe('setPlayerPrediction', () => {
      beforeEach(() => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 2;
        store.players = [
          { uid: 'player-1', name: 'Player 1' },
          { uid: 'player-2', name: 'Player 2' }
        ];
        store.predictions = {};
      });

      it('should set a player prediction and update local state', async () => {
        await store.setPlayerPrediction('player-1', 150.5);

        expect(gameDatabase.setPlayerPrediction).toHaveBeenCalledWith('test-game-1', 2, 'player-1', 150.5);
        expect(store.predictions['player-1']).toBe(150.5);
      });

      it('should advance phase if all players have made predictions', async () => {
        // Mock nextPhase method
        store.nextPhase = jest.fn();
        store.predictions['player-2'] = 155;

        await store.setPlayerPrediction('player-1', 150.5);

        expect(store.predictions['player-1']).toBe(150.5);
        expect(store.nextPhase).toHaveBeenCalled();
      });

      it('should not advance phase if not all players have made predictions', async () => {
        // Mock nextPhase method
        store.nextPhase = jest.fn();

        await store.setPlayerPrediction('player-1', 150.5);

        expect(store.predictions['player-1']).toBe(150.5);
        expect(store.nextPhase).not.toHaveBeenCalled();
      });

      it('should not proceed if player not found', async () => {
        await store.setPlayerPrediction('non-existent', 150.5);

        expect(gameDatabase.setPlayerPrediction).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalledWith('Player not found:', 'non-existent');
      });

      it('should not proceed if gameId is not set', async () => {
        store.gameId = null;

        await store.setPlayerPrediction('player-1', 150.5);

        expect(gameDatabase.setPlayerPrediction).not.toHaveBeenCalled();
      });
    });

    describe('placeBet', () => {
      beforeEach(() => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 3; // A betting phase
        store.players = [
          { uid: 'player-1', name: 'Player 1', chips: 1000 },
          { uid: 'player-2', name: 'Player 2', chips: 1000 }
        ];
        store.currentTurnIndex = 0;
        store.highestBet = 0;
        store.pot = 0;
        store.bets = {};
        store.folds = {};

        gameDatabase.getPlayerBet.mockResolvedValue(0);
        
        // Mock helper methods
        store.moveToNextTurn = jest.fn();
        store.checkBettingStatus = jest.fn().mockResolvedValue(false);
        store.nextPhase = jest.fn();
      });

      it('should place a bet successfully', async () => {
        await store.placeBet('player-1', 50);

        expect(gameDatabase.getPlayerBet).toHaveBeenCalledWith('test-game-1', 2, 'player-1');
        expect(gameDatabase.placeBet).toHaveBeenCalledWith('test-game-1', 2, 'player-1', 50);
        expect(gameDatabase.updatePlayerChips).toHaveBeenCalledWith('test-game-1', 'player-1', 950);
        expect(gameDatabase.updateHighestBet).toHaveBeenCalledWith('test-game-1', 2, 50);
        expect(gameDatabase.updatePot).toHaveBeenCalledWith('test-game-1', 2, 50);
        
        expect(store.bets['player-1']).toBe(50);
        expect(store.highestBet).toBe(50);
        expect(store.pot).toBe(50);
        expect(store.players[0].chips).toBe(950);
        expect(store.errorMessage).toBeNull();
        
        expect(store.moveToNextTurn).toHaveBeenCalled();
        expect(store.checkBettingStatus).toHaveBeenCalled();
      });

      it('should not allow betting in non-betting phases', async () => {
        store.currentPhase = 2; // Non-betting phase

        await store.placeBet('player-1', 50);

        expect(gameDatabase.placeBet).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
      });

      it('should not allow betting if not player\'s turn', async () => {
        await store.placeBet('player-2', 50);

        expect(gameDatabase.placeBet).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
      });

      it('should not allow betting more chips than player has', async () => {
        await store.placeBet('player-1', 1500);

        expect(gameDatabase.placeBet).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
      });

      it('should set error message if bet is less than highest bet', async () => {
        store.highestBet = 100;
        gameDatabase.getPlayerBet.mockResolvedValue(20); // Player has already bet 20

        await store.placeBet('player-1', 30); // Total would be 50, still less than 100

        expect(gameDatabase.placeBet).not.toHaveBeenCalled();
        expect(store.errorMessage).toBe('Bet must be at least equal to the highest bet of 100');
      });
      
      it('should advance to next phase if betting is complete', async () => {
        store.checkBettingStatus.mockResolvedValue(true);

        await store.placeBet('player-1', 50);
        
        expect(store.nextPhase).toHaveBeenCalled();
      });

      it('should move to next player if betting is not complete', async () => {
        store.checkBettingStatus.mockResolvedValue(false);

        await store.placeBet('player-1', 50);
        
        expect(store.nextPhase).not.toHaveBeenCalled();
        expect(store.moveToNextTurn).toHaveBeenCalled();
      });
    });

    describe('fold', () => {
      beforeEach(() => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 3; // A betting phase
        store.folds = {};
        
        // Mock helper methods
        store.moveToNextTurn = jest.fn();
        store.checkBettingStatus = jest.fn().mockResolvedValue(false);
      });

      it('should fold successfully', async () => {
        await store.fold('player-1');

        expect(gameDatabase.fold).toHaveBeenCalledWith('test-game-1', 2, 'player-1');
        expect(store.folds['player-1']).toBe(true);
        expect(store.moveToNextTurn).toHaveBeenCalled();
        expect(store.checkBettingStatus).toHaveBeenCalled();
      });

      it('should not allow folding in non-betting phases', async () => {
        store.currentPhase = 2; // Non-betting phase

        await store.fold('player-1');

        expect(gameDatabase.fold).not.toHaveBeenCalled();
        expect(store.errorMessage).toBe('Folding is only allowed during betting phases!');
      });
    });

    describe('checkBettingStatus', () => {
      beforeEach(() => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.currentPhase = 3; // A betting phase
        store.players = [
          { uid: 'player-1', name: 'Player 1', chips: 1000 },
          { uid: 'player-2', name: 'Player 2', chips: 1000 }
        ];
        store.folds = {};
        store.pot = 100;
        store.highestBet = 50;
      });

      it('should return false if not in a betting phase', async () => {
        store.currentPhase = 2; // Non-betting phase

        const result = await store.checkBettingStatus();

        expect(result).toBe(false);
      });

      it('should end round if only one player remains active', async () => {
        store.folds = { 'player-2': true };

        const result = await store.checkBettingStatus();

        expect(gameDatabase.updatePlayerChips).toHaveBeenCalledWith('test-game-1', 'player-1', 1100);
        expect(gameDatabase.updateData).toHaveBeenCalledWith('games/test-game-1/rounds/3', {
          phase: 1,
          isSpinning: false
        });
        expect(gameDatabase.updateCurrentRound).toHaveBeenCalledWith('test-game-1', 3);
        expect(gameDatabase.updateRoundPhase).toHaveBeenCalledWith('test-game-1', 3, 1);
        
        expect(store.pot).toBe(0);
        expect(store.highestBet).toBe(0);
        expect(store.currentRound).toBe(3);
        expect(store.currentPhase).toBe(1);
        expect(store.bets).toEqual({});
        expect(store.folds).toEqual({});
        expect(result).toBe(true);
      });

      it('should return true if all active players have matched the highest bet', async () => {
        gameDatabase.getPlayerBet.mockResolvedValueOnce(50).mockResolvedValueOnce(50);

        const result = await store.checkBettingStatus();

        expect(result).toBe(true);
      });

      it('should return false if not all active players have matched the highest bet', async () => {
        gameDatabase.getPlayerBet.mockResolvedValueOnce(50).mockResolvedValueOnce(30);

        const result = await store.checkBettingStatus();

        expect(result).toBe(false);
      });
    });

    describe('moveToNextTurn', () => {
      beforeEach(() => {
        store.players = [
          { uid: 'player-1', name: 'Player 1' },
          { uid: 'player-2', name: 'Player 2' },
          { uid: 'player-3', name: 'Player 3' }
        ];
        store.currentTurnIndex = 0;
        store.folds = {};
        store.gameId = 'test-game-1';
      });

      it('should move to the next player', () => {
        store.moveToNextTurn();

        expect(store.currentTurnIndex).toBe(1);
        expect(gameDatabase.updateCurrentTurnIndex).toHaveBeenCalledWith('test-game-1', 1);
      });

      it('should skip folded players', () => {
        store.folds = { 'player-2': true };

        store.moveToNextTurn();

        expect(store.currentTurnIndex).toBe(2);
        expect(gameDatabase.updateCurrentTurnIndex).toHaveBeenCalledWith('test-game-1', 2);
      });

      it('should wrap around to the beginning of the player list', () => {
        store.currentTurnIndex = 2;

        store.moveToNextTurn();

        expect(store.currentTurnIndex).toBe(0);
        expect(gameDatabase.updateCurrentTurnIndex).toHaveBeenCalledWith('test-game-1', 0);
      });

      it('should handle all players folded except current', () => {
        store.folds = { 'player-2': true, 'player-3': true };

        store.moveToNextTurn();

        expect(store.currentTurnIndex).toBe(0);
        expect(gameDatabase.updateCurrentTurnIndex).toHaveBeenCalledWith('test-game-1', 0);
      });

      it('should do nothing if no players', () => {
        store.players = [];

        store.moveToNextTurn();

        expect(gameDatabase.updateCurrentTurnIndex).not.toHaveBeenCalled();
      });
    });

    describe('addLogEntry', () => {
      it('should add a log entry', async () => {
        store.gameId = 'test-game-1';
        const message = 'Player 1 raised to 50';

        await store.addLogEntry(message);

        expect(gameDatabase.addLogEntry).toHaveBeenCalledWith('test-game-1', message);
      });

      it('should not add a log entry if gameId is not set', async () => {
        store.gameId = null;
        await store.addLogEntry('Test message');
        expect(gameDatabase.addLogEntry).not.toHaveBeenCalled();
      });
    });

    describe('addChipsToPlayer', () => {
      beforeEach(() => {
        store.gameId = 'test-game-1';
        store.players = [
          { uid: 'player-1', name: 'Player 1', chips: 1000 },
          { uid: 'player-2', name: 'Player 2', chips: 800 }
        ];
      });

      it('should add chips to a player', async () => {
        await store.addChipsToPlayer('player-1', 200);

        expect(gameDatabase.updatePlayerChips).toHaveBeenCalledWith('test-game-1', 'player-1', 1200);
        expect(store.players[0].chips).toBe(1200);
      });

      it('should not update if player not found', async () => {
        await store.addChipsToPlayer('player-3', 200);

        expect(gameDatabase.updatePlayerChips).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalledWith("Player not found:", "player-3");
      });

      it('should not update if gameId not set', async () => {
        store.gameId = null;
        await store.addChipsToPlayer('player-1', 200);
        expect(gameDatabase.updatePlayerChips).not.toHaveBeenCalled();
      });
    });

    describe('resetPot', () => {
      it('should reset the pot to zero', async () => {
        store.gameId = 'test-game-1';
        store.currentRound = 2;
        store.pot = 500;

        await store.resetPot();

        expect(gameDatabase.updatePot).toHaveBeenCalledWith('test-game-1', 2, 0);
        expect(store.pot).toBe(0);
      });

      it('should not reset if gameId not set', async () => {
        store.gameId = null;
        store.pot = 500;

        await store.resetPot();

        expect(gameDatabase.updatePot).not.toHaveBeenCalled();
        expect(store.pot).toBe(500);
      });
    });

    describe('setSelectedStock', () => {
      it('should set the selected stock', () => {
        const stock = { symbol: 'AAPL', name: 'Apple Inc' };

        store.setSelectedStock(stock);

        expect(store.selectedStock).toEqual(stock);
        expect(console.log).toHaveBeenCalledWith("setSelectedStock called with:", stock);
      });
    });
  });
});