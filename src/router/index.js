/**
 * Vue Router Configuration
 * Defines application routes, navigation guards, and authentication requirements
 */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import LobbyView from '../views/LobbyView.vue';
import GameView from '../views/GameView.vue';
import { app } from "../api/firebase-api";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * Route definitions with meta information for authentication requirements
 * requiresAuth: true - Route requires user to be logged in
 * requiresAuth: false - Route is accessible without authentication
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/lobby/:id',
    name: 'Lobby',
    component: LobbyView,
    meta: { requiresAuth: true }
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: GameView,
    meta: { requiresAuth: true }
  }
];

/**
 * Initialize router with HTML5 history mode
 * This enables cleaner URLs without the hash (#)
 */
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

/**
 * Navigation guard to handle authentication
 * Redirects unauthenticated users to login page when trying to access protected routes
 */
router.beforeEach((to, from, next) => {
  const auth = getAuth(app);
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  onAuthStateChanged(auth, (user) => {
    if (requiresAuth && !user) {
      next('/login');
    } else {
      next();
    }
  });
});

export default router;
