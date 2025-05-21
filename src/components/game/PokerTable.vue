<template>
    <div class="poker-table">
      <!-- Elliptical table surface -->
      <div class="table-surface"></div>
  
      <!-- Display the pot in the center of the table -->
      <div class="pot-display">
        Pot: {{ pot }}
      </div>      <!-- Render each player around the ellipse -->
      <PlayerCard
        v-for="(player, index) in players"
        :key="player.id"
        :player="player"
        :currentTurnId="currentTurnPlayer ? currentTurnPlayer.uid : null"
        :style="getPositionStyle(index, players.length)"
      />

      <!-- Redesigned chip stacks directly on table -->
      <div 
        v-for="(player, index) in players" 
        :key="`bet-${player.id}`" 
        class="player-bet"
        :style="getBetPositionStyle(index, players.length)"
      >
        <!-- Show chips for active bets -->
        <div v-if="getPlayerBet(player.uid) > 0" class="chip-stack">
          <!-- Generate chip stack based on bet amount -->
          <div 
            v-for="(chip, chipIndex) in generateChipStack(getPlayerBet(player.uid))" 
            :key="chipIndex"
            class="poker-chip"
            :class="chip.type"
            :style="{ bottom: `${chipIndex * 4}px` }"
          ></div>
          <div class="bet-amount">{{ getPlayerBet(player.uid) }}</div>
        </div>
        
        <!-- Folded indicator -->
        <div v-else-if="hasPlayerFolded(player.uid)" class="fold-indicator">
          Folded
        </div>
        
        <!-- Empty bet space -->
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
    },
    computed: {
      currentTurnPlayer() {
        if (!this.players.length || this.currentTurnIndex < 0 || this.currentTurnIndex >= this.players.length) {
          return null;
        }
        return this.players[this.currentTurnIndex];
      },
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
      
      /**
       * Positions each player around an ellipse by dividing 360 degrees
       * among totalPlayers.
       */
      getPositionStyle(index, totalPlayers) {
        const angle = (360 / totalPlayers) * index;
  
        const radiusX = 400; // horizontal radius
        const radiusY = 140; // vertical radius
        const centerX = 400; // half of .poker-table width
        const centerY = 200; // half of .poker-table height
  
        const rad = (angle * Math.PI) / 180;
        const x = centerX + radiusX * Math.cos(rad);
        const y = centerY + radiusY * Math.sin(rad);
  
        return {
          position: "absolute",
          top: `${y}px`,
          left: `${x}px`,
          transform: "translate(-50%, -50%)",
        }
      },

      getBetPositionStyle(index, totalPlayers) {
        const angle = (360 / totalPlayers) * index;
        
        const radiusX = 280; // less than player position radiusX
        const radiusY = 100; // less than player position radiusY
        const centerX = 400;
        const centerY = 200;
        
        const rad = (angle * Math.PI) / 180;
        const x = centerX + radiusX * Math.cos(rad);
        const y = centerY + radiusY * Math.sin(rad);
        
        return {
          position: "absolute",
          top: `${y}px`,
          left: `${x}px`,
          transform: "translate(-50%, -50%)",
        }
      },

      /**
       * Generate an array of chips representing the bet amount
       * Different denominations represented by different chip types
       */
      generateChipStack(betAmount) {
        if (!betAmount || betAmount <= 0) return [];
        
        const chips = [];
        let remaining = betAmount;
        
        // Generate chips in denominations (100, 25, 5, 1)
        // Higher value chips at the bottom of the stack
        
        // Add gold chips (100 each)
        const goldChips = Math.floor(remaining / 100);
        for (let i = 0; i < goldChips; i++) {
          chips.push({ type: 'gold-chip', value: 100 });
        }
        remaining -= goldChips * 100;
        
        // Add silver chips (25 each)
        const silverChips = Math.floor(remaining / 25);
        for (let i = 0; i < silverChips; i++) {
          chips.push({ type: 'silver-chip', value: 25 });
        }
        remaining -= silverChips * 25;
        
        // Add blue chips (5 each)
        const blueChips = Math.floor(remaining / 5);
        for (let i = 0; i < blueChips; i++) {
          chips.push({ type: 'blue-chip', value: 5 });
        }
        remaining -= blueChips * 5;
        
        // Add red chips (1 each)
        for (let i = 0; i < remaining; i++) {
          chips.push({ type: 'red-chip', value: 1 });
        }
        
        // Limit stack height for visual appearance
        return chips.slice(0, 12); // Maximum 12 chips visible in stack
      }
    },
  };
  </script>
  
  <style scoped>
  .poker-table {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 400px;
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

  /* Redesigned chip style to match PokerHUD */
  .poker-chip {
    position: absolute;
    width: 40px;
    height: 8px;
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.8);
    border: 2px dashed white; /* Add white dashed border like in PokerHUD */
    outline: none; /* Remove previous outline */
  }

  /* Chip stacking with better 3D perspective - keep existing positioning */
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

  /* Remove previous chip pattern styling and use simple dashed border instead */
  .poker-chip::before {
    display: none;
  }

  /* Update chip colors while keeping radial gradients */
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

  /* Improved bet amount display without background */
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
  }

  .empty-bet {
    width: 40px;
    height: 8px;
    opacity: 0.1;
  }

  /* Highlight the current user with a yellow border or background */
  .current-player {
    border: 2px solid yellow;
    /* Alternatively, you might want to change the background-color */
    /* background-color: #fdfd96; */
  }

  </style>
