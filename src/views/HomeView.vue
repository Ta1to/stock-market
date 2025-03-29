<template>
  <div class="main-wrapper">
  <div class="home-container">
    <div class="background-overlay"></div>
      <h1 class="title text-center">Stock Poker</h1>
      <LogoutButton class="logout-button"/>
      <!-- Game Options -->
      <div class="game-options">
        <button @click="createGame" class="btn primary">Create Game</button>
        <button @click="showJoinGame" class="btn secondary">Join Game</button>
      </div>

      <!-- Public/Private Toggle -->
      <div class="toggle-container">
        <span :class="{'active': isGamePublic}" @click="isGamePublic = true">Public</span>
        <div class="toggle-switch" @click="isGamePublic = !isGamePublic">
          <div class="toggle-slider" :class="{'right': !isGamePublic}"></div>
        </div>
        <span :class="{'active': !isGamePublic}" @click="isGamePublic = false">Private</span>
      </div>

      <!-- Public Games Section -->
      <div class="public-games-container">
        <h2 class="text-2xl font-bold text-center text-white mb-4">🔹 Öffentliche Spiele 🔹</h2>

        <div v-if="publicGames.length" class="game-grid">
          <div v-for="game in publicGames" :key="game.id" class="game-card">
            <div class="game-info">
              <h3 class="text-lg font-semibold">{{ game.code }}</h3>
              <p class="text-sm">{{ game.players.length }} Spieler</p>
            </div>
            <button 
              @click="$router.push(`/lobby/${game.id}`)" 
              class="join-button"
            >
              Beitreten
            </button>
          </div>
        </div>
        <p v-else class="text-center text-gray-400">Keine öffentlichen Spiele verfügbar.</p>
      </div>
          <!-- Join Game Modal -->
    <div v-if="showJoinGameModal" class="modal-overlay">
      <div class="modal">
        <h2>Join Game</h2>
        <input v-model="joinCode" type="text" placeholder="Enter game code" />
        <div class="modal-buttons">
          <button @click="joinGame" class="btn primary">Join</button>
          <button @click="closeJoinGameModal" class="btn secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>


<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { writeData, readData, updateData } from "@/services/database";
import LogoutButton from '../components/buttons/LogoutButton.vue';
export default {
  name: 'HomeView',
    components: {
        LogoutButton
    },
  data() {
    return {
      showJoinGameModal: false,
      joinCode: '',
      stockPrice: null,
      isGamePublic: true,
      publicGames: [],
    };
  },
  methods: {
    showJoinGame() {
      this.showJoinGameModal = true;
    },
    closeJoinGameModal() {
      this.showJoinGameModal = false;
    },
    async fetchGames() {
      try {
        const games = await readData("games");
        this.publicGames = Object.entries(games || {})
          .filter(([/* id */, game]) => game.isPublic === true && (!game.state || game.state !== 'started'))
          .map(([id, game]) => ({ id, ...game }));
      } catch (error) {
        console.error("Error while loading games: ", error);
      }
    },
    async joinGame() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          // Read user data from Realtime Database
          const userData = await readData(`users/${user.uid}`);
          if (userData) {
            // Find the game by code
            const games = await readData("games");
            const gameId = Object.keys(games || {}).find(
              key => games[key].code === this.joinCode && !games[key].isPublic
            );

            if (gameId) {
              // Update the game with the new player
              const game = games[gameId];
              const updatedPlayers = game.players || [];
              updatedPlayers.push({ uid: user.uid, username: userData.username });

              await updateData(`games/${gameId}`, { players: updatedPlayers });
              console.log(`User ${userData.username} joined the game with code: ${this.joinCode}`);
              this.$router.push(`/lobby/${gameId}`);
            } else {
              console.error("No game found with the provided code!");
            }
          } else {
            console.error("No such user document!");
          }
        } catch (e) {
          console.error("Error joining game: ", e);
        }
      }
      this.closeJoinGameModal();
    },
    async createGame() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          // Read user data from Realtime Database
          const userData = await readData(`users/${user.uid}`);
          if (userData && userData.name) {
            // Create a new game in Realtime Database
            const gameId = Math.random().toString(36).substr(2, 5); // Generate a unique game ID
            const gameData = {
              creator: user.uid,
              createdAt: new Date().toISOString(),
              code: gameId,
              isPublic: this.isGamePublic,
              players: [{ uid: user.uid, name: userData.name }]
            };

            await writeData(`games/${gameId}`, gameData);
            console.log("Game created with ID: ", gameId);
            this.$router.push(`/lobby/${gameId}`);
          } else {
            console.error("User document does not have a username field!");
          }
        } catch (e) {
          console.error("Error creating game: ", e);
        }
      }
    },
  },
  created() {
    this.fetchGames();
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.$router.push('/login');
      }
    });
  }
}
</script>

<style>
@import '../assets/styles/homeview.css';
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
