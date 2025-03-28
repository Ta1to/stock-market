<template>
  <v-container 
    class="fill-height d-flex align-center justify-center auth-wrapper" 
    fluid
  >
    <v-card 
      elevation="0" 
      width="600" 
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
:root {
  --bg-dark-primary: #0f0f1a;
  --bg-dark-secondary: #1c1c2e;
  --accent-gold: #ffd700;
  --accent-gold-transparent: rgba(255, 215, 0, 0.7);
}

.auth-wrapper {
  background: linear-gradient(135deg, var(--bg-dark-primary), var(--bg-dark-secondary));
  min-height: 100vh;
  perspective: 1000px;
}

.login-card {
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9));
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--accent-gold-transparent);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transform: rotateX(10deg) rotateY(-10deg);
  transition: all 0.5s ease;
}

.login-card:hover {
  transform: rotateX(0) rotateY(0);
}

.login-logo {
  color: var(--accent-gold);
  text-shadow: 
    0 4px 15px var(--accent-gold-transparent),
    2px 2px 0 rgba(0,0,0,0.2);
  letter-spacing: 2px;
}

.login-input .v-field {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid var(--accent-gold-transparent);
}

.login-input .v-field:focus-within {
  border-color: var(--accent-gold) !important;
  box-shadow: 0 0 15px var(--accent-gold-transparent);
}

.login-button {
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.4s ease;
}

.login-button:hover {
  transform: translateY(-5px);
}

.login-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: rgba(255,255,255,0.6);
  margin: 1.5rem 0;
}

.login-divider span {
  padding: 0 10px;
  position: relative;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.login-button-google {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.custom-link {
  color: inherit;
  transition: opacity 0.3s ease;
}

.custom-link:hover {
  opacity: 0.8;
}
</style>
