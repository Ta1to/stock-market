<template>
  <div class="stock-selector">
    <div class="slot-machine">
      <transition-group name="slide" tag="div" class="slot">
        <div v-for="(stock, index) in displayedStocks" :key="index" class="stock">
          {{ stock }}
        </div>
      </transition-group>
    </div>
    <button @click="spin" class="spin-button">Spin</button>
  </div>
</template>

<script>
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebase';

export default {
  name: 'StockSelector',
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      stocks: ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA'],
      displayedStocks: ['AAPL'],
      selectedStock: ''
    };
  },
  created() {
    const gameDoc = doc(db, 'games', this.gameId);
    onSnapshot(gameDoc, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.displayedStocks = [data.selectedStock];
        this.selectedStock = data.selectedStock;
      }
    });
  },
  methods: {
    spin() {
      const interval = setInterval(() => {
        this.displayedStocks = [this.stocks[Math.floor(Math.random() * this.stocks.length)]];
      }, 100);

      setTimeout(async () => {
        clearInterval(interval);
        this.selectedStock = this.displayedStocks[0];
        await updateDoc(doc(db, 'games', this.gameId), {
          selectedStock: this.selectedStock
        });
        this.$emit('stock-selected', this.selectedStock);
      }, 3000); // Spin for 3 seconds
    }
  }
}
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
