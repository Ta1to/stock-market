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
              <i class="icon account-icon"></i>
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
              <i class="icon email-icon"></i>
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
              <i class="icon lock-icon"></i>
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
                class="icon password-toggle" 
                :class="showPassword ? 'eye-icon' : 'eye-off-icon'"
                @click="showPassword = !showPassword"
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
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-dark-primary), var(--bg-dark-secondary));
}

.register-card {
  position: relative;
  width: 100%;
  max-width: 600px;
  padding: 48px;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.register-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.05));
  border-radius: 16px;
  z-index: -1;
}

.text-center {
  text-align: center;
}

.header-section {
  margin-bottom: 32px;
}

.app-logo {
  width: 180px;
  height: 180px;
  display: block;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  background-size: contain;
  background-repeat: no-repeat;
  display: inline-block;
}

.email-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M20,4H4C2.9,4 2,4.9 2,6V18C2,19.1 2.9,20 4,20H20C21.1,20 22,19.1 22,18V6C22,4.9 21.1,4 20,4M20,8L12,13L4,8V6L12,11L20,6V8Z'/%3E%3C/svg%3E");
}

.account-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z'/%3E%3C/svg%3E");
}

.lock-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z'/%3E%3C/svg%3E");
}

.eye-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z'/%3E%3C/svg%3E");
}

.eye-off-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z'/%3E%3C/svg%3E");
}

.register-logo {
  font-size: 32px;
  font-weight: 900;
  color: #ffffff;
}

.card-title {
  font-size: 28px;
  color: var(--accent-gold);
  margin-bottom: 8px;
  font-weight: 600;
}

.card-subtitle {
  color: #94a3b8;
  margin-top: 0;
}

.card-content {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #e2e8f0;
  font-size: 14px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  padding: 0 12px;
  transition: border-color 0.2s;
}

.input-container:focus-within {
  border-color: var(--accent-gold);
}

.form-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #ffffff;
  padding: 12px 8px;
  font-size: 16px;
  outline: none;
}

.password-toggle {
  cursor: pointer;
}

.error-message {
  color: #ef4444;
  border: none;
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 0;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.alert-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.submit-button {
  display: block;
  width: 90%;
  margin: 24px auto;
  background: linear-gradient(to right, var(--accent-gold), #ff9900);
  border: none;
  color: white;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  height: 44px;
}

.submit-button:hover {
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card-actions {
  text-align: center;
}

.login-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 16px;
}

.link-text {
  color: var(--accent-gold);
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .register-card {
    padding: 24px;
  }
  
  .register-logo {
    font-size: 24px;
  }
  
  .card-title {
    font-size: 24px;
  }
}
</style>
