<template>
  <div v-if="visible" class="winner-popup-overlay">
    <div class="winner-popup">
      <div class="winner-header">
        <h2 class="winner-title">Round {{ roundNumber }} Winner!</h2>
      </div>
      <div class="winner-content">
        <div class="winner-avatar">
          <i class="fas fa-crown winner-crown"></i>
          <div class="winner-name">{{ winner?.name || winner?.id }}</div>
        </div>
        <div class="winner-message">
          <p>Won the round and <span class="pot-amount">{{ pot }} chips</span> from the pot!</p>
        </div>
      </div>
      <div class="winner-actions">
        <button @click="handleContinue" class="continue-btn">
          Continue to {{ isLastRound ? 'Final Results' : 'Next Round' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoundWinner',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    winner: {
      type: Object,
      required: true
    },
    roundNumber: {
      type: Number,
      required: true
    },
    pot: {
      type: Number,
      required: true
    },
    totalRounds: {
      type: Number,
      default: 3
    }
  },
  computed: {
    isLastRound() {
      return this.roundNumber >= this.totalRounds;
    }
  },
  methods: {
    handleContinue() {
      this.$emit('continue');
    }
  }
}
</script>

<style scoped>
.winner-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.winner-popup {
  background: linear-gradient(135deg, #1f1f3d 0%, #0c0c1d 100%);
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(0, 0, 0, 0.6);
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  color: #e0e0e0;
  text-align: center;
  border: 2px solid #ffd700;
  animation: slideIn 0.4s ease-out;
}

.winner-header {
  margin-bottom: 1.5rem;
}

.winner-title {
  color: #ffd700;
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.winner-content {
  padding: 1rem 0 2rem;
}

.winner-avatar {
  position: relative;
  margin-bottom: 1.5rem;
}

.winner-crown {
  font-size: 3rem;
  color: #ffd700;
  margin-bottom: 0.5rem;
  animation: shine 2s infinite;
}

.winner-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.winner-message {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.pot-amount {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.3rem;
}

.continue-btn {
  background: linear-gradient(to right, #ffd700, #ffa500);
  border: none;
  color: #000;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
}

.continue-btn:active {
  transform: translateY(1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    transform: translateY(-50px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shine {
  0% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
}

@media (max-width: 768px) {
  .winner-popup {
    width: 95%;
    padding: 1.5rem;
  }
  
  .winner-title {
    font-size: 1.6rem;
  }
  
  .winner-crown {
    font-size: 2.5rem;
  }
  
  .winner-name {
    font-size: 1.5rem;
  }
  
  .winner-message {
    font-size: 1rem;
  }
  
  .continue-btn {
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
  }
}
</style>