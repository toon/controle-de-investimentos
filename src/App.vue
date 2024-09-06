<template>
  <v-app id="inspire">

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Controle de investimentos</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      permanent
    >

    <v-list nav>
      <v-list-item prepend-icon="mdi-wallet" title="Carteiras" value="carteiras" to="/carteiras"></v-list-item>
      <v-list-item prepend-icon="mdi-factory" title="Tickers" value="tickers" to="/tickers"></v-list-item>
      <v-list-item prepend-icon="mdi-cog" title="Tipos de Operação" value="tiposoperacao" to="/tiposoperacao"></v-list-item>
      <v-list-item prepend-icon="mdi-cog" title="Tipos de Provento" value="tiposprovento" to="/tiposprovento"></v-list-item>
    </v-list>    
    
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-2">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'

  const drawer = ref(null)
</script>

<script>
  export default {
    data: () => (
      { 
        drawer: null,
      }
    ),
  }
</script>