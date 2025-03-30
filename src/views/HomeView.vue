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
            <button @click="joinGame(game)" class="join-button">
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
            <button @click="joinGame()" class="btn primary">Join</button>
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
      this.joinCode = '';
    },
    
    async fetchGames() {
      try {
        const games = await readData("games");
        this.publicGames = Object.entries(games || {})
          .filter(([, game]) => game.isPublic === true && (!game.state || game.state !== 'started'))
          .map(([id, game]) => ({ id, ...game }));
      } catch (error) {
        console.error("Error while loading games:", error);
      }
    },
    
    async joinGame(gameObject) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userData = await readData(`users/${user.uid}`);
        if (!userData) {
          console.error("No such user document!");
          return;
        }

        let gameId, game;

        // Handle both direct game objects and game codes
        if (gameObject) {
          // Called from public games list
          gameId = gameObject.id;
          game = gameObject;
        } else {
          // Called from join by code
          const games = await readData("games");
          gameId = Object.keys(games || {}).find(
            key => games[key].code === this.joinCode
          );
          if (!gameId) {
            console.error("No game found with the provided code!");
            return;
          }
          game = games[gameId];
        }

        const updatedPlayers = game.players || [];
        
        if (updatedPlayers.some(player => player.uid === user.uid)) {
          console.error("Player already in game!");
          return;
        }

        updatedPlayers.push({ 
          uid: user.uid, 
          name: userData.name,
          chips: 1000
        });

        await updateData(`games/${gameId}`, { players: updatedPlayers });
        this.$router.push(`/lobby/${gameId}`);
        this.closeJoinGameModal();
      } catch (e) {
        console.error("Error joining game:", e);
      }
    },
    
    async createGame() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userData = await readData(`users/${user.uid}`);
        if (!userData?.name) {
          console.error("User document does not have a name field!");
          return;
        }

        // Generate a short code for the game
        const gameId = Math.random().toString(36).substr(2, 5);

        const gameData = {
          creator: user.uid,
          createdAt: new Date().toISOString(),
          code: gameId,
          isPublic: this.isGamePublic,
          state: 'waiting', // or "not-started"
          currentRound: 1,
          totalRounds: 3,

          players: [
            {
              uid: user.uid,
              name: userData.name,
              chips: 1000
            }
          ],

          // Rounds object
          rounds: {
            1: { phase: 1, predictions: {}, bets: {}, pot: 0 },
            2: { phase: 1, predictions: {}, bets: {}, pot: 0 },
            3: { phase: 1, predictions: {}, bets: {}, pot: 0 },
          }
        };

        await writeData(`games/${gameId}`, gameData);
        this.$router.push(`/lobby/${gameId}`);
      } catch (e) {
        console.error("Error creating game:", e);
      }
    }
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