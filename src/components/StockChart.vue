<template>
  <div class="stock-chart">
    <div v-if="chartData.labels.length" class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="no-data">Loading stock data...</div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getChartConfig } from '@/utils/stockDataUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
  name: 'StockChart',
  components: { Line },
  props: {
    stockData: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels: this.stockData.dates || [],
        datasets: [{
          label: 'Stock Price',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3b82f6',
          pointHoverBackgroundColor: '#fff',
          pointBorderColor: '#3b82f6',
          pointHoverBorderColor: '#3b82f6',
          pointBorderWidth: 2,
          data: this.stockData.prices || []
        }]
      };
    },
    chartOptions() {
      return getChartConfig(true);
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
  background: rgba(17, 24, 39, 0.6);
  border-radius: 16px;
  padding: 24px;
  margin: 20px auto;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.no-data {
  color: #f87979;
  text-align: center;
  padding: 20px;
}
</style>