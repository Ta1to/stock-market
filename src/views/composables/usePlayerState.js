import { computed } from 'vue';

export function usePlayerState(currentUser, gameStore) {
  // Determine if current user is the creator
  const isCreator = computed(() => 
    currentUser.value?.uid === gameStore.creator
  );

  // Determine if it's the current user's turn
  const isMyTurn = computed(() => {
    if (!currentUser.value || !gameStore.players.length) {
      return false;
    }
    const currentPlayer = gameStore.players[gameStore.currentTurnIndex];
    return currentUser.value.uid === currentPlayer?.uid;
  });

  // Get current user's chip count
  const currentUserChips = computed(() => {
    if (!currentUser.value || !gameStore.players.length) return 0;
    const player = gameStore.players.find(p => p.uid === currentUser.value.uid);
    return player ? player.chips : 0;
  });

  // Get current turn player's data
  const currentTurnPlayer = computed(() => {
    if (!gameStore.players.length) return {};
    return gameStore.players[gameStore.currentTurnIndex];
  });

  // Determine if betting is disabled in the current phase
  const bettingDisabled = computed(() => {
    // Betting is only allowed in phases 3, 5, 7, and 9 (the betting phases)
    return gameStore.currentPhase !== 3 && 
           gameStore.currentPhase !== 5 && 
           gameStore.currentPhase !== 7 && 
           gameStore.currentPhase !== 9;
  });

  return {
    isCreator,
    isMyTurn,
    currentUserChips,
    currentTurnPlayer,
    bettingDisabled
  };
}