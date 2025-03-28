<template>
  <v-container class="fill-height d-flex align-center justify-center auth-wrapper" fluid>
    <v-card elevation="0" width="600" class="register-card rounded-xl pa-12 position-relative">
      <div class="register-card-overlay"></div>

      <div class="text-center mb-8">
        <div class="d-flex justify-center align-center mb-4">
          <v-icon size="48" color="accent" class="mr-2">mdi-chart-line</v-icon>
          <span class="register-logo text-h3 font-weight-black">Stock Poker</span>
        </div>

        <v-card-title class="text-h4 justify-center mb-2 text-accent">
          Create Account
        </v-card-title>
        <v-card-subtitle class="text-center text-medium-emphasis">
          Join the trading community
        </v-card-subtitle>
      </div>

      <v-card-text>
        <v-form @submit.prevent="register" ref="form">
          <v-text-field
            v-model="name"
            label="Full Name"
            required
            :rules="nameRules"
            outlined
            prepend-inner-icon="mdi-account"
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="Email Address"
            type="email"
            required
            :rules="emailRules"
            outlined
            prepend-inner-icon="mdi-email"
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            required
            :rules="passwordRules"
            outlined
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showPassword = !showPassword"
            class="mb-6"
          ></v-text-field>

          <v-alert
            v-if="error"
            type="error"
            dense
            text
            class="mb-4"
          >{{ error }}</v-alert>
          
          <v-btn
            type="submit"
            color="accent"
            block
            height="44"
            :loading="loading"
            class="mb-4"
          >
            Create Account
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <router-link 
          to="/login" 
          class="text-body-1 text-decoration-none custom-link"
        >
          Already have an account? <span class="link-text font-weight-medium">Sign in</span>
        </router-link>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { writeData } from "@/services/database";

export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null,
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length >= 2 || 'Name must be at least 2 characters'
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters'
      ]
    };
  },
  methods: {
    async register() {
      if (!this.$refs.form.validate()) return;
      
      this.loading = true;
      this.error = null;
      const auth = getAuth();
      
      try {
        // Register User with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // Store user data in Database
        await writeData(`users/${user.uid}`, {
          name: this.name,
          email: this.email,
          createdAt: new Date().toISOString()
        });


        console.log("User registered:", userCredential.user);
        this.$router.push('/');
      } catch (error) {
        this.error = this.getErrorMessage(error.code);
      } finally {
        this.loading = false;
      }
    },
    getErrorMessage(code) {
      switch (code) {
        case 'auth/email-already-in-use':
          return 'This email is already registered';
        case 'auth/invalid-email':
          return 'Invalid email address';
        case 'auth/weak-password':
          return 'Password is too weak';
        default:
          return 'An error occurred during registration';
      }
    }
  }
}
</script>

<style scoped>
:root {
  --bg-dark-primary: #0f0f1a;
  --bg-dark-secondary: #1c1c2e;
  --accent-gold: #ffd700;
  --accent-gold-transparent: rgba(255, 215, 0, 0.7);
}

.auth-wrapper {
  background: linear-gradient(135deg, var(--bg-dark-primary), var(--bg-dark-secondary));
  min-height: 100vh;
}

.register-card {
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9));
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--accent-gold-transparent);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.register-logo {
  color: var(--accent-gold);
  text-shadow: 
    0 4px 15px var(--accent-gold-transparent),
    2px 2px 0 rgba(0,0,0,0.2);
  letter-spacing: 2px;
}

.v-field {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid var(--accent-gold-transparent);
}

.v-field:focus-within {
  border-color: var(--accent-gold) !important;
  box-shadow: 0 0 15px var(--accent-gold-transparent);
}

.v-btn {
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.4s ease;
}

.v-btn:hover {
  transform: translateY(-3px);
}

.custom-link {
  color: inherit;
  transition: opacity 0.3s ease;
}

.custom-link:hover {
  opacity: 0.8;
}
</style>
