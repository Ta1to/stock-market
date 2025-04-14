<template>
  <div class="mini-price-container" v-if="stockData" v-show="!isAnyModalActive">
    <div class="mini-price-label">Current Price:</div>
    <div class="mini-price-value">${{ currentPrice }}</div>
  </div>
</template>

<script>
import { PopupState } from '@/utils/popupEventBus';

export default {
  name: 'MiniPrice',
  props: {
    stockData: {
      type: Object,
      required: true
    }
  },
  computed: {
    isAnyModalActive() {
      return PopupState.isAnyModalActive();
    }, 
    currentPrice() {
      if (this.stockData && this.stockData.prices && this.stockData.prices.length > 0) {
        return this.stockData.prices[this.stockData.prices.length - 1].toFixed(2);
      }
      return "N/A";
    }
  }
};
</script>

<style scoped>
.mini-price-container {
  background: rgba(21, 128, 61, 0.2);
  border: 2px solid rgba(21, 128, 61, 0.5);
  border-radius: 8px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 95;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 170px;
}

.mini-price-label {
  font-size: 0.9rem;
  color: #e0e0e0;
  margin: 0 0 0.3rem 0;
}

.mini-price-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #4ade80;
}

@media (max-width: 768px) {
  .mini-price-container {
    top: 10px;
    right: 10px;
    padding: 0.6rem;
    min-width: 140px;
  }
  
  .mini-price-value {
    font-size: 1.5rem;
  }
}
</style>
