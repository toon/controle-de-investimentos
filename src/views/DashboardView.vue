<template>
  <div>
  <!-- Barra de ferramentas simplificada -->
  <v-toolbar flat>
    <v-toolbar-title>
      <v-icon>mdi-monitor-dashboard</v-icon>
      Dashboard {{ CarteiraNome }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn
      color="primary"
      @click="exibirConsole"
      class="mr-2"
    >Console</v-btn>
    <v-btn
      color="green"
      icon="mdi-refresh-circle"
      density="comfortable" 
      @click="fetchMultipleStockQuotes"
      title="Atualizar cotações"
    ></v-btn>
  </v-toolbar>

  <MenuCarteira :carteira-id="$route.params.id" />

  <!-- Filtros com botões de visualização à direita -->
  <v-card flat class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="text-h6">Filtros</div>
      <div class="d-flex align-center">
        <v-btn
          flat
          :icon="mostrarCard ? 'mdi-arrow-collapse' : 'mdi-arrow-expand'"
          density="compact" 
          @click="mostrarCard = !mostrarCard"
          size="small"
          class="mr-2"
        ></v-btn>
        
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          density="compact"
        >
          <v-btn value="table" icon="mdi-table" title="Visualização em tabela"></v-btn>
          <v-btn value="cards" icon="mdi-view-grid" title="Visualização em cards"></v-btn>
        </v-btn-toggle>
      </div>
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

    <!-- Visualização em Tabela -->
    <v-data-table
      v-if="viewMode === 'table'"
      :headers="headers"
      :items="filteredItems"
      item-key="id"
      hover
      hover-color="#f5f5f5"
      :items-per-page="25"
    >
      <template v-slot:item.preco_medio="{ item }">
        {{ $formatCurrency(item.preco_medio, item.Ticker.MoedaId) }}
        <v-btn
          flat
          icon="mdi-plus-circle-outline"
          density="compact" 
          size="small"
          @click="(item.cotacao) ? abrirDialog(item) : null"
        ></v-btn>
      </template>

      <template v-slot:item.quantidade="{ item }">
        {{ Number.isInteger(item.quantidade) ? item.quantidade : item.quantidade.toFixed(2) }}
      </template>    
      <template v-slot:item.lucro_realizado="{ item }">
        {{ $formatCurrency(item.lucro_realizado, item.Ticker.MoedaId) }}
      </template>
      <template v-slot:item.investido="{ item }">
        {{ $formatCurrency(item.investido, item.Ticker.MoedaId) }}
      </template>
      <template v-slot:item.atual="{ item }">
        {{ $formatCurrency(item.quantidade * item.cotacao, item.Ticker.MoedaId) }}
      </template>
      <template v-slot:item.cotacao="{ item }">
        {{ item.cotacao ? $formatCurrency(item.cotacao, item.Ticker.MoedaId) : 'N/A' }}
      </template>
      <template v-slot:item.lp="{ item }">
        <div :style="{ color: item.rendimento < 0 ? 'red' : item.rendimento > 10 ? 'green' : 'black' }">{{ $formatCurrency(item.quantidade * item.cotacao - item.investido, item.Ticker.MoedaId) }}</div>
      </template>
      <template v-slot:item.rendimento="{ item }">
        <v-chip density="compact" :style="{ color: item.rendimento < 0 ? 'red' : item.rendimento > 10 ? 'green' : 'black' }">
          {{ item.cotacao ? item.rendimento.toFixed(2) + "%" : "N/A" }}
        </v-chip>
      </template>
      <template v-slot:item.proventos="{ item }">
        {{ $formatCurrency(item.proventos, item.Ticker.MoedaId) }}
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

    <!-- Visualização em Cards -->
    <v-container fluid class="mt-4" v-else>
      <v-row dense>
        <v-col
          v-for="item in filteredItems"
          :key="item.id"
          cols="12" sm="6" md="4" lg="3"
        >
          <v-card 
            :border="item.rendimento >= 0 ? 'success' : 'error'"
            elevation="2"
            class="mx-auto card-ativo"
            height="100%"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="40" class="mr-2">
                  <span class="text-h6">{{ item.Ticker.nome.substring(0, 2) }}</span>
                </v-avatar>
                <span class="text-h6">{{ item.Ticker.nome }}</span>
              </div>
              <v-chip 
                :color="item.rendimento >= 0 ? 'success' : 'error'"
                small
                class="ml-2"
              >
                {{ item.rendimento ? item.rendimento.toFixed(2) + '%' : 'N/A' }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <v-list density="compact" class="card-list">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-numeric</v-icon>
                  </template>
                  <v-list-item-title>Quantidade: {{ Number.isInteger(item.quantidade) ? item.quantidade : item.quantidade.toFixed(2) }}</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-cash</v-icon>
                  </template>
                  <v-list-item-title>
                    Preço Médio: {{ $formatCurrency(item.preco_medio, item.Ticker.MoedaId) }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-chart-line</v-icon>
                  </template>
                  <v-list-item-title>
                    Cotação: {{ item.cotacao ? $formatCurrency(item.cotacao, item.Ticker.MoedaId) : 'N/A' }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-trending-up</v-icon>
                  </template>
                  <v-list-item-title>
                    Valor Atual: {{ $formatCurrency(item.quantidade * item.cotacao, item.Ticker.MoedaId) }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-investment</v-icon>
                  </template>
                  <v-list-item-title>
                    Investido: {{ $formatCurrency(item.investido, item.Ticker.MoedaId) }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="item.hoje">
                  <template v-slot:prepend>
                    <v-icon :color="item.hoje >= 0 ? 'success' : 'error'">mdi-arrow-up-down</v-icon>
                  </template>
                  <v-list-item-title>
                    Hoje: <span :style="{ color: item.hoje >= 0 ? 'green' : 'red' }">
                      {{ item.hoje.toFixed(2) }}%
                    </span>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                color="primary"
                variant="text"
                @click="abrirDialog(item)"
                size="small"
              >
                <v-icon>mdi-dots-horizontal</v-icon>
                Preço Médio
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h6">
          Detalhes de {{ itemSelecionado?.Ticker.nome }}
          <v-card-subtitle>
            Cotação do ativo hoje: {{ $formatCurrency(itemSelecionado?.cotacao, itemSelecionado?.Ticker.MoedaId) }}
            <br /> Dólar hoje: {{ $formatCurrency(this.dolar, 1) }}
            </v-card-subtitle>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="[
              { title: 'Data', key: 'data', value: 'data' },
              { title: 'Qtde.', value: 'quantidade' },
              { title: 'Preço M.', key: 'valor_unitario', value: 'valor_unitario' },
              { title: 'Taxas', value: 'taxas' },
              { title: 'Lucro', key: 'lucro', value: 'lucro' },
              { title: 'Rendimento', key: 'rendimento', value: 'rendimento', align: 'center' },
            ]"
            :items="operacoes"
            item-key="id"
            hide-default-footer
            >
            <template v-slot:item.quantidade="{ item }">
              {{ item.quantidade }}
            </template>
            <template v-slot:item.data="{ item }">
              {{ $formatDate(item.data) }}
              <span v-if="item.cotacao_dolar">
                <br />{{ $formatCurrency(item.cotacao_dolar, 1) }}
              </span>
            </template>
            <template v-slot:item.valor_unitario="{ item }">
              {{ $formatCurrency(item.valor_unitario, item.Ticker.MoedaId) }}
              <span v-if="item.cotacao_dolar">
                <br />{{ $formatCurrency(item.cotacao_dolar*item.valor_unitario, 1) }}
              </span>
            </template>
            <template v-slot:item.taxas="{ item }">
              {{ $formatCurrency(item.taxas, item.Ticker.MoedaId) }}
              <span v-if="item.cotacao_dolar">
                <br />{{ $formatCurrency(item.cotacao_dolar*item.taxas, 1) }}
              </span>
            </template>
            <template v-slot:item.cotacao="{ item }">
              {{ $formatCurrency(multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price, item.Ticker.MoedaId) }}
            </template>
            <template v-slot:item.lucro="{ item }">
              <span :style="{ color: (multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade-(item.quantidade*item.valor_unitario) < 0 ? 'red' : 'green' }">
              {{ $formatCurrency((multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade-(item.quantidade*item.valor_unitario), item.Ticker.MoedaId) }}
              </span>
              <span v-if="item.cotacao_dolar">
                <br />{{ $formatCurrency((multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade*item.cotacao_dolar-(item.quantidade*item.valor_unitario*item.cotacao_dolar), 1) }}
              </span>
            </template>
            <template v-slot:item.rendimento="{ item }">
              <v-chip :style="{ color: (((multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade-(item.quantidade*item.valor_unitario))/(item.quantidade*item.valor_unitario)*100).toFixed(2) < 0 ? 'red' : (((multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade-(item.quantidade*item.valor_unitario))/(item.quantidade*item.valor_unitario)*100).toFixed(2) > 10 ? 'green' : 'black' }">
                {{ (((multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade-(item.quantidade*item.valor_unitario))/(item.quantidade*item.valor_unitario)*100).toFixed(2) }}%
              </v-chip>
            <span v-if="item.cotacao_dolar"><br />
                {{ (((multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade*this.dolar-(item.quantidade*item.valor_unitario*item.cotacao_dolar))/(item.quantidade*item.valor_unitario*item.cotacao_dolar)*100).toFixed(2) }}%
              </span>
            </template>
            <template v-slot:body.append>
              <tr class="total-row">
                <td><strong>Sumarização</strong></td>
                <td><strong>{{ itemSelecionado?.quantidade.toFixed(5) }}</strong></td>
                <td>
                  <strong>{{ $formatCurrency(itemSelecionado?.preco_medio, itemSelecionado?.Ticker.MoedaId) }}</strong>
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />{{ $formatCurrency(itemSelecionado?.preco_medio*this.dolar, 1) }}
                  </span>
                </td>
                <td>
                  <strong>{{ $formatCurrency(taxas, itemSelecionado?.Ticker.MoedaId) }}</strong>
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />{{ (itemSelecionado?.taxas!='')?$formatCurrency(taxas*this.dolar, 1):'' }}
                  </span>
                </td>
                <td>
                  <strong>{{ $formatCurrency(((itemSelecionado?.quantidade * itemSelecionado?.cotacao)-itemSelecionado?.investido),itemSelecionado?.Ticker.MoedaId) }}</strong>
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />{{ $formatCurrency(((itemSelecionado?.quantidade * itemSelecionado?.cotacao*this.dolar)-itemSelecionado?.investido*this.dolar), 1) }}
                  </span>
                </td>
                <td align="center">
                  <v-chip :style="{ color: itemSelecionado?.rendimento < 0 ? 'red' : itemSelecionado?.rendimento > 10 ? 'green' : 'black' }">
                    {{ itemSelecionado?.rendimento.toFixed(2) }}%
                  </v-chip>
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />{{ this.rendimento_reais }}%
                  </span>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="fecharDialog()">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
    viewMode: 'table', // 'table' ou 'cards'
    rendimento_reais: 0,
    dolar: 0,
    taxas: 0,
    stockSymbol: null,
    operacoes: [],
    dialog: false,
    itemSelecionado: null,
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
      { title: "Ticker", key:"ticker", value: "Ticker.nome", align: "center" },
      { title: "Qtde.", key:"quantidade", value: "quantidade", align: "end" },
      { title: "Preço médio", key: "preco_medio", value: "preco_medio", align: "end" },
      { title: "Investido", key: "investido", value: "investido", align: "end" },
      { title: "Atual", key: "atual", value: "atual", align: "end" },
      { title: "Cotação", key: "cotacao", value: "cotacao", align: "end" },
      { title: "L/P", key: "lp", value: "lp", align: "end" },
      { title: "Rendimento", key: "rendimento", value: "rendimento", align: "end" },
      { title: "Realizado", key: "lucro_realizado", value: "lucro_realizado", align: "end" },
      { title: "Proventos", key: "proventos", value: "proventos", align: "end" },
      { title: "% Hoje", key: "hoje", value: "hoje" },
    ],
  }),

  computed: {
    ...mapGetters('filters', {
      filtrosDashboard: 'getFiltros'
    }),
    
    filteredItems() {
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
    this.fetchDolarQuote();
  },

  methods: {
    abrirDialog(item) {
      this.itemSelecionado = item;
      this.stockSymbol = item.Ticker.nome;
      api.get(`/operacaose?TipoOperacaoId=1&TipoOperacaoId=3&CarteiraId=${this.carteiraid}&TickerId=${item.Ticker.id}`).then((response) => {
        this.operacoes = response.data;
        let acumulado = 0;
        const selecionadas = [];

        for (let i = this.operacoes.length - 1; i >= 0; i--) {
          const operacao = this.operacoes[i];
          if (acumulado >= item.quantidade) break;

          selecionadas.unshift(operacao);
          acumulado += operacao.quantidade;
        }

        this.operacoes = selecionadas;
        this.taxas = selecionadas.reduce((sum, item) => sum + item.taxas, 0);
        this.rendimento_reais = this.calcularRendimentoReais(selecionadas, item.cotacao * item.quantidade * this.dolar);
      });
      
      this.dialog = true;
    },

    fecharDialog() {
      this.dialog = false;
      this.itemSelecionado = null;
      this.operacoes = [];
    },

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

    exibirConsole() {
      console.log(this.items);
    },

    atualizaCotacoes() {
      this.items.forEach(item => {
        const cotacao = this.multipleQuotes.find(c => c.ticker === item.Ticker.nome);
        if (cotacao) {
          item.cotacao = cotacao.price;
          item.open = cotacao.open;
          item.high = cotacao.high;
          item.low = cotacao.low;
          item.close = cotacao.close;
        }

        item.rendimento = this.calcularRendimento(item);
        item.hoje = this.calcularHoje(item);
      });

      this.items = this.items.map(item => ({
        ...item,
        rendimento: this.calcularRendimento(item),
        hoje: this.calcularHoje(item),
      }));
    },

    atualizaProventos() {
      this.items.forEach(item => {
          const provento = this.multipleProventos.find(c => c.ticker === item.Ticker.id);
          if (provento) {
              // item.proventos = provento.total;
          }
      });
    },

    async fetchDolarQuote() {
      try {
        this.dolar = await stockService.getStockQuote('BRL=X');
        this.dolar = this.dolar.price;
        this.dolar = this.dolar.toFixed(2);
      } catch (error) {
        console.error('Erro ao buscar cotação do dólar:', error);
      }
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
        });
      } catch (error) {
        console.error('Erro ao buscar múltiplos proventos:', error);
      }
    },

    calcularRendimento(item) {
      const { quantidade, cotacao, investido } = item;

      if (!investido || isNaN(quantidade) || isNaN(cotacao) || isNaN(investido)) {
        return 0;
      }

      const rendimento = ((quantidade * cotacao - investido) / investido) * 100;
      return rendimento;
    },

    calcularRendimentoReais(compras, valorAtualAtivo) {
      const totalInvestido = this.calcularTotalInvestido(compras);
      
      if (totalInvestido <= 0) {
        return 0;
      }
      
      const rendimento = ((valorAtualAtivo - totalInvestido) / totalInvestido) * 100;
      return parseFloat(rendimento.toFixed(2));
    },
    
    calcularTotalInvestido(compras) {
      if (!compras || compras.length === 0) {
        return 0;
      }

      const totalInvestido = compras.reduce((total, compra) => {
        const valorUnitario = compra.valor_unitario || compra["valor unitário"] || 0;
        const valorInvestido = compra.quantidade * valorUnitario * compra.cotacao_dolar;
        return total + valorInvestido;
      }, 0);

      return parseFloat(totalInvestido.toFixed(2));
    },
    
    calcularHoje(item) {
      const hoje = ((item.cotacao/item.close-1)*100);
      return hoje;
    },

    loadItems() {
      api.get(`/dashboards?CarteiraId=${this.carteiraid}`).then((response) => {
        this.items = response.data;
        this.symbols = this.items.map(item => item.Ticker.nome);
        this.symbols_id = this.items.map(item => item.Ticker.id);
        this.fetchMultipleStockQuotes();
        this.fetchMultipleProventos();
      });
      api.get(`/carteira?id=${this.carteiraid}`).then((response) => {
        this.CarteiraNome = response.data[0]["nome"];
      });
      api.get(`/ticker`).then((response) => {
        this.tickers = response.data;
      });
    },
  },
}
</script>

<style scoped>
.card-ativo {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.card-ativo:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-list {
  padding: 0;
}

.card-list .v-list-item {
  padding-left: 0;
  padding-right: 0;
}

.v-enter-active, .v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from, .v-leave-to {
  opacity: 0;
}
</style>