import {
  writeData,
  readData,
  updateData,
  deleteData,
  subscribeToGameData,
  createGame,
  updateRoundPhase,
  updateCurrentRound,
  setPlayerPrediction,
  placeBet,
  getPlayerBet,
  fold,
  updatePot,
  addLogEntry,
  updateCurrentTurnIndex,
  updatePlayerChips,
  updateHighestBet
} from '@/services/game-database';

import { ref, set, get, update, remove, onValue, off, push } from 'firebase/database';
import { db } from '@/api/firebase-api';

// Mock Firebase modules
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
  push: jest.fn(),
}));

jest.mock('@/api/firebase-api', () => ({
  db: {}
}));

describe('Game Database Service', () => {
  // Mock objects that will be used across tests
  const mockDbRef = {};
  
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    
    // Setup default mock implementations
    ref.mockReturnValue(mockDbRef);
    set.mockResolvedValue(undefined);
    get.mockResolvedValue({
      exists: () => true,
      val: () => ({})
    });
    update.mockResolvedValue(undefined);
    remove.mockResolvedValue(undefined);
    push.mockResolvedValue({ key: 'mock-key' });
  });

  describe('Generic Database Operations', () => {
    describe('writeData', () => {
      it('should write data to the specified path', async () => {
        const path = 'test/path';
        const data = { test: 'data' };
        
        await writeData(path, data);
        
        expect(ref).toHaveBeenCalledWith(db, path);
        expect(set).toHaveBeenCalledWith(mockDbRef, data);
      });
      
      it('should handle errors', async () => {
        const path = 'test/path';
        const data = { test: 'data' };
        const error = new Error('Write error');
        
        set.mockRejectedValueOnce(error);
        
        await writeData(path, data);
        
        expect(console.error).toHaveBeenCalledWith(`Error writing data to ${path}:`, error);
      });
    });
    
    describe('readData', () => {
      it('should read data from the specified path', async () => {
        const path = 'test/path';
        const mockData = { test: 'data' };
        
        get.mockResolvedValueOnce({
          exists: () => true,
          val: () => mockData
        });
        
        const result = await readData(path);
        
        expect(ref).toHaveBeenCalledWith(db, path);
        expect(get).toHaveBeenCalledWith(mockDbRef);
        expect(result).toEqual(mockData);
      });
      
      it('should return null if no data exists', async () => {
        const path = 'test/path';
        
        get.mockResolvedValueOnce({
          exists: () => false,
          val: () => null
        });
        
        const result = await readData(path);
        
        expect(result).toBeNull();
        expect(console.log).toHaveBeenCalledWith(`No data available at ${path}`);
      });
      
      it('should handle errors', async () => {
        const path = 'test/path';
        const error = new Error('Read error');
        
        get.mockRejectedValueOnce(error);
        
        await expect(readData(path)).rejects.toThrow(error);
        
        expect(console.error).toHaveBeenCalledWith(`Error reading data from ${path}:`, error);
      });
    });
    
    describe('updateData', () => {
      it('should update data at the specified path', async () => {
        const path = 'test/path';
        const data = { test: 'data' };
        
        await updateData(path, data);
        
        expect(ref).toHaveBeenCalledWith(db, path);
        expect(update).toHaveBeenCalledWith(mockDbRef, data);
      });
      
      it('should handle errors', async () => {
        const path = 'test/path';
        const data = { test: 'data' };
        const error = new Error('Update error');
        
        update.mockRejectedValueOnce(error);
        
        await updateData(path, data);
        
        expect(console.error).toHaveBeenCalledWith(`Error updating data at ${path}:`, error);
      });
    });
    
    describe('deleteData', () => {
      it('should delete data at the specified path', async () => {
        const path = 'test/path';
        
        await deleteData(path);
        
        expect(ref).toHaveBeenCalledWith(db, path);
        expect(remove).toHaveBeenCalledWith(mockDbRef);
      });
      
      it('should handle errors', async () => {
        const path = 'test/path';
        const error = new Error('Delete error');
        
        remove.mockRejectedValueOnce(error);
        
        await deleteData(path);
        
        expect(console.error).toHaveBeenCalledWith(`Error deleting data from ${path}:`, error);
      });
    });
    
    describe('subscribeToGameData', () => {
      it('should set up a subscription and return an unsubscribe function', () => {
        const gameId = 'game1';
        const callback = jest.fn();
        const unsubscribeFn = jest.fn();
        
        // Mock off function since it's what gets called when the unsubscribe function is executed
        ref.mockReturnValue(mockDbRef);
        onValue.mockReturnValue(unsubscribeFn);
        off.mockReturnValue(undefined);
        
        const result = subscribeToGameData(gameId, callback);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}`);
        expect(onValue).toHaveBeenCalledWith(mockDbRef, expect.any(Function));
        
        // Call the returned function
        result();
        // The actual implementation calls off(gameRef), not the value returned from onValue
        expect(off).toHaveBeenCalledWith(mockDbRef);
      });
      
      it('should call the callback with snapshot data', () => {
        const gameId = 'game1';
        const callback = jest.fn();
        const gameData = { name: 'Test Game' };
        
        // Capture the callback function passed to onValue
        let capturedCallback;
        onValue.mockImplementationOnce((ref, cb) => {
          capturedCallback = cb;
          return jest.fn();
        });
        
        subscribeToGameData(gameId, callback);
        
        // Simulate a snapshot event with data
        capturedCallback({
          val: () => gameData
        });
        
        expect(callback).toHaveBeenCalledWith(gameData);
      });
    });
  });

  describe('Game-Specific Functions', () => {
    describe('createGame', () => {
      it('should create a new game with default values', async () => {
        const gameId = 'game1';
        const initialData = {};
        
        await createGame(gameId, initialData);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}`);
        expect(set).toHaveBeenCalledWith(mockDbRef, {
          round: 1,
          phase: 1,
          currentTurnIndex: 0,
          players: [],
          predictions: {},
          bets: {},
          pot: 0
        });
      });
      
      it('should create a game with provided values', async () => {
        const gameId = 'game1';
        const initialData = {
          round: 2,
          phase: 3,
          currentTurnIndex: 1,
          players: [{ uid: 'player1' }, { uid: 'player2' }],
          extra: {  // Wrap creator and code in extra object
            creator: 'player1',
            code: 'ABC123'
          }
        };
        
        await createGame(gameId, initialData);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}`);
        expect(set).toHaveBeenCalledWith(mockDbRef, {
          round: 2,
          phase: 3,
          currentTurnIndex: 1,
          players: [{ uid: 'player1' }, { uid: 'player2' }],
          predictions: {},
          bets: {},
          pot: 0,
          creator: 'player1',  // Now these should be included through the extra object
          code: 'ABC123'
        });
      });
    });
    
    describe('updateRoundPhase', () => {
      it('should update the round phase', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const newPhase = 3;
        
        await updateRoundPhase(gameId, roundNumber, newPhase);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/rounds/${roundNumber}`);
        expect(update).toHaveBeenCalledWith(mockDbRef, { phase: newPhase });
      });
    });
    
    describe('updateCurrentRound', () => {
      it('should update the current round', async () => {
        const gameId = 'game1';
        const newRoundNumber = 3;
        
        await updateCurrentRound(gameId, newRoundNumber);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}`);
        expect(update).toHaveBeenCalledWith(mockDbRef, { currentRound: newRoundNumber });
      });
    });
    
    describe('setPlayerPrediction', () => {
      it('should set a player\'s prediction', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const playerId = 'player1';
        const price = 150.50;
        
        await setPlayerPrediction(gameId, roundNumber, playerId, price);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/rounds/${roundNumber}/predictions/${playerId}`);
        expect(set).toHaveBeenCalledWith(mockDbRef, price);
      });
    });
    
    describe('placeBet', () => {
      it('should place a bet for a player', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const playerId = 'player1';
        const amount = 100;
        
        await placeBet(gameId, roundNumber, playerId, amount);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/rounds/${roundNumber}/bets/${playerId}`);
        expect(set).toHaveBeenCalledWith(mockDbRef, {
          bet: amount,
          folded: false
        });
      });
    });
    
    describe('getPlayerBet', () => {
      it('should get a player\'s bet', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const playerId = 'player1';
        const mockData = { bet: 100, folded: false };
        
        get.mockResolvedValueOnce({
          exists: () => true,
          val: () => mockData
        });
        
        const result = await getPlayerBet(gameId, roundNumber, playerId);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/rounds/${roundNumber}/bets/${playerId}`);
        expect(get).toHaveBeenCalledWith(mockDbRef);
        expect(result).toBe(100);
      });
      
      it('should return 0 if no bet data exists', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const playerId = 'player1';
        
        get.mockResolvedValueOnce({
          exists: () => false,
          val: () => null
        });
        
        const result = await getPlayerBet(gameId, roundNumber, playerId);
        
        expect(result).toBe(0);
      });
      
      it('should handle errors and return 0', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const playerId = 'player1';
        const error = new Error('Test error');
        
        get.mockRejectedValueOnce(error);
        
        const result = await getPlayerBet(gameId, roundNumber, playerId);
        
        expect(console.error).toHaveBeenCalledWith(`Error getting bet for player ${playerId}:`, error);
        expect(result).toBe(0);
      });
    });
    
    describe('fold', () => {
      it('should fold a player\'s hand', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const playerId = 'player1';
        
        await fold(gameId, roundNumber, playerId);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/rounds/${roundNumber}/bets/${playerId}`);
        expect(set).toHaveBeenCalledWith(mockDbRef, {
          bet: 0,
          folded: true
        });
      });
    });
    
    describe('updatePot', () => {
      it('should update the pot value', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const newPot = 500;
        
        await updatePot(gameId, roundNumber, newPot);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/rounds/${roundNumber}/pot`);
        expect(set).toHaveBeenCalledWith(mockDbRef, newPot);
      });
    });
    
    describe('addLogEntry', () => {
      it('should add a log entry', async () => {
        const gameId = 'game1';
        const message = 'Test log message';
        
        // Mock Date.now to return a consistent value
        const originalDateNow = Date.now;
        Date.now = jest.fn(() => 1617235200000); // 2021-04-01
        
        await addLogEntry(gameId, message);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/logs`);
        expect(push).toHaveBeenCalledWith(mockDbRef, {
          message,
          timestamp: 1617235200000
        });
        
        // Restore original Date.now
        Date.now = originalDateNow;
      });
    });
    
    describe('updateCurrentTurnIndex', () => {
      it('should update the current turn index', async () => {
        const gameId = 'game1';
        const turnIndex = 2;
        
        await updateCurrentTurnIndex(gameId, turnIndex);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}`);
        expect(update).toHaveBeenCalledWith(mockDbRef, { currentTurnIndex: turnIndex });
      });
    });
    
    describe('updatePlayerChips', () => {
      it('should update a player\'s chips', async () => {
        const gameId = 'game1';
        const playerId = 'player1';
        const newChipsAmount = 1500;
        
        const mockPlayers = [
          { uid: 'player1', name: 'Player 1', chips: 1000 },
          { uid: 'player2', name: 'Player 2', chips: 2000 }
        ];
        
        get.mockResolvedValueOnce({
          exists: () => true,
          val: () => mockPlayers
        });
        
        await updatePlayerChips(gameId, playerId, newChipsAmount);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/players`);
        expect(get).toHaveBeenCalledWith(mockDbRef);
        
        const expectedUpdatedPlayers = [
          { uid: 'player1', name: 'Player 1', chips: 1500 },
          { uid: 'player2', name: 'Player 2', chips: 2000 }
        ];
        
        expect(set).toHaveBeenCalledWith(mockDbRef, expectedUpdatedPlayers);
      });
      
      it('should handle case when players data is not found', async () => {
        const gameId = 'game1';
        const playerId = 'player1';
        
        get.mockResolvedValueOnce({
          exists: () => false,
          val: () => null
        });
        
        await updatePlayerChips(gameId, playerId, 1000);
        
        expect(console.warn).toHaveBeenCalledWith("No players data found");
        expect(set).not.toHaveBeenCalled();
      });
      
      it('should handle errors', async () => {
        const gameId = 'game1';
        const playerId = 'player1';
        const error = new Error('Test error');
        
        get.mockRejectedValueOnce(error);
        
        await updatePlayerChips(gameId, playerId, 1000);
        
        expect(console.error).toHaveBeenCalledWith("Error updating player chips:", error);
      });
    });
    
    describe('updateHighestBet', () => {
      it('should update the highest bet', async () => {
        const gameId = 'game1';
        const roundNumber = 2;
        const newHighestBet = 200;
        
        await updateHighestBet(gameId, roundNumber, newHighestBet);
        
        expect(ref).toHaveBeenCalledWith(db, `games/${gameId}/rounds/${roundNumber}/highestBet`);
        expect(set).toHaveBeenCalledWith(mockDbRef, newHighestBet);
      });
    });
  });
});