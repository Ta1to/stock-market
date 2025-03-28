<template>
  <button @click="logout" class="logout-button">Logout</button>
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
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
  
.logout-button:hover {
  background-color: #d32f2f;
}
</style>
