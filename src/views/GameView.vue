<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock p-4">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-4xl text-center">
      <h1 class="text-2xl mb-2">Stock Poker</h1>
      <h1>Round: {{ gameStore.currentRound }} / Phase: {{ gameStore.currentPhase }}</h1>

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
        :visible="gameStore.currentPhase === 2"
        @submit="handlePrediction"
        @close="closePopup"
      />

      <!-- Poker Table with Playercards -->
      <!-- Use gameStore.players here -->
      <PokerTable 
        v-if="gameStore.players.length" 
        :players="gameStore.players" 
      />

      <!-- Poker HUD with Bet, Check, Fold buttons -->
      <PokerHUD
        :initialCoins="1000"
        @bet-placed="handleBet"
        @check="handleCheck"
        @fold="handleFold"
      />

      <button @click="openPopup">Make a Prediction</button>
      <LeaveGameButton />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed} from 'vue';
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

    // Local states for popup
    const showPopup = ref(false);
    const prediction = ref(null);
    
    const isCreator = computed(() => {
      return currentUser.value?.uid === gameStore.creator;
    });

    onMounted(() => {
      // Listen for Firebase Auth changes
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        currentUser.value = user;
        if (user) {
          // Subscribe to the game once user is logged in
          const gameId = route.params.id;
          gameStore.subscribeToGame(gameId);
        } else {
          // Not logged in -> handle as needed (redirect, show message, etc.)
        }
      });

      // Cleanup on unmount
      onUnmounted(() => {
        unsubscribeAuth();
        gameStore.unsubscribeFromGame();
      });
    });

    /* StockPrediction popup logic */
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
      gameStore.nextPhase();
    }

    // Return everything you need in the template
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
      handleStockPhaseComplete
    };
  },
};
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
