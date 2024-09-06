<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :sort-by="[{ key: 'data', order: 'desc' }]"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title><v-icon>mdi-monitor-dashboard</v-icon> Dashboard {{ CarteiraNome }}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
    </template>
    <template v-slot:item.preco_medio="{ item }">
      {{ formatCurrency(item.preco_medio) }}
    </template>
    <template v-slot:item.investido="{ item }">
      {{ formatCurrency(item.investido) }}
    </template>
    <template v-slot:item.proventos="{ item }">
      {{ formatCurrency(item.proventos) }}
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="loadItems"
      >
        Recarregar
      </v-btn>
    </template>
  </v-data-table>
</template>
<script>
import api from "../services/api";

export default {
  data: () => ({
    valid: false,
    carteiraid: null,
    CarteiraNome: "carregando...",
    items: [],
    headers: [
      { title: "Ticker", key:"ticker", align: "center", value: "Ticker.nome" },
      { title: "Qtde.", key:"quantidade", align: "center", value: "quantidade" },
      { title: "Preço médio", key: "preco_medio", align: "center", value: "preco_medio" },
      { title: "Investido", key: "investido", align: "center", value: "investido" },
      { title: "Atual", key: "atual", align: "center", value: "atual" },
      { title: "Cotação", key: "cotacao", align: "center", value: "cotacao" },
      { title: "Rendimento", key: "rendimento", align: "center", value: "rendimento" },
      { title: "Resultado", key: "resultado", align: "center", value: "resultado" },
      { title: "Proventos", key: "proventos", align: "center", value: "proventos" },
      { title: "% Hoje", key: "hoje", align: "center", value: "hoje" },
    ],


  }),

  computed: {
  },

  watch: {
  },

  created() {
    this.carteiraid = this.$route.params.id;
    this.loadItems();
  },

  methods: {



    calculateTotal(quantidade, precoUnitario, taxas) {
      const total = quantidade * precoUnitario + taxas;
      // Formata o valor total como moeda
      return total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    },

    formatCurrency(value) {
      // Formata o valor como moeda brasileira (R$)
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    },

    loadItems() {
      api.get(`/dashboards?CarteiraId=${this.carteiraid}`).then((response) => {
        this.items = response.data;
      });
      api.get(`/carteira?id=${this.carteiraid}`).then((response) => {
        this.CarteiraNome = response.data[0]["nome"];
        // console.log(response.data[0]["nome"]);
      });
      // api.get(`/ticker`).then((response) => {
      //   this.tickers = response.data;
      //   // console.log(response.data[0]["nome"]);
      // });
    },

    
  },
}
</script>