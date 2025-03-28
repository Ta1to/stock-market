<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl mb-6">Stock Poker</h1>
      <div class="flex space-x-4">
        <button @click="showJoinGame" class="text-xl bg-blue-500 rounded shadow-lg hover:bg-blue-700 flex items-center justify-center w-48 h-48">
          <i class="fas fa-sign-in-alt mr-2"></i> Join Game
        </button>
        <button @click="createGame" class="text-xl bg-green-500 rounded shadow-lg hover:bg-green-700 flex items-center justify-center w-48 h-48">
          <i class="fas fa-plus mr-2"></i> Create Game
        </button>
      </div>
    </div>
    <LogoutButton />
    <OpenGames />
    <button @click="isGamePublic = !isGamePublic" class="p-2 bg-gray-600 rounded shadow-lg">
      {{ isGamePublic ? "Public Game" : "Private Game" }}
    </button>
    <div v-if="showJoinGameModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 class="text-xl mb-4">Join Game</h2>
        <input v-model="joinCode" type="text" placeholder="Enter game code" class="w-full p-2 mb-4 bg-gray-700 rounded">
        <button @click="joinGame" class="w-full p-2 bg-blue-500 rounded shadow-lg hover:bg-blue-700">Join</button>
        <button @click="closeJoinGameModal" class="w-full p-2 mt-2 bg-red-500 rounded shadow-lg hover:bg-red-700">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { writeData, readData, updateData } from "@/services/database";
import LogoutButton from '../components/buttons/LogoutButton.vue';
import OpenGames from '../components/OpenGames.vue';
export default {
  name: 'HomeView',
    components: {
        LogoutButton, 
        OpenGames
    },
  data() {
    return {
      showJoinGameModal: false,
      joinCode: '',
      stockPrice: null,
      isGamePublic: true,
    };
  },
  methods: {
    showJoinGame() {
      this.showJoinGameModal = true;
    },
    closeJoinGameModal() {
      this.showJoinGameModal = false;
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
