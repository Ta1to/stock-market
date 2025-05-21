<template>
  <button @click="logout" class="btn primary">LOGOUT</button>
</template>
  
<script>
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from 'vue-router';
  
export default {
  name: 'LogoutButton',
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.$router.push('/login');
      }).catch((error) => {
        console.error("Error logging out: ", error);
      });
    },
  }
}
</script>  
<style scoped>
/* No longer needed - using the common .btn.primary styles from homeview.css */
</style>
