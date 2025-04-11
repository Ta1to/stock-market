<template>
  <div v-if="visible">
    <div class="blur-background"></div>
    <div class="modal-overlay">
      <div class="indicators-popup">
        <div class="indicators-header">
          <h2>Technical Indicators - {{ stockData.name }} ({{ stockData.symbol }})</h2>
          <div class="countdown" v-if="countdown > 0">{{ countdown }}s</div>
        </div>

        <div class="indicators-content">
          <div v-if="indicators && indicators.rsi !== null && indicators.macd !== null" class="indicators-grid">
            <!-- RSI Indicator -->
            <div class="indicator-card">
              <h3>RSI (Relative Strength Index)</h3>
              <div class="indicator-value" :class="getRsiClass(indicators.rsi)">
                {{ indicators.rsi.toFixed(2) }}
              </div>
              <div class="indicator-description">
                <p>Measures the speed and change of price movements. Values above 70 indicate overbought conditions, while values below 30 indicate oversold conditions.</p>
              </div>
              <div class="indicator-scale">
                <div class="scale-marker oversold">30</div>
                <div class="scale-bar">
                  <div class="scale-fill" :style="{ width: getRsiWidth() + '%' }"></div>
                </div>
                <div class="scale-marker overbought">70</div>
              </div>
            </div>

            <!-- MACD Indicator -->
            <div class="indicator-card">
              <h3>MACD (Moving Average Convergence Divergence)</h3>
              <div class="indicator-value" :class="getMacdClass()">
                {{ indicators.macd.value.toFixed(2) }}
              </div>
              <div class="indicator-secondary">
                Signal: {{ indicators.macd.signal.toFixed(2) }} | 
                Histogram: {{ indicators.macd.histogram.toFixed(2) }}
              </div>
              <div class="indicator-description">
                <p>Trend-following momentum indicator that shows the relationship between two moving averages of a stock's price.</p>
              </div>
            </div>
            
            <div class="indicator-analysis">
              <h3>Market Analysis</h3>
              <p>{{ generatedAnalysis }}</p>
            </div>
          </div>
          
          <div v-else class="loading-error">
            <h3>Loading Indicators...</h3>
            <p>Technical indicators could not be loaded at this time. This could be due to API limitations or connectivity issues.</p>
            <p>Try again later or check another stock.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTimer } from '@/utils/timerUtils';
import { PopupState } from '@/utils/popupEventBus';

export default {
  name: 'TechnicalIndicatorsHint',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
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
      countdown: 15,
      timer: null,
      indicators: null
    };
  },
  computed: {
    generatedAnalysis() {
      if (!this.indicators) return '';
      
      const rsi = this.indicators.rsi || 50;
      const macd = this.indicators.macd.value || 0;
      const signal = this.indicators.macd.signal || 0;
      
      let analysis = '';
      
      // RSI analysis
      if (rsi > 70) {
        analysis += `${this.stockData.symbol} is currently showing overbought conditions with an RSI of ${rsi.toFixed(2)}. This might indicate a potential reversal or correction is coming. `;
      } else if (rsi < 30) {
        analysis += `${this.stockData.symbol} is currently showing oversold conditions with an RSI of ${rsi.toFixed(2)}. This could present a buying opportunity if other indicators confirm. `;
      } else {
        analysis += `${this.stockData.symbol} has a neutral RSI of ${rsi.toFixed(2)}, suggesting balanced buying and selling pressure. `;
      }
      
      // MACD analysis
      if (macd > signal) {
        analysis += `The MACD (${macd.toFixed(2)}) is above the signal line (${signal.toFixed(2)}), indicating bullish momentum. `;
      } else {
        analysis += `The MACD (${macd.toFixed(2)}) is below the signal line (${signal.toFixed(2)}), indicating bearish momentum. `;
      }
      
      // conclusion based on indicators
      if ((rsi < 70 && rsi > 50 && macd > signal) || (rsi < 30)) {
        analysis += `Overall, technical indicators suggest a potential buying opportunity for ${this.stockData.symbol}.`;
      } else if ((rsi > 30 && rsi < 50 && macd < signal) || (rsi > 70)) {
        analysis += `Overall, technical indicators suggest it might be better to avoid buying ${this.stockData.symbol} right now.`;
      } else {
        analysis += `Overall, technical indicators show mixed signals for ${this.stockData.symbol}, suggesting caution.`;
      }
      
      return analysis;
    }
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.initTimer();
        PopupState.activateModalPopup('technicalIndicators');
        this.loadIndicators();
      } else if (this.timer) {
        this.timer.stop();
        PopupState.deactivateModalPopup('technicalIndicators');
      }
    }
  },
  methods: {
    initTimer() {
      this.countdown = 15;
      this.timer = useTimer(
        15, 
        (time) => { this.countdown = time; }, 
        () => { 
          this.$emit('close'); 
          PopupState.deactivateModalPopup('technicalIndicators');
        }
      );
      this.timer.start();
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
    getRsiWidth() {
      // Convert RSI (0-100) to a percentage width for the scale bar
      if (!this.indicators) return 50;
      return Math.min(100, Math.max(0, this.indicators.rsi));
    },
    loadIndicators() {
      // Simply use the fetched indicators data
      if (this.stockData?.technicalIndicators) {
        this.indicators = {
          rsi: this.stockData.technicalIndicators.rsi,
          macd: this.stockData.technicalIndicators.macd
        };
      } else {
        console.warn("No prefetched indicators available for", this.stockData?.symbol);
      }
    }
  },
  mounted() {
    if (this.visible) {
      this.loadIndicators();
    }
  },
  beforeUnmount() {
    if (this.timer) {
      this.timer.stop();
      PopupState.deactivateModalPopup('technicalIndicators');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.blur-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 9998;
}

.indicators-popup {
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  background: rgba(17, 24, 39, 0.98);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 0;
  animation: fadeIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.indicators-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.indicators-header h2 {
  margin: 0;
  color: #ffd700;
  font-size: 1.5rem;
}

.countdown {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: bold;
  min-width: 50px;
  text-align: center;
}

.indicators-content {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-areas: 
    "rsi macd"
    "analysis analysis";
  gap: 24px;
}
.indicators-grid > div:nth-child(1) {
  grid-area: rsi;
}

.indicators-grid > div:nth-child(2) {
  grid-area: macd;
}

.indicators-grid > div:nth-child(3) {
  grid-area: analysis;
}

.indicator-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicator-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.3);
}

.indicator-card h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.indicator-value {
  font-size: 2rem;
  font-weight: bold;
}

.indicator-secondary {
  font-size: 0.95rem;
  color: #cbd5e1;
  margin-top: -8px;
}

.indicator-description {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 8px 0;
}

.indicator-analysis {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.indicator-analysis h3 {
  color: #e2e8f0;
  margin-top: 0;
  margin-bottom: 12px;
  text-align: center;
}

.indicator-analysis p {
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 1rem;
}

.indicator-scale {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.scale-bar {
  flex-grow: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.scale-fill {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #10b981, #ffd700, #ef4444);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.scale-marker {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.oversold {
  color: #10b981;
}

.overbought {
  color: #ef4444;
}

.neutral {
  color: #ffd700;
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

.loading-error {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  text-align: center;
  margin: 20px 0;
}

.loading-error h3 {
  color: #ffd700;
  margin-top: 0;
  margin-bottom: 16px;
}

.loading-error p {
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 1rem;
  margin: 8px 0;
}

.close-button {
  margin: 0;
  align-self: center;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #ffd700;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}
@media (max-width: 768px) {
  .indicators-popup {
    width: 95%;
    max-width: none;
  }
  
  .indicators-header h2 {
    font-size: 1.2rem;
  }
  
  .indicators-grid {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "rsi"
      "macd"
      "analysis";
  }
  
  .indicator-value {
    font-size: 1.6rem;
  }
}
</style>
