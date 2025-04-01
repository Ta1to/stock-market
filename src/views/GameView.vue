<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock p-4">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-4xl text-center">
      <h1 class="text-2xl mb-2">Stock Poker</h1>
      <h1>Round: {{ gameStore.currentRound }} / Phase: {{ gameStore.currentPhase }}</h1>
      
      <!-- Visual indicator for current turn -->
      <p v-if="gameStore.players.length">
        Current Turn: 
        {{ currentTurnPlayer.name || currentTurnPlayer.id }}
      </p>

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

      <!-- Poker Table with Playercards -->
      <PokerTable 
        v-if="gameStore.players.length" 
        :players="gameStore.players" 
        :currentUserId="currentUserId"
      />

      <!-- Poker HUD with Bet, Check, Fold buttons -->
      <PokerHUD
        :initialCoins="1000"
        :isMyTurn="isMyTurn"
        @bet-placed="handleBet"
        @check="handleCheck"
        @fold="handleFold"
      />
      <LeaveGameButton />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { auth } from '@/api/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useGameStore } from '@/services/game-store.js';

/* Components */
import LeaveGameButton from '@/components/buttons/LeaveGameButton.vue';
import PokerTable from '@/components/game/PokerTable.vue';
import PokerHUD from '@/components/game/PokerHUD.vue';
import StockPrediction from '@/components/game/StockPrediction.vue';
import StockSelector from '@/components/StockSelector.vue';  

export default {
  name: 'GameView',
  components: {
    LeaveGameButton,
    PokerTable,
    PokerHUD,
    StockPrediction, 
    StockSelector
  },
  setup() {
    const route = useRoute();
    const gameStore = useGameStore();

    // Reactive ref for the current logged-in user
    const currentUser = ref(null);

    // Local state for popup
    const showPopup = ref(false);
    const prediction = ref(null);

    const stockData = computed(() => {
      const currentRound = gameStore.currentRound;
      const roundData = gameStore.rounds?.[currentRound];
      
      console.log("Current round data:", roundData);
      
      if (!roundData?.stocks?.[0]) {
        console.warn("No stocks data available for current round");
        return null;
      }

      // Erste Aktie aus dem stocks Array nehmen
      const stockDetails = roundData.stocks[0];
      console.log("Stock details:", stockDetails);

      if (stockDetails?.history && Array.isArray(stockDetails.history)) {
        return {
          dates: stockDetails.history.map(entry => entry.date),
          prices: stockDetails.history.map(entry => entry.price)
        };
      }

      console.warn("Stock history not available or not in correct format");
      return null;
    });
    
    const isCreator = computed(() => currentUser.value?.uid === gameStore.creator);

    // Computed property to determine if it's the current user's turn
    const isMyTurn = computed(() => {
      if (!currentUser.value || !gameStore.players.length) {
        console.log("isMyTurn: missing user or players", { currentUser: currentUser.value, players: gameStore.players });
        return false;
      }
      const currentPlayer = gameStore.players[gameStore.currentTurnIndex];
      console.log("isMyTurn:", {
        currentUserUid: currentUser.value.uid,
        currentPlayer: currentPlayer
      });
      // Adjust property names (uid or id) as needed:
      return currentUser.value.uid === currentPlayer.uid;
    });

    const currentUserId = computed(() => {
      return currentUser.value ? currentUser.value.uid : '';
    });


    // Computed property for the current turn player's data
    const currentTurnPlayer = computed(() => {
      if (!gameStore.players.length) return {};
      return gameStore.players[gameStore.currentTurnIndex];
    });

    onMounted(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
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

      onUnmounted(() => {
        unsubscribeAuth();
        gameStore.unsubscribeFromGame();
      });
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
  
    async function handleStockSelection(){
      try {
        if (!isCreator.value) return;
        await gameStore.startStockSelection(route.params.id);
      } catch (error) {
        console.error('Error in handleStockSelection:', error);
      }
    }

    async function handleStockPhaseComplete() {
      console.log('Phase complete, moving to next phase');
      if (gameStore.currentPhase === 2 && !gameStore.allPlayersPredicted) {
        console.warn("Not all players have predicted yet.");
        return;
      }
      await gameStore.nextPhase();
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
      stockData
    };
  },
};
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
