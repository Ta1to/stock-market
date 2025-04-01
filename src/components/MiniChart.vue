<template>
    <div class="mini-chart-container" :class="{ expanded: isExpanded }">
      <div class="mini-chart-header" @click="toggleExpand">
        <span>{{ isExpanded ? 'Stock Chart ▼' : 'Stock Chart ▶' }}</span>
      </div>
      <div class="chart-content" v-show="isExpanded">
        <StockChart :stockData="limitedStockData" />
      </div>
    </div>
  </template>
  
  <script>
  import StockChart from '@/components/StockChart.vue';
  import { getLimitedStockData } from '@/utils/stockDataUtils';
  
  export default {
    name: 'MiniChart',
    components: { StockChart },
    props: {
      stockData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        isExpanded: false
      };
    },
    computed: {
      limitedStockData() {
        return getLimitedStockData(this.stockData, 3);
      }
    },
    methods: {
      toggleExpand() {
        this.isExpanded = !this.isExpanded;
      }
    }
  };
  </script>
  
  <style scoped>
  .mini-chart-container {
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(17, 24, 39, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 100;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 215, 0, 0.2);
  }
  
  .mini-chart-container.expanded {
    width: 600px;
    height: auto;
    background: rgba(17, 24, 39, 0.98);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  .mini-chart-header {
    padding: 12px 16px;
    cursor: pointer;
    color: #ffd700;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  }
  
  .mini-chart-header:hover {
    background: rgba(255, 215, 0, 0.1);
  }
  
  .chart-content {
    padding: 16px;
    min-height: 300px;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .mini-chart-container.expanded {
      width: 90vw;
      max-width: 500px;
    }
  }
  </style>