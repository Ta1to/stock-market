<template>
  <div class="player-card" :class="{ 'current-player': isCurrentTurn }">
    <!-- Player avatar section -->
    <div class="player-avatar">
      <img 
        v-if="player.profilePicture" 
        :src="player.profilePicture" 
        alt="Player Avatar" 
      />
      <div 
        v-else 
        class="default-avatar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#e3e3e3"
        >
          <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
        </svg>
      </div>
    </div>

    <div class="player-info">
      <div class="player-name">{{ player.name || player.id }}</div>
      <div class="player-chips">Chips: {{ player.chips }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlayerCard",
  props: {
    player: {
      type: Object,
      required: true,
    },
    currentTurnId: {
      type: [Number, String],
      default: null,
    }
  },  computed: {
    isCurrentTurn() {
      return this.player.uid === this.currentTurnId;
    }
  },
};
</script>

<style scoped>
.player-card {
  width: 120px;
  padding: 8px;
  background-color: #333;
  color: #fff;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.3s, border 0.3s;
}

.current-player {
  border: 2px solid yellow;
}

.player-avatar {
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-avatar img {
  width: 100%;
  height: auto;
  display: block;
}

.default-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.player-info {
  margin-bottom: 8px;
}

.player-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.player-chips {
  font-size: 14px;
  margin-bottom: 4px;
}
</style>
