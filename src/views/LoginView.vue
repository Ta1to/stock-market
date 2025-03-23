<template>
  <v-container
    class="fill-height d-flex align-center justify-center"
  >
    <v-card
      elevation="8"
      max-width="400"
      class="pa-6"
    >
      <v-card-title class="text-h5">
        Login
      </v-card-title>
      
      <v-divider class="my-2"></v-divider>

      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field
            v-model="email"
            label="E-Mail"
            type="email"
            required
            outlined
            dense
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="password"
            label="Passwort"
            type="password"
            required
            outlined
            dense
            class="mb-4"
          ></v-text-field>
          
          <v-btn
            type="submit"
            color="primary"
            block
          >
            Einloggen
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <router-link to="/register" class="text-center w-full mt-4">
          Du hast noch kein Konto? Jetzt registrieren
        </router-link>
      </v-card-actions>
    </v-card>
  </v-container>
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
    async login() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log("User logged in:", userCredential.user);
        this.$router.push('/');
      } catch (error) {
        console.error("Fehler beim Login:", error);
      }
    }
  }
}
</script>

<style scoped>
.v-application {
  background-color: #121212 !important; /* Dunkler Hintergrund */
}
</style>
