<template>
    <div class="mini-news-container" :class="{ expanded: isExpanded }" v-show="!isAnyModalActive">
      <div class="mini-news-header" @click="toggleExpand">
        <span>{{ isExpanded ? 'Latest News ▼' : 'Latest News ▶' }}</span>
      </div>
      <div class="news-content" v-show="isExpanded">
        <div v-if="hasNews" class="news-list">
          <div v-for="(item, index) in stockData.news" :key="index" class="news-item">
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
  import { PopupState } from '@/utils/popupEventBus';

  export default {
    name: 'MiniNews',
    props: {
      stockData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        popupId: 'mini-news'
      };
    },
    computed: {
      isExpanded() {
        return PopupState.isActivePopup(this.popupId);
      },
      hasNews() {
        return this.stockData?.news && this.stockData.news.length > 0;
      },
      isAnyModalActive() {
        return PopupState.isAnyModalActive();
      }
    },
    methods: {
      toggleExpand() {
        if (this.isExpanded) {
          PopupState.deactivatePopup(this.popupId);
        } else {
          PopupState.activatePopup(this.popupId);
        }
      }
    },
    beforeUnmount() {
      if (this.isExpanded) {
        PopupState.deactivatePopup(this.popupId);
      }
    }
  };
  </script>
  
  <style scoped>
  .mini-news-container {
    position: fixed;
    top: 90px;  
    left: 20px;
    background: rgba(17, 24, 39, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 99; 
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 215, 0, 0.2);
    width: auto;
  }
  
  .mini-news-container.expanded {
    width: 600px;
    height: auto;
    background: rgba(17, 24, 39, 0.98);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  .mini-news-header {
    padding: 12px 16px;
    cursor: pointer;
    color: #ffd700;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  }
  
  .mini-news-header:hover {
    background: rgba(255, 215, 0, 0.1);
  }
  
  .news-content {
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .news-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 16px;
    border-radius: 8px;
    text-align: left;
  }
  
  .news-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  .news-title {
    font-size: 1rem;
    color: #e0e0e0;
    margin: 0;
    flex: 1;
  }  
  .news-summary {
    line-height: 1.5;
    color: #d1d5db;
    font-size: 0.9rem;
  }
  
  .no-news {
    background: rgba(255, 255, 255, 0.05);
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    color: #d1d5db;
  }
  
  @media (max-width: 768px) {
    .mini-news-container.expanded {
      width: 90vw;
      max-width: 500px;
    }
    
    .news-header {
      flex-direction: column;
    }
  }
  </style>