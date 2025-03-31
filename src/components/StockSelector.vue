<template>
  <div v-if="visible" class="modal-overlay">
    <div class="stock-selector">
      <div class="slot-machine" :class="{ spinning }">
        <div class="stock" :class="{ final: !spinning }">
          {{ displayedStock.name }} ({{ displayedStock.symbol }})
        </div>
      </div>
      <div v-if="stockSelected" class="countdown">
        Countdown {{ countdown }} 
      </div>
      <button 
        v-if="isCreator && !spinning && !stockSelected" 
        class="spin-button"
        @click="initiateSpin"
      >
        Aktie auswählen
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onValue } from "firebase/database";
import { db } from '@/api/firebase';
import { stockList } from '@/utils/stock-list';
import { updateData } from '@/services/database';

export default {
  name: 'StockSelector',
  props: {
    visible: Boolean,
    gameId: String,
    roundNumber: Number,
    isCreator: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      displayedStock: stockList[0],
      spinning: false,
      spinInterval: null, 
      currentIndex: 0, 
      stockSelected: false,
      countdown: 5
    };
  },
  created() {
    console.log('StockSelector created with gameId:', this.gameId, 'round:', this.roundNumber);
    this.setupListener();
  },
  methods: {
    setupListener() {
      const roundRef = ref(db, `games/${this.gameId}/rounds/${this.roundNumber}`);
      onValue(roundRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Round data:', data);
        
        if (data?.isSpinning && !this.spinning) {
          this.startSpinAnimation();
        } else if (!data?.isSpinning && this.spinning) {
          this.stopSpinAnimation(data?.selectedStock?.symbol);
        }
      });
    },

    async initiateSpin() {
      if (!this.isCreator) return;
      console.log('Initiating spin...');

      const randomStock = stockList[Math.floor(Math.random() * stockList.length)];
      try {
        await updateData(`games/${this.gameId}/rounds/${this.roundNumber}`, {
          isSpinning: true,
          selectedStock: randomStock
        });

        setTimeout(async () => {
          await updateData(`games/${this.gameId}/rounds/${this.roundNumber}`, {
            isSpinning: false,
            selectedStock: randomStock
          });
        }, 3000);
      } catch (error) {
        console.error('Error initiating spin:', error);
      }
    },

    startSpinAnimation() {
      console.log('Starting spin animation');
      this.spinning = true;
      this.spinInterval = setInterval(() => {
        //rotation through stocklist 
        this.currentIndex = (this.currentIndex + 1) % stockList.length;
        this.displayedStock = stockList[this.currentIndex];
      }, 100);
    },

    stopSpinAnimation(finalStock) {
      console.log('Stopping spin animation with stock:', finalStock);
      clearInterval(this.spinInterval);
      this.spinning = false;
      const stock = stockList.find(s => s.symbol === finalStock) || stockList[0];
      this.displayedStock = stock;
      this.stockSelected = true;
      this.$emit('stock-selected', stock);
      this.startCountdown();
    }, 
    startCountdown() {
      this.countdown = 5;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
          this.$emit('phase-complete');
        }
      }, 1000);
    }
  },
  beforeUnmount() {
    if (this.spinInterval) {
      clearInterval(this.spinInterval);
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.stock-selector {
  background: linear-gradient(145deg, #16213e, #0f0f1a);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 215, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.slot-machine {
  width: 300px;
  height: 100px;
  background: linear-gradient(145deg, #16213e, #0f0f1a);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock {
  font-size: 1.5rem; 
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  padding: 0 1rem;
}

.spinning .stock {
  animation: spin 0.1s infinite;
}

.final {
  animation: pop 0.5s ease-out;
}

.spin-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem; 
  position: relative;
  z-index: 10000;
}

.spin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
}

.countdown {
  color: #ffd700;
  font-size: 1.2rem;
  margin-top: 1rem;
  text-align: center;
}

@keyframes spin {
  0% { transform: translateY(-100%); opacity: 0; }
  50% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>