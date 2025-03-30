<template>
    <div class="hud">
      <div class="coins">Coins: {{ coins }}</div>
      <div class="bet-info">
        <label for="betAmount">Bet Amount:</label>
        <input id="betAmount" type="number" v-model.number="betAmount" min="0" />
      </div>
      <div class="actions">
        <button @click="bet">Bet</button>
        <button @click="check">Check</button>
        <button @click="fold">Fold</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "PokerHUD",
    props: {
      initialCoins: {
        type: Number,
        default: 1000,
      },
    },
    data() {
      return {
        coins: this.initialCoins,
        betAmount: 0,
      };
    },
    methods: {
      bet() {
        if (this.betAmount > 0 && this.betAmount <= this.coins) {
          this.coins -= this.betAmount;
          this.$emit("bet-placed", this.betAmount);
          this.betAmount = 0;
        } else {
          console.log("Invalid bet amount.");
        }
      },
      check() {
        this.$emit("check");
      },
      fold() {
        this.$emit("fold");
      },
    },
  };
  </script>
  
  <style scoped>
  .hud {
    position: fixed;
    left: 50%;
    bottom: 20px; /* Adjust as needed for margin from bottom */
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    border-radius: 8px;
    width: 300px;
  }
  
  .coins {
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  .bet-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .bet-info input {
    width: 80px;
    padding: 4px;
    border-radius: 4px;
    border: none;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .actions button {
    padding: 8px 16px;
    background: #056947;
    border: none;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.3s;
  }
  
  .actions button:hover {
    background: #02331e;
  }
  </style>
  