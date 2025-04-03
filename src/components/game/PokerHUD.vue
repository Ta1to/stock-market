<template>
  <div class="poker-hud" :class="{ 'my-turn': isMyTurn, 'disabled': isBettingDisabled }">
    <div class="hud-top">
      <div class="chip-stack">
        <div class="chip gold"></div>
        <div class="chip gold" style="transform: translateY(-5px)"></div>
        <div class="chip gold" style="transform: translateY(-10px)"></div>
        <div class="chip-count">{{ coins }}</div>
      </div>
    </div>
    
    <div class="hud-middle">
      <div class="bet-slider">
        <label for="betAmount">
          <i class="fas fa-coins"></i> 
          <span>Bet Amount</span>
        </label>
        <div class="bet-controls">
          <button @click="decrementBet" class="bet-btn" :disabled="betAmount <= 0">
            <i class="fas fa-minus-circle"></i>
          </button>
          <input 
            id="betAmount" 
            type="number" 
            v-model.number="betAmount" 
            min="0" 
            :max="coins" 
            class="bet-input"
          />
          <button @click="incrementBet" class="bet-btn" :disabled="betAmount >= coins">
            <i class="fas fa-plus-circle"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="hud-bottom">
      <button 
        :disabled="!isMyTurn || isBettingDisabled" 
        @click="bet" 
        class="poker-button bet-button"
      >
        <i class="fas fa-coins"></i> Bet
      </button>
      <button 
        :disabled="!isMyTurn || isBettingDisabled" 
        @click="check" 
        class="poker-button check-button"
      >
        <i class="fas fa-check"></i> Check
      </button>
      <button 
        :disabled="!isMyTurn || isBettingDisabled" 
        @click="fold" 
        class="poker-button fold-button"
      >
        <i class="fas fa-times"></i> Fold
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PokerHUD",
  props: {
    coins: {
      type: Number,
      required: true,
    },
    isMyTurn: {
      type: Boolean,
      default: false,
    },
    isBettingDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      betAmount: 0,
    };
  },
  methods: {
    bet() {
      if (this.betAmount > 0 && this.betAmount <= this.coins) {
        this.$emit("bet-placed", this.betAmount);
        this.betAmount = 0;
      } else {
        console.log("Invalid bet amount.");
      }
    },
    check() {
      this.$emit("check");
    },
    fold() {
      this.$emit("fold");
    },
    incrementBet() {
      if (this.betAmount < this.coins) {
        this.betAmount += 10;
        if (this.betAmount > this.coins) {
          this.betAmount = this.coins;
        }
      }
    },
    decrementBet() {
      if (this.betAmount > 0) {
        this.betAmount -= 10;
        if (this.betAmount < 0) {
          this.betAmount = 0;
        }
      }
    }
  },
};
</script>

<style scoped>
.poker-hud {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  width: 450px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, #16213e, #0f0f1a);
  color: #fff;
  border-radius: 16px;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 215, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
}

.poker-hud.my-turn {
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.6),
    0 0 0 2px rgba(255, 215, 0, 0.8),
    0 0 20px rgba(255, 215, 0, 0.5);
  animation: pulse 2s infinite;
}

.poker-hud.disabled {
  opacity: 0.7;
}

@keyframes pulse {
  0% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.7); }
  100% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5); }
}

.hud-top, .hud-middle, .hud-bottom {
  display: flex;
  justify-content: center;
  width: 100%;
}

.chip-stack {
  position: relative;
  height: 60px;
  width: 150px;
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.chip {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px dashed white;
  background: radial-gradient(circle at center, #ffd700 0%, #b8860b 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.chip-count {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 10px;
  z-index: 2;
}

.bet-slider {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.bet-slider label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffd700;
  font-weight: bold;
  font-size: 16px;
}

.bet-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bet-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  padding: 10px;
  color: white;
  font-size: 18px;
  text-align: center;
}

.bet-input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.bet-btn {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bet-btn:hover:not(:disabled) {
  transform: scale(1.1);
  color: white;
}

.bet-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hud-bottom {
  display: flex;
  gap: 12px;
}

.poker-button {
  flex: 1;
  padding: 14px 0;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.bet-button {
  background: linear-gradient(135deg, #059669, #065f46);
  color: white;
}

.check-button {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
}

.fold-button {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
}

.poker-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.poker-button:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.poker-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive styling */
@media (max-width: 480px) {
  .poker-hud {
    width: 95%;
    padding: 15px;
    bottom: 15px;
  }
  
  .poker-button {
    padding: 10px 0;
    font-size: 14px;
  }
  
  .bet-input {
    padding: 8px;
    font-size: 16px;
  }
}
</style>
