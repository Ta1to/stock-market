<template>
    <div class="poker-table">
      <!-- Elliptical table surface -->
      <div class="table-surface"></div>
  
      <!-- Render each player around the ellipse -->
      <PlayerCard
        v-for="(player, index) in players"
        :key="player.id"
        :player="player"
        :style="getPositionStyle(index, players.length)"
      />
    </div>
  </template>
  
  <script>
  import PlayerCard from "./PlayerCard.vue";
  
  export default {
    name: "PokerTable",
    components: {
      PlayerCard,
    },
    props: {
      players: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      /**
       * Positions each player around an ellipse by dividing 360 degrees
       * among totalPlayers.
       */
      getPositionStyle(index, totalPlayers) {
        // For N players, angles = 0, 360/N, 2*(360/N), ...
        // For 2 players, that’s 0 and 180 => top & bottom center
        const angle = (360 / totalPlayers) * index;
  
        // Ellipse sizing (you can adjust as needed)
        // These numbers assume .poker-table is 600x400 (below in CSS).
        const radiusX = 400; // horizontal radius
        const radiusY = 140; // vertical radius
        const centerX = 400; // half of .poker-table width
        const centerY = 200; // half of .poker-table height
  
        // Convert angle to radians
        const rad = (angle * Math.PI) / 180;
        // Compute x,y on ellipse
        const x = centerX + radiusX * Math.cos(rad);
        const y = centerY + radiusY * Math.sin(rad);
  
        return {
          position: "absolute",
          top: `${y}px`,
          left: `${x}px`,
          transform: "translate(-50%, -50%)",
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* 
    Outer container for the table. 
    If you want it responsive, you can use % or vw/vh instead of fixed px.
  */
  .poker-table {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  
    /* Example fixed size for demonstration */
    width: 800px;
    height: 400px;
  
    /* This makes it elliptical. 50% border-radius on a non-square area => ellipse */
    border-radius: 35%;
    overflow: visible;
  }
  
  /* The actual “felt” or surface of the table */
  .table-surface {
    width: 100%;
    height: 100%;
    border-radius: 35%;
    background: radial-gradient(ellipse at center, #056947 0%, #02331e 100%);
  }
  </style>
  