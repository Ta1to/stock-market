import { defineStore } from 'pinia';

// Import your service functions
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
  updateData, // NEW: Import the updateData function to initialize round structure in DB
} from './game-database';


export const useGameStore = defineStore('game', {
  state: () => ({
    currentRound: 1,
    currentPhase: 1,
    totalRounds: 3,
    totalPhases: 10,  // Updated from 9 to 10 to include the winner announcement phase

    // Store the ID of the current game
    gameId: null,
    creator: null, 

    players: [],
    predictions: {},
    bets: {},
    folds: {},
    highestBet: 0,
    pot: 0,

    rounds: {},

    unsubscribers: [],

    // This identifies the player whose turn it is (initially set to 0 => player 1)
    currentTurnIndex: 0,
    errorMessage: null, // added property to hold error messages
    selectedStock: null, // new property for the selected stock of the round
  }),

  getters: {
    isGameComplete: (state) => state.currentRound > state.totalRounds,
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
        console.log("Game data received:", data);

        // Update the game state with the received data
        this.creator = data.creator;
        this.currentRound = data.currentRound || data.round || 1;
        this.currentPhase = (data.rounds && data.rounds[this.currentRound] && data.rounds[this.currentRound].phase) || data.phase || 1;
        this.players = data.players || [];
        // New addition: sync the pot from the database
        this.pot = data.rounds[this.currentRound].pot || 0;
        // NEW: Sync highestBet from database
        this.highestBet = data.rounds[this.currentRound].highestBet || 0;
        this.rounds = data.rounds || {}; 
        this.rounds = { ...this.rounds, ...data.rounds };
        
        // Replace merging with direct assignment:
        const incomingPredictions =
          data.rounds && data.rounds[this.currentRound] && data.rounds[this.currentRound].predictions
            ? data.rounds[this.currentRound].predictions
            : {};
        this.predictions = incomingPredictions;
    
        // NEW: Retrieve selectedStock from the current round's data in the database.
        const roundData = data.rounds ? data.rounds[this.currentRound] : null;
        this.selectedStock = roundData && roundData.selectedStock !== undefined ? roundData.selectedStock : null;
    
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
        // New round: reset selectedStock so the creator can choose stock for new round
        newRound = currentRound + 1;
        newPhase = 1;
        console.log(`Advancing to new round ${newRound}; resetting selectedStock.`);
        this.selectedStock = null;

        // Reset predictions when starting a new round:
        this.predictions = {};

        // Make sure the DB has a structure for the new round
        await updateData(`games/${this.gameId}/rounds/${newRound}`, {
          phase: 1,
          isSpinning: false
        });
      }

      await updateRoundPhase(this.gameId, newRound, newPhase);
      await updateCurrentRound(this.gameId, newRound);

      // Reset bets, folds, and highestBet when moving to next phase/round
      this.bets = {};
      this.folds = {};
      this.highestBet = 0;
      this.pot = 0; 
      this.currentRound = newRound;
      this.currentPhase = newPhase;
      console.log(`Updated state: round ${this.currentRound}, phase ${this.currentPhase}.`);
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
      
      // Check if every player has predicted.
      const allPredicted = this.players.every(p => this.predictions[p.uid] !== undefined);
      if (this.currentPhase === 2 && allPredicted) {
        console.log("All players predicted.");
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
    
      // Get current player chips
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
        this.errorMessage = `Bet must be at least equal to the highest bet of ${this.highestBet}`;
        return;
      }
      
      // Clear error message on successful bet
      this.errorMessage = null;
    
      // Calculate new chip amount
      const newChipsAmount = currentChips - amount;
    
      try {
        // Update the bet in the database
        await dbPlaceBet(this.gameId, this.currentRound, playerId, newBet);
        
        // Update the player's chips in the database
        await updatePlayerChips(this.gameId, playerId, newChipsAmount);
    
        // Update local state
        this.bets[playerId] = newBet;
        
        // Update the player's chips in local state
        this.players = this.players.map(p => {
          if (p.uid === playerId) {
            return { ...p, chips: newChipsAmount };
          }
          return p;
        });
    
        // Update highestBet if necessary
        if (newBet > this.highestBet) {
          this.highestBet = newBet;
          updateHighestBet(this.gameId, this.currentRound ,this.highestBet);
        }
    
        // Immediately update the pot with this bet amount
        this.pot += amount;
        await updatePot(this.gameId, this.currentRound, this.pot);
    
        const bettingComplete = await this.checkBettingStatus();
        if (bettingComplete) {
          console.log("Betting round complete, moving to next phase.");
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
     * Player folds
     */
    async fold(playerId) {
      if (!this.gameId) return;

      // Allow folding only in phases 3, 5, and 7 the betting phases
      if (this.currentPhase !== 3 && this.currentPhase !== 5 && this.currentPhase !== 7 && this.currentPhase !== 9) {
        console.warn('Folding not allowed outside betting phases!', this.currentPhase);
        this.errorMessage = 'Folding is only allowed during betting phases!';
        return;
      }

      await dbFold(this.gameId, this.currentRound, playerId);
      this.folds[playerId] = true;
      this.moveToNextTurn();
      await this.checkBettingStatus();
    },
    
    /**
     * Check if all players have placed bets or folded
     * @returns {Promise<boolean>} True if betting round is complete, false if still ongoing
     */
    async checkBettingStatus() {
      console.log('Checking betting status...');

      // Only check betting status in phases 3, 5, and 7
      if (this.currentPhase !== 3 && this.currentPhase !== 5 && this.currentPhase !== 7 && this.currentPhase !== 9) {
        console.log("Not in a betting phase, skipping check");
        return false;
      }

      const activePlayers = this.players.filter((p) => !this.folds[p.uid]);

      // If only one player remains, award the pot, reset pot and highestBet, and end the round.
      if (activePlayers.length <= 1) {
          console.log('Only one player left, awarding pot and ending round.');
          const winner = activePlayers[0];
          // Award the pot to the winner: update the winner's chips.
          const newChips = winner.chips + this.pot;
          await updatePlayerChips(this.gameId, winner.uid, newChips);
          
          // Update local state: reflect the changed chips for the winner.
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
          
          // Advance to next round in DB.
          await updateCurrentRound(this.gameId, newRound);
          await updateRoundPhase(this.gameId, newRound, 1);
          
          // Update local state accordingly.
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
      );

      const allMatchedHighest = playerBets.every((pb) => pb.bet === this.highestBet);

      if (allMatchedHighest) {
          console.log('All players placed matching bets. Pot is:', this.pot);
          return true;
      }

      return false;
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
     * Add a log entry
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
      
      try {
        // Update the player's chips in the database
        await updatePlayerChips(this.gameId, playerId, newChipsAmount);
        
        // Update local state: reflect the changed chips for the player
        this.players = this.players.map(p => {
          if (p.uid === playerId) {
            return { ...p, chips: newChipsAmount };
          }
          return p;
        });
        
        console.log(`Added ${amount} chips to player ${playerId}. New balance: ${newChipsAmount}`);
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
    },

    // New action to set the selected stock for this round
    setSelectedStock(stock) {
      console.log("setSelectedStock called with:", stock);
      this.selectedStock = stock;
    },
  },
});
