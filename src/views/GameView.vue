<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl mb-2">Game</h1>
      <p class="text-lg mb-6">Round: {{ round }}</p>
      <stock-selector @stock-selected="handleStockSelected"></stock-selector>
      <p v-if="selectedStock" class="text-lg mt-4">Selected Stock: {{ selectedStock }}</p>
      <p v-if="stockPrice" class="text-lg mt-2">Current Price: ${{ stockPrice }}</p>
      <!-- <line-chart v-if="chartData.labels.length" :chart-data="chartData" :options="chartOptions"></line-chart>
      <div v-else class="text-red-500">Failed to load stock data.</div> -->
      <div class="mt-6">
        <button @click="predict('crash')" class="w-full p-2 bg-red-500 rounded shadow-lg hover:bg-red-700 mb-2">Crash</button>
        <button @click="predict('boom')" class="w-full p-2 bg-green-500 rounded shadow-lg hover:bg-green-700 mb-2">Boom</button>
        <button @click="predict('constant')" class="w-full p-2 bg-yellow-500 rounded shadow-lg hover:bg-yellow-700">Constant</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { getStockData, getStockPrice } from '../api/stock';
import StockSelector from '../components/StockSelector.vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
  name: 'GameView',
  components: {
    StockSelector
  },
  data() {
    return {
      round: 1,
      selectedStock: '',
      stockPrice: null,
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Stock Price',
            backgroundColor: '#f87979',
            data: []
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  methods: {
    async fetchStockData() {
      try {
        const { dates, prices } = await getStockData(this.selectedStock, 30);
        this.chartData.labels = dates;
        this.chartData.datasets[0].data = prices;
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    },
    async fetchStockPrice() {
      try {
        this.stockPrice = await getStockPrice(this.selectedStock);
      } catch (error) {
        console.error("Error fetching stock price:", error);
      }
    },
    predict(prediction) {
      console.log(`Prediction: ${prediction}`);
      // Handle prediction logic here
    },
    handleStockSelected(stock) {
      this.selectedStock = stock;
      this.fetchStockData();
      this.fetchStockPrice();
    }
  },
  async created() {
    const db = getFirestore();
    const gameId = this.$route.params.id;
    onSnapshot(doc(db, "games", gameId), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        this.round = gameData.round;
      } else {
        console.log("Game document does not exist, redirecting to home.");
        this.$router.push('/');
      }
    }, (error) => {
      console.log("Error fetching game document:", error);
      this.$router.push('/');
    });
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
