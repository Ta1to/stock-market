<template>
    <div class="players-container">
      <h2 class="players-title">Spieler ({{ players.length }})</h2>
      <div class="players-list">
        <div v-for="player in players" :key="player.uid" class="player-card">
          <div class="player-info">
            <span class="player-name">{{ player.name }}</span>
            <i v-if="player.uid === creator" class="fas fa-crown crown-icon"></i>
          </div>
          <button 
            v-if="isCreator && player.uid !== creator" 
            @click="$emit('remove-player', player.uid)"
            class="remove-player-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PlayerList',
    props: {
      players: {
        type: Array,
        required: true
      },
      creator: {
        type: String,
        required: true
      },
      isCreator: {
        type: Boolean,
        default: false
      }
    }
  }
  </script>
  
  <style scoped>
  .players-container {
    margin: 2rem 0;
  }
  
  .players-title {
    color: var(--text-light);
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .remove-player-btn {
    background: none;
    border: none;
    color: #ff4444;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 50%;
  }
  
  .remove-player-btn:hover {
    background: rgba(255, 68, 68, 0.1);
    transform: scale(1.1);
  }
  
  .player-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  </style>