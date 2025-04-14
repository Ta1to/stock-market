<template>
  <div class="mini-indicators-container" :class="{ expanded: isExpanded }" v-show="!isAnyModalActive">
    <div class="mini-indicators-header" @click="toggleExpand">
      <h3>Technical Indicators</h3>
      <button class="expand-button">
        <i :class="isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
      </button>
    </div>
    
    <div class="mini-indicators-content" v-if="isExpanded">
      <div class="indicator-item" v-if="indicators">
        <div class="indicator-label">RSI (14):</div>
        <div class="indicator-value" :class="getRsiClass(indicators.rsi)">
          {{ indicators.rsi.toFixed(2) }}
        </div>
      </div>
      
      <div class="indicator-item" v-if="indicators">
        <div class="indicator-label">MACD:</div>
        <div class="indicator-value" :class="getMacdClass(indicators.macd.value, indicators.macd.signal)">
          {{ indicators.macd.value.toFixed(2) }}
        </div>
      </div>
      
      <div v-if="usingCalculatedValues" class="calculated-notice">
        * Calculated values 
      </div>
    </div>
  </div>
</template>

<script>
import { PopupState } from '@/utils/popupEventBus';
import { 
  calculateRSI, 
  calculateMACD, 
  extractClosingPrices,
  getRsiClass,
  getMacdClass
} from '@/utils/technicalIndicatorUtils';

export default {
  name: 'MiniIndicators',
  props: {
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
      indicators: null, 
      popupId: 'mini-indicators',
      usingCalculatedValues: false
    };
  },
  computed: {
    isExpanded() {
      return PopupState.isActivePopup(this.popupId);
    }, 
    isAnyModalActive() {
      return PopupState.isAnyModalActive();
    }
  },
  watch: {
    stockData: {
      immediate: true,
      handler() {
        this.loadIndicators();
      }
    },
    roundNumber() {
      this.loadIndicators();
    }
  },
  methods: {
    toggleExpand() {
      if (this.isExpanded) {
        PopupState.deactivatePopup(this.popupId);
      } else {
        PopupState.activatePopup(this.popupId);
      }
    },
    getRsiClass,
    getMacdClass,
    loadIndicators() {
      try {
        if (this.stockData?.technicalIndicators?.rsi !== undefined && 
            this.stockData?.technicalIndicators?.macd?.value !== undefined) {
          
          this.indicators = {
            rsi: this.stockData.technicalIndicators.rsi,
            macd: this.stockData.technicalIndicators.macd
          };
          this.usingCalculatedValues = false;
        } else {
          // if no fetched indicators are available, calculate them
          this.calculateIndicatorsFromHistory();
          this.usingCalculatedValues = true;
        }
      } catch (error) {
        console.error('Error loading indicators:', error);
        // fallback to calculated indicators
        this.calculateIndicatorsFromHistory();
        this.usingCalculatedValues = true;
      }
    },
    calculateIndicatorsFromHistory() {
      // first check if we have historical price data
      if (!this.stockData?.history || !Array.isArray(this.stockData.history) || this.stockData.history.length < 30) {
        if (this.stockData?.prices && this.stockData.prices.length >= 14) {
          this.calculateIndicatorsFromPrices(this.stockData.prices);
          return;
        }
        
        this.setDefaultIndicators();
        return;
      }
      
      const closingPrices = extractClosingPrices(this.stockData.history);
      
      if (closingPrices.length < 14) {
        this.setDefaultIndicators();
        return;
      }
      
      this.calculateIndicatorsFromPrices(closingPrices);
    },
    calculateIndicatorsFromPrices(prices) {
      const rsi = calculateRSI(prices);
      
      const macdResult = calculateMACD(prices);
      
      this.indicators = {
        rsi,
        macd: {
          value: macdResult.macd,
          signal: macdResult.signal,
          histogram: macdResult.histogram
        }
      };
    },
    setDefaultIndicators() {
      this.indicators = {
        rsi: 50,
        macd: {
          value: 0,
          signal: 0,
          histogram: 0
        }
      };
    }
  },
  mounted() {
    this.loadIndicators();
  }, 
  beforeUnmount() {
    if (this.isExpanded) {
      PopupState.deactivatePopup(this.popupId);
    }
  }
};
</script>

<style scoped>
.mini-indicators-container {
  position: fixed;
  top: 160px;
  left: 20px;
  background: rgba(17, 24, 39, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 98;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 215, 0, 0.2);
  width: 280px;
  overflow: hidden;
}

.mini-indicators-container.expanded {
  height: auto;
  background: rgba(17, 24, 39, 0.98);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.mini-indicators-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.mini-indicators-header h3 {
  margin: 0;
  color: #ffd700;
  font-size: 1rem;
}

.expand-button {
  background: none;
  border: none;
  color: #ffd700;
  cursor: pointer;
  padding: 4px;
}

.mini-indicators-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.indicator-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.indicator-label {
  color: #d1d5db;
  font-size: 0.85rem;
}

.indicator-value {
  font-weight: bold;
  font-size: 0.9rem;
}

.overbought {
  color: #ef4444;
}

.oversold {
  color: #10b981;
}

.bullish {
  color: #10b981; 
}

.weak-bullish {
  color: #7acea3; 
}

.bearish {
  color: #ef4444; 
}

.weak-bearish {
  color: #f1a3a3; 
}

.neutral {
  color: #ffd700;
}

.calculated-notice {
  font-size: 0.75rem;
  color: rgba(255, 215, 0, 0.7);
  font-style: italic;
  text-align: center;
  margin-top: 8px;
  padding: 4px;
  border-top: 1px dashed rgba(255, 215, 0, 0.3);
}

@media (max-width: 768px) {
  .mini-indicators-container {
    width: 240px;
  }
  
  .mini-indicators-header h3 {
    font-size: 0.9rem;
  }
  
  .indicator-label {
    font-size: 0.8rem;
  }
  
  .indicator-value {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .mini-indicators-container {
    width: 200px;
    left: 10px;
    top: 140px;
  }
  
  .mini-indicators-content {
    padding: 8px;
    gap: 6px;
  }
  
  .indicator-item {
    padding: 6px;
  }
}

@media (max-width: 360px) {
  .mini-indicators-container {
    width: 90%;
    max-width: 250px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>