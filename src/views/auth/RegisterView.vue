<template>
  <div class="auth-wrapper">
    <div class="register-card">
      <div class="register-card-overlay"></div>
      
      <div class="text-center header-section">
        <div class="logo-container">
          <img src="/stockpoker.png" alt="Stock Poker Logo" class="app-logo" />
        </div>
        
        <h1 class="card-title">Create Account</h1>
        <p class="card-subtitle">Join the trading community</p>
      </div>

      <div class="card-content">
        <form @submit.prevent="register" ref="form">
          <div class="form-group">
            <div class="input-container">
              <i class="fa fa-user"></i>
              <input
                id="name"
                v-model="name"
                placeholder="Full Name"
                type="text"
                required
                class="form-input"
                @blur="validateName"
                @input="validateName"
              />
            </div>
            <p v-if="nameError" class="error-message">{{ nameError }}</p>
          </div>
          
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
                @input="validateEmail"
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
            <span v-if="!loading">Create Account</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </form>
      </div>

      <div class="card-actions">
        <router-link to="/login" class="login-link">
          Already have an account? <span class="link-text">Sign in</span>
        </router-link>
      </div>
    </div>
  </div>
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
      nameError: null,
      emailError: null,
      passwordError: null
    };
  },
  methods: {
    validateName() {
      this.nameError = null;
      if (!this.name) {
        this.nameError = 'Name is required';
        return false;
      }
      if (this.name.length < 2) {
        this.nameError = 'Name must be at least 2 characters';
        return false;
      }
      return true;
    },
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
      const isNameValid = this.validateName();
      const isEmailValid = this.validateEmail();
      const isPasswordValid = this.validatePassword();
      return isNameValid && isEmailValid && isPasswordValid;
    },
    async register() {
      if (!this.validateForm()) return;
      
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
  },
  watch: {
    name() {
      if (this.name) this.validateName();
    },
    email() {
      if (this.email) this.validateEmail();
    },
    password() {
      if (this.password) this.validatePassword();
    }
  }
}
</script>

<style scoped>
@import "@/assets/styles/auth.css";
</style>
