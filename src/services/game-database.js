import { db } from '../api/firebase-api';
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
    currentTurnIndex: initialData.currentTurnIndex || 0,
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
 * Get a player's current bet for a specific round
 */
export const getPlayerBet = async (gameId, roundNumber, playerId) => {
  try {
      const data = await readData(`games/${gameId}/rounds/${roundNumber}/bets/${playerId}`);
      return data ? data.bet : 0;
  } catch (error) {
      console.error(`Error getting bet for player ${playerId}:`, error);
      return 0;
  }
};


/**
 * Fold
 */
export const fold = async (gameId, roundNumber, playerId) => {
  await writeData(`games/${gameId}/rounds/${roundNumber}/bets/${playerId}`, {
    bet: 0,
    folded: true,
  });
};

/**
 * Update the pot
 */
export const updatePot = async (gameId, roundNumber, newPotValue) => {
  try {
    await writeData(`games/${gameId}/rounds/${roundNumber}/pot`, newPotValue);
    console.log(`Pot updated to ${newPotValue} for game ${gameId}, round ${roundNumber}`);
  } catch (error) {
    console.error(`Error updating pot for game ${gameId}, round ${roundNumber}:`, error);
  }
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

/**
 * Update the current turn index in the game data.
 */
export const updateCurrentTurnIndex = async (gameId, turnIndex) => {
  try {
    await updateData(`games/${gameId}`, { currentTurnIndex: turnIndex });
    console.log(`Turn index updated to ${turnIndex} in game ${gameId}`);
  } catch (error) {
    console.error(`Error updating turn index in game ${gameId}:`, error);
  }
};

/**
 * Update the players' chips in the game data.
 */
export const updatePlayerChips = async (gameId, playerId, newChipsAmount) => {
  try {
    const playersPath = `games/${gameId}/players`;
    // Read current players array
    const players = await readData(playersPath);
    if (!players) {
      console.warn("No players data found");
      return;
    }
    // Update chip count for the specified player
    const updatedPlayers = players.map(player => {
      if (player.uid === playerId) {
        return { ...player, chips: newChipsAmount };
      }
      return player;
    });
    // Write the updated players array back to the database
    await writeData(playersPath, updatedPlayers);
    console.log(`Player ${playerId} chips updated to ${newChipsAmount}`);
  } catch (error) {
    console.error("Error updating player chips:", error);
  }
};

/**
 * Update the highest bet in the database.
 */
export const updateHighestBet = async (gameId, roundNumber, newHighestBet) => {
  console.log(`Updating highestBet to ${newHighestBet} at path: games/${gameId}/highestBet`);
  await writeData(`games/${gameId}/rounds/${roundNumber}/highestBet`, newHighestBet);
};