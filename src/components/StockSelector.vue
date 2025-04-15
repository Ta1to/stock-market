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
import { ref, onValue, get } from "firebase/database";
import { db } from '@/api/firebase-api';
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
      countdown: 5,
      preSelectedStock: null
    };
  },
  created() {
    this.setupListener();
  },
  watch: {
    roundNumber() {
      // Reset local state for next round
      this.stockSelected = false;
      this.countdown = 5;
      this.spinning = false;
      this.displayedStock = this.$options.data().displayedStock;
      // Re-setup listener for the new round
      this.setupListener();
    },
    visible(newVal) {
      if (newVal) {
        this.setupListener();
      }
    }
  },
  methods: {
    setupListener() {
      const roundRef = ref(db, `games/${this.gameId}/rounds/${this.roundNumber}`);
      
      // First get the pre-selected stock from the database
      get(roundRef).then((snapshot) => {
        const data = snapshot.val();
        
        if (data?.stocks && data.stocks.length > 0) {
          this.preSelectedStock = data.stocks[0];
        } else {
          console.warn('No stocks found in the database for this round');
        }
      }).catch(error => {
        console.error('Error getting round data:', error);
      });
      
      onValue(roundRef, (snapshot) => {
        const data = snapshot.val();
        
        // If we have no data for this round yet, we need to initialize it for spinning
        if (!data && this.isCreator) {
          updateData(`games/${this.gameId}/rounds/${this.roundNumber}`, {
            phase: 1,
            isSpinning: false
          });
        }
        
        // Update preSelectedStock from onValue as well in case it changed
        if (data?.stocks && data.stocks.length > 0 && !this.preSelectedStock) {
          this.preSelectedStock = data.stocks[0];
        }
        
        if (data?.isSpinning && !this.spinning) {
          this.startSpinAnimation();
        } else if (!data?.isSpinning && this.spinning) {
          // Only pass the stock info needed for display, not the full object
          this.stopSpinAnimation();
        }
      });
    },

    async initiateSpin() {
      
      if (!this.isCreator || !this.preSelectedStock) {
        console.warn('Cannot initiate spin: either not creator or no stock data available');
        return;
      }
      
      try {
        // Only update the spinning state, not the stock data
        await updateData(`games/${this.gameId}/rounds/${this.roundNumber}`, {
          isSpinning: true
        });

        setTimeout(async () => {
          await updateData(`games/${this.gameId}/rounds/${this.roundNumber}`, {
            isSpinning: false
          });
        }, 3000);
      } catch (error) {
        console.error('Error initiating spin:', error);
      }
    },

    startSpinAnimation() {
      this.spinning = true;
      this.spinInterval = setInterval(() => {
        //rotation through stocklist 
        this.currentIndex = (this.currentIndex + 1) % stockList.length;
        this.displayedStock = stockList[this.currentIndex];
      }, 100);
    },

    stopSpinAnimation() {
      clearInterval(this.spinInterval);
      this.spinning = false;
      
      // Use the pre-selected stock if available
      if (this.preSelectedStock) {
        this.displayedStock = {
          name: this.preSelectedStock.name,
          symbol: this.preSelectedStock.symbol
        };
      } else {
        this.displayedStock = stockList[0];
      }
      
      this.stockSelected = true;
      this.$emit('stock-selected', this.displayedStock);
      this.startCountdown();
    }, 
    startCountdown() {
      this.countdown = 5;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
          this.stockSelected = false;
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