<template>
  <!-- Hintergrund-Container, der die gesamte Höhe nutzt, Inhalte zentriert -->
  <v-container
    class="fill-height d-flex align-center justify-center"
  >
    <!-- Karte mit dunklerem Hintergrund, Schatten und festgelegter Breite -->
    <v-card
      elevation="8"
      max-width="400"
      class="pa-6"
    >
      <!-- Titel -->
      <v-card-title class="text-h5">
        Registrieren
      </v-card-title>
      
      <!-- Trennlinie -->
      <v-divider class="my-2"></v-divider>

      <!-- Formularbereich -->
      <v-card-text>
        <v-form @submit.prevent="register">
          <v-text-field
            v-model="username"
            label="Benutzername"
            required
            outlined
            dense
            class="mb-4"
          ></v-text-field>
          
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
          
          <!-- Button -->
          <v-btn
            type="submit"
            color="primary"
            block
          >
            Registrieren
          </v-btn>
        </v-form>
      </v-card-text>

      <!-- Karten-Aktionen (z.B. Link zum Login) -->
      <v-card-actions class="justify-center">
        <router-link to="/login" class="text-center w-full mt-4">
          Du hast schon ein Konto? Jetzt einloggen
        </router-link>
      </v-card-actions>
    </v-card>
  </v-container>
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
        // Benutzerinformationen in Firestore speichern
        await setDoc(doc(db, "users", user.uid), {
          username: this.username,
          email: this.email
        });
        // Weiterleiten zur Startseite
        this.$router.push('/');
      } catch (error) {
        console.error("Fehler beim Registrieren:", error);
      }
    }
  }
}
</script>

<style scoped>
/* Beispiel: Dunklen Hintergrund setzen für den Container.
   Du kannst auch das Dark-Theme global über Vuetify aktivieren */
.v-application {
  background-color: #121212 !important; /* Dunkler Hintergrund */
}
</style>
