<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal">

        <div class="modal-header">
          <h2 class="modal-title">The Current Stock Price</h2>
          <div class="timer">{{ remainingTime }}s</div>
        </div>
        
        <!-- Current Stock Price Display -->
        <div class="current-price-container">
          <h3 class="price-label">Current Price:</h3>
          <div class="price-value">${{ currentPrice }}</div>
        </div>
  
        <div class="price-info-container" v-if="stockData?.news && stockData.news.length > 0">
          <div v-for="(item, index) in stockData.news" :key="index" class="price-info-item">
            <div class="price-info-header">
              <h3 class="info-title">{{ item.title }}</h3>
            </div>
            <p class="info-summary">{{ item.summary }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closePrice">Close</button>
        </div>
        
      </div>
    </div>
  </template>
  
  <script>
  import { useTimer } from '@/utils/timerUtils';

  export default {
    name: 'CurrentPriceHint',
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
        remainingTime: 20,
        timer: null
      };
    },
    watch: {
        visible(newValue) {
          if (newValue) {
            this.initTimer();
          } else if (this.timer) {
            this.timer.stop();
          }
        }
    },
    computed: {
        hasNews() {
            return this.stockData?.news && this.stockData.news.length > 0;
        },
        currentPrice() {
            // Get the current price from the prices array
            if (this.stockData && this.stockData.prices && this.stockData.prices.length > 0) {
                return this.stockData.prices[this.stockData.prices.length - 1].toFixed(2);
            }
            return "N/A";
        }   
    },
    methods: {
        initTimer() {
          const duration = this.hasNews ? 20 : 3;
          this.remainingTime = duration;
          
          this.timer = useTimer(
            duration,
            (time) => { this.remainingTime = time; },
            () => { this.$emit('close'); }
          );
          this.timer.start();
        },
        closePrice() {
          this.$emit('close');
        }
    }, 
    beforeUnmount() {
        if (this.timer) {
          this.timer.stop();
        }
    }
  };
  </script>
  
  <style scoped>
  .timer-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
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
    max-width: 800px;
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
  
  .price-info-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .price-info-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: left;
  }
  
  .price-info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .info-title {
    font-size: 1.1rem;
    color: #e0e0e0;
    margin: 0;
    flex: 1;
  }
  
  .info-summary {
    line-height: 1.6;
    color: #d1d5db;
    font-size: 0.95rem;
  }
  
  .no-info {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .current-price-container {
    background: rgba(21, 128, 61, 0.2);
    border: 2px solid rgba(21, 128, 61, 0.5);
    border-radius: 8px;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .price-label {
    font-size: 1.1rem;
    color: #e0e0e0;
    margin: 0 0 0.5rem 0;
  }
  
  .price-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #4ade80;
  }
  
  @media (max-width: 768px) {
    .modal {
      padding: 1.5rem;
    }
    
    .price-info-header {
      flex-direction: column;
    }
    
    .sentiment-badge {
      margin-left: 0;
      margin-top: 0.5rem;
      align-self: flex-start;
    }
  }
  </style>