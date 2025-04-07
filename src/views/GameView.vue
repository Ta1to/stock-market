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
        <h1 class="game-title">Stock Poker</h1>
        <div class="game-info">
          <div class="round-badge">Round: {{ gameStore.currentRound }}/3</div>
          <div class="phase-badge">Phase: {{ gameStore.currentPhase }}</div>
        </div>
      </div>
      
      <!-- Visual indicator for current turn -->
      <div v-if="gameStore.players.length" class="turn-indicator">
        <div class="turn-label">Current Turn</div>
        <div class="player-turn">{{ currentTurnPlayer.name || currentTurnPlayer.id }}</div>
      </div>

      <!-- Error message display -->
      <div v-if="gameStore.errorMessage" class="error-message">
        {{ gameStore.errorMessage }}
      </div>

      <!-- StockSelector as Modal -->
      <StockSelector
        :visible="gameStore.currentPhase === 1"
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
      />

      <!-- Poker Table with Playercards - Pass current round data instead of just bets -->
      <PokerTable 
        v-if="gameStore.players.length" 
        :players="gameStore.players" 
        :currentUserId="currentUserId"
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

      <!-- Current Price Hint (Phase 8) -->
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

    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { auth } from '@/api/firebase-api';
import { onAuthStateChanged } from 'firebase/auth';
import { useGameStore } from '@/services/game-store.js';
import { PopupState } from '@/utils/popupEventBus';

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

// Composables
import { useCurrentUser } from './composables/useCurrentUser';
import { useStockData } from './composables/useStockData';
import { usePlayerState } from './composables/usePlayerState';
import { useGamePhases } from './composables/useGamePhases';
import { useErrorHandling } from './composables/useErrorHandling';
import { useWinnerDetermination } from './composables/useWinnerDetermination';

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
    RoundWinner
  },
  setup() {
    const route = useRoute();
    const gameStore = useGameStore();

    // User management
    const { currentUser, currentUserId, unsubscribeAuth } = useCurrentUser(auth);

    // Stock data 
    const { stockData } = useStockData(gameStore);

    // Player state
    const { 
      isCreator,
      isMyTurn, 
      currentUserChips,
      currentTurnPlayer,
      bettingDisabled
    } = usePlayerState(currentUser, gameStore);

    // Error handling
    const { errorTimeout } = useErrorHandling(gameStore);

    // Round winner determination
    const { 
      roundWinner, 
      roundPot, 
      handleWinnerDetermination 
    } = useWinnerDetermination(gameStore, stockData);

    // Game phases management
    const { 
      showPopup, 
      closePopup, 
      openPopup 
    } = useGamePhases();

    // Watch for phase changes to determine winner in phase 10
    watch(() => gameStore.currentPhase, async (newPhase, oldPhase) => {
      console.log(`Phase changed from ${oldPhase} to ${newPhase}`);
      
      // Close all popups when phase changes
      PopupState.activePopup = null;

      // If phase changes to 10, determine the round winner
      if (newPhase === 10) {
        handleWinnerDetermination();
      }
    });

    onMounted(() => {
      unsubscribeAuth.value = onAuthStateChanged(auth, (user) => {
        currentUser.value = user;
        console.log("Auth state changed:", user);
        if (user) {
          const gameId = route.params.id;
          gameStore.subscribeToGame(gameId);
          // Delay logging players to ensure subscription has updated them:
          setTimeout(() => {
            console.log("Players array after subscription:", gameStore.players);
            console.log("Current turn index:", gameStore.currentTurnIndex);
          }, 1000);
        }
      });
    });

    onUnmounted(() => {
      // Clear any active timeout when unmounting
      if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
      }
      
      // Unsubscribe from auth state changes
      if (unsubscribeAuth.value) {
        unsubscribeAuth.value();
      }
      
      gameStore.unsubscribeFromGame();
    });

    // User action handlers
    function handlePrediction(value) {
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.setPlayerPrediction(playerId, value);
      closePopup();
    }

    /* Betting logic */
    function handleBet(amount) {
      console.log('Bet placed:', amount);
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.placeBet(playerId, amount);
    }

    function handleCheck() {
      console.log('Check action triggered');
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.placeBet(playerId, 0);
    }

    function handleFold() {
      console.log('Fold action triggered');
      if (!currentUser.value) return;
      const playerId = currentUser.value.uid;
      gameStore.fold(playerId);
    }

    //close news popup and move to next phase
    function handleNewsClose() {
      console.log('News popup closed, moving to next phase');
      gameStore.nextPhase();
    }

    // Close technical indicators popup and move to next phase
    function handleIndicatorsClose() {
      console.log('Technical indicators popup closed, moving to next phase');
      gameStore.nextPhase();
    }
  
    async function handleStockSelection(stock) {
      if (!isCreator.value) return;
      gameStore.setSelectedStock(stock);
    }

    async function handleStockPhaseComplete() {
      console.log('Phase complete, moving to next phase');
      if (gameStore.currentPhase === 2 && !gameStore.allPlayersPredicted) {
        console.warn("Not all players have predicted yet.");
        return;
      }
      await gameStore.nextPhase();
    }

    // Handler for when user clicks continue on the winner popup
    function handleWinnerContinue() {
      gameStore.nextPhase();
    }

    return {
      gameStore,
      showPopup,
      openPopup,
      closePopup,
      handlePrediction,
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
      handleWinnerContinue
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
  animation: fadeInError 0.3s ease-in-out, fadeOutError 0.5s ease-in-out 4.5s forwards;
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

@keyframes fadeOutError {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

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
