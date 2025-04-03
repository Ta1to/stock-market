<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal">
      <h2 class="modal-title">Stock Price Prediction</h2>

      <!-- Company Info Section -->
      <div class="company-info" v-if="stockData">
        <div class="info-section">
          <h3>About the Company</h3>
          <p class="description">{{ getCompanyInfo.description }}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Sector:</span>
            <span class="value">{{ getCompanyInfo.sector }}</span>
          </div>
          <div class="info-item">
            <span class="label">Industry:</span>
            <span class="value">{{ getCompanyInfo.industry }}</span>
          </div>
        </div>
      </div>

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
    },
    roundNumber: {
      type: Number,
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
    },
    getCompanyInfo() {
      return {
        name: this.stockData?.name || 'Unknown Company',
        description: this.stockData?.description || 'No description available',
        sector: this.stockData?.sector || 'N/A', 
        industry: this.stockData?.industry || 'N/A'
      };
    }
  },
  watch: {
    // Reset prediction state when round changes
    roundNumber() {
      this.prediction = '';
      this.hasPredicted = false;
      this.submittedPrediction = null;
      console.log('StockPrediction reset for new round:', this.roundNumber);
    },
    // Also reset when visibility changes
    visible(newVal) {
      if (newVal) {
        this.prediction = '';
        this.hasPredicted = false;
        this.submittedPrediction = null;
      }
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
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  background: rgb(17, 24, 39);
  padding: 2rem;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #ffd700;
}

.company-info {
  margin-bottom: 2rem;
  text-align: left;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h3 {
  color: #ffd700;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.description {
  line-height: 1.6;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.label {
  color: #ffd700;
  font-weight: 500;
  margin-right: 0.5rem;
}

.value {
  color: #e0e0e0;
}

.prediction-input {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.prediction-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.prediction-input button {
  padding: 8px 16px;
  background-color: #ffd700;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.prediction-submitted {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 4px;
  color: #ffd700;
}

@media (max-width: 768px) {
  .modal {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>