/**
 * Main application entry point
 * Sets up Vue application with plugins and mounts it to the DOM
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'

// Import Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

// Create and configure Vue application
createApp(App)
  .use(router)         // Add Vue Router for navigation
  .use(createPinia())  // Add Pinia for state management
  .mount('#app')       // Mount the app to the DOM element with id 'app'
