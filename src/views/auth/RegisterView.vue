<template>
  <v-container class="fill-height d-flex align-center justify-center auth-container">
    <v-card elevation="8" width="600" class="pa-12 rounded-lg">
      <div class="text-center mb-6">
        <v-icon size="48" color="primary" class="mb-4">mdi-chart-line</v-icon>
        <v-card-title class="text-h4 justify-center">Create Account</v-card-title>
        <v-card-subtitle>Join the trading community</v-card-subtitle>
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
            color="primary"
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
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
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
.v-application {
  background-color: #121212 !important;
}

.auth-container {
  max-width: 100% !important;
}

.custom-link {
  color: inherit;
  transition: all 0.3s ease;
}

.custom-link:hover {
  opacity: 0.8;
}

.custom-link:active {
  opacity: 0.6;
}

.link-text {
  color: #1976d2 !important;
}

.link-text:hover {
  color: #2196f3 !important;
}
</style>
