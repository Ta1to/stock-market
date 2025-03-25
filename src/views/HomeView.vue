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
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, arrayUnion, getDocs, query, where } from "firebase/firestore";
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
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const gameQuery = collection(db, "games");
            const gameSnapshot = await getDocs(query(gameQuery, where("code", "==", this.joinCode)));
            if (!gameSnapshot.empty) {
              const gameDoc = gameSnapshot.docs[0];
              const gameId = gameDoc.id;
              await updateDoc(doc(db, "games", gameId), {
                players: arrayUnion({ uid: user.uid, username: userData.username })
              });
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
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.username) {
              const docRef = await addDoc(collection(db, "games"), {
                creator: user.uid,
                createdAt: new Date(),
                code: Math.random().toString(36).substr(2, 5),
                players: [{ uid: user.uid, username: userData.username }]
              });
              console.log("Game created with ID: ", docRef.id);
              this.$router.push(`/lobby/${docRef.id}`);
            } else {
              console.error("User document does not have a username field!");
            }
          } else {
            console.error("No such user document!");
          }
        } catch (e) {
          console.error("Error adding document: ", e);
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
