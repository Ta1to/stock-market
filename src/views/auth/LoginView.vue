<template>
  <div class="auth-wrapper">
    <div class="login-card">
      <div class="login-card-overlay"></div>
      
      <div class="text-center header-section">
        <div class="logo-container">
          <img src="/stockpoker.png" alt="Stock Poker Logo" class="app-logo" />
        </div>
        
        <h1 class="card-title">Welcome Back</h1>
        <p class="card-subtitle">Sign in to your account</p>
      </div>

      <div class="card-content">
        <form @submit.prevent="login" ref="form">
          <div class="form-group">
            <div class="input-container">
              <i class="fa fa-envelope"></i>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="Email Address"
                required
                class="form-input"
                @blur="validateEmail"
              />
            </div>
            <p v-if="emailError" class="error-message">{{ emailError }}</p>
          </div>
          
          <div class="form-group">
            <div class="input-container">
              <i class="fa fa-lock"></i>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                required
                class="form-input"
                @blur="validatePassword"
                @input="validatePassword"
              />
              <i 
                class="fa password-toggle"
                :class="showPassword ? 'fa-eye' : 'fa-eye-slash'"
                @click="showPassword = !showPassword"
                style="cursor: pointer;"
              ></i>
            </div>
            <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
          </div>

          <p v-if="error" class="alert-error">{{ error }}</p>
          
          <button
            type="submit"
            class="submit-button"
            :disabled="loading"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </form>
      </div>

      <div class="card-actions">
        <router-link to="/register" class="signup-link">
          Don't have an account? <span class="link-text">Sign up</span>
        </router-link>
      </div>
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
      password: '',
      showPassword: false,
      loading: false,
      error: null,
      emailError: null,
      passwordError: null
    };
  },
  methods: {
    validateEmail() {
      this.emailError = null;
      if (!this.email) {
        this.emailError = 'Email is required';
        return false;
      }
      if (!/.+@.+\..+/.test(this.email)) {
        this.emailError = 'Email must be valid';
        return false;
      }
      return true;
    },
    validatePassword() {
      this.passwordError = null;
      if (!this.password) {
        this.passwordError = 'Password is required';
        return false;
      }
      if (this.password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters';
        return false;
      }
      return true;
    },
    validateForm() {
      const isEmailValid = this.validateEmail();
      const isPasswordValid = this.validatePassword();
      return isEmailValid && isPasswordValid;
    },
    async login() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      this.error = null;
      const auth = getAuth();
      
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
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
  },
  watch: {
    email() {
      if (this.email) this.validateEmail();
    }
  }
}
</script>

<style scoped>
@import "@/assets/styles/auth.css";
</style>
