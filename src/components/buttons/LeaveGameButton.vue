<template>
  <button @click="leaveGame" class="leave-button">
    <i class="fas fa-sign-out-alt"></i>
    <span>Leave</span>
  </button>
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
  position: fixed;
  top: 15px;
  right: 15px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  max-width: fit-content;
}

.leave-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.leave-button:active {
  transform: translateY(1px);
}

@media (max-width: 480px) {
  .leave-button {
    top: 10px;
    right: 10px;
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .leave-button span {
    display: none;
  }
}
</style>
