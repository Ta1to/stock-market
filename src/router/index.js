import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import LobbyView from '../views/LobbyView.vue';
import GameView from '../views/GameView.vue';
import app from "../api/firebase-api";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = getAuth(app); // Ensure Firebase is initialized before using getAuth
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
