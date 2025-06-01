<template>
  <div class="game-wrapper">    <!--Mini chart for stock data-->
    <MiniChart 
      v-if="gameStore.currentPhase >= 3 && gameStore.stockData"
      :stockData="gameStore.stockData"
      class="mini-chart"
    />
    <!--news pop Up about stocks in game-->
    <MiniNews
      v-if="gameStore.currentPhase >= 5 && gameStore.stockData"
      :stockData="gameStore.stockData"
      class="mini-news"
    />
    <!--technical indicators pop up about stocks in game-->
    <MiniIndicators
      v-if="gameStore.currentPhase >= 7 && gameStore.stockData"
      :stockData="gameStore.stockData"
      :roundNumber="gameStore.currentRound"
      class="mini-indicators"
    />
    <!--mini price display-->
    <MiniPrice
      v-if="gameStore.currentPhase >= 8 && gameStore.stockData"
      :stockData="gameStore.stockData"
      class="mini-price"
    />
    <div class="game-container">
      <div class="game-header">
        <div class="game-info">
          <div class="round-badge">Round: {{ gameStore.currentRound }}/3</div>
          <div class="phase-badge">Phase: {{ gameStore.currentPhase }}</div>
        </div>
      </div>

      <!-- Error message display -->
      <div v-if="gameStore.errorMessage" class="error-message">
        {{ gameStore.errorMessage }}
      </div>      
      <StockSelector
        :visible="gameStore.currentPhase === 1 && gameStore.currentRound <= gameStore.totalRounds"
        :gameId="route.params.id"
        :roundNumber="gameStore.currentRound"
        :isCreator="gameStore.isCreator"
        @stock-selected="handleStockSelection"
        @phase-complete="handleStockPhaseComplete"
      />

      <!-- Stock Prediction Popup -->
      <StockPrediction
        v-if="gameStore.stockData"
        :visible="gameStore.currentPhase === 2"
        :selectedStock="gameStore.selectedStock"
        :stockData="gameStore.stockData"
        @submit="handlePrediction"
        @close="closePopup"
      />      
      
      <!-- Poker Table with Playercards - Pass current round data instead of just bets -->
      <PokerTable 
        v-if="gameStore.players.length" 
        :players="gameStore.players" 
        :currentUserId="gameStore.currentUserId"
        :currentTurnIndex="gameStore.currentTurnIndex"
        :pot="gameStore.pot"
        :currentRound="gameStore.currentRound"
        :roundsData="gameStore.rounds"
      />

      <!-- Poker HUD with Bet, Check, Fold buttons -->
      <PokerHUD
        :coins="gameStore.currentUserChips"
        :isMyTurn="gameStore.isMyTurn"
        :isBettingDisabled="gameStore.bettingDisabled"
        @bet-placed="handleBet"
        @check="handleCheck"
        @fold="handleFold"
      />

      <!-- stock news pop up-->
      <StockNewsHint
        v-if="gameStore.stockData" 
        :visible="gameStore.currentPhase === 4"
        :stockData="gameStore.stockData"
        :roundNumber="gameStore.currentRound"
        @close="handleNewsClose"
      />

      <!-- Technical Indicators Popup (Phase 6) -->
      <TechnicalIndicatorsHint
        v-if="gameStore.stockData"
        :visible="gameStore.currentPhase === 6"
        :stockData="gameStore.stockData"
        :roundNumber="gameStore.currentRound"
        @close="handleIndicatorsClose"
      />

      <CurrentPriceHint
        v-if="gameStore.stockData"
        :visible="gameStore.currentPhase === 8"
        :stockData="gameStore.stockData"
        :roundNumber="gameStore.currentRound"
        @close="handleIndicatorsClose"
      />

      <!-- Round Winner Popup (Phase 10) -->
      <RoundWinner
        v-if="gameStore.roundWinner"
        :visible="gameStore.currentPhase === 10"
        :winner="gameStore.roundWinner"
        :roundNumber="gameStore.currentRound"
        :pot="gameStore.roundPot"
        :totalRounds="gameStore.totalRounds"
        @continue="handleWinnerContinue"
      />

      <!-- Game Winner (after final round) -->
      <GameWinner
        :visible="gameStore.showGameWinner || (gameStore.currentRound > gameStore.totalRounds && gameStore.players.length)"
        :players="gameStore.players"
        :gameId="route.params.id"
        :onGameEnd="handleGameEnd"
      />

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/services/game-store.js';

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
  },  setup() {
    const route = useRoute();
    const router = useRouter();
    const gameStore = useGameStore();

    // Local state for popup
    const showPopup = ref(false);
    const prediction = ref(null);    
    watch(() => gameStore.errorMessage, () => {
    });
    
    // Watch for phase changes
    watch(() => gameStore.currentPhase, async (newPhase) => {
      await gameStore.handlePhaseChange(newPhase);
    });
      // Watch for round changes
    watch(() => gameStore.currentRound, (newRound) => {
      gameStore.handleRoundChange(newRound);
    });

    watch(() => gameStore.gameEnded, (gameEnded) => {
      if (gameEnded) {
        console.log("Game ended detected, redirecting to lobby");
        router.push('/');
      }
    });

    onMounted(() => {
      const gameId = route.params.id;
      gameStore.initializeAuth(gameId);
    });

    onUnmounted(() => {
      gameStore.cleanup();
    });

    // Popup functions
    function openPopup() {
      showPopup.value = true;
    }
    
    function closePopup() {
      showPopup.value = false;
    }
    
    function handlePrediction(value) {
      if (!gameStore.currentUser) return;
      const playerId = gameStore.currentUser.uid;
      gameStore.setPlayerPrediction(playerId, value);
      closePopup();
    }

    // Betting functions
    function handleBet(amount) {
      if (!gameStore.currentUser) return;
      const playerId = gameStore.currentUser.uid;
      gameStore.placeBet(playerId, amount);
    }
    
    function handleCheck() {
      if (!gameStore.currentUser) return;
      const playerId = gameStore.currentUser.uid;
      gameStore.placeBet(playerId, 0);
    }
    
    function handleFold() {
      if (!gameStore.currentUser) return;
      const playerId = gameStore.currentUser.uid;
      gameStore.fold(playerId);
    }

    // Phase transition functions
    function handleNewsClose() {
      gameStore.nextPhase();
    }

    function handleIndicatorsClose() {
      gameStore.nextPhase();
    }
  
    async function handleStockSelection(stock) {
      if (!gameStore.isCreator) return;
      gameStore.setSelectedStock(stock);
    }

    async function handleStockPhaseComplete() {
      if (gameStore.currentPhase === 2 && !gameStore.allPlayersPredicted) {
        return;
      }
      await gameStore.nextPhase();
    }

    // Game end function
    async function handleGameEnd() {
      const gameId = route.params.id;
      await gameStore.handleGameEnd(gameId);
    }

    // Winner continue function
    function handleWinnerContinue() {
      gameStore.handleWinnerContinue();
    }

    return {
      gameStore,
      showPopup,
      openPopup,
      closePopup,
      handlePrediction,
      prediction,
      handleBet,
      handleCheck,
      handleFold,
      handleStockSelection,
      route, 
      handleStockPhaseComplete,
      handleNewsClose, 
      handleIndicatorsClose,
      handleWinnerContinue,
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
  z-index: 20; 
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


@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

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
