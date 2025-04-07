<template>
  <div class="game-winner-overlay" v-if="visible">
    <div class="game-winner-container">
      <h2 class="winner-title">Game Over</h2>
      
      <div class="countdown-timer">
        Returning to lobby in {{ countdown }} seconds
      </div>
      
      <div class="final-results">
        <h3>Final Results</h3>
        
        <!-- Podium visualization -->
        <div class="podium-container">
          <!-- Second place -->
          <div class="podium-place second-place" v-if="sortedPlayers.length > 1">
            <div class="player-avatar">
              <span class="player-initial">{{ getInitial(sortedPlayers[1].name) }}</span>
            </div>
            <div class="player-name">{{ sortedPlayers[1].name }}</div>
            <div class="player-chips">{{ sortedPlayers[1].chips }} chips</div>
            <div class="podium-block second">2</div>
          </div>
          
          <!-- First place (winner) -->
          <div class="podium-place first-place">
            <div class="winner-crown">👑</div>
            <div class="player-avatar winner">
              <span class="player-initial">{{ getInitial(sortedPlayers[0].name) }}</span>
            </div>
            <div class="player-name">{{ sortedPlayers[0].name }}</div>
            <div class="player-chips">{{ sortedPlayers[0].chips }} chips</div>
            <div class="podium-block first">1</div>
          </div>
          
          <!-- Third place -->
          <div class="podium-place third-place" v-if="sortedPlayers.length > 2">
            <div class="player-avatar">
              <span class="player-initial">{{ getInitial(sortedPlayers[2].name) }}</span>
            </div>
            <div class="player-name">{{ sortedPlayers[2].name }}</div>
            <div class="player-chips">{{ sortedPlayers[2].chips }} chips</div>
            <div class="podium-block third">3</div>
          </div>
        </div>
        
        <!-- List of all other players -->
        <div class="other-players" v-if="sortedPlayers.length > 3">
          <h4>Other Players</h4>
          <div class="player-list">
            <div v-for="(player, index) in sortedPlayers.slice(3)" :key="player.uid" class="player-item">
              <span class="player-rank">{{ index + 4 }}</span>
              <span class="player-name">{{ player.name }}</span>
              <span class="player-chips">{{ player.chips }} chips</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="winner-message">
        {{ winnerMessage }}
      </div>
      
      <button class="return-button" @click="returnToLobby">
        Return to Lobby
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'GameWinner',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    players: {
      type: Array,
      required: true
    },
    gameId: {
      type: String,
      required: true
    },
    onGameEnd: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();
    const countdown = ref(30);
    let countdownTimer = null;

    const sortedPlayers = computed(() => {
      return [...props.players].sort((a, b) => b.chips - a.chips);
    });

    const winnerMessage = computed(() => {
      if (!sortedPlayers.value.length) return '';
      
      const winner = sortedPlayers.value[0];
      const runnerUp = sortedPlayers.value.length > 1 ? sortedPlayers.value[1] : null;
      
      if (runnerUp && winner.chips - runnerUp.chips < 50) {
        return `${winner.name} wins by a narrow margin!`;
      } else {
        return `${winner.name} dominates the table as the ultimate Stock Poker champion!`;
      }
    });

    const getInitial = (name) => {
      return name ? name.charAt(0).toUpperCase() : '?';
    };

    const startCountdown = () => {
      if (countdownTimer) clearInterval(countdownTimer);
      
      countdown.value = 30;
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(countdownTimer);
          returnToLobby();
        }
      }, 1000);
    };

    const returnToLobby = () => {
      if (countdownTimer) clearInterval(countdownTimer);
      props.onGameEnd();
      router.push('/');
    };

    watch(() => props.visible, (newValue) => {
      if (newValue) {
        startCountdown();
      } else if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    });

    onMounted(() => {
      if (props.visible) {
        startCountdown();
      }
    });

    return {
      countdown,
      sortedPlayers,
      winnerMessage,
      getInitial,
      returnToLobby
    };
  }
}
</script>

<style scoped>
.game-winner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease-out;
}

.game-winner-container {
  background: linear-gradient(145deg, #16213e, #0f0f1a);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 900px;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3), 0 0 50px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: #e0e0e0;
  border: 1px solid rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.winner-title {
  font-size: 2.5rem;
  color: #ffd700;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  font-weight: 900;
  letter-spacing: 2px;
}

.countdown-timer {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.final-results h3 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #e0e0e0;
}

.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 2rem 0;
  height: 280px;
  position: relative;
}

.podium-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.podium-block {
  color: #16213e;
  font-weight: bold;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.first {
  background: linear-gradient(to top, #ffd700, #ffec80);
  height: 120px;
}

.second {
  background: linear-gradient(to top, #c0c0c0, #e6e6e6);
  height: 90px;
}

.third {
  background: linear-gradient(to top, #cd7f32, #e9be93);
  height: 60px;
}

.player-avatar {
  width: 60px;
  height: 60px;
  background: #16213e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  margin-bottom: 50px;
  border: 2px solid #344675;
}

.player-avatar.winner {
  background: #16213e;
  border: 3px solid #ffd700;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.winner-crown {
  font-size: 1.8rem;
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  animation: float 3s ease-in-out infinite;
}

.player-initial {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e0e0e0;
}

.player-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  position: absolute;
  bottom: 140px;
}

.player-chips {
  font-size: 0.9rem;
  color: #ffd700;
  background: rgba(0, 0, 0, 0.3);
  padding: 3px 8px;
  border-radius: 10px;
  position: absolute;
  bottom: 120px;
}

.first-place .player-chips {
  font-weight: bold;
}

.first-place {
  z-index: 3;
}

.second-place {
  z-index: 2;
}

.third-place {
  z-index: 1;
}

.other-players {
  margin-top: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.other-players h4 {
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: rgba(22, 33, 62, 0.5);
  border-radius: 8px;
}

.player-rank {
  background: #16213e;
  color: #e0e0e0;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 0.8rem;
}

.winner-message {
  font-size: 1.2rem;
  margin: 1.5rem 0;
  color: #e0e0e0;
  font-style: italic;
}

.return-button {
  background: linear-gradient(to right, #ffd700, #ffb700);
  color: #16213e;
  font-weight: bold;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  margin-top: 1rem;
}

.return-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.return-button:active {
  transform: translateY(1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  50% {
    transform: translateY(-10px) translateX(-50%);
  }
}

@media (max-width: 768px) {
  .podium-container {
    height: 230px;
  }
  
  .podium-block {
    width: 80px;
  }
  
  .first {
    height: 100px;
  }
  
  .second {
    height: 75px;
  }
  
  .third {
    height: 50px;
  }
  
  .player-avatar {
    width: 50px;
    height: 50px;
    margin-bottom: 40px;
  }
  
  .player-initial {
    font-size: 1.2rem;
  }
  
  .player-name {
    font-size: 0.9rem;
    max-width: 80px;
    bottom: 115px;
  }
  
  .player-chips {
    font-size: 0.8rem;
    bottom: 95px;
  }
}

@media (max-width: 480px) {
  .podium-container {
    height: 200px;
  }
  
  .podium-block {
    width: 60px;
  }
  
  .first {
    height: 80px;
  }
  
  .second {
    height: 60px;
  }
  
  .third {
    height: 40px;
  }
  
  .player-avatar {
    width: 40px;
    height: 40px;
    margin-bottom: 30px;
  }
  
  .player-initial {
    font-size: 1rem;
  }
  
  .player-name {
    font-size: 0.8rem;
    max-width: 60px;
    bottom: 90px;
  }
  
  .player-chips {
    font-size: 0.7rem;
    bottom: 75px;
  }
  
  .winner-title {
    font-size: 1.8rem;
  }
}
</style>
