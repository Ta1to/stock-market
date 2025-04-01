<template>
  <button @click="leaveGame" class="leave-button">Leave Game</button>
</template>

<script>
import { getDatabase, ref, get, update, remove, query, orderByChild, equalTo } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useRouter } from "vue-router";

export default {
  name: "LeaveGameButton",
  setup() {
    const router = useRouter();
    const db = getDatabase();
    const auth = getAuth();

    async function leaveGame() {
      console.log("Leaving game...");
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in.");
        return;
      }

      // Get the user's document from 'users' node.
      const userRef = ref(db, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        console.error("User document does not exist.");
        return;
      }
      
      const gameId = userSnapshot.val().gameId;
      if (!gameId) {
        console.log("User is not in a game.");
        router.push("/");
        return;
      }

      // Get the game document.
      const gameRef = ref(db, `games/${gameId}`);
      const gameSnapshot = await get(gameRef);
      if (!gameSnapshot.exists()) {
        console.log("Game not found.");
        router.push("/");
        return;
      }
      const gameData = gameSnapshot.val();

      // If the user is the creator, try to reassign the creator role.
      if (gameData.creatorId === user.uid) {
        // Query all users with the same gameId.
        const playersQuery = query(ref(db, "users"), orderByChild("gameId"), equalTo(gameId));
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
          // No other players remain; delete the game.
          await remove(gameRef);
          router.push("/");
          return;
        }
      }

      // Remove the game membership from the user's document (set gameId to null).
      await update(userRef, { gameId: null });
      router.push("/");
    }

    return { leaveGame };
  },
};
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
