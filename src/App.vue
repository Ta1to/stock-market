<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>


<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Roboto Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: grey;
}
</style>
