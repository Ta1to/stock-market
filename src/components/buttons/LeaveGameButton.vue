<template>
  <button @click="leaveGame" class="leave-button">Leave Game</button>
</template>

<script>
import { getDatabase, ref, get, update, remove, query, orderByChild, equalTo } from "firebase/database";
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
      const db = getDatabase();

      if(!user) {
        console.log("No user logged in.");
        return;
      }

      const userRef = ref(db, `users/${user.uid}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const gameId = userSnapshot.val().gameId;
        const gameRef = ref(db, `games/${gameId}`);
        const gameSnapshot = await get(gameRef);

        if (gameSnapshot.exists()) {
          const gameData = gameSnapshot.val();

          if (gameData.creatorId === user.uid) {
            // Reassign creator role
            const playersQuery = query(ref(db, 'users'), orderByChild('gameId'), equalTo(gameId));
            const playersSnapshot = await get(playersQuery);

            let newCreatorId = null;

            playersSnapshot.forEach((playerSnapshot) => {
              if (playerSnapshot.key !== user.uid && !newCreatorId) {
                newCreatorId = playerSnapshot.key;
              }
            });

            if (newCreatorId) {
              await update(gameRef, { creatorId: newCreatorId });
            } else {
              // No players left, delete the game
              await remove(gameRef);
              this.$router.push('/');
              return;
            }
          }

          // Remove the user from the game
          await remove(userRef);
          this.$router.push('/');
        }
      } else {
        console.error("User document does not exist.");
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
