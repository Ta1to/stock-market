<template>
  <div class="min-h-screen flex items-center justify-center bg-dark text-white font-stock">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl mb-6">Home View</h1>
      <button @click="logout" class="w-full p-2 bg-red-500 rounded hover:bg-red-700">Logout</button>
    </div>
  </div>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";

export default {
  name: 'HomeView',
  methods: {
    logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.$router.push('/login');
      }).catch((error) => {
        console.error("Error logging out: ", error);
      });
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
