<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table-virtual
    :headers="headers"
    :items="items"
    :sort-by="[{ key: 'data', order: 'desc' }]"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title><v-icon>mdi-monitor-dashboard</v-icon>
          <v-btn
          color="primary"
          @click="exibirConsole"
          >Console</v-btn>

          &nbsp;<v-btn
          color="green"
          icon="mdi-refresh-circle"
          density="comfortable" 
          @click="fetchMultipleStockQuotes"
          ></v-btn>

          Dashboard {{ CarteiraNome }} 
        </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
    </template>
    <template v-slot:item.preco_medio="{ item }">
      {{ formatCurrency(item.preco_medio) }}
    </template>
    <template v-slot:item.investido="{ item }">
      {{ formatCurrency(item.investido) }}
    </template>
    <template v-slot:item.atual="{ item }">
      {{ formatCurrency(item.quantidade * item.cotacao) }}
    </template>
    <template v-slot:item.cotacao="{ item }">
      {{ item.cotacao ? formatCurrency(item.cotacao) : 'N/A' }}
    </template>
    <template v-slot:item.rendimento="{ item }">
      <v-chip :style="{ color: ((((item.quantidade * item.cotacao)-item.investido)/item.investido*100).toFixed(2)) < 0 ? 'red' : ((((item.quantidade * item.cotacao)-item.investido)/item.investido*100).toFixed(2)) > 10 ? 'green' : 'black' }">
        {{ (((item.quantidade * item.cotacao)-item.investido)/item.investido*100).toFixed(2) }}%
      </v-chip>
    </template>
    <template v-slot:item.proventos="{ item }">
      {{ formatCurrency(item.proventos) }}
    </template>
    <template v-slot:item.hoje="{ item }">
      {{ item.open ? ((1-item.cotacao/item.open)*100).toFixed(2) + "%" : "N/A" }}
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="loadItems"
      >
        Recarregar
      </v-btn>
    </template>
  </v-data-table-virtual>
</template>
<script>
import api from "../services/api";
import stockService from "@/services/stockService";

export default {
  data: () => ({
    symbols: null,
    symbols_id: null,
    quote: 'carregando...',
    multipleQuotes: 0,
    valid: false,
    carteiraid: null,
    CarteiraNome: "carregando...",
    items: [],
    multipleProventos: [],
    headers: [
      { title: "Ticker", key:"ticker", value: "Ticker.nome" },
      { title: "Qtde.", key:"quantidade", value: "quantidade" },
      { title: "Preço médio", key: "preco_medio", value: "preco_medio" },
      { title: "Investido", key: "investido", value: "investido" },
      { title: "Atual", key: "atual", value: "atual" },
      { title: "Cotação", key: "cotacao", value: "cotacao" },
      { title: "Rendimento", key: "rendimento", value: "rendimento" },
      { title: "Proventos", key: "proventos", value: "proventos" },
      { title: "% Hoje", key: "hoje", value: "hoje" },
    ],
    // headers: [
    //   { title: "Ticker", key:"ticker", align: "center", value: "Ticker.nome" },
    //   { title: "Qtde.", key:"quantidade", align: "center", value: "quantidade" },
    //   { title: "Preço médio", key: "preco_medio", align: "center", value: "preco_medio" },
    //   { title: "Investido", key: "investido", align: "center", value: "investido" },
    //   { title: "Atual", key: "atual", align: "center", value: "atual" },
    //   { title: "Cotação", align: "center", key: "cotacao", value: "cotacao" },
    //   { title: "Rendimento", key: "rendimento", align: "center", value: "rendimento" },
    //   { title: "Proventos", key: "proventos", align: "center", value: "proventos" },
    //   { title: "% Hoje", key: "hoje", align: "center", value: "hoje" },
    // ],

  }),

  computed: {
  },

  watch: {

    multipleQuotes: {
      handler(novoValor) {
        this.atualizaCotacoes();
      },
      deep: true
    },

    multipleProventos: {
      handler(novoValor) {
        this.atualizaProventos();
      },
      deep: true
    },

  },

  created() {
    this.carteiraid = this.$route.params.id;
    this.loadItems();
    // this.fetchStockQuotes();
  },

  mounted() {
    // this.fetchStockQuotes();
  },

  methods: {

    // Botão para chamar o método
    // <v-btn
    // @click="exibirConsole"
    // >Console</v-btn>
    exibirConsole() {
      console.log(this.items);
    },

    atualizaCotacoes () {

      // Itera sobre o primeiro array e adiciona o preço
      this.items.forEach(item => {

          // Busca o item correspondente pelo nome do ticker
          const cotacao = this.multipleQuotes.find(c => c.ticker === item.Ticker.nome);
          
          // Se encontrar uma correspondência, adiciona o preço ao objeto
          if (cotacao) {
              item.cotacao = cotacao.price;
              item.open = cotacao.open;
              item.high = cotacao.high;
              item.low = cotacao.low;
          }
          
      });
    },


    atualizaProventos () {

      // Itera sobre o primeiro array e adiciona valor ao outro
      this.items.forEach(item => {

          // Busca o item correspondente pelo nome do ticker
          const provento = this.multipleProventos.find(c => c.ticker === item.Ticker.id);
          
          // Se encontrar uma correspondência, adiciona o preço ao objeto
          if (provento) {
              // item.proventos = provento.total;
          }
          
      });
    },


    async fetchStockQuote() {
      if (!this.stockSymbol) return;

      try {
        this.quote = await stockService.getStockQuote(this.stockSymbol);
      } catch (error) {
        console.error('Erro ao buscar cotação da ação:', error);
      }
    },

    async fetchMultipleStockQuotes() {
      if (!this.symbols) return;
      
      try {
        this.multipleQuotes = await stockService.getMultipleStockQuotes(this.symbols);
      } catch (error) {
        console.error('Erro ao buscar múltiplas cotações:', error);
      }
    },

    async fetchMultipleProventos() {
      if (!this.symbols) return;
      
      try {
        
        api.get(`/aggregation/Provento/total/sum/TickerId?ativos=${this.symbols_id}`).then((response) => {
          this.multipleProventos = response.data;
          // this.CarteiraNome = response.data[0]["nome"];
          // console.log(response.data[0]["nome"]);
        });

      } catch (error) {
        console.error('Erro ao buscar múltiplos proventos:', error);
      }
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
        // Extrair os tickers que foram recebidos
        this.symbols = this.items.map(item => item.Ticker.nome);
        // Extrair os códigos dos tickers que foram recebidos
        this.symbols_id = this.items.map(item => item.Ticker.id);
        // Invocar o método que recupera os dados de preço dos tickers
        this.fetchMultipleStockQuotes();
        // Invocar o método que recupera os proventos de cada ticker
        this.fetchMultipleProventos();
      });
      api.get(`/carteira?id=${this.carteiraid}`).then((response) => {
        this.CarteiraNome = response.data[0]["nome"];
        // console.log(response.data[0]["nome"]);
      });
    },

    
  },
}
</script>