<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>


<script>

export default {
  name: 'StockPoker',
}
</script>

<style>
@import './assets/styles/common.css';

#app {
  font-family: 'Roboto Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: grey;
}
</style>
