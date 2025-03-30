import { db } from '../api/firebase';
import { ref, set, get, update, remove, onValue, off, push } from 'firebase/database';

/**
 * ------------------------------------------------------------------------
 * GENERIC DATABASE OPERATIONS
 * ------------------------------------------------------------------------
 */

/**
 * Write (overwrite) data at a given path
 */
export const writeData = async (path, data) => {
  try {
    await set(ref(db, path), data);
    console.log(`Data written to ${path}`);
  } catch (error) {
    console.error(`Error writing data to ${path}:`, error);
  }
};

/**
 * Read data from a path once
 */
export const readData = async (path) => {
  try {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log(`No data available at ${path}`);
      return null;
    }
  } catch (error) {
    console.error(`Error reading data from ${path}:`, error);
    throw error;
  }
};

/**
 * Update data at a given path
 */
export const updateData = async (path, data) => {
  try {
    await update(ref(db, path), data);
    console.log(`Data updated at ${path}`);
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error);
  }
};

/**
 * Delete data at a given path
 */
export const deleteData = async (path) => {
  try {
    await remove(ref(db, path));
    console.log(`Data deleted from ${path}`);
  } catch (error) {
    console.error(`Error deleting data from ${path}:`, error);
  }
};

/**
 * ------------------------------------------------------------------------
 * GAME-SPECIFIC FUNCTIONS
 * ------------------------------------------------------------------------
 */

/**
 * Continuously listen to a game's data
 * Returns an unsubscribe function you can call to stop listening.
 */
export const subscribeToGameData = (gameId, callback) => {
  const gameRef = ref(db, `games/${gameId}`);
  onValue(gameRef, (snapshot) => {
    callback(snapshot.val());
  });
  // Return a cleanup function that calls "off"
  return () => off(gameRef);
};

/**
 * Create or initialize a game node in the DB
 */
export const createGame = async (gameId, initialData) => {
  const path = `games/${gameId}`;
  const data = {
    round: initialData.round || 1,
    phase: initialData.phase || 1,
    players: initialData.players || [],
    predictions: {},
    bets: {},
    pot: 0,
    ...initialData.extra || {}, // optional extra data
  };
  await writeData(path, data);
};

/**
 * Update round/phase data
 */
export const updateRoundPhase = async (gameId, roundNumber, newPhase) => {
    await updateData(`games/${gameId}/rounds/${roundNumber}`, { phase: newPhase });
  };

/**
 * Update the current round number
 */
export const updateCurrentRound = async (gameId, newRoundNumber) => {
  await updateData(`games/${gameId}`, { currentRound: newRoundNumber });
};  
/**
 * Set a player’s prediction
 */
export const setPlayerPrediction = async (gameId, roundNumber, playerId, price) => {
    await writeData(`games/${gameId}/rounds/${roundNumber}/predictions/${playerId}`, price);
  };
  

/**
 * Place a bet
 */
export const placeBet = async (gameId, roundNumber, playerId, amount) => {
    await writeData(`games/${gameId}/rounds/${roundNumber}/bets/${playerId}`, {
      bet: amount,
      folded: false,
    });
  };

/**
 * Fold
 */
export const fold = async (gameId, playerId) => {
  await writeData(`games/${gameId}/bets/${playerId}`, {
    bet: 0,
    folded: true,
  });
};

/**
 * Update the pot
 */
export const updatePot = async (gameId, newPotValue) => {
  await writeData(`games/${gameId}/pot`, newPotValue);
};

/**
 * Push a new log entry
 */
export const addLogEntry = async (gameId, message) => {
  const logsRef = ref(db, `games/${gameId}/logs`);
  await push(logsRef, {
    message,
    timestamp: Date.now(),
  });
};
