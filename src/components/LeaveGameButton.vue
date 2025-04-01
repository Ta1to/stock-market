<template>
  <button @click="leaveGame" class="leave-button">Leave Game</button>
</template>

<script>
import { getFirestore, doc, updateDoc, deleteDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from 'vue-router';

export default {
  name: 'LeaveGameButton',
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async leaveGame() {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const gameId = userDoc.data().gameId;
        const gameDocRef = doc(db, "games", gameId);
        const gameDoc = await getDoc(gameDocRef);

        if (gameDoc.exists()) {
          const gameData = gameDoc.data();
          if (gameData.creatorId === user.uid) {
            // Reassign creator role
            const playersQuery = query(collection(db, "users"), where("gameId", "==", gameId));
            const playersSnapshot = await getDocs(playersQuery);
            let newCreatorId = null;

            playersSnapshot.forEach((playerDoc) => {
              if (playerDoc.id !== user.uid && !newCreatorId) {
                newCreatorId = playerDoc.id;
              }
            });

            if (newCreatorId) {
              await updateDoc(gameDocRef, { creatorId: newCreatorId });
            } else {
              // No players left, delete the game
              await deleteDoc(gameDocRef);
              this.$router.push('/');
            }
          }

          // Delete user from Firestore
          await deleteDoc(userDocRef);
          this.$router.push('/');
        }
      }
    }
  }
}
</script>

<style scoped>
.leave-button {
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

.leave-button:hover {
  background-color: #d32f2f;
}
</style>
