<template>
  <div class="lobby-wrapper">
    <div class="lobby-container">
      <h1 class="lobby-title">Lobby</h1>
      <div class="lobby-header">
        <div class="join-code">
          Join Code: {{ joinCode }}
        </div>
        <div v-if="isCreator" class="visibility-toggle">
          <span :class="{ 'active': !isPublic }">Privat</span>
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="isPublic"
              @change="updateGameVisibility"
            >
            <span class="slider"></span>
          </label>
          <span :class="{ 'active': isPublic }">Öffentlich</span>
        </div>
      </div>
      
      <PlayerList 
        :players="users"
        :creator="creator"
        :isCreator="isCreator"
        @remove-player="removePlayer"
      />
      
      <div class="action-buttons">
        <button v-if="isCreator" @click="deleteGame" class="action-button delete-button">
          <i class="fas fa-trash-alt"></i> Spiel löschen
        </button>
        <button v-if="isCreator" @click="startGame" class="action-button start-button">
          <i class="fas fa-play"></i> Spiel starten
        </button>
        <button 
          v-if="!isCreator" 
          @click="leaveGame" 
          class="action-button leave-button">
          <i class="fas fa-sign-out-alt"></i> Spiel verlassen
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onUnmounted, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { updateData, deleteData } from "@/services/database";
import { getRandomStock, getStockHistory } from '../api/stock-api';
import PlayerList from '../components/PlayerList.vue';
import { onValue, ref as dbRef } from "firebase/database";
import { db } from "../api/firebase-api";
import Swal from 'sweetalert2';
import { getStockInfo } from '@/api/description-api';
import { getStockNews } from '@/api/news-api';
import { auth } from '@/api/firebase-api';

// Composables
import { useCurrentUser } from './composables/useCurrentUser';
import { useErrorHandling } from './composables/useErrorHandling';

export default {
  name: 'LobbyView',
  components: {
    PlayerList
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // User management
    const { currentUser } = useCurrentUser(auth);
    
    // Error handling
    const { errorTimeout } = useErrorHandling({
      errorMessage: ref(null)
    });
    
    // Game state
    const users = ref([]);
    const creator = ref('');
    const joinCode = ref('');
    const isCreator = ref(false);
    const gameState = ref('');
    const isPublic = ref(false);
    const unsubscribe = ref(null);
    const isLoading = ref(false);
    
    /**
     * Update game visibility (public/private)
     */
    async function updateGameVisibility() {
      if (!isCreator.value) return;
      
      const gameId = route.params.id;
      try {
        isLoading.value = true;
        await updateData(`games/${gameId}`, { 
          isPublic: isPublic.value
        });
      } catch (e) {
        console.error("Error updating game visibility:", e);
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * Remove a player from the game
     */
    async function removePlayer(playerUid) {
      if (!isCreator.value) return;
      
      const gameId = route.params.id;
      try {
        const updatedPlayers = users.value.filter(user => user.uid !== playerUid);
        await updateData(`games/${gameId}`, { players: updatedPlayers });
      } catch (e) {
        console.error("Error removing player:", e);
      }
    }

    /**
     * Delete the game (creator only)
     */
    async function deleteGame() {
      const gameId = route.params.id;
      const user = currentUser.value;
      
      if (!user || user.uid !== creator.value) {
        console.error("Not authorized to delete this game");
        return;
      }

      try {
        await deleteData(`games/${gameId}`);
        router.push('/');
      } catch (e) {
        console.error("Error deleting game:", e);
      }
    }
    
    /**
     * Leave the game (non-creator)
     */
    async function leaveGame() {
      const gameId = route.params.id;
      const user = currentUser.value;
      
      if (!user) return;
      
      try {
        const updatedPlayers = users.value.filter(player => player.uid !== user.uid);
        await updateData(`games/${gameId}`, { players: updatedPlayers });
        router.push('/');
      } catch (e) {
        console.error("Error leaving game:", e);
      }
    }

    /**
     * Start the game (creator only)
     */
    async function startGame() {
      if (!isCreator.value) return;

      if (users.value.length < 2) {
        Swal.fire({ 
          icon: 'warning',
          title: 'Nicht genügend Spieler',
          text: 'Es müssen mindestens 2 Spieler im Spiel sein, um zu starten.',
          confirmButtonColor: '#dc2626',
          iconColor: '#dc2626',
          background: 'rgb(15, 15, 30)',
          customClass: {
            popup: 'custom-swal-popup'
          },
          color: '#fff',
          confirmButtonText: 'Okay',
        });
        return;
      }
      
      const gameId = route.params.id;
      try {
        isLoading.value = true;
        
        // Set this to false to disable API data validation
        const validateStockAPI = false;
        
        const numberOfRounds = 3;
        const roundsData = [];

        for (let round = 1; round <= numberOfRounds; round++) {
          const stocks = await getRandomStock(1);
          const stockDetails = await Promise.all(
            stocks.map(async (stock) => {
              console.log('Getting info for stock:', stock);
              // Get price data
              const { dates, prices } = await getStockHistory(stock.symbol);
              // Get company description
              const companyInfo = await getStockInfo(stock.symbol);
              console.log('Received company info for', stock.symbol, ':', companyInfo);

              // Get news for this stock
              const newsItems = await getStockNews(stock.symbol, 2); 
              console.log('Received news for', stock.symbol, ':', newsItems.length, 'items');

              if (validateStockAPI && (!dates || !prices || dates.length === 0 || prices.length === 0 || !companyInfo)) {
                console.error("API data missing for stock:", stock.symbol, { dates, prices, companyInfo });
                throw new Error("API data missing");
              }
              
              return {
                name: stock.name,
                symbol: stock.symbol,
                description: companyInfo?.description || '',
                sector: companyInfo?.sector || '',
                industry: companyInfo?.industry || '',
                website: companyInfo?.website || '',
                news: newsItems,
                history: dates.map((date, index) => ({
                  date,
                  price: prices[index]
                }))
              };
            })
          );
          roundsData.push({ round, stockDetails });
        }

        await updateData(`games/${gameId}`, { state: 'started' });
        for (const { round, stockDetails } of roundsData) {
          await updateData(`games/${gameId}/rounds/${round}`, { stocks: stockDetails });
        }

      } catch (e) {
        console.error("Error starting game:", e);
        Swal.fire({
          icon: 'error',
          title: 'API Fehler',
          text: 'Derzeit gibt es Probleme mit den Stock APIs. Bitte versuchen Sie es später.',
          confirmButtonColor: '#dc2626',
          background: 'rgb(15, 15, 30)',
          customClass: {
            popup: 'custom-swal-popup'
          },
          color: '#fff',
          confirmButtonText: 'Okay',
        });
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * Set up real-time listener for game data
     */
    function setupGameListener() {
      const gameId = route.params.id;
      const user = currentUser.value;

      if (!user) {
        router.push('/login');
        return;
      }

      unsubscribe.value = onValue(dbRef(db, `games/${gameId}`), (snapshot) => {
        const gameData = snapshot.val();
        
        if (!gameData) {
          router.push('/');
          return;
        }

        // Check if user is a player in this game
        const isPlayer = gameData.players?.some(player => player.uid === user.uid);
        if (!isPlayer) {
          router.push('/');
          return;
        }

        users.value = gameData.players || [];
        creator.value = gameData.creator;
        joinCode.value = gameData.code;
        isPublic.value = gameData.isPublic;
        gameState.value = gameData.state;
        checkIfCreator();

        if (gameData.state === 'started') {
          router.push(`/game/${gameId}`);
        }
      });
    }

    /**
     * Check if current user is the creator
     */
    function checkIfCreator() {
      const user = currentUser.value;
      isCreator.value = user && user.uid === creator.value;
    }

    // Watch for user authentication state changes
    watchEffect(() => {
      if (currentUser.value) {
        setupGameListener();
      } else {
        router.push('/login');
      }
    });

    // Cleanup on component unmount
    onUnmounted(() => {
      if (unsubscribe.value) {
        unsubscribe.value();
      }
      
      if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
      }
    });

    return {
      users,
      creator,
      joinCode,
      isCreator,
      gameState,
      isPublic,
      isLoading,
      updateGameVisibility,
      removePlayer,
      deleteGame,
      leaveGame,
      startGame
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
@import '@/assets/styles/lobbyview.css';
</style>