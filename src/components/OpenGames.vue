<script>
import { readData } from "@/services/database";

export default {
  data() {
    return {
      publicGames: [], 
    };
  },
  methods: {
    async fetchGames() {
      try {
        const games = await readData("games");
        this.publicGames = Object.entries(games || {})
          .filter(([/* id */, game]) => game.isPublic === true)
          .map(([id, game]) => ({ id, ...game }));
      } catch (error) {
        console.error("Fehler beim Laden der Spiele: ", error);
      }
    },
  },
  created() {
    this.fetchGames(); 
  },
};
</script>

<template>
  <div>
    <h2 class="text-xl mb-4">Öffentliche Spiele</h2>
    <ul v-if="publicGames.length">
      <li v-for="game in publicGames" :key="game.id">
        <span>{{ game.code }} - {{ game.players.length }} Spieler</span>
        <button @click="$router.push(`/lobby/${game.id}`)" class="ml-2 p-2 bg-blue-500 rounded">Beitreten</button>
      </li>
    </ul>
    <p v-else>Keine öffentlichen Spiele verfügbar.</p>
  </div>
</template>
