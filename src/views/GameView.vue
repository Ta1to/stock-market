<template>
  <div class="game-wrapper">
    <!--Mini chart for stock data-->
    <MiniChart 
      v-if="gameStore.currentPhase >= 3 && stockData"
      :stockData="stockData"
      class="mini-chart"
    />
    <!--news pop Up about stocks in game-->
    <MiniNews
      v-if="gameStore.currentPhase >= 5 && stockData"
      :stockData="stockData"
      class="mini-news"
    />
    <!--technical indicators pop up about stocks in game-->
    <MiniIndicators
      v-if="gameStore.currentPhase >= 7 && stockData"
      :stockData="stockData"
      :roundNumber="gameStore.currentRound"
      class="mini-indicators"
    />
    <!--mini price display-->
    <MiniPrice
      v-if="gameStore.currentPhase >= 8 && stockData"
      :stockData="stockData"
      class="mini-price"
    />
    <div class="game-container">
      <div class="game-header">
        <div class="game-info">
          <div class="round-badge">Round: {{ gameStore.currentRound }}/3</div>
          <div class="phase-badge">Phase: {{ gameStore.currentPhase }}</div>
        </div>
      </div>
      
      <!-- Visual indicator for current turn -->
      <!-- <div v-if="gameStore.players.length" class="turn-indicator">
        <div class="turn-label">Current Turn</div>
        <div class="player-turn">{{ currentTurnPlayer.name || currentTurnPlayer.id }}</div>
      </div> -->

      <!-- Error message display -->
      <div v-if="gameStore.errorMessage" class="error-message">
        {{ gameStore.errorMessage }}
      </div>

      <!-- StockSelector as Modal -->
      <StockSelector
        :visible="gameStore.currentPhase === 1 && gameStore.currentRound <= gameStore.totalRounds"
        :gameId="route.params.id"
        :roundNumber="gameStore.currentRound"
        :isCreator="isCreator"
        @stock-selected="handleStockSelection"
        @phase-complete="handleStockPhaseComplete"
      />

      <!-- Stock Prediction Popup -->
      <StockPrediction
        v-if="stockData"
        :visible="gameStore.currentPhase === 2"
        :selectedStock="gameStore.selectedStock"
        :stockData="stockData"
        @submit="handlePrediction"
        @close="closePopup"
      />      <!-- Poker Table with Playercards - Pass current round data instead of just bets -->
      <PokerTable 
        v-if="gameStore.players.length" 
        :players="gameStore.players" 
        :currentUserId="currentUserId"
        :currentTurnIndex="gameStore.currentTurnIndex"
        :pot="gameStore.pot"
        :currentRound="gameStore.currentRound"
        :roundsData="gameStore.rounds"
      />

      <!-- Poker HUD with Bet, Check, Fold buttons -->
      <PokerHUD
        :coins="currentUserChips"
        :isMyTurn="isMyTurn"
        :isBettingDisabled="bettingDisabled"
        @bet-placed="handleBet"
        @check="handleCheck"
        @fold="handleFold"
      />

      <!-- stock news pop up-->
      <StockNewsHint
        v-if="stockData" 
        :visible="gameStore.currentPhase === 4"
        :stockData="stockData"
        :roundNumber="gameStore.currentRound"
        @close="handleNewsClose"
      />

      <!-- Technical Indicators Popup (Phase 6) -->
      <TechnicalIndicatorsHint
        v-if="stockData"
        :visible="gameStore.currentPhase === 6"
        :stockData="stockData"
        :roundNumber="gameStore.currentRound"
        @close="handleIndicatorsClose"
      />

      <CurrentPriceHint
        v-if="stockData"
        :visible="gameStore.currentPhase === 8"
        :stockData="stockData"
        :roundNumber="gameStore.currentRound"
        @close="handleIndicatorsClose"
      />

      <!-- Round Winner Popup (Phase 10) -->
      <RoundWinner
        v-if="roundWinner"
        :visible="gameStore.currentPhase === 10"
        :winner="roundWinner"
        :roundNumber="gameStore.currentRound"
        :pot="roundPot"
        :totalRounds="gameStore.totalRounds"
        @continue="handleWinnerContinue"
      />

      <!-- Game Winner (after final round) -->
      <GameWinner
        :visible="showGameWinner || (gameStore.currentRound > gameStore.totalRounds && gameStore.players.length)"
        :players="gameStore.players"
        :gameId="route.params.id"
        :onGameEnd="handleGameEnd"
      />

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '@/api/firebase-api';
import { onAuthStateChanged } from 'firebase/auth';
import { useGameStore } from '@/services/game-store.js';
import { PopupState } from '@/utils/popupEventBus';
import { doc, deleteDoc } from 'firebase/firestore';

/* Components */
import PokerTable from '@/components/game/PokerTable.vue';
import PokerHUD from '@/components/game/PokerHUD.vue';
import StockPrediction from '@/components/game/StockPrediction.vue';
import StockSelector from '@/components/StockSelector.vue';  
import MiniChart from '@/components/game/hint/mini/MiniChart.vue';
import StockNewsHint from '@/components/game/hint/StockNewsHint.vue';
import MiniNews from '@/components/game/hint/mini/MiniNews.vue';
import TechnicalIndicatorsHint from '@/components/game/hint/TechnicalIndicatorsHint.vue';
import MiniIndicators from '@/components/game/hint/mini/MiniIndicator.vue'; 
import CurrentPriceHint from '@/components/game/hint/CurrentPriceHint.vue';
import MiniPrice from '@/components/game/hint/mini/MiniPrice.vue';
import RoundWinner from '@/components/game/RoundWinner.vue';
import GameWinner from '@/components/game/GameWinner.vue';

export default {
  name: 'GameView',
  components: {
    PokerTable,
    PokerHUD,
    StockPrediction, 
    StockSelector,
    MiniChart, 
    StockNewsHint,
    MiniNews, 
    TechnicalIndicatorsHint, 
    MiniIndicators,
    CurrentPriceHint,
    MiniPrice,
    RoundWinner,
    GameWinner
  },
  setup() {
    const route = useRoute();
    // eslint-disable-next-line no-unused-vars
    const router = useRouter();
    const gameStore = useGameStore();
    let errorTimeout = null;
    let unsubscribeAuth = null; // Define here so it's accessible in onUnmounted

    // Reactive ref for the current logged-in user
    const currentUser = ref(null);

    // Local state for popup
    const showPopup = ref(false);
    const prediction = ref(null);

    const roundWinner = ref(null);
    const roundPot = ref(0);
    
    // Game winner state
    const showGameWinner = ref(false);

    // Top-level computed for current user chips
    const currentUserChips = computed(() => {
      if (!currentUser.value || !gameStore.players.length) return 0;
      const player = gameStore.players.find(p => p.uid === currentUser.value.uid);
      return player.chips;
    });

    const stockData = computed(() => {
      const currentRound = gameStore.currentRound;
      const roundData = gameStore.rounds?.[currentRound];
            
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
    });
    
    const isCreator = computed(() => currentUser.value?.uid === gameStore.creator);

    // Computed property to determine if it's the current user's turn
    const isMyTurn = computed(() => {
      if (!currentUser.value || !gameStore.players.length) {
        return false;
      }
      const currentPlayer = gameStore.players[gameStore.currentTurnIndex];
      // Adjust property names (uid or id) as needed:
      return currentUser.value.uid === currentPlayer.uid;
    });

    const currentUserId = computed(() => {
      return currentUser.value ? currentUser.value.uid : '';
    });

    // Computed property for the current turn player's data&& gameStore.currentPhase !== 9;
    const currentTurnPlayer = computed(() => {
      if (!gameStore.players.length) return {};
      return gameStore.players[gameStore.currentTurnIndex];
    });

    // Updated computed prop to disable betting in non-betting phases
    const bettingDisabled = computed(() => {
      return gameStore.currentPhase !== 3 && gameStore.currentPhase !== 5 && gameStore.currentPhase !== 7 && gameStore.currentPhase !== 9;
    });

    // Watch for error message changes and auto-dismiss after timeout
    watch(() => gameStore.errorMessage, (newMessage) => {
      // Clear any existing timeout
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
      }
      
      // If there's a new error message, set a timeout to clear it
      if (newMessage) {
        errorTimeout = setTimeout(() => {
          gameStore.errorMessage = null;
        }, 5000); // 5 seconds
      }
    });    watch(() => gameStore.currentPhase, async (newPhase) => {
      // close all popups when phase changes
      PopupState.activePopup = null;

      // If phase changes to 10, determine the round winner
      if (newPhase === 10) {
        // Determine winner based on the active players
        const activePlayers = gameStore.players.filter((p) => !gameStore.folds[p.uid]);
        
        // Save the current pot amount before any changes - verwende den aktuellen Pot
        // Dieser wurde während der Phasen akkumuliert und nicht zurückgesetzt
        roundPot.value = gameStore.pot;
        console.log('Final pot amount for round winner:', gameStore.pot);
        
        if (activePlayers.length === 1) {
          // Only one player left (others folded)
          roundWinner.value = activePlayers[0];
          // Add pot to winner's chips
          gameStore.addChipsToPlayer(roundWinner.value.uid, gameStore.pot);
        } else {
          // Multiple players remain - determine winner by prediction accuracy
          const currentPrice = stockData.value?.prices[stockData.value.prices.length - 1] || 0;
          
          let closestPlayers = [];
          let smallestDifference = Infinity;
          
          // Find player(s) with closest prediction
          activePlayers.forEach(player => {
            const prediction = gameStore.predictions[player.uid];
            if (prediction !== undefined) {
              const difference = Math.abs(prediction - currentPrice);
              
              // If this player has a better prediction than current best
              if (difference < smallestDifference) {
                smallestDifference = difference;
                closestPlayers = [player]; // Reset the array with only this player
              } 
              // If this player has the same prediction accuracy as current best
              else if (difference === smallestDifference) {
                closestPlayers.push(player); // Add this player to the winners
              }
            }
          });
          
          // If multiple players have the same prediction accuracy (tie)
          if (closestPlayers.length > 1) {
            // Create a combined winner object indicating a tie and listing winners
            roundWinner.value = {
              isTie: true,
              players: closestPlayers,
              name: closestPlayers.map(p => p.name).join(', '),
              // Include a message about the pot being split
              message: `Tie! The pot will be split among ${closestPlayers.length} players.`
            };
            
            // Split the pot equally among tied players
            const splitAmount = Math.floor(gameStore.pot / closestPlayers.length);
            
            // Distribute chips to each winner
            closestPlayers.forEach(player => {
              gameStore.addChipsToPlayer(player.uid, splitAmount);
            });
          } else if (closestPlayers.length === 1) {
            // Single winner
            roundWinner.value = closestPlayers[0];
            // Add pot to winner's chips
            gameStore.addChipsToPlayer(roundWinner.value.uid, gameStore.pot);
          } else {
            console.warn("No winner could be determined - no valid predictions found");
          }
        }
        
        // Reset the pot for the next round after all chips have been distributed
        gameStore.resetPot();
      }
    });
    
    // Watch for final round completion
    watch(() => gameStore.currentRound, (newRound) => {
      if (newRound > gameStore.totalRounds) {
        showGameWinner.value = true;
      }
    });

    onMounted(() => {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        currentUser.value = user;
        if (user) {
          const gameId = route.params.id;
          gameStore.subscribeToGame(gameId);
          setTimeout(() => 1000);
        }
      });
    });

    onUnmounted(() => {
      // Clear any active timeout when unmounting
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
      
      // Unsubscribe from auth state changes
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
      
      gameStore.unsubscribeFromGame();
    });

    function openPopup() {
      showPopup.value = true;
    }
    function closePopup() {
      showPopup.value = false;
    }
    function handlePrediction(value) {
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.setPlayerPrediction(playerId, value);
      closePopup();
    }

    /* Betting logic */
    function handleBet(amount) {
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.placeBet(playerId, amount);
    }
    function handleCheck() {
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.placeBet(playerId, 0);
    }
    function handleFold() {
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.fold(playerId);
    }

    //close news popup and move to next phase
    function handleNewsClose() {
      gameStore.nextPhase();
    }

    // Close technical indicators popup and move to next phase
    function handleIndicatorsClose() {
      gameStore.nextPhase();
    }
  
    async function handleStockSelection(stock) {
      if (!isCreator.value) return;
      gameStore.setSelectedStock(stock);
    }

    async function handleStockPhaseComplete() {
      if (gameStore.currentPhase === 2 && !gameStore.allPlayersPredicted) {
        return;
      }
      await gameStore.nextPhase();
    }

    // Handler for when the entire game ends
    async function handleGameEnd() {
      try {
        // Delete the game from Firestore
        const gameId = route.params.id;
        await deleteDoc(doc(db, "games", gameId));
        
        // Reset game store
        gameStore.resetGame();
        
        // Navigation will be handled by the GameWinner component
      } catch (error) {
        console.error("Error deleting game:", error);
      }
    }

    // Handler for when user clicks continue on the winner popup
    function handleWinnerContinue() {
      // If this was the final round, show the game winner
      if (gameStore.currentRound >= gameStore.totalRounds) {
        showGameWinner.value = true;
        // Prevent moving to the next phase/round which would trigger StockSelector
        return; 
      } else {
        // Otherwise, move to the next round
        gameStore.nextPhase();
      }
    }

    return {
      currentUser,
      gameStore,
      showPopup,
      openPopup,
      closePopup,
      handlePrediction,
      prediction,
      handleBet,
      handleCheck,
      handleFold,
      isCreator,
      handleStockSelection,
      route, 
      handleStockPhaseComplete,
      isMyTurn,
      currentTurnPlayer,
      currentUserId, 
      stockData,
      currentUserChips,
      bettingDisabled, 
      handleNewsClose, 
      handleIndicatorsClose,
      roundWinner,
      roundPot,
      handleWinnerContinue,
      showGameWinner,
      handleGameEnd
    };
  },
};
</script>

<style>
:root {
  --accent-gold: #ffd700;
  --accent-gold-transparent: rgba(255, 215, 0, 0.3);
  --bg-dark-primary: #0f0f1a;
  --bg-dark-secondary: #16213e;
  --text-light: #e0e0e0;
  --felt-green: #056947;
  --felt-green-dark: #02331e;
}

.game-wrapper {
  min-height: 100vh;
  width: 100%;
  position: relative;
  background: linear-gradient(145deg, var(--bg-dark-primary), #000000);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.game-container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  margin: 0 auto;
  padding: clamp(1rem, 2vw, 2rem);
  background: rgba(15, 15, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: var(--text-light);
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.game-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  color: var(--accent-gold);
  text-shadow: 
    0 4px 15px var(--accent-gold-transparent),
    2px 2px 0 rgba(0,0,0,0.2);
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.game-info {
  display: inline-flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: nowrap;
  margin: 0 auto;
  width: auto;
  min-width: fit-content;
}

.round-badge, .phase-badge {
  background: linear-gradient(145deg, var(--bg-dark-secondary), var(--bg-dark-primary));
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: bold;
  color: var(--accent-gold);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--accent-gold-transparent);
  white-space: nowrap;
  display: inline-block;
}

.turn-indicator {
  background: linear-gradient(145deg, var(--bg-dark-secondary), var(--bg-dark-primary));
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--accent-gold-transparent);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
}

.turn-label {
  font-size: 0.9rem;
  color: var(--accent-gold);
  opacity: 0.8;
  margin-bottom: 0.3rem;
}

.player-turn {
  font-size: 1.2rem;
  font-weight: bold;
}

.mini-chart {
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  overflow: hidden;
}

.mini-news {
  z-index: 99; 
}

.mini-indicators {
  z-index: 100;
}

.mini-price {
  z-index: 95;
}

.leave-button {
  margin-top: auto;
}

/* Make PokerTable larger */
:deep(.poker-table) {
  width: 100% !important;
  height: 70vh !important;
  transform: translate(-50%, -50%) scale(1.2) !important;
  z-index: 5;
}

:deep(.pot-display) {
  font-size: 32px !important;
}

:deep(.player-card) {
  transform: scale(1.2);
}

/* Styling for error message */
.error-message {
  color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.5);
  padding: 0.8rem;
  margin: 1rem 0;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 20; /* Higher than poker table to ensure visibility */
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInError 0.3s ease-in-out;
}

@keyframes fadeInError {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Removed fadeOutError animation to ensure error messages stay visible */

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Responsive styles */
@media (max-width: 768px) {
  .game-container {
    padding: 1rem;
    width: 98%;
    height: 95vh;
  }
  
  .game-info {
    flex-direction: row;
    gap: 0.5rem;
    justify-content: center;
    display: inline-flex;
  }
  
  .round-badge, .phase-badge {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    min-width: unset;
  }
  
  .turn-indicator {
    padding: 0.6rem;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 10;
  }
  
  :deep(.poker-table) {
    transform: translate(-50%, -50%) scale(1) !important;
    height: 65vh !important;
    z-index: 5;
  }
}

/* Fix for very small screens */
@media (max-width: 480px) {
  .game-title {
    margin-bottom: 0.3rem;
  }
  
  .game-info {
    gap: 0.3rem;
  }
  
  .round-badge, .phase-badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>
