import { defineStore } from 'pinia';

// Import your service functions
import {
  subscribeToGameData,
  createGame,
  updateRoundPhase,
  updateCurrentRound,
  updateCurrentTurnIndex,
  setPlayerPrediction as dbSetPlayerPrediction,
  placeBet as dbPlaceBet,
  fold as dbFold,
  updatePot as dbUpdatePot,
  addLogEntry as dbAddLogEntry,
} from './game-database';

export const useGameStore = defineStore('game', {
  state: () => ({
    currentRound: 1,
    currentPhase: 1,
    totalRounds: 3,
    totalPhases: 3,

    // Store the ID of the current game
    gameId: null,
    creator: null, 

    players: [],
    predictions: {},
    bets: {},
    folds: {},
    highestBet: 0,  // Fixed typo here: changed from heigestBet to highestBet
    pot: 0,

    rounds: {},

    unsubscribers: [],

    // This identifies the player whose turn it is (initially set to 0 => player 1)
    currentTurnIndex: 0,
  }),

  getters: {
    isGameComplete: (state) => state.currentRound > state.totalRounds,
    allPlayersPredicted: (state) => {
      const validPredictions = Object.values(state.predictions).filter(
        prediction => prediction !== undefined && prediction !== null && prediction !== ''
      );
      console.log("Valid predictions:", validPredictions);
      console.log("All players predicted:", state.players.length, validPredictions.length);
      return state.players.length === validPredictions.length;
    },
    allPlayersBetOrFolded: (state) =>
      state.players.every(
        (p) => state.bets[p.id] !== undefined || state.folds[p.id] === true
      ),
  },

  actions: {
    /**
     * Subscribe to the realtime data for this game
     */
    async subscribeToGame(gameId) {
      this.gameId = gameId;
      const unsub = subscribeToGameData(gameId, (data) => {
        if (!data) {
          console.warn("Game not found or no data at this path");
          return;
        }
        
        this.creator = data.creator;
        this.currentRound = data.currentRound || data.round || 1;
        this.currentPhase = (data.rounds && data.rounds[this.currentRound] && data.rounds[this.currentRound].phase) || data.phase || 1;
        this.players = data.players || [];
        this.rounds = data.rounds || {}; 
        this.rounds = { ...this.rounds, ...data.rounds };
        
        // Merge incoming predictions with existing local predictions
        const incomingPredictions =
          data.rounds && data.rounds[this.currentRound] && data.rounds[this.currentRound].predictions
            ? data.rounds[this.currentRound].predictions
            : {};
        this.predictions = { ...this.predictions, ...incomingPredictions };
    
        // Set the turn index from the database, if available. Otherwise, default to 0.
        if (data.currentTurnIndex !== undefined) {
          this.currentTurnIndex = data.currentTurnIndex;
        } else {
          this.currentTurnIndex = 0;
        }
      });
      this.unsubscribers.push(unsub);
    },
    
    /**
     * Stop listening to game updates
     */
    unsubscribeFromGame() {
      this.unsubscribers.forEach((fn) => fn());
      this.unsubscribers = [];
    },

    /**
     * Create/initialize a new game in DB
     */
    async createGameInDB(gameId, initialData = {}) {
      await createGame(gameId, initialData);
    },

    /**
     * Move to the next phase or round
     */
    async nextPhase() {
      if (!this.gameId) return;
      
      let { currentRound, totalPhases } = this;
      const currentPhase = this.currentPhase;
      
      let newPhase;
      let newRound = currentRound;
      
      if (currentPhase < totalPhases) {
        newPhase = currentPhase + 1;
      } else {
        newRound = currentRound + 1;
        newPhase = 1;
      }
      
      await updateRoundPhase(this.gameId, newRound, newPhase);
      await updateCurrentRound(this.gameId, newRound);

      // Reset bets, folds and highestBet when moving to next phase/round
      this.bets = {};
      this.folds = {};
      this.highestBet = 0;
    },

    async startStockSelection(gameId) {
      if (!this.gameId) return;
      
      try {
        if (this.currentPhase !== 1) {
          await updateRoundPhase(this.gameId, this.currentRound, 1);
        }
        console.log('Stock selection started for game:', gameId);
      } catch (error) {
        console.error('Error in startStockSelection:', error);
        throw error;
      }
    },

    /**
     * Player sets a prediction
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
      console.log("Prediction set, current predictions:", this.predictions);
      
      // Instead of automatically changing phase, you can emit an event
      // or set a flag to allow the user to confirm the prediction manually.
      // For example, simply log that all predictions are complete:
      if (this.currentPhase === 2 && this.allPlayersPredicted) {
        console.log("All players predicted.");
        // Optionally, you could trigger the phase change here if desired.
        await this.nextPhase();
      } else {
        console.log("Not all players predicted yet, remaining in phase 2");
      }
    },
      

    /**
     * Player places a bet
     */
    async placeBet(playerId, amount) {
      if (!this.gameId) return;
    
      // Allow betting only in phase 3 (betting phase)
      if (this.currentPhase !== 3) {
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
        console.warn("It's not your turn!" ,currentPlayer.id, playerId);
        return;
      }

      if (player.chips < amount) {
        console.warn("Player does not have enough chips:", playerId);
        return;
      }
    
      // Retrieve the player's existing bet (if any)
      const oldBet = this.bets[playerId] || 0;
      // Calculate the new total bet by adding the current amount to the old bet
      const newBet = oldBet + amount;
    
      // Store the bet in the database
      await dbPlaceBet(this.gameId, this.currentRound, playerId, newBet);
    
      // Update the local state with the new total bet
      this.bets[playerId] = newBet;
    
      // Update highestBet if necessary
      if (newBet > this.highestBet) {
        this.highestBet = newBet;
      }
    
      // Move to the next active player's turn
      this.moveToNextTurn();
    
      // Check if all players have either bet or folded
      await this.checkBettingStatus();
    },
    
    /**
     * Player folds
     */
    async fold(playerId) {
      if (!this.gameId) return;
    
      // Store the fold status in the database
      await dbFold(this.gameId, this.currentRound, playerId);
    
      // Update the local fold status for the player
      this.folds[playerId] = true;
    
      // Move the turn to the next active player
      this.moveToNextTurn();
    
      // Check betting status
      await this.checkBettingStatus();
    },
    
    /**
     * Check if all players have placed bets or folded
     */
    async checkBettingStatus() {
      const activePlayers = this.players.filter((p) => !this.folds[p.id]);

      // If only one player remains, end the round automatically
      if (activePlayers.length <= 1) {
        console.log('Only one player left, round is over.');
        await this.nextPhase(); 
        return;
      }

      // Check if all active players have placed the same bet
      const allMatchedHighest = activePlayers.every((p) => {
        const bet = this.bets[p.id] || 0;
        return bet === this.highestBet;
      });

      if (allMatchedHighest) {
        // Update the pot (optional)
        this.pot += activePlayers.length * this.highestBet;
        console.log('All players placed a bet.');
        await this.nextPhase();
      }
    },

    /**
     * Move to the next player's turn
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
     * Update the pot in DB
     */
    async updatePot(newPotValue) {
      if (!this.gameId) return;
      await dbUpdatePot(this.gameId, newPotValue);
    },

    /**
     * Add a log entry
     */
    async addLogEntry(message) {
      if (!this.gameId) return;
      await dbAddLogEntry(this.gameId, message);
    },
  },
});
