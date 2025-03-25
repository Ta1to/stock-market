<template>
  <div class="stock-selector">
    <div class="slot-machine">
      <transition-group name="slide" tag="div" class="slot">
        <div :key="displayedStock" class="stock">
          {{ displayedStock }}
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebase';

export default {
  name: 'StockSelector',
  props: {
    gameId: String,
    isCreator: Boolean
  },
  data() {
    return {
      stocks: ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA'],
      displayedStock: 'AAPL',
      spinning: false,
    };
  },
  created() {
    const gameDoc = doc(db, 'games', this.gameId);

    onSnapshot(gameDoc, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        if (data.isSpinning && !this.spinning) {
          this.startSpin(data.selectedStock);
        } else if (!data.isSpinning) {
          this.displayedStock = data.selectedStock;
        }
      }
    });
  },
  methods: {
    async initiateSpin() {
      if (!this.isCreator) return;

      const finalStock = this.stocks[Math.floor(Math.random() * this.stocks.length)];

      await updateDoc(doc(db, 'games', this.gameId), {
        isSpinning: true,
        selectedStock: finalStock,
        lastSpinTime: Date.now()
      });

      setTimeout(async () => {
        await updateDoc(doc(db, 'games', this.gameId), { isSpinning: false });
      }, 3000);
    },
    startSpin(finalStock) {
      this.spinning = true;
      const interval = setInterval(() => {
        this.displayedStock = this.stocks[Math.floor(Math.random() * this.stocks.length)];
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        this.displayedStock = finalStock;
        this.spinning = false;
        this.$emit('stock-selected', finalStock);
      }, 3000);
    }
  }
};
</script>

<style scoped>
.stock-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slot-machine {
  width: 100px;
  height: 100px;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: 100%;
}

.stock {
  width: 100px;
  height: 100px;
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 10px;
}

.spin-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.spin-button:hover {
  background-color: #0056b3;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.1s;
}

.slide-enter, .slide-leave-to {
  transform: translateY(-100%);
}
</style>
