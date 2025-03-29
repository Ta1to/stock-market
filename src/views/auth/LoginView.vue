<template>
  <v-container 
    class="fill-height d-flex align-center justify-center auth-wrapper" 
    fluid
  >
    <v-card 
      elevation="0" 
      :width="$vuetify.display.smAndDown ? '95%' : '100%'"
      :max-width="$vuetify.display.smAndDown ? 'none' : '600'"
      class="login-card rounded-xl pa-12 position-relative"
    >
      <div class="login-card-overlay"></div>
      
      <div class="text-center mb-8">
        <div class="d-flex justify-center align-center mb-4">
          <v-icon 
            size="48" 
            color="accent" 
            class="mr-2"
          >
            mdi-chart-line
          </v-icon>
          <span class="login-logo text-h3 font-weight-black">Stock Poker</span>
        </div>
        
        <v-card-title class="text-h4 justify-center mb-2 text-accent">
          Welcome Back
        </v-card-title>
        <v-card-subtitle class="text-center text-medium-emphasis">
          Sign in to your account
        </v-card-subtitle>
      </div>

      <v-card-text>
        <v-form @submit.prevent="login" ref="form">
          <v-text-field
            v-model="email"
            label="Email Address"
            type="email"
            required
            :rules="emailRules"
            outlined
            prepend-inner-icon="mdi-email"
            class="mb-4"
            density="comfortable"
            style="max-width: 90%; margin: auto;"
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
            density="comfortable"
            style="max-width: 90%; margin: auto;"
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
            Sign In
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <router-link 
          to="/register" 
          class="text-body-1 text-decoration-none custom-link"
        >
          Don't have an account? <span class="link-text font-weight-medium">Sign up</span>
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
      password: '',
      showPassword: false,
      loading: false,
      error: null,
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
    async login() {
      if (!this.$refs.form.validate()) return;
      
      this.loading = true;
      this.error = null;
      const auth = getAuth();
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log("User logged in:", userCredential.user);
        this.$router.push('/');
      } catch (error) {
        this.error = this.getErrorMessage(error.code);
      } finally {
        this.loading = false;
      }
    },
    getErrorMessage(code) {
      switch (code) {
        case 'auth/user-not-found':
          return 'No account found with this email';
        case 'auth/wrong-password':
          return 'Invalid password';
        default:
          return 'An error occurred during sign in';
      }
    }
  }
}
</script>

<style scoped>
  @import '@/assets/styles/loginview.css';
</style>
