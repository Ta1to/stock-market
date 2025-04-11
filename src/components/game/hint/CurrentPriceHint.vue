<template>
    <div v-if="visible">
      <div class="blur-background"></div>
      <div class="modal-overlay">
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
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { useTimer } from '@/utils/timerUtils';
  import { PopupState } from '@/utils/popupEventBus';

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
        remainingTime: 10, 
        timer: null
      };
    },
    watch: {
        visible(newValue) {
          if (newValue) {
            this.initTimer();
            PopupState.activateModalPopup('currentPrice');
          } else if (this.timer) {
            this.timer.stop();
            PopupState.deactivateModalPopup('currentPrice');
          }
        }
    },
    computed: {
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
          this.remainingTime = 10; 
          
          this.timer = useTimer(
            10,
            (time) => { this.remainingTime = time; },
            () => { 
              this.$emit('close'); 
              PopupState.deactivateModalPopup('currentPrice');
            }
          );
          this.timer.start();
        },
    }, 
    beforeUnmount() {
        if (this.timer) {
          this.timer.stop();
        }
        PopupState.deactivateModalPopup('currentPrice');
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
    z-index: 9999; 
  }
  
  .blur-background {
    position: fixed;
    inset: 0;
    backdrop-filter: blur(8px);
    z-index: 9998;
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
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  }
  
  .modal-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    color: #ffd700;
  }
  
  .timer {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    font-weight: bold;
  }
  
  .current-price-container {
    background: rgba(21, 128, 61, 0.2);
    border: 2px solid rgba(21, 128, 61, 0.5);
    border-radius: 8px;
    padding: 1.8rem;
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .price-label {
    font-size: 1.2rem;
    color: #e0e0e0;
    margin: 0 0 0.8rem 0;
  }
  
  .price-value {
    font-size: 3rem;
    font-weight: bold;
    color: #4ade80;
  }
  
  .modal-footer {
    margin-top: 1rem;
  }
  
  .modal-footer button {
    background: #ffd700;
    color: #000;
    border: none;
    padding: 10px 24px;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .modal-footer button:hover {
    background: #ffed4a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    .modal {
      padding: 1.5rem;
    }
    
    .price-value {
      font-size: 2.5rem;
    }
  }
  </style>