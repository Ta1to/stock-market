<template>
  <div class="background-wrapper">
    <!-- Animierte Hintergrundeffekte für Partystimmung -->
    <div class="bubble bubble-1"></div>
    <div class="bubble bubble-2"></div>
    <div class="bubble bubble-3"></div>
    <div class="bubble bubble-4"></div>
  <!-- Hintergrund-Container, der die gesamte Höhe nutzt, Inhalte zentriert -->
  <v-container
    class="fill-height d-flex align-center justify-center"
  >
    <!-- Karte mit dunklerem Hintergrund, Schatten und festgelegter Breite -->
    <v-card
      elevation="16"
      max-width="450"
      class="registration-card"
      rounded="lg"
    >
      <!-- Header mit Logo/Icon -->
      <div class="card-header text-center pa-4">
        <v-icon size="48" color="amber accent-3">mdi-glass-cocktail</v-icon>
        <h1 class="text-h4 font-weight-bold mt-2 party-text">DRINK ZONE</h1>
        <div class="subtitle-text">Das ultimative Trinkspiel-Erlebnis</div>
      </div>

      <v-divider></v-divider>
      <!-- Titel -->
      <v-card-title class="text-center pt-6 pb-2">
        <span class="text-h5 font-weight-medium">Werde Teil der Party!</span>
      </v-card-title>

      <!-- Formularbereich -->
      <v-card-text class="px-6">
        <v-form @submit.prevent="register">
          <v-text-field
            v-model="username"
            label="Dein Party-Name"
            prepend-inner-icon="mdi-account"
            required
            rounded
            filled
            outlined
            dense
            class="mb-3 input-field"
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="E-Mail"
            type="email"
            required
            rounded
            filled
            outlined
            dense
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Passwort"
            type="password"
            prepend-inner-icon="mdi-lock"
            required
            rounded
            filled
            outlined
            dense
            class="mb-4"
          ></v-text-field>

          <!-- Button -->
          <v-btn
            type="submit"
            color="amber accent-4"
            dark
            block
            height="48"
            rounded
            class="register-btn text-uppercase font-weight-bold"
          >
            <v-icon left>mdi-party-popper</v-icon>
            Party starten
          </v-btn>
        </v-form>
      </v-card-text>

      <!-- Karten-Aktionen (z.B. Link zum Login) -->
      <v-card-actions class="justify-center pb-6 px-6">
        <router-link to="/login" class="text-center w-full mt-4">
          <v-btn text color="amber">
            <v-icon small left>mdi-login</v-icon>
            Bereits dabei? Jetzt einloggen
          </v-btn>
        </router-link>
      </v-card-actions>
    </v-card>
  </v-container>
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
