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
        <v-list-item prepend-icon="mdi-file-certificate-outline" title="Opções" value="opcoes" to="/opcoes"></v-list-item>
        <v-list-item prepend-icon="mdi-factory" title="Tickers" value="tickers" to="/tickers"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Investidores" value="investidores" to="/investidores"></v-list-item>
        <v-list-item prepend-icon="mdi-domain" title="Corretoras" value="corretoras" to="/corretoras"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Tipos de Ativo" value="tiposativo" to="/tiposativo"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Tipos de Classificação de Ativo" value="tiposativoclassificacao" to="/tiposativoclassificacao"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Tipos de Agrupamento de Ativo" value="tiposativoagrupamento" to="/tiposativoagrupamento"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Tipos de Operação" value="tiposoperacao" to="/tiposoperacao"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Tipos de Provento" value="tiposprovento" to="/tiposprovento"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Opções: Tipo de Operação" value="tiposopcaooperacoes" to="/tiposopcaooperacoes"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Opções: Tipo de Status" value="tiposopcaostatus" to="/tiposopcaostatus"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Opções: Tipo de Período" value="tiposopcaoperiodo" to="/tiposopcaoperiodo"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Moedas" value="moedas" to="/moedas"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Carregar CSV" value="carregarcsv" to="/carregarcsv"></v-list-item>
      </v-list>    
    </v-navigation-drawer>

    <v-main style="min-height: 100vh;">
      <v-container fluid style="height: 100%;">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'

  const drawer = ref(false)
</script>

<script>
export default {
  data: () => ({
    drawer: null,
  }),
}
</script>