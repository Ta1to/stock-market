<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl mb-6">Lobby</h1>
      <ul class="mb-6">
        <li v-for="user in users" :key="user.uid" class="flex items-center justify-between p-2 bg-gray-700 rounded mb-2">
          <span>{{ user.username }}</span>
          <i v-if="user.uid === creator" class="fas fa-crown text-yellow-500"></i>
        </li>
      </ul>
      <button @click="deleteGame" class="w-full p-2 bg-red-500 rounded shadow-lg hover:bg-red-700 flex items-center justify-center">
        <i class="fas fa-trash-alt mr-2"></i> Delete Game
      </button>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, deleteDoc, getDoc } from "firebase/firestore";

export default {
  name: 'LobbyView',
  data() {
    return {
      users: [],
      creator: ''
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
    async fetchUsers() {
      const db = getFirestore();
      const gameId = this.$route.params.id;
      const gameDoc = await getDoc(doc(db, "games", gameId));
      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        this.creator = gameData.creator;
        this.users = gameData.players;
      }
    },
    async fetchGameDetails() {
      const db = getFirestore();
      const gameId = this.$route.params.id;
      const gameDoc = await getDoc(doc(db, "games", gameId));
      if (gameDoc.exists()) {
        this.creator = gameDoc.data().creator;
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
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
