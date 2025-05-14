<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="filteredItems"
    :sort-by="[{ key: 'ticker', order: 'asc' }]"
    item-key="id"
    v-model:expanded="expanded"
    
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

      <MenuCarteira :carteira-id="$route.params.id" />

      <!-- Filtros em linha única acima da tabela -->
      <v-card flat class="mb-4">
        <v-card-title class="text-h6">Filtros
          <v-btn
              flat
              :icon="mostrarCard ? 'mdi-arrow-collapse' : 'mdi-arrow-expand'"
              density="compact" 
              @click="mostrarCard = !mostrarCard"
          ></v-btn>
          
        </v-card-title>
        <v-card-text class="pa-2" v-if="mostrarCard">
          <v-row dense align="center">
            
            <v-col cols="12" sm="2" md="2">
              <v-autocomplete
                v-model="filters.ticker"
                :items="tickers"
                item-title="nome"
                item-value="id"
                label="Ticker"
                clearable
                density="compact"
                variant="outlined"
                hide-details
                @update:modelValue="applyFilters"
              ></v-autocomplete>
            </v-col>
            
            <v-col cols="12" sm="12" md="3" class="text-left">
              <v-btn
                color="secondary"
                variant="outlined"
                size="small"
                @click="clearFilters"
                title="Limpar filtros"
              >
                <v-icon start>mdi-filter-off</v-icon>
                Limpar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

    </template>
    <template v-slot:item.preco_medio="{ item }">
      {{ formatCurrency(item.preco_medio, item.Ticker.MoedaId) }}
      <v-btn
        flat
        :icon="isExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        density="compact" 
        size="small"
        @click="toggleExpand(item)"
      ></v-btn>
    </template>
    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length">
          IGOR {{ console.log('ID usado para expansão:', item.Ticker.id) }}
        </td>
      </tr>
    </template>
    <template v-slot:item.lucro_realizado="{ item }">
      {{ formatCurrency(item.lucro_realizado, item.Ticker.MoedaId) }}
    </template>
    <template v-slot:item.investido="{ item }">
      {{ formatCurrency(item.investido, item.Ticker.MoedaId) }}
    </template>
    <template v-slot:item.atual="{ item }">
      {{ formatCurrency(item.quantidade * item.cotacao, item.Ticker.MoedaId) }}
    </template>
    <template v-slot:item.cotacao="{ item }">
      {{ item.cotacao ? formatCurrency(item.cotacao, item.Ticker.MoedaId) : 'N/A' }}
    </template>
    <template v-slot:item.rendimento="{ item }">
      <v-chip :style="{ color: item.rendimento < 0 ? 'red' : item.rendimento > 10 ? 'green' : 'black' }">
        {{ item.cotacao ? item.rendimento.toFixed(2) + "%" : "N/A" }}
      </v-chip>
    </template>
    <template v-slot:item.proventos="{ item }">
      {{ formatCurrency(item.proventos, item.Ticker.MoedaId) }}
    </template>
    <template v-slot:item.hoje="{ item }">
      <v-chip :style="{ color: item.hoje < 0 ? 'red' : 'green' }">
        {{ item.close ? item.hoje.toFixed(2) + "%" : "N/A" }}
      </v-chip>
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
import stockService from "@/services/stockService";
import MenuCarteira from '@/components/MenuCarteira.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    MenuCarteira,
  },
  data: () => ({
    expanded: [],
    mostrarCard: false,
    filters: {
      ticker: null,
    },
    tickers: [],
    symbols: [],
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
      { title: "Lucro", key: "lucro_realizado", value: "lucro_realizado" },
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

    // Mapeie o getter corretamente
    ...mapGetters('filters', {
      filtrosDashboard: 'getFiltros' // Mapeando com alias
    }),
    
    filteredItems() {
      // Chame o getter como função passando 'dashboard' como parâmetro
      const filtros = this.filtrosDashboard('dashboard')
      return this.items.filter(item => {
        const matchesTicker = !filtros.ticker || item.Ticker.id === filtros.ticker
        return matchesTicker
      })
    },

    carteiraId() {
      return this.$route.params.id
    },

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

    toggleExpand(item) {
      const index = this.expanded.indexOf(item.id)
      if (index > -1) {
        this.expanded.splice(index, 1)
      } else {
        this.expanded.push(item.id)
      }
    },
    
    isExpanded(item) {
      return this.expanded.includes(item.id)
    },

    // Mapeie as actions corretamente
    ...mapActions('filters', [
      'aplicarFiltros',
      'limparFiltros'
    ]),
    
    applyFilters() {
      this.aplicarFiltros({
        pagina: 'dashboard',
        filtros: this.filters
      })
    },
    
    clearFilters() {
      this.filters = { ticker: null }
      this.limparFiltros('dashboard')
    },
    
    loadFilters() {
      const savedFilters = this.filtrosDashboard('dashboard')
      this.filters = { ...this.filters, ...savedFilters }
    },

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
              item.close = cotacao.close;
          }
          
      });

      this.items = this.items.map(item => ({
        ...item,
        rendimento: this.calcularRendimento(item),
        hoje: this.calcularHoje(item),
      }));

      console.log(this.items);

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

    formatCurrency(value, formato) {
      // Formata o valor como moeda brasileira (R$)
      if (formato == 1) {
        return value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      } else if (formato == 2) {
        return value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        });
      }
    },
    
    calcularRendimento(item) {
      const { quantidade, cotacao, investido } = item;

      // console.log(`🔎 item:`, item);
      // console.log(`📊 Quantidade: ${quantidade}, Cotação: ${cotacao}, Investido: ${investido}`);

      if (!investido || isNaN(quantidade) || isNaN(cotacao) || isNaN(investido)) {
        // console.warn(`⚠️ Dados inválidos para cálculo`, item);
        return 0;
      }

      const rendimento = ((quantidade * cotacao - investido) / investido) * 100;

      // console.log(`✅ Rendimento calculado: ${rendimento.toFixed(2)}%`);

      return rendimento;
    },

    calcularHoje(item) {
      //const { cotacao } = item;

      // console.log(`🔎 item:`, item);
      // console.log(`📊 Quantidade: ${quantidade}, Cotação: ${cotacao}, Investido: ${investido}`);

      const hoje = ((item.cotacao/item.close-1)*100);

      // console.log(`✅ Rendimento calculado: ${rendimento.toFixed(2)}%`);

      return hoje;
    },

    loadItems() {
      api.get(`/dashboards?CarteiraId=${this.carteiraid}`).then((response) => {
        // this.items = response.data.map(item => ({
        //   ...item,
        //   rendimento: this.calcularRendimento(item)
        // }));
        this.items = response.data;
        // Extrair os tickers que foram recebidos
        this.symbols = this.items.map(item => item.Ticker.nome);
        // Extrair os códigos dos tickers que foram recebidos
        this.symbols_id = this.items.map(item => item.Ticker.id);
        // Invocar o método que recupera os dados de preço dos tickers
        this.fetchMultipleStockQuotes();
        // Invocar o método que recupera os proventos de cada ticker
        this.fetchMultipleProventos();
        console.log(this.items);
      });
      api.get(`/carteira?id=${this.carteiraid}`).then((response) => {
        this.CarteiraNome = response.data[0]["nome"];
        // console.log(response.data[0]["nome"]);
      });
      api.get(`/ticker`).then((response) => {
        this.tickers = response.data;
        // console.log(response.data[0]["nome"]);
      });
    },

    
  },
}
</script>