<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal">

        <div class="modal-header">
        <h2 class="modal-title">Latest News for {{ stockData?.name }}</h2>
        <div class="timer">{{ remainingTime }}s</div>
      </div>
  
        <div class="news-container" v-if="stockData?.news && stockData.news.length > 0">
          <div v-for="(item, index) in stockData.news" :key="index" class="news-item">
            <div class="news-header">
              <h3 class="news-title">{{ item.title }}</h3>
            </div>
            <p class="news-summary">{{ item.summary }}</p>
          </div>
        </div>
        
        <div v-else class="no-news">
          <p>No news available for this stock.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StockNews',
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
        remainingTime: 20, // countdown time in seconds for showing news
        timerInterval: null
      };
    },
    watch: {
        visible(newValue) {
        if (newValue) {
            this.startTimer();
        } else {
            this.clearTimer();
        }
        }
    },
    computed: {
        hasNews() {
            return this.stockData?.news && this.stockData.news.length > 0;
        }   
    },
    methods: {
        startTimer() {
            this.remainingTime = 20;
            this.clearTimer();
            
            this.timerInterval = setInterval(() => {
                this.remainingTime--;
                
                if (this.remainingTime <= 0) {
                this.clearTimer();
                this.closeNews();
                }
            }, 1000);
        },
        clearTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },
        closeNews() {
        this.$emit('close');
        },
    }, 
    beforeUnmount() {
        this.clearTimer();
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
  }
  
  .news-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .news-title {
    font-size: 1.1rem;
    color: #e0e0e0;
    margin: 0;
    flex: 1;
  }
  
  .sentiment-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-left: 1rem;
  }
  
  .news-summary {
    line-height: 1.6;
    color: #d1d5db;
    font-size: 0.95rem;
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
    
    .sentiment-badge {
      margin-left: 0;
      margin-top: 0.5rem;
      align-self: flex-start;
    }
  }
  </style>