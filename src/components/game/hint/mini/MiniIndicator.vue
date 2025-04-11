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
        <div class="indicator-value" :class="getMacdClass()">
          {{ indicators.macd.value.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PopupState } from '@/utils/popupEventBus';

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
      popupId: 'mini-indicators'
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
    getRsiClass(rsi) {
      if (rsi > 70) return 'overbought';
      if (rsi < 30) return 'oversold';
      return 'neutral';
    },
    getMacdClass() {
      if (!this.indicators) return '';
      const macdValue = this.indicators.macd.value;
      const signalValue = this.indicators.macd.signal;
      
      // Strong bullish: Positive MACD and above signal line
      if (macdValue > 0 && macdValue > signalValue) return 'bullish';
      
      // Weak bullish: Negative MACD but crossing above signal line (momentum changing)
      if (macdValue <= 0 && macdValue > signalValue) return 'weak-bullish';
      
      // Weak bearish: Positive MACD but crossing below signal line (momentum weakening)
      if (macdValue > 0 && macdValue <= signalValue) return 'weak-bearish';
      
      // Strong bearish: Negative MACD and below signal line
      return 'bearish';
    },
    loadIndicators() {
      try {
        console.log("MiniIndicator: Loading indicators from fetched data");
        if (this.stockData?.technicalIndicators) {
          this.indicators = {
            rsi: this.stockData.technicalIndicators.rsi,
            macd: this.stockData.technicalIndicators.macd
          };
          console.log("MiniIndicator: Loaded indicators:", this.indicators);
        } else {
          console.warn("No technical indicators available for", this.stockData?.symbol);
        }
      } catch (error) {
        console.error('Error loading indicators:', error);
      }
    }
  },
  mounted() {
    console.log("MiniIndicator component mounted");
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
  color: #10b981; /* Strong green for bullish */
}

.weak-bullish {
  color: #7acea3; /* Lighter green for weak bullish */
}

.bearish {
  color: #ef4444; /* Strong red for bearish */
}

.weak-bearish {
  color: #f1a3a3; /* Lighter red for weak bearish */
}

.neutral {
  color: #ffd700;
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