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
  .use(router)
  .use(createPinia())
  .mount('#app')
