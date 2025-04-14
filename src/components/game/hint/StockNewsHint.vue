<template>
    <div v-if="visible">
      <div class="blur-background"></div>
      <div class="modal-overlay">
        <div class="modal">

          <div class="modal-header">
            <h2 class="modal-title">Latest News for {{ stockData?.name }}</h2>
            <div class="timer">{{ remainingTime }}s</div>
          </div>
    
          <div class="news-container" v-if="stockData?.news && stockData.news.length > 0">
            <div v-for="(item, index) in stockData.news" :key="index" class="news-item">
              <p class="news-summary">{{ item.summary }}</p>
              <a v-if="item.url" :href="item.url" target="_blank" class="news-source-link">
                Source: {{ item.source || 'Unknown' }}
              </a>
              <span v-else class="news-source-text">
                Source: {{ item.source || 'Unknown' }}
              </span>
            </div>
          </div>
          
          <div v-else class="no-news">
            <p>No news available for this stock.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { useTimer } from '@/utils/timerUtils';
  import { PopupState } from '@/utils/popupEventBus';

  export default {
    name: 'StockNewsHint',
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
            PopupState.activateModalPopup('stockNews');
          } else if (this.timer) {
            this.timer.stop();
            PopupState.deactivateModalPopup('stockNews');
          }
        }
    },
    computed: {
        hasNews() {
            return this.stockData?.news && this.stockData.news.length > 0;
        }   
    },
    methods: {
        initTimer() {
          const duration = this.hasNews ? 20 : 3;
          this.remainingTime = duration;
          
          this.timer = useTimer(
            duration,
            (time) => { this.remainingTime = time; },
            () => { 
              this.$emit('close');
              PopupState.deactivateModalPopup('stockNews'); 
            }
          );
          this.timer.start();
        },
    }, 
    beforeUnmount() {
        if (this.timer) {
          this.timer.stop();
        }
        PopupState.deactivateModalPopup('stockNews');
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
    backdrop-filter: blur(10px);
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
  
  .news-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .news-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: left;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
  }
  
  .news-item:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
  
  .news-summary {
    line-height: 1.6;
    color: #d1d5db;
    font-size: 0.95rem;
    white-space: pre-line; 
    margin: 0 0 1rem 0;
    text-align: justify;
  }
  
  .news-source-link {
    align-self: flex-start;
    font-size: 0.8rem;
    color: #ffd700;
    text-decoration: underline;
    margin-top: auto;
  }
  
  .news-source-text {
    align-self: flex-start;
    font-size: 0.8rem;
    color: #ffd700;
    margin-top: auto;
  }
  
  .no-news {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 768px) {
    .modal {
      padding: 1.5rem;
    }
    
    .news-header {
      flex-direction: column;
    }
    
    .news-source {
      margin-left: 0;
      margin-top: 0.5rem;
      align-self: flex-start;
    }
  }
  </style>