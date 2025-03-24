<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl mb-2">Lobby</h1>
      <p class="text-lg mb-6">Join Code: {{ joinCode }}</p>
      <ul class="mb-6">
        <li v-for="user in users" :key="user.uid" class="flex items-center justify-between p-2 bg-gray-700 rounded mb-2">
          <span>{{ user.username }}</span>
          <i v-if="user.uid === creator" class="fas fa-crown text-yellow-500"></i>
        </li>
      </ul>
      <button v-if="isCreator" @click="deleteGame" class="w-full p-2 bg-red-500 rounded shadow-lg hover:bg-red-700 flex items-center justify-center">
        <i class="fas fa-trash-alt mr-2"></i> Delete Game
      </button>
      <button v-if="isCreator" @click="startGame" class="w-full p-2 bg-green-500 rounded shadow-lg hover:bg-green-700 flex items-center justify-center mt-4">
        <i class="fas fa-play mr-2"></i> Start Game
      </button>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, deleteDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

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
      const db = getFirestore();
      const gameId = this.$route.params.id;
      try {
        await deleteDoc(doc(db, "games", gameId));
        console.log("Game deleted with ID: ", gameId);
        this.$router.push('/');
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    },
    async startGame() {
      const db = getFirestore();
      const gameId = this.$route.params.id;
      try {
        await updateDoc(doc(db, "games", gameId), {
          state: 'started',
          round: 1
        });
        this.$router.push(`/game/${gameId}`);
      } catch (e) {
        console.error("Error starting game: ", e);
      }
    },
    async fetchUsers() {
      const db = getFirestore();
      const gameId = this.$route.params.id;
      const gameDoc = await getDoc(doc(db, "games", gameId));
      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        this.creator = gameData.creator;
        this.joinCode = gameData.code;
        this.users = gameData.players;
        this.checkIfCreator();
      }
    },
    async fetchGameDetails() {
      const db = getFirestore();
      const gameId = this.$route.params.id;
      const gameDoc = await getDoc(doc(db, "games", gameId));
      if (gameDoc.exists()) {
        this.creator = gameDoc.data().creator;
        this.joinCode = gameDoc.data().code;
        this.gameState = gameDoc.data().state;
        this.checkIfCreator();
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

    const db = getFirestore();
    const gameId = this.$route.params.id;
    onSnapshot(doc(db, "games", gameId), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        this.users = gameData.players;
        this.gameState = gameData.state;
        if (this.gameState === 'started') {
          this.$router.push(`/game/${gameId}`);
        }
        console.log(`User joined the game: ${gameData.players[gameData.players.length - 1].username}`);
      } else {
        console.log("Game document does not exist, redirecting to home.");
        this.$router.push('/');
      }
    }, (error) => {
      console.log("Error fetching game document:", error);
      this.$router.push('/');
    });
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
