import { defineStore } from 'pinia';

// Import your service functions
import {
  subscribeToGameData,
  createGame,
  updateRoundPhase,
  updateCurrentRound,
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

    players: [],
    predictions: {},
    bets: {},
    pot: 0,

    unsubscribers: [],
  }),

  getters: {
    isGameComplete: (state) => state.currentRound > state.totalRounds,
    allPlayersPredicted: (state) =>
        state.players.length === Object.keys(state.predictions).length,
    allPlayersBetOrFolded: (state) =>
      state.players.every((p) => state.bets[p.id] !== undefined),
  },

  actions: {
    /**
     * Subscribe to the realtime data for this game
     */
    async subscribeToGame(gameId) {
      this.gameId = gameId;

      const unsub = subscribeToGameData(gameId, (data) => {
        if (!data) {
          console.warn('Game not found or no data at this path');
          return;
        }

        // Update currentRound from DB
        this.currentRound = data.currentRound || data.round || 1;
        // Use the phase from the current round if available, otherwise fallback
        this.currentPhase =
          (data.rounds && data.rounds[this.currentRound] && data.rounds[this.currentRound].phase) ||
          data.phase ||
          1;
        this.players = data.players || [];
        this.predictions =
          data.rounds && data.rounds[this.currentRound]
            ? data.rounds[this.currentRound].predictions || {}
            : {};
        this.bets = data.bets || {};
        this.pot = data.pot || 0;

        console.log('players:', this.players.map(p => p.id));
        console.log('predictions keys:', Object.keys(this.predictions));
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
        // get the current phase from store's state
        const currentPhase = this.currentPhase;
      
        let newPhase;
        let newRound = currentRound;
      
        if (currentPhase < totalPhases) {
          newPhase = currentPhase + 1;
        } else {
          // move to next round
          newRound = currentRound + 1;
          newPhase = 1;
        }
      
        // update the DB
        await updateRoundPhase(this.gameId, newRound, newPhase);
        await updateCurrentRound(this.gameId, newRound);
    },
      

    /**
     * Player sets a prediction
     */
    async setPlayerPrediction(playerId, price) {
      if (!this.gameId) return;
      await dbSetPlayerPrediction(this.gameId, this.currentRound, playerId, price);

      // Removed logging here because the updated predictions will reflect
      // once the Firebase subscription updates store state.
      if (this.currentPhase === 1 && this.allPlayersPredicted) {
        await this.nextPhase();
      }
    },

    /**
     * Player places a bet
     */
    async placeBet(playerId, amount) {
      if (!this.gameId) return;
      await dbPlaceBet(this.gameId, playerId, amount);
    },

    /**
     * Player folds
     */
    async fold(playerId) {
      if (!this.gameId) return;
      await dbFold(this.gameId, playerId);
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
