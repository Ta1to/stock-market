<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-dark text-white font-stock p-4">
    <div class="bg-dark-light p-8 rounded-lg shadow-lg w-full max-w-4xl text-center">
      <h1 class="text-2xl mb-2">Game</h1>
      <p class="text-lg mb-6">Round: {{ round }}</p>
      
      <div v-if="stocks.length > 0" class="stock-selector mb-4">
        <label for="stock-select" class="block text-sm font-medium text-gray-300 mb-2">Select Stock:</label>
        <select id="stock-select" v-model="selectedStock" @change="handleStockSelected(selectedStock)" class="bg-gray-700 text-white p-2 rounded">
          <option v-for="stock in stocks" :key="stock.symbol" :value="stock">
            {{ stock.name }} ({{ stock.symbol }})
          </option>
        </select>
      </div>

      <stock-chart v-if="selectedStock" :stock-data="{ dates: selectedStock.history.map(h => h.date), prices: selectedStock.history.map(h => h.price) }" />

      <LeaveGameButton />
    </div>
  </div>
</template>

<script>
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { ref, onValue } from "firebase/database";
import { readData } from "@/services/database";
import StockChart from '../components/StockChart.vue';
import LeaveGameButton from '../components/buttons/LeaveGameButton.vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
  name: 'GameView',
  components: {
    StockChart,
    LeaveGameButton
  },
  data() {
    return {
      round: 1,
      selectedStock: null,
      stocks: [],
      gameId: this.$route.params.id,
    };
  },
  methods: {    
    async fetchGameData() {
      const gameId = this.$route.params.id;
      try {
        const gameData = await readData(`games/${gameId}`);
        if (gameData) {
          this.round = gameData.round;
          // Load stocks form the game
          this.stocks = gameData.stocks || [];
          this.selectedStock = this.stocks.length > 0 ? this.stocks[0] : null;
        } else {
          console.log("Game does not exist, redirecting to home.");
          this.$router.push('/');
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
        this.$router.push('/');
      }
    },
    handleStockSelected(stock) {
      this.selectedStock = stock; 
    },
    listenToGameUpdates() {
      const gameId = this.$route.params.id;
      const gameRef = ref(this.$firebase.db, `games/${gameId}`);
      onValue(gameRef, (snapshot) => {
        const gameData = snapshot.val();
        if (gameData) {
          this.round = gameData.round;
        } else {
          console.log("Game does not exist, redirecting to home.");
          this.$router.push('/');
        }
      }, (error) => {
        console.error("Error listening to game updates:", error);
        this.$router.push('/');
      });
    }
  },

 async created() {
    await this.fetchGameData();
    this.listenToGameUpdates();
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
