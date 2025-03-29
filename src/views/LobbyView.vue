<template>
  <div class="lobby-wrapper">
    <div class="lobby-container">
      <h1 class="lobby-title">Lobby</h1>
      <div class="join-code">
        Join Code: {{ joinCode }}
      </div>
      <div class="players-list">
        <div v-for="user in users" :key="user.uid" class="player-card">
          <span class="player-name">{{ user.name }}</span>
          <i v-if="user.uid === creator" class="fas fa-crown crown-icon"></i>
        </div>
      </div>
      <button v-if="isCreator" @click="deleteGame" class="action-button delete-button">
        <i class="fas fa-trash-alt"></i> Delete Game
      </button>
      <button v-if="isCreator" @click="startGame" class="action-button start-button">
        <i class="fas fa-play"></i> Start Game
      </button>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { readData, updateData, deleteData } from "@/services/database";
import {  getRandomStock, getStockData } from '../api/stock';

export default {
  name: 'LobbyView',
  data() {
    return {
      users: [],
      creator: '',
      joinCode: '',
      isCreator: false,
      gameState: ''
    };
  },
  methods: {
    async deleteGame() {
      const gameId = this.$route.params.id;
      try {
        await deleteData(`games/${gameId}`);
        console.log("Game deleted with ID: ", gameId);
        this.$router.push('/');
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    },
    async startGame() {
      const gameId = this.$route.params.id;

      try {
        const stocks = await getRandomStock(2);
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

        await updateData(`games/${gameId}`, {
          state: 'started',
          round: 1,
          stocks: stockDetails
        });

        // Redirect to the game view
        this.$router.push(`/game/${gameId}`);
      } catch (e) {
        console.error("Error starting game: ", e);
      }
    },
    async fetchUsers() {
      const gameId = this.$route.params.id;
      try {
        const gameData = await readData(`games/${gameId}`);
        if (gameData) {
          this.creator = gameData.creator;
          this.joinCode = gameData.code;
          this.users = gameData.players || [];
          this.checkIfCreator();
        }
      } catch (e) {
        console.error("Error fetching users: ", e);
      }
    },
    async fetchGameDetails() {
      const gameId = this.$route.params.id;
      try {
        const gameData = await readData(`games/${gameId}`);
        if (gameData) {
          this.creator = gameData.creator;
          this.joinCode = gameData.code;
          this.gameState = gameData.state;
          this.checkIfCreator();
        }
      } catch (e) {
        console.error("Error fetching game details: ", e);
      }
    },
    checkIfCreator() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.uid === this.creator) {
        this.isCreator = true;
      }
    }
  },
  async created() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.$router.push('/login');
      }
    });

    await this.fetchGameDetails();
    await this.fetchUsers();

    const gameId = this.$route.params.id;
    try {
      const gameRef = `games/${gameId}`;
      const gameData = await readData(gameRef);

      if (gameData) {
        this.users = gameData.players || [];
        this.gameState = gameData.state;

        if (this.gameState === 'started') {
          this.$router.push(`/game/${gameId}`);
        }
      } else {
        console.log("Game does not exist, redirecting to home.");
        this.$router.push('/');
      }
    } catch (e) {
      console.error("Error fetching game data:", e);
      this.$router.push('/');
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
@import '@/assets/styles/lobbyview.css';
</style>
