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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { updateData, deleteData } from "@/services/database";
import { getRandomStock, getStockData } from '../api/stock';
import PlayerList from '../components/PlayerList.vue';
import { ref, onValue} from "firebase/database";
import { db } from "../api/firebase";
import Swal from 'sweetalert2';

export default {
  name: 'LobbyView',
  components: {
    PlayerList
  },
  data() {
    return {
      users: [],
      creator: '',
      joinCode: '',
      isCreator: false,
      gameState: '',
      isPublic: false,
      unsubscribe: null,
      isLoading: false
    };
  },
  methods: {
    async updateGameVisibility() {
      if (!this.isCreator) return;
      
      const gameId = this.$route.params.id;
      try {
        this.isLoading = true;
        await updateData(`games/${gameId}`, { 
          isPublic: this.isPublic
        });
      } catch (e) {
        console.error("Error updating game visibility:", e);
      } finally {
        this.isLoading = false;
      }
    },

    async removePlayer(playerUid) {
      if (!this.isCreator) return;
      
      const gameId = this.$route.params.id;
      try {
        const updatedPlayers = this.users.filter(user => user.uid !== playerUid);
        await updateData(`games/${gameId}`, { players: updatedPlayers });
      } catch (e) {
        console.error("Error removing player:", e);
      }
    },

    async deleteGame() {
      const gameId = this.$route.params.id;
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || user.uid !== this.creator) {
        console.error("Not authorized to delete this game");
        return;
      }

      try {
        await deleteData(`games/${gameId}`);
        this.$router.push('/');
      } catch (e) {
        console.error("Error deleting game:", e);
      }
    },
    async leaveGame() {
    const gameId = this.$route.params.id;
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return;
    
    try {
      const updatedPlayers = this.users.filter(player => player.uid !== user.uid);
      await updateData(`games/${gameId}`, { players: updatedPlayers });
      this.$router.push('/');
    } catch (e) {
      console.error("Error leaving game:", e);
    }
    },

    async startGame() {
      if (!this.isCreator) return;

      if(this.users.length < 2) {
        Swal.fire({ 
          icon: 'warning',
          title: 'Nicht genügend Spieler',
          text: 'Es müssen mindestens 2 Spieler im Spiel sein, um zu starten.',
          confirmButtonColor: '#dc2626',
          iconColor:'#dc2626',
          background: 'rgb(15, 15, 30)',
          customClass: {
            popup: 'custom-swal-popup'
          },
          color: '#fff',
          confirmButtonText: 'Okay',
        });
        return;
      }
      
      const gameId = this.$route.params.id;
      try {
        this.isLoading = true;

        // Amount of rounds
        const numberOfRounds = 3;

        // Update game state
        await updateData(`games/${gameId}`, { state: 'started' });

        // Fetch for each round a random stock
        for (let round = 1; round <= numberOfRounds; round++) {
          const stocks = await getRandomStock(1);
          const stockDetails = await Promise.all(
            stocks.map(async (stock) => {
              const { dates, prices } = await getStockData(stock.symbol);
              return {
                name: stock.name,
                symbol: stock.symbol,
                history: dates.map((date, index) => ({
                  date,
                  price: prices[index]
                }))
              };
            })
          );

          // Save a stock for each round in each round
          await updateData(`games/${gameId}/rounds/${round}`, { stocks: stockDetails });
        }

      } catch (e) {
        console.error("Error starting game:", e);
      } finally {
        this.isLoading = false;
      }
    },

    setupGameListener() {
      const gameId = this.$route.params.id;
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        this.$router.push('/login');
        return;
      }

      this.unsubscribe = onValue(ref(db, `games/${gameId}`), (snapshot) => {
        const gameData = snapshot.val();
        
        if (!gameData) {
          this.$router.push('/');
          return;
        }

        // Check if user is a player in this game
        const isPlayer = gameData.players?.some(player => player.uid === user.uid);
        if (!isPlayer) {
          this.$router.push('/');
          return;
        }

        this.users = gameData.players || [];
        this.creator = gameData.creator;
        this.joinCode = gameData.code;
        this.isPublic = gameData.isPublic;
        this.gameState = gameData.state;
        this.checkIfCreator();

        if (gameData.state === 'started') {
          this.$router.push(`/game/${gameId}`);
        }
      });
    },

    checkIfCreator() {
      const auth = getAuth();
      const user = auth.currentUser;
      this.isCreator = user && user.uid === this.creator;
    }
  },

  created() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.$router.push('/login');
      } else {
        this.setupGameListener();
      }
    });
  },

  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
@import '@/assets/styles/lobbyview.css';
</style>