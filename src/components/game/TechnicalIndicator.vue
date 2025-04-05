<template>
    <div class="modal-overlay" v-if="visible">
      <div class="indicators-popup">
        <div class="indicators-header">
          <h2>Technical Indicators - {{ stockData.name }} ({{ stockData.symbol }})</h2>
          <div class="countdown" v-if="countdown > 0">{{ countdown }}s</div>
        </div>
  
        <div class="indicators-content">
          <div class="indicators-grid">
            <!-- RSI Indicator -->
            <div class="indicator-card">
              <h3>RSI (Relative Strength Index)</h3>
              <div class="indicator-value" :class="getRsiClass(mockIndicators.rsi)">
                {{ mockIndicators.rsi.toFixed(2) }}
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
                {{ mockIndicators.macd.value.toFixed(2) }}
              </div>
              <div class="indicator-secondary">
                Signal: {{ mockIndicators.macd.signal.toFixed(2) }} | 
                Histogram: {{ mockIndicators.macd.histogram.toFixed(2) }}
              </div>
              <div class="indicator-description">
                <p>Trend-following momentum indicator that shows the relationship between two moving averages of a stock's price.</p>
              </div>
            </div>
  
            <!-- SMA Indicator -->
            <div class="indicator-card">
              <h3>SMA (Simple Moving Average)</h3>
              <div class="indicator-value">
                {{ mockIndicators.sma.toFixed(2) }}
              </div>
              <div class="indicator-description">
                <p>The average price over a specific time period. Helps to identify trend direction and potential support/resistance levels.</p>
              </div>
            </div>
  
            <!-- Volume Indicator -->
            <div class="indicator-card">
              <h3>Trading Volume</h3>
              <div class="indicator-value">
                {{ formatVolume(mockIndicators.volume) }}
              </div>
              <div class="indicator-description">
                <p>The number of shares traded during a given time period. High volume often indicates strong interest in a stock.</p>
              </div>
            </div>
          </div>
  
          <div class="indicator-analysis">
            <h3>Market Analysis</h3>
            <p>{{ generatedAnalysis }}</p>
          </div>
        </div>
  
        <div class="indicators-footer">
          <button @click="handleClose" class="close-button" :disabled="countdown > 0">
            {{ countdown > 0 ? `Wait (${countdown}s)` : 'Continue to Final Betting' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TechnicalIndicatorsPopUp',
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
        countdownTimer: null,
        // Mock indicators that would normally come from an API
        mockIndicators: null
      };
    },
    computed: {
      generatedAnalysis() {
        if (!this.mockIndicators) return '';
        
        const rsi = this.mockIndicators.rsi;
        const macd = this.mockIndicators.macd.value;
        const signal = this.mockIndicators.macd.signal;
        
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
        
        // Conclusion based on indicators
        if ((rsi > 50 && macd > signal) || (rsi < 70 && rsi > 60 && macd > signal)) {
          analysis += `Overall, technical indicators suggest a positive short-term outlook for ${this.stockData.symbol}.`;
        } else if ((rsi < 50 && macd < signal) || (rsi > 30 && rsi < 40 && macd < signal)) {
          analysis += `Overall, technical indicators suggest a negative short-term outlook for ${this.stockData.symbol}.`;
        } else {
          analysis += `Overall, technical indicators show mixed signals for ${this.stockData.symbol}, suggesting caution.`;
        }
        
        return analysis;
      }
    },
    watch: {
      visible(newValue) {
        if (newValue) {
          this.startCountdown();
          this.generateMockIndicators();
        } else {
          this.stopCountdown();
        }
      }
    },
    methods: {
      startCountdown() {
        this.countdown = 15;
        this.countdownTimer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            this.stopCountdown();
          }
        }, 1000);
      },
      stopCountdown() {
        clearInterval(this.countdownTimer);
      },
      handleClose() {
        if (this.countdown <= 0) {
          this.$emit('close');
        }
      },
      formatVolume(volume) {
        if (!volume) return '0';
        if (volume >= 1000000) {
          return (volume / 1000000).toFixed(2) + 'M';
        }
        if (volume >= 1000) {
          return (volume / 1000).toFixed(0) + 'K';
        }
        return volume.toString();
      },
      getRsiClass(rsi) {
        if (rsi > 70) return 'overbought';
        if (rsi < 30) return 'oversold';
        return 'neutral';
      },
      getMacdClass() {
        if (this.mockIndicators.macd.value > this.mockIndicators.macd.signal) return 'bullish';
        return 'bearish';
      },
      getRsiWidth() {
        // Convert RSI (0-100) to a percentage width for the scale bar
        return Math.min(100, Math.max(0, this.mockIndicators.rsi));
      },
      generateMockIndicators() {
        // Create deterministic but seemingly random values based on stock symbol
        const seedValue = this.stockData.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rng = (min, max) => {
          const x = Math.sin(seedValue + this.roundNumber) * 10000;
          const rand = x - Math.floor(x);
          return min + rand * (max - min);
        };
        
        // Generate mock indicator values
        const rsi = rng(20, 80);
        const macdValue = rng(-2, 2);
        const macdSignal = macdValue + rng(-0.5, 0.5);
        const histogram = macdValue - macdSignal;
        const sma = parseFloat(this.stockData.prices[0]) * (1 + rng(-0.05, 0.05));
        const volume = Math.floor(rng(100000, 5000000));
        
        this.mockIndicators = {
          rsi,
          macd: {
            value: macdValue,
            signal: macdSignal,
            histogram
          },
          sma,
          volume
        };
      }
    },
    beforeUnmount() {
      this.stopCountdown();
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
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .indicators-popup {
    background: #131722;
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255, 215, 0, 0.2);
    animation: fadeIn 0.3s ease;
  }
  
  .indicators-header {
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    color: #ffd700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .indicators-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .countdown {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
    min-width: 50px;
    text-align: center;
  }
  
  .indicators-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
  }
  
  .indicators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .indicator-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .indicator-card h3 {
    color: #e0e0e0;
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 10px;
  }
  
  .indicator-value {
    font-size: 2rem;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .indicator-secondary {
    font-size: 0.9rem;
    color: #a0a0a0;
    margin-top: -5px;
  }
  
  .indicator-description {
    color: #a0a0a0;
    font-size: 0.9rem;
    margin-top: auto;
  }
  
  .indicator-scale {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
  
  .scale-bar {
    flex-grow: 1;
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;
    margin: 0 10px;
  }
  
  .scale-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #ffd700, #ef4444);
    border-radius: 5px;
  }
  
  .scale-marker {
    font-size: 0.8rem;
    color: #e0e0e0;
  }
  
  .scale-marker.oversold {
    color: #10b981;
  }
  
  .scale-marker.overbought {
    color: #ef4444;
  }
  
  .indicator-analysis {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 20px;
    margin-top: 20px;
  }
  
  .indicator-analysis h3 {
    color: #ffd700;
    margin: 0 0 15px 0;
  }
  
  .indicator-analysis p {
    color: #e0e0e0;
    line-height: 1.6;
  }
  
  .indicators-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
    display: flex;
    justify-content: center;
  }
  
  .close-button {
    background: #ffd700;
    color: #000;
    border: none;
    padding: 12px 30px;
    border-radius: 30px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .close-button:hover:not(:disabled) {
    background: #ffed4a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  
  .close-button:disabled {
    background: #5a5a5a;
    color: #888;
    cursor: not-allowed;
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
  
  .bearish {
    color: #ef4444;
  }
  
  .neutral {
    color: #ffd700;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .indicators-grid {
      grid-template-columns: 1fr;
    }
    
    .indicators-popup {
      width: 95%;
      max-height: 95vh;
    }
    
    .indicator-value {
      font-size: 1.5rem;
    }
  }
  </style>