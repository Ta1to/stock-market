<template>
  <div class="min-h-screen flex items-center justify-center bg-dark text-white font-stock">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 class="text-2xl mb-6">Login</h1>
      <input v-model="email" type="email" placeholder="Email" class="w-full p-2 mb-4 bg-dark-lighter rounded" />
      <input v-model="password" type="password" placeholder="Password" class="w-full p-2 mb-4 bg-dark-lighter rounded" />
      <button @click="login" class="w-full p-2 bg-blue-500 rounded hover:bg-blue-700">Login</button>
      <p class="mt-4">Don't have an account? <router-link to="/register" class="text-blue-400">Register</router-link></p>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    login() {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then((userCredential) => {
          console.log("User logged in: ", userCredential.user);
          this.$router.push('/');
        })
        .catch((error) => {
          console.error("Error logging in: ", error);
        });
    }
  }
}
</script>
