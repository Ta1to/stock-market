<template>
  <button @click="logout" class="btn primary logout-button">LOGOUT</button>
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
.logout-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 10px 20px;
  border-radius: 10px;
}
</style>
