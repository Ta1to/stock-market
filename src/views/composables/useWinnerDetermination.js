import { ref } from 'vue';

export function useWinnerDetermination(gameStore, stockData) {
  const roundWinner = ref(null);
  const roundPot = ref(0);

  function handleWinnerDetermination() {
    // Determine winner based on the active players
    const activePlayers = gameStore.players.filter((p) => !gameStore.folds[p.uid]);
    
    if (activePlayers.length === 1) {
      // Only one player left (others folded)
      roundWinner.value = activePlayers[0];
      // Add pot to winner's chips
      gameStore.addChipsToPlayer(roundWinner.value.uid, gameStore.pot);
    } else {
      // Multiple players remain - determine winner by prediction accuracy
      const currentPrice = stockData.value?.prices[stockData.value.prices.length - 1] || 0;
      
      let closestPlayers = [];
      let smallestDifference = Infinity;
      
      // Find player(s) with closest prediction
      activePlayers.forEach(player => {
        const prediction = gameStore.predictions[player.uid];
        if (prediction !== undefined) {
          const difference = Math.abs(prediction - currentPrice);
          
          // If this player has a better prediction than current best
          if (difference < smallestDifference) {
            smallestDifference = difference;
            closestPlayers = [player]; // Reset the array with only this player
          } 
          // If this player has the same prediction accuracy as current best
          else if (difference === smallestDifference) {
            closestPlayers.push(player); // Add this player to the winners
          }
        }
      });
      
      // If multiple players have the same prediction accuracy (tie)
      if (closestPlayers.length > 1) {
        // Create a combined winner object indicating a tie and listing winners
        roundWinner.value = {
          isTie: true,
          players: closestPlayers,
          // Include a message about the pot being split
          message: `Tie! The pot will be split among ${closestPlayers.length} players.`
        };
        
        // Split the pot equally among tied players
        const splitAmount = Math.floor(gameStore.pot / closestPlayers.length);
        // Distribute chips to each winner
        closestPlayers.forEach(player => {
          gameStore.addChipsToPlayer(player.uid, splitAmount);
        });
      } else if (closestPlayers.length === 1) {
        // Single winner
        roundWinner.value = closestPlayers[0];
        // Add pot to winner's chips
        gameStore.addChipsToPlayer(roundWinner.value.uid, gameStore.pot);
      } else {
        // No winners (should not happen, but handle just in case)
        console.error("No winner could be determined");
      }
    }
    
    // Set the pot amount for display in winner component
    roundPot.value = gameStore.pot;
    
    // Reset the pot for the next round
    gameStore.resetPot();
  }

  return {
    roundWinner,
    roundPot,
    handleWinnerDetermination
  };
}