<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock">
    <div class="w-full flex justify-end p-4">
      <button @click="logout" class="p-2 bg-red-500 rounded hover:bg-red-700">Logout</button>
    </div>
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl mb-6">Home View</h1>
      <div class="mb-4">
        <button @click="showJoinGame" class="w-full p-2 bg-blue-500 rounded hover:bg-blue-700">Join Game</button>
      </div>
      <div>
        <button @click="createGame" class="w-full p-2 bg-green-500 rounded hover:bg-green-700">Create Game</button>
      </div>
    </div>
    <div v-if="showJoinGameModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 class="text-xl mb-4">Join Game</h2>
        <input v-model="joinCode" type="text" placeholder="Enter game code" class="w-full p-2 mb-4 bg-gray-700 rounded">
        <button @click="joinGame" class="w-full p-2 bg-blue-500 rounded hover:bg-blue-700">Join</button>
        <button @click="closeJoinGameModal" class="w-full p-2 mt-2 bg-red-500 rounded hover:bg-red-700">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

export default {
  name: 'HomeView',
  data() {
    return {
      showJoinGameModal: false,
      joinCode: ''
    };
  },
  methods: {
    logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.$router.push('/login');
      }).catch((error) => {
        console.error("Error logging out: ", error);
      });
    },
    showJoinGame() {
      this.showJoinGameModal = true;
    },
    closeJoinGameModal() {
      this.showJoinGameModal = false;
    },
    joinGame() {
      // Implement join game logic here
      console.log("Joining game with code:", this.joinCode);
      this.closeJoinGameModal();
    },
    async createGame() {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = await addDoc(collection(db, "games"), {
            creator: user.uid,
            createdAt: new Date(),
            code: Math.random().toString(36).substr(2, 9)
          });
          console.log("Game created with ID: ", docRef.id);
          this.$router.push(`/lobby/${docRef.id}`);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    }
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
