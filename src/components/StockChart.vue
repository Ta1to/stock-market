<template>
  <div class="stock-chart">
    <div v-if="displayedChartData.labels.length" class="chart-container">
      <Line 
        :data="displayedChartData"
        :options="chartOptions"
      />
    </div>
    <div v-else class="no-data">Loading stock data...</div>
    <button v-if="!showFullChart" @click="revealChart" class="reveal-button">Reveal Chart</button>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { getStockData } from '../api/stock'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default {
  name: 'StockChart',
  components: {
    Line
  },
  props: {
    stockSymbol: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [{
          label: 'Stock Price',
          backgroundColor: 'rgba(59, 130, 246, 0.1)', // Modern blue background
          borderColor: '#3b82f6', // Modern blue line
          borderWidth: 2,
          tension: 0.4, // Smoother line
          fill: true,
          pointRadius: 0, // Hide points
          pointHoverRadius: 6, // Show points on hover
          pointBackgroundColor: '#3b82f6',
          pointHoverBackgroundColor: '#fff',
          pointBorderColor: '#3b82f6',
          pointHoverBorderColor: '#3b82f6',
          pointBorderWidth: 2,
          data: []
        }]
      },
      displayedChartData: {
        labels: [],
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
          data: []
        }]
      },
      showFullChart: false,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 11
              },
              callback: function(value) {
                return '$ ' + value.toFixed(2);
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 11
              },
              maxRotation: 0
            }
          }
        }
      }
    }
  },
  mounted() {
    this.fetchStockData()
  },
  methods: {
    async fetchStockData() {
      try {
        const { dates, prices } = await getStockData(this.stockSymbol)
        this.chartData.labels = dates
        this.chartData.datasets[0].data = prices
        this.updateDisplayedChartData()
      } catch (error) {
        console.error('Error fetching stock data:', error)
      }
    },
    updateDisplayedChartData() {
      const last6Months = 26 // Show only the last 6 months initially
      this.displayedChartData.labels = this.chartData.labels.slice(-last6Months)
      this.displayedChartData.datasets[0].data = this.chartData.datasets[0].data.slice(-last6Months)
    },
    revealChart() {
      this.showFullChart = true
      const totalMonths = this.chartData.labels.length
      const revealStep = 1 // Number of months to reveal at each step
      let currentIndex = this.displayedChartData.labels.length

      const reveal = () => {
        if (currentIndex < totalMonths) {
          const newLabels = [...this.displayedChartData.labels, this.chartData.labels[currentIndex]]
          const newData = [...this.displayedChartData.datasets[0].data, this.chartData.datasets[0].data[currentIndex]]
          this.displayedChartData = {
            labels: newLabels,
            datasets: [{
              ...this.displayedChartData.datasets[0],
              data: newData
            }]
          }
          currentIndex += revealStep
          requestAnimationFrame(reveal)
        }
      }
      requestAnimationFrame(reveal)
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 600px;
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

.reveal-button {
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.reveal-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}
</style>
