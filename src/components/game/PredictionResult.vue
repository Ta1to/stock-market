<template>
    <div class="modal-overlay" v-if="visible">
      <div class="result-popup">
        <div class="result-header">
          <h2>Round {{ roundNumber }} Results</h2>
        </div>
  
        <div class="result-content">
          <div class="stock-info">
            <h3>{{ stockData.name }} ({{ stockData.symbol }})</h3>
            <div class="current-price">
              Current Price: <span class="price-value">${{ currentPrice.toFixed(2) }}</span>
            </div>
          </div>
  
          <div class="predictions-table">
            <h3>Player Predictions</h3>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Prediction</th>
                  <th>Difference</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in activePlayers" :key="player.uid" :class="{ 'winner-row': player.uid === winner?.uid }">
                  <td>{{ player.name }}</td>
                  <td>${{ playerPrediction(player.uid).toFixed(2) }}</td>
                  <td>${{ predictionDifference(player.uid).toFixed(2) }}</td>
                  <td>
                    <span v-if="player.uid === winner?.uid" class="win">+{{ potAmount }} chips</span>
                    <span v-else class="loss">-{{ playerBet(player.uid) }} chips</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div class="result-summary">
            <div v-if="winner" class="winner-announcement">
              <div class="winner-crown">👑</div>
              <h3>{{ winner.name }} wins the round!</h3>
              <p>With a prediction of ${{ playerPrediction(winner.uid).toFixed(2) }}, 
                {{ winner.name }} was closest to the actual price of ${{ currentPrice.toFixed(2) }}.</p>
            </div>
            <div v-else class="no-winner">
              <h3>No winner for this round</h3>
              <p>No active players made predictions.</p>
            </div>
          </div>
        </div>
  
        <div class="result-footer">
          <button @click="handleClose" class="continue-button">
            Continue to Next Round
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PredictionResult',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      stockData: {
        type: Object,
        required: true
      },
      roundNumber: {
        type: Number,
        required: true
      },
      predictions: {
        type: Object,
        default: () => ({})
      },
      roundsData: {
        type: Object,
        default: () => ({})
      },
      players: {
        type: Array,
        default: () => []
      },
      potAmount: {
        type: Number,
        default: 0
      },
      winner: {
        type: Object,
        default: null
      }
    },
    computed: {
      currentPrice() {
        // current price of the stock
        return this.stockData && this.stockData.prices && this.stockData.prices.length > 0
          ? parseFloat(this.stockData.prices[this.stockData.prices.length - 1])
          : 0;
      },
      activePlayers() {
        //filter for player who did not fold and have a prediction
        return this.players.filter(player => {
          const hasNoPrediction = !this.predictions[player.uid];
          const hasFolded = this.playerFolded(player.uid);
          return !hasNoPrediction && !hasFolded;
        });
      }
    },
    methods: {
      playerPrediction(playerId) {
        return this.predictions[playerId] || 0;
      },
      predictionDifference(playerId) {
        const prediction = this.playerPrediction(playerId);
        return Math.abs(prediction - this.currentPrice);
      },
      playerBet(playerId) {
        const currentRoundData = this.roundsData[this.roundNumber];
        if (!currentRoundData || !currentRoundData.bets || !currentRoundData.bets[playerId]) {
          return 0;
        }
        
        const playerBetData = currentRoundData.bets[playerId];
        return playerBetData.bet || 0;
      },
      playerFolded(playerId) {
        const currentRoundData = this.roundsData[this.roundNumber];
        if (!currentRoundData || !currentRoundData.bets || !currentRoundData.bets[playerId]) {
          return false;
        }
        
        const playerBetData = currentRoundData.bets[playerId];
        return playerBetData.folded === true;
      },
      handleClose() {
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .result-popup {
    background: #131722;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255, 215, 0, 0.2);
    animation: fadeIn 0.3s ease;
  }
  
  .result-header {
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    color: #ffd700;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .result-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .result-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
  }
  
  .stock-info {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stock-info h3 {
    color: #e0e0e0;
    margin: 0 0 10px 0;
  }
  
  .current-price {
    font-size: 1.2rem;
    color: #a0a0a0;
  }
  
  .price-value {
    font-weight: bold;
    color: #ffd700;
  }
  
  .predictions-table {
    margin-bottom: 20px;
  }
  
  .predictions-table h3 {
    color: #e0e0e0;
    margin-bottom: 15px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  th {
    background-color: rgba(0, 0, 0, 0.2);
    color: #ffd700;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.03);
  }
  
  .winner-row {
    background-color: rgba(255, 215, 0, 0.1) !important;
    position: relative;
  }
  
  .winner-row::before {
    content: '👑';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .win {
    color: #10b981;
    font-weight: bold;
  }
  
  .loss {
    color: #ef4444;
    font-weight: bold;
  }
  
  .result-summary {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 20px;
    margin-top: 20px;
    text-align: center;
  }
  
  .winner-announcement {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .winner-crown {
    font-size: 3rem;
    margin-bottom: 10px;
    animation: bounce 2s infinite;
  }
  
  .winner-announcement h3 {
    color: #ffd700;
    margin: 0 0 10px 0;
  }
  
  .winner-announcement p, .no-winner p {
    color: #e0e0e0;
    line-height: 1.6;
  }
  
  .no-winner h3 {
    color: #ef4444;
    margin: 0 0 10px 0;
  }
  
  .result-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
    display: flex;
    justify-content: center;
  }
  
  .continue-button {
    background: #ffd700;
    color: #000;
    border: none;
    padding: 12px 30px;
    border-radius: 30px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .continue-button:hover {
    background: #ffed4a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  @media (max-width: 768px) {
    th, td {
      padding: 8px 10px;
      font-size: 0.9rem;
    }
    
    .result-summary {
      padding: 15px;
    }
    
    .winner-crown {
      font-size: 2.5rem;
    }
  }
  </style>