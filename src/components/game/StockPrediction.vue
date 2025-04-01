<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal">
      <h2>Stock Price Prediction</h2>
      <StockChart v-if="stockData" :stockData="limitedStockData" />
      <div v-if="!hasPredicted" class="prediction-input">
        <input
          type="number"
          v-model="prediction"
          placeholder="Enter predicted price"
        />
        <button @click="submitPrediction">Submit</button>
      </div>
      <div v-else class="prediction-submitted">
        <p>Your prediction: ${{ submittedPrediction }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import StockChart from '@/components/StockChart.vue';
import { getLimitedStockData } from '@/utils/stockDataUtils';

export default {
  name: 'StockPrediction',
  components: { StockChart },
  props: {
    visible: Boolean,
    stockData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      prediction: '',
      hasPredicted: false,
      submittedPrediction: null
    };
  },
  computed: {
    limitedStockData() {
      return getLimitedStockData(this.stockData, 3);
    }
  },
  methods: {
    submitPrediction() {
      const predictionValue = parseFloat(this.prediction);
      if (!isNaN(predictionValue)) {
        this.hasPredicted = true;
        this.submittedPrediction = predictionValue;
        this.$emit('submit', predictionValue);
        this.prediction = '';
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  background: #000;
  padding: 32px;
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.prediction-input {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.prediction-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.prediction-input button {
  padding: 8px 16px;
  background-color: #056947;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.prediction-submitted {
  margin-top: 12px;
  padding: 12px;
  background: rgba(5, 105, 71, 0.2);
  border-radius: 4px;
  color: #fff;
}
</style>