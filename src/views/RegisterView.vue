<template>
  <div class="min-h-screen flex items-center justify-center bg-dark text-white font-stock">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 class="text-2xl mb-6">Register</h1>
      <input v-model="username" type="text" placeholder="Username" class="w-full p-2 mb-4 bg-dark-lighter rounded" />
      <input v-model="email" type="email" placeholder="Email" class="w-full p-2 mb-4 bg-dark-lighter rounded" />
      <input v-model="password" type="password" placeholder="Password" class="w-full p-2 mb-4 bg-dark-lighter rounded" />
      <button @click="register" class="w-full p-2 bg-blue-500 rounded hover:bg-blue-700">Register</button>
      <p class="mt-4">Already have an account? <router-link to="/login" class="text-blue-400">Login</router-link></p>
    </div>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from '../api/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      email: '',
      password: ''
    };
  },
  methods: {
    async register() {
      const auth = getAuth();
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          username: this.username,
          email: this.email
        });
        this.$router.push('/');
      } catch (error) {
        console.error("Error registering: ", error);
      }
    }
  }
}
</script>
