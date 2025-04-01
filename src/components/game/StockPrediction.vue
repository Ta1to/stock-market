<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal">
      <h2>Stock Price Prediction</h2>
      <!-- Chart for the selected stock -->
      <StockChart v-if="stockData" :stockData="getLimitedStockData" />
      <!-- Prediction input -->
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

export default {
  name: "StockPrediction",
  components: { StockChart },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    stockData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      prediction: "",
      hasPredicted: false,
      submittedPrediction: null,
    };
  },
  computed: {
    getLimitedStockData() {
      if (!this.stockData?.dates || !this.stockData?.prices) return null;
        const cuttoffIndexDate = -2; 
        const cuttoffIndexPrice = -5;
      return {

        dates: this.stockData.dates.slice(0, cuttoffIndexDate),
        // show stock pirce only 2 months before today 
        prices: this.stockData.prices.slice(0, cuttoffIndexPrice)
      };
    }
  },
  methods: {
    submitPrediction() {
      const predictionValue = parseFloat(this.prediction);
      if (!isNaN(predictionValue)) {
        this.hasPredicted = true;
        this.submittedPrediction = predictionValue;
        this.$emit("submit", predictionValue);
        this.reset();
      } else {
        console.error("Invalid prediction value");
      }
    },
    reset() {
      this.prediction = "";
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #000;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
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

.prediction-submitted p {
  margin: 0;
  font-size: 1.1em;
}
</style>