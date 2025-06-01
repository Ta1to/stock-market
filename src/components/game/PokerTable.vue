<template>
    <div class="poker-table" :class="{ 'many-players': hasManyPlayers }">
      <div class="table-surface"></div>
      <!-- Display the pot in the center of the table -->
      <div class="pot-display">
        Pot: {{ pot }}
      </div>      
      <PlayerCard
        v-for="(player, index) in players"
        :key="player.id"
        :player="player"
        :currentTurnId="currentTurnPlayer ? currentTurnPlayer.uid : null"
        :style="getPositionStyle(index, players.length)"
      />

      <div 
        v-for="(player, index) in players" 
        :key="`bet-${player.id}`" 
        class="player-bet"
        :style="getBetPositionStyle(index, players.length)"
      >
        <!-- show chips for active bets -->
        <div v-if="getPlayerBet(player.uid) > 0" class="chip-stack">
          <!-- generate chip stack based on bet amount -->
          <div 
            v-for="(chip, chipIndex) in generateChipStack(getPlayerBet(player.uid))" 
            :key="chipIndex"
            class="poker-chip"
            :class="chip.type"
            :style="{ bottom: `${chipIndex * 4}px` }"
          ></div>
          <div class="bet-amount">{{ getPlayerBet(player.uid) }}</div>
        </div>
        
        <!-- folded indicator -->
        <div v-else-if="hasPlayerFolded(player.uid)" class="fold-indicator">
          Folded
        </div>
        
        <!-- empty bet space -->
        <div v-else class="empty-bet"></div>
      </div>
    </div>
  </template>
  
  <script>
  import PlayerCard from "./PlayerCard.vue";
  
  export default {
    name: "PokerTable",
    components: {
      PlayerCard,
    },
    props: {      players: {
        type: Array,
        default: () => [],
      },
      currentUserId: {
        type: String,
        default: '',
      },
      currentTurnIndex: {
        type: Number,
        default: 0,
      },
      pot: {
        type: Number,
        default: 0,
      },
      currentRound: {
        type: Number,
        required: true
      },      roundsData: {
        type: Object,
        default: () => ({})
      }
    },    computed: {
      currentTurnPlayer() {
        if (!this.players.length || this.currentTurnIndex < 0 || this.currentTurnIndex >= this.players.length) {
          return null;
        }
        return this.players[this.currentTurnIndex];
      },
      
      hasManyPlayers() {
        return this.players.length > 6;
      },
      
      isLargeScreen() {
        return window.innerWidth > 1920;
      }
    },
    
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      /**
       * Get player's bet from the current round data
       */
      getPlayerBet(playerId) {
        const currentRoundData = this.roundsData[this.currentRound];
        if (!currentRoundData || !currentRoundData.bets || !currentRoundData.bets[playerId]) {
          return 0;
        }
        
        const playerBetData = currentRoundData.bets[playerId];
        return playerBetData.bet || 0;
      },
      
      /**
       * Check if player has folded in current round
       */
      hasPlayerFolded(playerId) {
        const currentRoundData = this.roundsData[this.currentRound];
        if (!currentRoundData || !currentRoundData.bets || !currentRoundData.bets[playerId]) {
          return false;
        }
        
        const playerBetData = currentRoundData.bets[playerId];
        return playerBetData.folded === true;
      },
      getPositionStyle(index, totalPlayers) {
        const angleOffset = totalPlayers % 2 === 1 ? 180 / totalPlayers : 0;
        const angle = (360 / totalPlayers) * index + angleOffset;
        
        const isLargeScreen = window.innerWidth > 1920;
        
        let radiusX = isLargeScreen ? 480 : 380; // horizontal radius
        let radiusY = isLargeScreen ? 200 : 150; // vertical radius
        const centerX = isLargeScreen ? 450 : 350; 
        const centerY = isLargeScreen ? 200 : 150; 
        
        if (totalPlayers > 7) {
          radiusX = isLargeScreen ? 500 : 400;
          radiusY = isLargeScreen ? 210 : 160;
        } else if (totalPlayers > 4) {
          radiusX = isLargeScreen ? 490 : 390;
          radiusY = isLargeScreen ? 205 : 155;
        }
        
        const rad = (angle * Math.PI) / 180;
        const x = centerX + radiusX * Math.cos(rad);
        const y = centerY + radiusY * Math.sin(rad);
        
        const scale = totalPlayers > 7 ? (isLargeScreen ? 0.9 : 0.85) : 1;
        
        return {
          position: "absolute",
          top: `${y}px`,
          left: `${x}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }
      },      getBetPositionStyle(index, totalPlayers) {
        const angleOffset = totalPlayers % 2 === 1 ? 180 / totalPlayers : 0;
        const angle = (360 / totalPlayers) * index + angleOffset;
        
        const isLargeScreen = window.innerWidth > 1920;
        
        let radiusX = isLargeScreen ? 300 : 255; 
        let radiusY = isLargeScreen ? 100 : 60; 
        const centerX = isLargeScreen ? 450 : 350; 
        const centerY = isLargeScreen ? 160 : 125; 
        
        // Adjust bet positions based on player count
        if (totalPlayers > 7) {
          radiusX = isLargeScreen ? 270 : 220; 
          radiusY = isLargeScreen ? 90 : 80;
        } else if (totalPlayers > 4) {
          radiusX = isLargeScreen ? 280 : 230;
          radiusY = isLargeScreen ? 95 : 80;
        }
        
        const rad = (angle * Math.PI) / 180;
        const x = centerX + radiusX * Math.cos(rad);
        const y = centerY + radiusY * Math.sin(rad);
        
        // Scale bet displays for many players
        const scale = totalPlayers > 7 ? (isLargeScreen ? 0.95 : 0.9) : 1;
        
        return {
          position: "absolute",
          top: `${y}px`,
          left: `${x}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }
      },/**
       * Generate an array of chips representing the bet amount
       * Different denominations represented by different chip types
       * Limits chip stack size based on total player count
       */      /**
       * Handle window resize events to update responsive elements
       */
      handleResize() {
        // This just forces a reactivity update when the window is resized
        // The isLargeScreen computed property will automatically update
        this.$forceUpdate();
      },
      
      /**
       * Generate an array of chips representing the bet amount
       * Different denominations represented by different chip types
       * Limits chip stack size based on total player count and screen size
       */
      generateChipStack(betAmount) {
        if (!betAmount || betAmount <= 0) return [];
        
        const chips = [];
        let remaining = betAmount;
        
        // Generate chips in denominations (100, 25, 5, 1)
        // Higher value chips at the bottom of the stack
          const goldChips = Math.floor(remaining / 100);
        for (let i = 0; i < goldChips; i++) {
          chips.push({ type: 'gold-chip', value: 100 });
        }
        remaining -= goldChips * 100;
        
        const silverChips = Math.floor(remaining / 25);
        for (let i = 0; i < silverChips; i++) {
          chips.push({ type: 'silver-chip', value: 25 });
        }
        remaining -= silverChips * 25;
        
        const blueChips = Math.floor(remaining / 5);
        for (let i = 0; i < blueChips; i++) {
          chips.push({ type: 'blue-chip', value: 5 });
        }
        remaining -= blueChips * 5;
        
        for (let i = 0; i < remaining; i++) {
          chips.push({ type: 'red-chip', value: 1 });
        }
        
        // Dynamically adjust max chip count based on screen size and player count
        let maxChips = 12; // Default for standard screens
          if (window.innerWidth > 1920) {
          // Allow more chips for large screens
          maxChips = this.players.length > 6 ? 14 : 18;
        } else {
          // For normal and small screens
          maxChips = this.players.length > 6 ? 8 : 12;
        }
        
        return chips.slice(0, maxChips);
      }
    },
  };
  </script>
  
  <style scoped>
  .poker-table {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 300px;
    border-radius: 35%;
    overflow: visible;
  }
  
  .table-surface {
    width: 100%;
    height: 100%;
    border-radius: 35%;
    background: radial-gradient(ellipse at center, #056947 0%, #02331e 100%);
  }

  .pot-display {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 24px;
    font-weight: bold;
    z-index: 1;
  }

  .player-bet {
    position: absolute;
    z-index: 3;
    text-align: center;
  }

  .chip-stack {
    position: relative;
    height: 65px;
    width: 50px;
    margin: 0 auto;
  }

  .poker-chip {
    position: absolute;
    width: 40px;
    height: 8px;
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.8);
    border: 2px dashed white; 
    outline: none; 
  }
  .poker-chip:nth-child(2) { bottom: 3px; }
  .poker-chip:nth-child(3) { bottom: 6px; }
  .poker-chip:nth-child(4) { bottom: 9px; }
  .poker-chip:nth-child(5) { bottom: 12px; }
  .poker-chip:nth-child(6) { bottom: 15px; }
  .poker-chip:nth-child(7) { bottom: 18px; }
  .poker-chip:nth-child(8) { bottom: 21px; }
  .poker-chip:nth-child(9) { bottom: 24px; }
  .poker-chip:nth-child(10) { bottom: 27px; }
  .poker-chip:nth-child(11) { bottom: 30px; }
  .poker-chip:nth-child(12) { bottom: 33px; }
  
  .poker-chip:nth-child(13) { bottom: 36px; }
  .poker-chip:nth-child(14) { bottom: 39px; }
  .poker-chip:nth-child(15) { bottom: 42px; }
  .poker-chip:nth-child(16) { bottom: 45px; }
  .poker-chip:nth-child(17) { bottom: 48px; }
  .poker-chip:nth-child(18) { bottom: 51px; }

  .poker-chip::before {
    display: none;
  }

  .gold-chip {
    background: radial-gradient(circle at center, #ffd700 0%, #b8860b 100%);
    border-color: white;
  }

  .silver-chip {
    background: radial-gradient(circle at center, #e0e0e0 0%, #a0a0a0 100%);
    border-color: white;
  }

  .blue-chip {
    background: radial-gradient(circle at center, #3a6fd8 0%, #1e40af 100%);
    border-color: white;
  }

  .red-chip {
    background: radial-gradient(circle at center, #ff5b5b 0%, #c41e3a 100%);
    border-color: white;
  }

  .bet-amount {
    position: absolute;
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--accent-gold, gold);
    font-weight: bold;
    font-size: 16px;
    text-shadow: 0 0 8px rgba(0, 0, 0, 1), 0 0 12px rgba(0, 0, 0, 1);
    white-space: nowrap;
    padding: 2px 8px;
    z-index: 2;
  }

  .fold-indicator {
    color: #ff4d4f;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 0 0 8px rgba(0, 0, 0, 1), 0 0 12px rgba(0, 0, 0, 1);
    opacity: 0.9;
    transform: translateY(20px);
  }

  .empty-bet {
    width: 40px;
    height: 8px;
    opacity: 0.1;
  }
  .current-player {
    border: 2px solid yellow;
  }  
  @media (min-width: 1921px) {
    .poker-table {
      width: 900px;
      height: 400px;
    }
    
    .pot-display {
      font-size: 28px;
    }
    
    .poker-chip {
      width: 45px;
      height: 10px;
    }
    
    .chip-stack {
      height: 90px;
    }
    
    .bet-amount {
      font-size: 18px;
      bottom: -26px;
    }
    
    .fold-indicator {
      font-size: 16px;
    }
  }  
  @media (max-width: 768px) {
    .poker-table {
      width: 560px;
      height: 250px;
    }
    
    .pot-display {
      font-size: 20px;
    }
    
    .poker-chip {
      width: 35px;
      height: 7px;
    }
    
    .bet-amount {
      font-size: 14px;
    }
  }
  
  @media (max-width: 576px) {
    .poker-table {
      width: 450px;
      height: 200px;
    }
    
    .pot-display {
      font-size: 18px;
    }
    
    .poker-chip {
      width: 30px;
      height: 6px;
    }
    
    .bet-amount {
      font-size: 12px;
      bottom: -18px;
    }
    
    .fold-indicator {
      font-size: 12px;
    }
  }
    .poker-table.many-players .poker-chip {
    width: 30px;
    height: 6px;
  }
  
  .poker-table.many-players .chip-stack {
    height: 50px;
  }
  
  .poker-table.many-players .bet-amount {
    font-size: 14px;
  }

  </style>
