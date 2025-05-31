/**
 * Game State Management
 * Handles all game-related state and business logic using Pinia store
 * Provides reactivity, persistence, and synchronization with Firebase
 */
import { defineStore } from 'pinia';
import { auth } from '@/api/firebase-api';
import { onAuthStateChanged } from 'firebase/auth';
import { PopupState } from '@/utils/popupEventBus';

// Import database functions for game state persistence
import {
  subscribeToGameData,
  createGame,
  updateRoundPhase,
  updateCurrentRound,
  updateCurrentTurnIndex,
  updatePlayerChips,
  updateHighestBet,
  setPlayerPrediction as dbSetPlayerPrediction,
  placeBet as dbPlaceBet,
  fold as dbFold,
  updatePot,
  addLogEntry as dbAddLogEntry,
  getPlayerBet as dbGetPlayerBet,
  updateData, // Used to initialize round structure in database
  deleteData, // Used to delete game from database
} from './game-database';


export const useGameStore = defineStore('game', {
  /**
   * State contains all reactive game data
   * All properties are synchronized with Firebase
   */  state: () => ({
    currentRound: 1,
    currentPhase: 1,
    totalRounds: 3,
    totalPhases: 10,  // Includes winner announcement phase

    // Store the ID of the current game
    gameId: null,
    creator: null, 

    players: [],
    predictions: {},
    bets: {},
    folds: {},
    highestBet: 0,
    pot: 0,    rounds: {},

    unsubscribers: [],
    unsubscribeGame: null, // Specific subscription for game data

    // Identifies the player whose turn it is (initially set to 0 => player 1)
    currentTurnIndex: 0,
    errorMessage: null, // Holds error messages for UI display
    selectedStock: null, // Selected stock symbol for the current round
    
    // Authentication state
    currentUser: null,
      // Round winner state
    roundWinner: null,
    roundPot: 0,
    showGameWinner: false,
    
    // Game end state
    gameEnded: false,
    
    // Error handling
    errorTimeout: null,
    unsubscribeAuth: null,
  }),
  getters: {
    /**
     * Determines if the game has reached its conclusion
     * @returns {boolean} True if all rounds have been completed
     */
    isGameComplete: (state) => state.currentRound > state.totalRounds,
    
    /**
     * Get current user's chips
     * @returns {number} Current user's chip count
     */
    currentUserChips: (state) => {
      if (!state.currentUser || !state.players.length) return 0;
      const player = state.players.find(p => p.uid === state.currentUser.uid);
      return player ? player.chips : 0;
    },
    
    /**
     * Get formatted stock data for the current round
     * @returns {object|null} Formatted stock data or null if not available
     */
    stockData: (state) => {
      const currentRound = state.currentRound;
      const roundData = state.rounds?.[currentRound];
            
      if (!roundData?.stocks?.[0]) {
        console.warn("No stocks data available for current round");
        return null;
      }

      const stockDetails = roundData.stocks[0];
      if (!stockDetails.history) {
        console.warn("Stock history not available or not in correct format");
        return null;
      }

      return {
        name: stockDetails.name,
        symbol: stockDetails.symbol,
        description: stockDetails.description,
        sector: stockDetails.sector, 
        industry: stockDetails.industry,
        website: stockDetails.website,
        dates: stockDetails.history.map(entry => entry.date),
        prices: stockDetails.history.map(entry => entry.price),
        news: stockDetails.news || [], 
        technicalIndicators: stockDetails.technicalIndicators || null
      };
    },
    
    /**
     * Check if current user is the game creator
     * @returns {boolean} True if current user is creator
     */
    isCreator: (state) => state.currentUser?.uid === state.creator,
    
    /**
     * Check if it's the current user's turn
     * @returns {boolean} True if it's current user's turn
     */
    isMyTurn: (state) => {
      if (!state.currentUser || !state.players.length) {
        return false;
      }
      const currentPlayer = state.players[state.currentTurnIndex];
      return state.currentUser.uid === currentPlayer.uid;
    },
    
    /**
     * Get current user ID
     * @returns {string} Current user ID or empty string
     */
    currentUserId: (state) => {
      return state.currentUser ? state.currentUser.uid : '';
    },
    
    /**
     * Get current turn player data
     * @returns {object} Current turn player data or empty object
     */
    currentTurnPlayer: (state) => {
      if (!state.players.length) return {};
      return state.players[state.currentTurnIndex];
    },
    
    /**
     * Check if betting is disabled in current phase
     * @returns {boolean} True if betting is disabled
     */
    bettingDisabled: (state) => {
      return state.currentPhase !== 3 && state.currentPhase !== 5 && state.currentPhase !== 7 && state.currentPhase !== 9;
    },
  },

  actions: {
    /**
     * Subscribe to the realtime data for this game from Firebase
     * Updates local state whenever remote data changes
     * @param {string} gameId - Unique identifier for the game
     */    async subscribeToGame(gameId) {
      this.gameId = gameId;      const unsub = subscribeToGameData(gameId, (data) => {
        if (!data) {
          console.warn("Game not found or no data at this path - game may have been deleted");
          // Game has been deleted, redirect all players to lobby
          this.gameEnded = true;
          import('@/router').then(({ default: router }) => {
            router.push('/');
          });
          return;        }
        this.creator = data.creator;
        this.players = data.players || [];
        this.rounds = { ...this.rounds, ...data.rounds };
        
        // Set currentRound first
        this.currentRound = data.currentRound || data.round || 1;
        
        // Then get currentRoundData based on the updated currentRound
        const currentRoundData = data.rounds && data.rounds[this.currentRound] ? data.rounds[this.currentRound] : {};
        
        // Now set phase and other round-specific data
        this.currentPhase = currentRoundData.phase || data.phase || 1;
        this.pot = currentRoundData.pot || 0;
        this.highestBet = currentRoundData.highestBet || 0;
        this.selectedStock = currentRoundData.selectedStock !== undefined ? currentRoundData.selectedStock : null;
        
        const incomingPredictions = currentRoundData.predictions || {};
        this.predictions = incomingPredictions;
        if (data.gameEnded) {
          this.gameEnded = true;
          // Import router to navigate
          import('@/router').then(({ default: router }) => {
            router.push('/');
          });
          return;
        }    
        if (data.currentTurnIndex !== undefined) {
          this.currentTurnIndex = data.currentTurnIndex;
        } else {
          this.currentTurnIndex = 0;
        }
      });
      
      this.unsubscribeGame = unsub;
      this.unsubscribers.push(unsub);
    },

    /**
     * Stop listening to game updates and clean up subscriptions
     * Should be called when leaving a game or component unmounts
     */
    unsubscribeFromGame() {
      this.unsubscribers.forEach((fn) => fn());
      this.unsubscribers = [];
    },

    /**
     * Create and initialize a new game in database
     * @param {string} gameId - Unique identifier for the new game
     * @param {object} initialData - Initial game configuration data
     */
    async createGameInDB(gameId, initialData = {}) {
      await createGame(gameId, initialData);
    },

    /**
     * Advances the game to the next phase or round
     * Handles phase transitions and round boundaries
     * Updates both local state and database
     */
    async nextPhase() {
      if (!this.gameId) return;

      let { currentRound, totalPhases } = this;
      const currentPhase = this.currentPhase;

      let newPhase;
      let newRound = currentRound;

      if (currentPhase < totalPhases) {
        newPhase = currentPhase + 1;
      } else {        // New round: reset selectedStock so the creator can choose stock for new round
        newRound = currentRound + 1;
        newPhase = 1;
        this.selectedStock = null;

        // Reset predictions when starting a new round:
        this.predictions = {};

        // Make sure the DB has a structure for the new round
        await updateData(`games/${this.gameId}/rounds/${newRound}`, {
          phase: 1,
          isSpinning: false
        });
      }      await updateRoundPhase(this.gameId, newRound, newPhase);
      await updateCurrentRound(this.gameId, newRound);

      // Reset bets, folds, and highestBet when moving to next phase/round
      this.bets = {};
      this.folds = {};
      this.highestBet = 0;
      
      // Nur bei einer neuen Runde den Pot zurücksetzen
      if (newRound > currentRound) {
        this.pot = 0;
      }
        this.currentRound = newRound;
      this.currentPhase = newPhase;
    },

    /**
     * Initiates the stock selection phase for a round
     * @param {string} gameId - Unique identifier for the game
     */    async startStockSelection() {
      if (!this.gameId) return;
        try {
        if (this.currentPhase !== 1) {
          await updateRoundPhase(this.gameId, this.currentRound, 1);
        }
      } catch (error) {
        console.error('Error in startStockSelection:', error);
        throw error;
      }
    },

    /**
     * Records a player's price prediction for the current round
     * @param {string} playerId - Unique identifier for the player
     * @param {number} price - The player's predicted price
     */
    async setPlayerPrediction(playerId, price) {
      if (!this.gameId) return;
      
      const player = this.players.find((p) => p.uid === playerId);
      if (!player) {
        console.warn("Player not found:", playerId);
        return;
      }
      
      await dbSetPlayerPrediction(this.gameId, this.currentRound, playerId, price);
        // Immediately update the local state.
      this.predictions[playerId] = price;
        const allPredicted = this.players.every(p => this.predictions[p.uid] !== undefined);
      if (this.currentPhase === 2 && allPredicted) {
        await this.nextPhase();
      }
    },
      


    /**
     * Player places a bet in the current betting phase
     * Updates player chips, pot, and highest bet
     * @param {string} playerId - Unique identifier for the player
     * @param {number} amount - Bet amount in chips
     */
    async placeBet(playerId, amount) {
      if (!this.gameId) return;
    
      // Allow betting only in phases 3, 5, and 7 the betting phases
      if (this.currentPhase !== 3 && this.currentPhase !== 5 && this.currentPhase !== 7 && this.currentPhase !== 9) {
        console.warn('Betting phase not active!', this.currentPhase);
        console.warn('Wait for a betting phase!');
        return;
      }
    
      const player = this.players.find((p) => p.uid === playerId);
      if (!player) {
        console.warn("Player not found:", playerId);
        return;
      }
    
      // Determine the player whose turn it is
      const currentPlayer = this.players[this.currentTurnIndex];
      if (currentPlayer.uid !== playerId) {
        console.warn("It's not your turn!", currentPlayer.id, playerId);
        return;
      }
      const currentChips = player.chips;
      
      if (currentChips < amount) {
        console.warn("Player does not have enough chips:", playerId);
        return;
      }
    
      // Retrieve the player's existing bet (if any)
      const oldBet = await dbGetPlayerBet(this.gameId, this.currentRound, playerId);
      const newBet = oldBet + amount;
        // Bet validation with error message visible on screen
      if (this.highestBet > 0 && newBet < this.highestBet) {
        this.setErrorMessage(`Bet must be at least equal to the highest bet of ${this.highestBet}`);
        return;
      }
        this.errorMessage = null;
    
      // Calculate new chip amount
      const newChipsAmount = currentChips - amount;
    
      try {        await dbPlaceBet(this.gameId, this.currentRound, playerId, newBet);
        
        await updatePlayerChips(this.gameId, playerId, newChipsAmount);

        this.bets[playerId] = newBet;
        
        this.players = this.players.map(p => {
          if (p.uid === playerId) {
            return { ...p, chips: newChipsAmount };
          }
          return p;
        });        if (newBet > this.highestBet) {
          this.highestBet = newBet;
          updateHighestBet(this.gameId, this.currentRound ,this.highestBet);
        }
    
        // Immediately update the pot with this bet amount
        this.pot += amount;
        await updatePot(this.gameId, this.currentRound, this.pot);        const bettingComplete = await this.checkBettingStatus();
        if (bettingComplete) {
          await this.nextPhase();
        } else {
          this.moveToNextTurn();
        }
      } catch (error) {
        console.error("Error placing bet:", error);
        throw error;
      }
    },
    
    /**
     * Player folds during the current betting phase
     * Removes player from active betting and moves to next player's turn
     * @param {string} playerId - Unique identifier for the player
     */
    async fold(playerId) {
      if (!this.gameId) return;      // Allow folding only in phases 3, 5, and 7 the betting phases
      if (this.currentPhase !== 3 && this.currentPhase !== 5 && this.currentPhase !== 7 && this.currentPhase !== 9) {
        console.warn('Folding not allowed outside betting phases!', this.currentPhase);
        this.setErrorMessage('Folding is only allowed during betting phases!');
        return;
      }

      await dbFold(this.gameId, this.currentRound, playerId);
      this.folds[playerId] = true;
      this.moveToNextTurn();
      await this.checkBettingStatus();
    },
    
    /**
     * Check if all players have placed bets or folded
     * Determines if betting round is complete and handles single player scenarios
     * @returns {Promise<boolean>} True if betting round is complete, false if still ongoing
     */    async checkBettingStatus() {
      // Only check betting status in phases 3, 5, and 7
      if (this.currentPhase !== 3 && this.currentPhase !== 5 && this.currentPhase !== 7 && this.currentPhase !== 9) {
        return false;
      }

      const activePlayers = this.players.filter((p) => !this.folds[p.uid]);      // If only one player remains, award the pot, reset pot and highestBet, and end the round.
      if (activePlayers.length <= 1) {
          const winner = activePlayers[0];          const newChips = winner.chips + this.pot;
          await updatePlayerChips(this.gameId, winner.uid, newChips);
          
          this.players = this.players.map(p => {
            if (p.uid === winner.uid) {
              return { ...p, chips: newChips };
            }
            return p;
          });
          
          // Reset the pot and highestBet.
          this.pot = 0;
          this.highestBet = 0;
          
          const newRound = this.currentRound + 1;
          
          // Make sure the new round has its structure initialized in DB
          await updateData(`games/${this.gameId}/rounds/${newRound}`, {
            phase: 1,
            isSpinning: false
          });
            await updateCurrentRound(this.gameId, newRound);
          await updateRoundPhase(this.gameId, newRound, 1);
          
          this.currentRound = newRound;
          this.currentPhase = 1;
          this.bets = {};
          this.folds = {};
          
          return true;
      }
      
      const playerBets = await Promise.all(
          activePlayers.map(async (p) => {
              const bet = await dbGetPlayerBet(this.gameId, this.currentRound, p.uid);
              return { playerId: p.uid, bet };
          })
      );      const allMatchedHighest = playerBets.every((pb) => pb.bet === this.highestBet);

      if (allMatchedHighest) {
          return true;
      }

      return false;
    },

    /**
     * Move to the next player's turn
     * Skips players who have folded
     * Updates both local state and database
     */
    moveToNextTurn() {
      if (!this.players.length) return;
      
      let nextIndex = this.currentTurnIndex;
      const totalPlayers = this.players.length;
      let iterations = 0;
      
      // Loop to find the next active player (one who has not folded)
      do {
        nextIndex = (nextIndex + 1) % totalPlayers;
        iterations++;
        if (iterations > totalPlayers) {
          break;
        }
      } while (this.folds[this.players[nextIndex].uid]); // use uid if that's your field
    
      this.currentTurnIndex = nextIndex;
      // Save the updated turn index to Firebase
      updateCurrentTurnIndex(this.gameId, nextIndex);
    },

    /**
     * Add a log entry to the game history
     * @param {string} message - Log message to record
     */
    async addLogEntry(message) {
      if (!this.gameId) return;
      await dbAddLogEntry(this.gameId, message);
    },

    /**
     * Add chips to a player's balance
     * @param {string} playerId - The ID of the player to add chips to
     * @param {number} amount - The amount of chips to add
     */
    async addChipsToPlayer(playerId, amount) {
      if (!this.gameId) return;
      
      const player = this.players.find((p) => p.uid === playerId);
      if (!player) {
        console.warn("Player not found:", playerId);
        return;
      }
      
      // Calculate new chip amount
      const newChipsAmount = player.chips + amount;
      
      try {        await updatePlayerChips(this.gameId, playerId, newChipsAmount);
          this.players = this.players.map(p => {
          if (p.uid === playerId) {
            return { ...p, chips: newChipsAmount };
          }
          return p;
        });
      } catch (error) {
        console.error("Error adding chips to player:", error);
        throw error;
      }
    },
    
    /**
     * Reset the pot to zero
     */
    async resetPot() {
      if (!this.gameId) return;
      this.pot = 0;
      await updatePot(this.gameId, this.currentRound, 0);
    },    /**
     * Sets the selected stock for the current round
     * Used during stock selection phase
     * @param {object} stock - Stock object containing symbol and name
     */    setSelectedStock(stock) {
      this.selectedStock = stock;
    },
    
    /**
     * Initialize authentication state and game subscription
     * @param {string} gameId - Game ID to subscribe to
     */
    async initializeAuth(gameId) {
      this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        if (user) {
          this.subscribeToGame(gameId);
        }
      });
    },
    
    /**
     * Handle error message with auto-dismiss timeout
     * @param {string} message - Error message to display
     */
    setErrorMessage(message) {
      // Clear any existing timeout
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
        this.errorTimeout = null;
      }
      
      this.errorMessage = message;
      
      // If there's a new error message, set a timeout to clear it
      if (message) {
        this.errorTimeout = setTimeout(() => {
          this.errorMessage = null;
        }, 5000); // 5 seconds
      }
    },
    
    /**
     * Handle phase change and determine round winner
     * @param {number} newPhase - The new phase number
     */
    async handlePhaseChange(newPhase) {
      // close all popups when phase changes
      PopupState.activePopup = null;

      // If phase changes to 10, determine the round winner
      if (newPhase === 10) {
        await this.determineRoundWinner();
      }
    },
    
    /**
     * Determine the winner of the current round
     */
    async determineRoundWinner() {
      // Determine winner based on the active players
      const activePlayers = this.players.filter((p) => !this.folds[p.uid]);
        // Save the current pot amount before any changes
      this.roundPot = this.pot;
      
      if (activePlayers.length === 1) {
        // Only one player left (others folded)        this.roundWinner = activePlayers[0];
        await this.addChipsToPlayer(this.roundWinner.uid, this.pot);
      } else if (activePlayers.length > 1) {
        // Multiple players remain - determine winner by prediction accuracy
        const currentPrice = this.stockData?.prices[this.stockData.prices.length - 1] || 0;
        
        let closestPlayers = [];
        let smallestDifference = Infinity;
        
        // Find player(s) with closest prediction
        activePlayers.forEach(player => {
          const prediction = this.predictions[player.uid];
          if (prediction !== undefined) {
            const difference = Math.abs(prediction - currentPrice);
              if (difference < smallestDifference) {
              smallestDifference = difference;
              closestPlayers = [player];
            }            else if (difference === smallestDifference) {
              closestPlayers.push(player);
            }
          }
        });
          if (closestPlayers.length > 1) {
          this.roundWinner = {
            isTie: true,
            players: closestPlayers,
            name: closestPlayers.map(p => p.name).join(', '),
            message: `Tie! The pot will be split among ${closestPlayers.length} players.`
          };
          
          const splitAmount = Math.floor(this.pot / closestPlayers.length);
          
          for (const player of closestPlayers) {
            await this.addChipsToPlayer(player.uid, splitAmount);
          }        } else if (closestPlayers.length === 1) {
          this.roundWinner = closestPlayers[0];
          await this.addChipsToPlayer(this.roundWinner.uid, this.pot);
        } else {
          console.warn("No winner could be determined - no valid predictions found");
        }
      }
      
      // Reset the pot for the next round after all chips have been distributed
      await this.resetPot();
    },
    
    /**
     * Handle round change and check for game completion
     * @param {number} newRound - The new round number
     */
    handleRoundChange(newRound) {
      if (newRound > this.totalRounds) {
        this.showGameWinner = true;
      }
    },    /**
     * Handle game end - mark game as ended for all players
     * @param {string} gameId - Game ID to mark as ended
     */
    async handleGameEnd(gameId) {
      try {
        // Mark the game as ended in the database so all players get notified
        await updateData(`games/${gameId}`, {
          gameEnded: true,
          endedAt: Date.now()
        });
        
        // Schedule game deletion after all players have had time to see the end screen
        setTimeout(async () => {
          try {
            await deleteData(`games/${gameId}`);
          } catch (error) {
            console.error("Error deleting game:", error);
          }
        }, 35000); // 35 seconds - slightly longer than the countdown timer
        
      } catch (error) {
        console.error("Error marking game as ended:", error);
        throw error;
      }
    },
    
    /**
     * Handle winner continue action
     */
    async handleWinnerContinue() {
      // If this was the final round, show the game winner
      if (this.currentRound >= this.totalRounds) {
        this.showGameWinner = true;
        // Prevent moving to the next phase/round which would trigger StockSelector
        return; 
      } else {
        // Otherwise, move to the next round
        await this.nextPhase();
      }
    },
    
    /**
     * Reset all game state
     */
    resetGame() {
      this.currentRound = 1;
      this.currentPhase = 1;
      this.gameId = null;
      this.creator = null;
      this.players = [];
      this.predictions = {};
      this.bets = {};
      this.folds = {};
      this.highestBet = 0;
      this.pot = 0;
      this.rounds = {};
      this.currentTurnIndex = 0;
      this.errorMessage = null;      this.selectedStock = null;
      this.currentUser = null;
      this.gameEnded = false;      this.roundWinner = null;
      this.roundPot = 0;
      this.showGameWinner = false;
      this.unsubscribeGame = null;
      
      // Clear timeouts
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
        this.errorTimeout = null;
      }
    },
    
    /**
     * Clean up subscriptions and timeouts
     */
    cleanup() {
      // Clear any active timeout
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
        this.errorTimeout = null;
      }
      
      // Unsubscribe from auth state changes
      if (this.unsubscribeAuth) {
        this.unsubscribeAuth();
        this.unsubscribeAuth = null;
      }
      
      this.unsubscribeFromGame();
    },
  },
});
