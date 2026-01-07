<template>
  <div>
  <v-toolbar flat>
    <v-toolbar-title>
      <v-icon>mdi-monitor-dashboard</v-icon>
      Dashboard {{ CarteiraNome }} 
      <v-btn
        color="primary"
        icon="mdi-arrow-right-circle"
        density="comfortable" 
        @click="nextCarteira"
        title="Próxima carteira"
      ></v-btn>
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

        <v-menu
          v-if="viewMode === 'table'"
          offset-y
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-view-column"
              v-bind="props"
              density="compact"
              class="ml-2"
              title="Selecionar colunas"
            ></v-btn>
          </template>
          <v-list>
            <v-list-item v-for="header in headers" :key="header.key">
              <v-checkbox-btn v-model="header.visible" :label="header.title" density="compact"></v-checkbox-btn>
            </v-list-item>
          </v-list>
        </v-menu>
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

    <v-data-table
      v-if="viewMode === 'table'"
      v-model:sort-by="sortBy"
      :headers="visibleHeaders"
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
        ></v-btn> <sup>{{ multiplePosicoes.find(i => i.TickerId == item.Ticker.id)?.agg_id }}</sup>
        <div>
          <small>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props" density="compact">
                  {{ $formatCurrency(item.preco_medio_historico, item.Ticker.MoedaId) }}
                </span>
              </template>
              <div>Preço médio histórico</div>
            </v-tooltip>
            <v-icon 
              size="x-small" 
              icon="mdi-information-outline" 
              style="position: relative; padding-left: 5px; padding-bottom: 7px "
            ></v-icon>
          </small>
        </div>

      </template>

      <template v-slot:item.ticker="{ item }">
        {{ item.Ticker.nome }} ({{ item.Ticker.id }})
      </template>
      <template v-slot:item.quantidade="{ item }">
        {{ Number.isInteger(item.quantidade) ? item.quantidade : item.quantidade.toFixed(2) }}
      </template>    
      <template v-slot:item.lucro_realizado="{ item }">
        {{ $formatCurrency(item.lucro_realizado, item.Ticker.MoedaId) }}
          <span v-if="item.Ticker.MoedaId != 1">
            <br />{{ $formatCurrency((item.lucro_realizado) * this.dolar, 1) }}
          </span>        
      </template>
      <template v-slot:item.investido="{ item }">
        {{ $formatCurrency(item.investido, item.Ticker.MoedaId) }}<br />
        <small>
          <div v-if="item.valor_investido > 0">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props">
                  {{ $formatCurrency(item.valor_investido, item.Ticker.MoedaId) }}
                </span>
              </template>
              <div>Valor dos aportes</div>
            </v-tooltip>
            <v-icon 
              size="x-small" 
              icon="mdi-information-outline" 
              style="position: absolute; padding-left: 5px; "
            ></v-icon>
          </div>
        </small>
        <span v-if="item.Ticker.MoedaId != 1">
          <br />{{ $formatCurrency(item.investido * this.dolar, 1) }}
        </span>        
      </template>
      <template v-slot:item.atual="{ item }">
        {{ $formatCurrency(item.quantidade * item.cotacao, item.Ticker.MoedaId) }}
        <span v-if="item.Ticker.MoedaId != 1">
          <br />{{ $formatCurrency(item.quantidade * item.cotacao * this.dolar, 1) }}
        </span>        
      </template>
      <template v-slot:item.cotacao="{ item }">
        {{ item.cotacao ? $formatCurrency(item.cotacao, item.Ticker.MoedaId) : 'N/A' }}
      </template>
      <template v-slot:item.lp="{ item }">
        <div :style="{ color: item.rendimento < 0 ? 'red' : item.rendimento > 10 ? 'green' : 'black' }">{{ $formatCurrency(item.quantidade * item.cotacao - item.investido, item.Ticker.MoedaId) }}
          <span v-if="item.Ticker.MoedaId != 1">
            <br />{{ $formatCurrency((item.quantidade * item.cotacao - item.investido) * this.dolar, 1) }}
          </span>        
        </div>
      </template>
      <template v-slot:item.rendimento="{ item }">
        <v-chip density="compact" :style="{ color: item.rendimento < 0 ? 'red' : item.rendimento > 10 ? 'green' : 'black' }">
          {{ item.cotacao ? item.rendimento.toFixed(2) + "%" : "N/A" }}
        </v-chip>
        <div v-if="item.investido > 0">
          <small>
            <span v-if="item.valor_investido > 0" style="padding-right: 5px;">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" density="compact" :style="{ color: item.rendimento_valor < 0 ? 'red' : 'green' }">
                    {{ item.cotacao ? item.rendimento_valor.toFixed(2) + "%" : "N/A" }}
                  </span>
                </template>
                <div>Rendimento considerando aportes</div>
              </v-tooltip>
            </span>
            <span v-if="item.valor_investido > 0">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" density="compact" :style="{ color: item.rendimento_pm_historico < 0 ? 'red' : 'green' }">
                    {{ item.cotacao ? item.rendimento_pm_historico.toFixed(2) + "%" : "N/A" }}
                  </span>
                </template>
                <div>Rendimento sobre o PM histórico</div>
              </v-tooltip>
            </span>
          </small>
        </div>
      </template>
      <template v-slot:item.proventos="{ item }">
        {{ $formatCurrency(item.proventos, item.Ticker.MoedaId) }}
          <span v-if="item.Ticker.MoedaId != 1">
            <br />{{ $formatCurrency((item.proventos) * this.dolar, 1) }}
          </span>        
      </template>
      <template v-slot:item.hoje="{ item }">
        <v-chip :style="{ color: item.hoje < 0 ? 'red' : 'green' }">
          {{ item.close ? item.hoje.toFixed(2) + "%" : "N/A" }}
        </v-chip>
      </template>
      <template v-slot:item.tipo_ativo="{ item }">
        {{ item.tipoAtivoNome }}
      </template>
      <template v-slot:item.tipo_ativo_classificacao="{ item }">
        {{ item.tipoAtivoClassificacaoNome }}
      </template>
      <template v-slot:item.percentual_carteira="{ item }">
        <v-chip v-if="item.percentualCarteira" density="compact">
          <small>
            {{ ((item.quantidade * item.cotacao * (item.Ticker.MoedaId !== 1 ? dolar : 1)) / totalPortfolioValue * 100).toFixed(2) }}%
          </small>
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
              <div>
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="40" class="mr-2">
                    <span class="text-h6">{{ item.Ticker.nome.substring(0, 2) }}</span>
                  </v-avatar>
                  <span class="text-h6">{{ item.Ticker.nome }}</span>
                </div>
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
    
    <v-container fluid class="mt-4">
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="2" height="100%">
            <v-card-text>
                <apexchart 
                  type="donut" 
                  height="350" 
                  :options="chartOptionsComputed" 
                  :series="allocationData.series"
                ></apexchart>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" height="100%">
            <v-card-text>
              <div v-if="totalComparativoData.series.length > 0">
                <apexchart 
                  type="bar" 
                  height="350" 
                  :options="totalBarChartOptions" 
                  :series="totalComparativoData.series"
                ></apexchart>
              </div>
              <div v-else class="text-center pa-4">
                Carregando...
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" height="100%">
            <v-card-text>
              <div v-if="performanceData.series.length > 0">
                <apexchart 
                  type="bar" 
                  height="350" 
                  :options="barChartOptionsComputed" 
                  :series="performanceData.series"
                ></apexchart>
              </div>
              <div v-else class="text-center pa-4">
                Carregando dados...
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h6">
          Detalhes de {{ itemSelecionado?.Ticker.nome }} <br /> 
          <div>
            <strong>Posições do ativo:</strong>
            <span v-if="posicoesAtivo[0]">
              <v-chip
                v-for="posicao in posicoesAtivo"
                :key="posicao"
                :color="posicao === posicaoAtivoSelecionado ? 'green' : 'grey'"
                :elevated="posicao === posicaoAtivoSelecionado"
                :variant="posicao === posicaoAtivoSelecionado ? 'outlined' : 'tonal'"
                :class="posicao === posicaoAtivoSelecionado ? 'selected-posicao-chip' : ''"
                class="ma-1"
                size="small"
              >
                <a href="#" @click.prevent="atualizaPosicaoDialog(posicao)">
                  {{ posicao }}
                </a>
              </v-chip>
            </span>
            <span v-else>
              Nenhuma posição encontrada.
            </span>
          </div>
          <v-card-subtitle>
            Cotação do ativo hoje: {{ $formatCurrency(itemSelecionado?.cotacao, itemSelecionado?.Ticker.MoedaId) }}
            <br /> Dólar hoje: {{ $formatCurrency(this.dolar, 1) }} 
            </v-card-subtitle>
          
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="[
              { title: 'Data', key: 'data', value: 'data' },
              { title: 'Op.', key: 'TipoOperacaoId', value: 'TipoOperacao.nome' },
              { title: 'Qtde. (Acc.)', value: 'quantidade' },
              { title: 'Preço M. (PM Posição)', key: 'valor_unitario', value: 'valor_unitario' },
              { title: 'Taxas', value: 'taxas' },
              { title: 'L/P', key: 'lucro', value: 'lucro' },
              { title: 'Rendimento', key: 'rendimento', value: 'rendimento', align: 'center' },
            ]"
            :items="operacoesselecionadas"
            item-key="id"
            hide-default-footer
            items-per-page=0
            >
            <template v-slot:item.TipoOperacaoId="{ item }">
              {{ item.TipoOperacao.nome.substring(0, 1) }}
            </template>
            <template v-slot:item.quantidade="{ item }">
              {{ item.quantidade }} 
              <span style="color:#aaa">({{ item.qtde_acumulada.toFixed(2) }})</span>
            </template>
            <template v-slot:item.data="{ item }">
              {{ $formatDate(item.data) }}
              <span v-if="item.cotacao_dolar">
                <br />{{ $formatCurrency(item.cotacao_dolar, 1) }}<br />
              </span>
              <span v-if="item.InvestidorId || item.CorretoraId">
                {{ (item.InvestidorId != null ? item.Investidor.nome : null) }} 
                {{ (item.CorretoraId != null ? '(' + item.Corretora.nome + ')' : null) }}
              </span>
            </template>
            <template v-slot:item.valor_unitario="{ item }">
              {{ $formatCurrency(item.valor_unitario, item.Ticker.MoedaId) }} 
              <span style="color:#aaa">({{ $formatCurrency(item.PM_posicao, item.Ticker.MoedaId) }})</span>
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
              <span v-if="item.TipoOperacaoId === 2">
                  <span :style="{color: item.lucro > 0 ? 'green' : 'red'}">{{ $formatCurrency(item.lucro, item.Ticker.MoedaId) }}</span>
              </span>
            </template>
            <template v-slot:item.rendimento="{ item }">
              <v-chip v-if="item.rendimento" :style="{ color: item.rendimento < 0 ? 'red' : 'green' }">
                {{ item.TipoOperacaoId === 2 ? item.rendimento.toFixed(2) + '%' : 'N/A' }}  
              </v-chip>              
              <span v-if="item.cotacao_dolar && item.rendimento"><br />
                {{ (((multipleQuotes.find(i => i.ticker === item.Ticker.nome)?.price)*item.quantidade*this.dolar-(item.quantidade*item.valor_unitario*item.cotacao_dolar))/(item.quantidade*item.valor_unitario*item.cotacao_dolar)*100).toFixed(2) }}%
              </span>
            </template>
            <template v-slot:body.append>
              <tr class="total-row">
                <td><strong>Sumarização</strong></td>
                <td>&nbsp;</td>
                <td><strong>{{ this.posicaoQuantidade.toFixed(2) }}</strong></td>
                <td>
                  <strong>
                    {{ $formatCurrency(this.posicaoPrecoMedio, itemSelecionado?.Ticker.MoedaId) }}
                  </strong>
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />{{ $formatCurrency(this.posicaoPrecoMedio*this.dolar, 1) }}
                  </span>
                  <br />(s/taxas)
                </td>
                <td>
                  <strong>{{ $formatCurrency(taxas, itemSelecionado?.Ticker.MoedaId) }}</strong>
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />{{ (itemSelecionado?.taxas!='')?$formatCurrency(taxas*this.dolar, 1):'' }}
                  </span>
                </td>
                <td>
                  <span v-if="this.posicaoQuantidade">
                    <span :style="{ color: itemSelecionado?.cotacao > this.posicaoPrecoMedio ? 'green' : 'red'}"><strong>{{ $formatCurrency(((itemSelecionado?.cotacao-this.posicaoPrecoMedio)*this.posicaoQuantidade)-taxas, itemSelecionado?.Ticker.MoedaId) }}</strong></span>
                    <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                      <br />{{ $formatCurrency((((itemSelecionado?.cotacao-this.posicaoPrecoMedio)*this.posicaoQuantidade)-taxas)*this.dolar, 1) }}
                    </span>
                  </span>
                </td>
                <td align="center">
                  <v-chip v-if="this.posicaoQuantidade" :style="{ color: (itemSelecionado?.cotacao/this.posicaoPrecoMedio-1) < 0 ? 'red' : 'green' }">
                    {{ ((itemSelecionado?.cotacao/this.posicaoPrecoMedio-1)*100).toFixed(2) }}%
                  </v-chip>
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />
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
import VueApexCharts from "vue3-apexcharts";

// Chaves únicas para o LocalStorage
const SORT_BY_STORAGE_KEY = 'DashboardSortBy';
const COLUMN_VISIBILITY_KEY = 'dashboardColumnVisibility';

export default {
  components: {
    MenuCarteira,
    apexchart: VueApexCharts,
  },
  data: () => ({
    sortBy: [{ key: 'Ticker.nome', order: 'asc' }],
    posicoesAtivo: [],
    posicaoAtivoSelecionado: null,
    posicaoPrecoMedio: 0,
    posicaoQuantidade: 0,
    viewMode: 'table', // 'table' ou 'cards'
    rendimento_reais: 0,
    dolar: 0,
    taxas: 0,
    stockSymbol: null,
    operacoes: [],
    operacoesselecionadas: [],
    dialog: false,
    itemSelecionado: null,
    mostrarCard: false,
    filters: {
      ticker: null,
    },
    carteiras: [],
    tickers: [],
    symbols: [],
    symbols_id: null,
    quote: 'carregando...',
    multipleQuotes: 0,
    valid: false,
    carteiraid: null,
    CarteiraNome: "carregando...",
    items: [],
    tiposAtivo: [],
    tiposAtivoClassificacao: [],
    multipleProventos: [],
    multiplePosicoes: [],
    headers: [ // Adicionado 'visible: true' a cada header
      { title: "Ticker", key:"ticker", value: "Ticker.nome", align: "center", visible: true },
      { title: "Tipo", key:"tipo_ativo", value: "tipoAtivoNome", align: "center", visible: true },
      { title: "Classificação", key:"tipo_ativo_classificacao", value: "tipoAtivoClassificacaoNome", align: "center", visible: true },
      { title: "% Cart.", key:"percentual_carteira", value: "percentualCarteira", align: "end", visible: true },
      { title: "Qtde.", key:"quantidade", value: "quantidade", align: "end", visible: true },
      { title: "Preço médio", key: "preco_medio", value: "preco_medio", align: "center", visible: true },
      { title: "Investido", key: "investido", value: "investido", align: "end", visible: true },
      { title: "Atual", key: "atual", value: "atual", align: "end", visible: true },
      { title: "Cotação", key: "cotacao", value: "cotacao", align: "end", visible: true },
      { title: "L/P", key: "lp", value: "lp", align: "end", visible: true },
      { title: "Rendimento", key: "rendimento", value: "rendimento", align: "end", visible: true },
      { title: "Realizado", key: "lucro_realizado", value: "lucro_realizado", align: "end", visible: true },
      { title: "Proventos", key: "proventos", value: "proventos", align: "end", visible: true },
      { title: "% Hoje", key: "hoje", value: "hoje", visible: true },
    ],
    chartOptions: {
      chart: {
        type: 'donut',
      },
      labels: [], // Preenchido via computed
      colors: ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#8E24AA', '#00ACC1'],
      
      // 1. Configuração para mostrar o valor TOTAL e INDIVIDUAL no centro do Donut
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Roboto, sans-serif',
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '20px',
                fontFamily: 'Roboto, sans-serif',
                offsetY: 5,
                // Formata o valor que aparece no centro ao passar o mouse na fatia
                formatter: function (val) {
                  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                }
              },
              total: {
                show: true,
                showAlways: true, // Sempre mostra o total quando não estiver passando o mouse
                label: 'Patrimônio',
                fontSize: '16px',
                fontFamily: 'Roboto, sans-serif',
                color: '#373d3f',
                // Função para somar e formatar o Total Geral
                formatter: function (w) {
                  const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                }
              }
            }
          }
        }
      },

      // 2. Configuração do Tooltip (caixa flutuante ao passar o mouse)
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val) {
            return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          }
        }
      },

      // 3. Configuração dos rótulos nas fatias (DataLabels)
      // DICA: É recomendável deixar como percentual (%) nas fatias para não poluir, 
      // mas se quiser dinheiro, mude o return abaixo.
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          // Opção A: Mostrar apenas porcentagem (mais limpo)
          return val.toFixed(1) + "%";

          // Opção B: Mostrar Valor Monetário (comente a linha acima e descomente abaixo)
          // const value = opts.w.config.series[opts.seriesIndex];
          // return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        },
        dropShadow: { enabled: false }
      },
      
      title: {
        text: 'Alocação por Tipo de Ativo',
        align: 'center'
      },
      legend: {
        position: 'bottom'
      },
    },

    barChartOptions: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        },
      },
      dataLabels: {
        enabled: false // Desligado para não poluir, pois já tem tooltip
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: [], // Será preenchido via computed
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            // Formata eixo Y abreviado (ex: 10 k) ou normal
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
          }
        }
      },
      fill: {
        opacity: 1
      },
      // Cores: Cinza Azulado para Investido, Verde para Atual (sugestão)
      colors: ['#78909C', '#4CAF50'], 
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          }
        }
      },
      title: {
        text: 'Performance por Classe (Investido vs Atual)',
        align: 'left'
      }
    },

  }),

  computed: {
    ...mapGetters('filters', {
      filtrosDashboard: 'getFiltros'
    }),

    totalPortfolioValue() {
      if (!this.items || this.items.length === 0 || !this.dolar) {
        return 0;
      }
      return this.items.reduce((total, item) => {
        const valorAtual = (item.quantidade || 0) * (item.cotacao || 0);
        const valorEmReais = item.Ticker.MoedaId !== 1 ? valorAtual * this.dolar : valorAtual;
        return total + valorEmReais;
      }, 0);
    },
    
    filteredItems() {
      const filtros = this.filtrosDashboard('dashboard')
      return this.items.filter(item => {
        const matchesTicker = !filtros.ticker || item.Ticker.id === filtros.ticker
        return matchesTicker
      })
    },
    
    visibleHeaders() {
      return this.headers.filter(h => h.visible)
    },

    carteiraId() {
      return this.$route.params.id
    },

    allocationData() {
      // Se não tiver itens ou cotação do dólar, retorna vazio
      if (!this.items || this.items.length === 0) return { series: [], labels: [] };

      const groups = {};

      // Itera sobre os itens (use filteredItems se quiser que o gráfico obedeça aos filtros, ou items para carteira total)
      this.items.forEach(item => {
        // Define o nome do grupo (ex: Ações, FIIs, etc)
        const typeName = item.tipoAtivoNome || 'Outros';
        
        // Calcula valor total em Reais (convertendo se necessário, igual sua lógica do template)
        const totalValue = (item.quantidade || 0) * (item.cotacao || 0) * (item.Ticker.MoedaId !== 1 ? this.dolar : 1);

        if (!groups[typeName]) {
          groups[typeName] = 0;
        }
        groups[typeName] += totalValue;
      });

      // Retorna objeto pronto para o ApexCharts
      return {
        series: Object.values(groups), // Valores numéricos
        labels: Object.keys(groups)    // Nomes das categorias
      };
    },
    
    // Atualiza as opções do gráfico dinamicamente quando os labels mudam
    chartOptionsComputed() {
        return {
            ...this.chartOptions,
            labels: this.allocationData.labels
        };
    },

    performanceData() {
      if (!this.items || this.items.length === 0) return { series: [], categories: [] };

      const groups = {};

      this.items.forEach(item => {
        const typeName = item.tipoAtivoNome || 'Outros';
        const factor = item.Ticker.MoedaId !== 1 ? this.dolar : 1;

        // Calcula valores em Reais
        const investidoBRL = (item.investido || 0) * factor;
        const atualBRL = (item.quantidade || 0) * (item.cotacao || 0) * factor;

        if (!groups[typeName]) {
          groups[typeName] = { investido: 0, atual: 0 };
        }
        
        groups[typeName].investido += investidoBRL;
        groups[typeName].atual += atualBRL;
      });

      const categories = Object.keys(groups);
      
      return {
        categories: categories,
        series: [
          {
            name: 'Valor Investido',
            data: categories.map(c => groups[c].investido)
          },
          {
            name: 'Valor Atual',
            data: categories.map(c => groups[c].atual)
          }
        ]
      };
    },

    // Atualiza as categorias (Eixo X) dinamicamente
    barChartOptionsComputed() {
      return {
        ...this.barChartOptions,
        xaxis: {
          ...this.barChartOptions.xaxis,
          categories: this.performanceData.categories
        }
      };
    },    

    // --- NOVA LÓGICA DO GRÁFICO TOTAL COMPARATIVO ---
    totalComparativoData() {
      // Usa filteredItems para respeitar os filtros ou this.items para tudo
      const lista = this.filteredItems.length > 0 ? this.filteredItems : this.items;

      if (!lista || lista.length === 0) return { series: [], colors: [] };

      let totalInvestido = 0;
      let totalAtual = 0;

      lista.forEach(item => {
        const factor = item.Ticker.MoedaId !== 1 ? this.dolar : 1;
        totalInvestido += (item.investido || 0) * factor;
        totalAtual += (item.quantidade || 0) * (item.cotacao || 0) * factor;
      });

      // Lógica de Cor:
      // Barra 1 (Investido): Cinza (#78909C)
      // Barra 2 (Atual): Verde (#4CAF50) se lucro, Vermelho (#E53935) se prejuízo
      const corAtual = totalAtual >= totalInvestido ? '#4CAF50' : '#E53935';

      return {
        series: [{
          name: 'Valor',
          data: [totalInvestido, totalAtual]
        }],
        colors: ['#78909C', corAtual]
      };
    },

    totalBarChartOptions() {
      // 1. Recupera os valores calculados na outra computed property
      // A estrutura é: series[0].data = [TotalInvestido, TotalAtual]
      const dados = this.totalComparativoData.series[0]?.data || [0, 0];
      const investido = dados[0] || 0;
      const atual = dados[1] || 0;

      // 2. Calcula a porcentagem de diferença
      let percentual = 0;
      if (investido > 0) {
        percentual = ((atual - investido) / investido) * 100;
      }

      // 3. Formata a string (ex: "+15.50%" ou "-2.30%")
      const sinal = percentual >= 0 ? '+' : '';
      const textoPercentual = `${sinal}${percentual.toFixed(2)}%`;

      // 4. Retorna as opções do gráfico com o título dinâmico
      return {
        chart: {
          type: 'bar',
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '40%', 
            borderRadius: 6,
            distributed: true 
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => {
             if(val > 1000) return (val/1000).toFixed(1) + 'k';
             return val.toFixed(0);
          },
          offsetY: -20,
          style: {
            colors: ['#304758']
          }
        },
        legend: { show: false },
        xaxis: {
          categories: ['Total Investido', 'Valor Atual'],
          labels: {
            style: { fontSize: '14px', fontWeight: 'bold' }
          }
        },
        yaxis: {
          labels: {
            formatter: (value) => {
              return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          }
        },
        colors: this.totalComparativoData.colors,
        
        // --- AQUI ESTÁ A MUDANÇA NO TÍTULO ---
        title: {
          // Exibe: Patrimônio Total (+10.50%)
          text: `Patrimônio Total (${textoPercentual})`, 
          align: 'center',
          style: {
             // Deixa o texto Verde se lucro, Vermelho se prejuízo
             color: percentual >= 0 ? '#4CAF50' : '#E53935',
             fontSize: '16px',
             fontWeight: 'bold'
          }
        }
      };
    },

  },

  watch: {
    headers: {
      handler() {
        this.saveColumnVisibility();
      },
      deep: true
    },
    sortBy: {
      handler(newSortBy) {
        // O v-model atualiza 'sortBy', e este watcher salva no LocalStorage
        localStorage.setItem(SORT_BY_STORAGE_KEY, JSON.stringify(newSortBy));
      },
      deep: true // Necessário porque 'sortBy' é um array de objetos
    },
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

    multiplePosicoes: {
      handler(novoValor) {
        this.atualizaPosicoes();
      },
      deep: true
    },
  },

  created() {
    this.loadPersistentSort();
    this.loadColumnVisibility();
    this.carteiraid = this.$route.params.id;
    this.loadItems();
    this.loadTiposAtivo();
    this.loadTiposAtivoClassificacao();
    this.fetchDolarQuote();
  },

  methods: {
    saveColumnVisibility() {
      const visibilityConfig = this.headers.reduce((acc, header) => {
        acc[header.key] = header.visible;
        return acc;
      }, {});
      localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(visibilityConfig));
    },

    loadColumnVisibility() {
      const savedVisibility = localStorage.getItem(COLUMN_VISIBILITY_KEY);
      if (savedVisibility) {
        try {
          const visibilityConfig = JSON.parse(savedVisibility);
          this.headers.forEach(header => {
            if (visibilityConfig[header.key] !== undefined) {
              header.visible = visibilityConfig[header.key];
            }
          });
        } catch (e) {
          console.error('Erro ao carregar a visibilidade das colunas:', e);
          localStorage.removeItem(COLUMN_VISIBILITY_KEY);
        }
      }
    },
    getTipoAtivoNome(tipoAtivoId) {
      if (!this.tiposAtivo.length) return '';
      const tipoAtivo = this.tiposAtivo.find(t => t.id === tipoAtivoId);
      return tipoAtivo ? tipoAtivo.nome : '';
    },

    getTipoAtivoClassificacaoNome(tipoAtivoClassificacaoId) {
      // 1. Verifica se a lista está vazia e retorna nulo para evitar erros
      if (!this.tiposAtivoClassificacao.length) return '';
      // 2. Busca pelo item
      const tipoAtivoClassificacao = this.tiposAtivoClassificacao.find(t => t.id === tipoAtivoClassificacaoId);
      // 3. Retorno do resultado
      return tipoAtivoClassificacao ? tipoAtivoClassificacao.nome : '';
    },

    // abrirDialog(item) {
    //   this.itemSelecionado = item;
    //   this.stockSymbol = item.Ticker.nome;
    //   api.get(`/operacaose?TipoOperacaoId=1&TipoOperacaoId=3&CarteiraId=${this.carteiraid}&TickerId=${item.Ticker.id}`).then((response) => {
    //     this.operacoes = response.data;
    //     let acumulado = 0;
    //     const selecionadas = [];

    //     for (let i = this.operacoes.length - 1; i >= 0; i--) {
    //       const operacao = this.operacoes[i];
    //       if (acumulado >= item.quantidade) break;

    //       selecionadas.unshift(operacao);
    //       acumulado += operacao.quantidade;
    //     }

    //     this.operacoes = selecionadas;
    //     this.taxas = selecionadas.reduce((sum, item) => sum + item.taxas, 0);
    //     this.rendimento_reais = this.calcularRendimentoReais(selecionadas, item.cotacao * item.quantidade * this.dolar);
    //   });
      
    //   this.dialog = true;
    // },

    loadPersistentSort() {
      const persistentSortBy = localStorage.getItem(SORT_BY_STORAGE_KEY);
      if (persistentSortBy) {
        try {
          const parsedSortBy = JSON.parse(persistentSortBy);
          // Garante que é um array (formato do v-data-table)
          if (Array.isArray(parsedSortBy)) { 
            this.sortBy = parsedSortBy;
          }
        } catch (e) {
          console.error('Erro ao carregar ordenação salva:', e);
          localStorage.removeItem(SORT_BY_STORAGE_KEY);
        }
      }
    },

    abrirDialog(item) {
      this.itemSelecionado = item;
      this.stockSymbol = item.Ticker.nome;
      api.get(`/operacaose?TipoOperacaoId=1&TipoOperacaoId=2&TipoOperacaoId=3&TipoOperacaoId=4&CarteiraId=${this.carteiraid}&TickerId=${item.Ticker.id}`).then((response) => {
        this.operacoes = response.data;

        // Atribuir ao this.posicoesAtivo o array com somente o código das posições únicas
        this.posicoesAtivo = [...new Set(this.operacoes.map(op => op.PosicaoAtivoId))];
        
        let selecionadas = [];
        // Filtrar somente as operações da última posição
        // Recuperar o PosiçãoAtivoId da última operação
        if (this.operacoes.length === 0) {
          this.dialog = false;
          return;
        } else {
          const ultimaOperacao = this.operacoes[this.operacoes.length - 1];
          selecionadas = this.operacoes.filter(op => op.PosicaoAtivoId === ultimaOperacao.PosicaoAtivoId);
          this.posicaoAtivoSelecionado = ultimaOperacao.PosicaoAtivoId;
        }

        // Em selecionadas, adicionar a propriedade qtde_acumulada que é a soma acumulada da quantidade
        // de compras, subscrições e bonificações menos as vendas. 
        let acumulado = 0;
        selecionadas = selecionadas.map(op => {
          if (op.TipoOperacaoId === 1 || op.TipoOperacaoId === 3 || op.TipoOperacaoId === 4) {
            acumulado += op.quantidade;
          } else if (op.TipoOperacaoId === 2) {
            acumulado -= op.quantidade;
          }
          return { ...op, qtde_acumulada: acumulado };
        });

        this.posicaoQuantidade = acumulado;

        // Em selecionadas, adicionar a propriedade PM_posicao que é o preço médio da posição na data da operação
        // Nas operações de venda, o PM_posicao é o PM_posicao da operação anterior
        // Para compra, bonificação e subscrição, o PM_posicao é calculado como a média ponderada do PM_posicao anterior
        let pmPosicaoAnterior = 0;
        let quantidadeAcumulada = 0;
        let taxasAcumuladas = 0;
        let valorInvestidoAcumulado = 0;
        selecionadas = selecionadas.map(op => {
          if (op.TipoOperacaoId === 1 || op.TipoOperacaoId === 3 || op.TipoOperacaoId === 4) {
            // Compra, bonificação ou subscrição
            const totalAnterior = pmPosicaoAnterior * quantidadeAcumulada;
            quantidadeAcumulada += op.quantidade;
            pmPosicaoAnterior = (totalAnterior + (op.valor_unitario * op.quantidade)) / quantidadeAcumulada;
            valorInvestidoAcumulado += op.valor_unitario * op.quantidade;
          } else if (op.TipoOperacaoId === 2) {
            // Venda
            quantidadeAcumulada -= op.quantidade;
            // O PM_posicao permanece o mesmo em vendas
          }
          taxasAcumuladas += op.taxas || 0;
          return { 
            ...op, 
            PM_posicao: pmPosicaoAnterior,
            taxas_acumuladas: taxasAcumuladas,
            valor_investido_acumulado: valorInvestidoAcumulado
          };
        });

        this.posicaoPrecoMedio = pmPosicaoAnterior;

        // Em selecionadas, adicionar a propriedade lucro para os registros de venda
        // O lucro é calculado como (valor_unitario - PM_posicao) * quantidade
        selecionadas = selecionadas.map(op => {
          if (op.TipoOperacaoId === 2) {
            const lucro = (op.valor_unitario - op.PM_posicao) * op.quantidade;
            return { ...op, lucro };
          }
          return { ...op, lucro: 0 };
        });

        // Em selecionadas, adicionar a propriedade rendimento que é o rendimento da operação de venda
        // O rendimento é calculado como ((valor_unitario - PM_posicao) / PM_posicao) * 100
        selecionadas = selecionadas.map(op => {
          if (op.TipoOperacaoId === 2) {
            const rendimento = ((op.valor_unitario - op.PM_posicao) / op.PM_posicao) * 100;
            return { ...op, rendimento };
          }
          return { ...op, rendimento: 0 };
        });

        this.operacoesselecionadas = selecionadas;
        this.taxas = selecionadas.reduce((sum, item) => sum + item.taxas, 0);
        this.rendimento_reais = this.calcularRendimentoReais(selecionadas, item.cotacao * item.quantidade * this.dolar);
      });
      
      this.dialog = true;
    },

    atualizaPosicaoDialog(posicaoId) {
      
      let selecionadas = [];
      
      // Filtrar somente as operações cujo valor seja igual ao posicaoId recebido como parâmetro
      
      if (this.operacoes.length === 0) {
        this.dialog = false;
        return;
      } else {
        selecionadas = this.operacoes.filter(op => op.PosicaoAtivoId === posicaoId);
        this.posicaoAtivoSelecionado = posicaoId;
      }
      
      // Em selecionadas, adicionar a propriedade qtde_acumulada que é a soma acumulada da quantidade
      // de compras, subscrições e bonificações menos as vendas. 
      let acumulado = 0;
      selecionadas = selecionadas.map(op => {
        if (op.TipoOperacaoId === 1 || op.TipoOperacaoId === 3 || op.TipoOperacaoId === 4) {
          acumulado += op.quantidade;
        } else if (op.TipoOperacaoId === 2) {
          acumulado -= op.quantidade;
        }
        return { ...op, qtde_acumulada: acumulado };
      });

      this.posicaoQuantidade = acumulado;

      // Em selecionadas, adicionar a propriedade PM_posicao que é o preço médio da posição na data da operação
      // Nas operações de venda, o PM_posicao é o PM_posicao da operação anterior
      // Para compra, bonificação e subscrição, o PM_posicao é calculado como a média ponderada do PM_posicao anterior
      let pmPosicaoAnterior = 0;
      let quantidadeAcumulada = 0;
      selecionadas = selecionadas.map(op => {
        if (op.TipoOperacaoId === 1 || op.TipoOperacaoId === 3 || op.TipoOperacaoId === 4) {
          // Compra, bonificação ou subscrição
          const totalAnterior = pmPosicaoAnterior * quantidadeAcumulada;
          quantidadeAcumulada += op.quantidade;
          pmPosicaoAnterior = (totalAnterior + (op.valor_unitario * op.quantidade)) / quantidadeAcumulada;
        } else if (op.TipoOperacaoId === 2) {
          // Venda
          quantidadeAcumulada -= op.quantidade;
          // O PM_posicao permanece o mesmo em vendas
        }
        return { ...op, PM_posicao: pmPosicaoAnterior };
      });

      this.posicaoPrecoMedio = pmPosicaoAnterior;

      // Em selecionadas, adicionar a propriedade lucro para os registros de venda
      // O lucro é calculado como (valor_unitario - PM_posicao) * quantidade
      selecionadas = selecionadas.map(op => {
        if (op.TipoOperacaoId === 2) {
          const lucro = (op.valor_unitario - op.PM_posicao) * op.quantidade;
          return { ...op, lucro };
        }
        return { ...op, lucro: 0 };
      });

      // Em selecionadas, adicionar a propriedade rendimento que é o rendimento da operação de venda
      // O rendimento é calculado como ((valor_unitario - PM_posicao) / PM_posicao) * 100
      selecionadas = selecionadas.map(op => {
        if (op.TipoOperacaoId === 2) {
          const rendimento = ((op.valor_unitario - op.PM_posicao) / op.PM_posicao) * 100;
          return { ...op, rendimento };
        }
        return { ...op, rendimento: 0 };
      });

      this.operacoesselecionadas = selecionadas;
      this.taxas = selecionadas.reduce((sum, op) => sum + op.taxas, 0);
      this.rendimento_reais = this.calcularRendimentoReais(selecionadas, this.itemSelecionado.cotacao * this.itemSelecionado.quantidade * this.dolar);

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
      // console.log(this.items);
      console.log(this.carteiras);
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
        item.rendimento_valor = this.calcularRendimento_valor(item);
        item.rendimento_pm_historico = this.calcularRendimento_pm_historico(item);
        
        item.hoje = this.calcularHoje(item);
        // Adiciona o percentual da carteira para ordenação
        item.percentualCarteira = (item.quantidade * item.cotacao * (item.Ticker.MoedaId !== 1 ? this.dolar : 1)) / this.totalPortfolioValue;
      });

      this.items = this.items.map(item => ({
        ...item,
        rendimento: this.calcularRendimento(item),
        rendimento_valor: this.calcularRendimento_valor(item),
        rendimento_pm_historico: this.calcularRendimento_pm_historico(item),
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

    atualizaPosicoes() {
      this.items = this.items.map(item => {
          const posicao = this.multiplePosicoes.find(c => c.tickerId == item.Ticker.id);
          if (posicao) {
              return { ...item, numero_posicoes: posicao.agg_id };
          }

          // TODO: Pensar lugar melhor para colocar isso
          // Adiciona o nome do tipo de ativo para ordenação
          item.tipoAtivoNome = this.getTipoAtivoNome(item.Ticker.TipoAtivoId);
          // Adiciona o nome da classificação para ordenação
          item.tipoAtivoClassificacaoNome = this.getTipoAtivoClassificacaoNome(item.Ticker.TipoAtivoClassificacaoId);

          return item;
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

    async fetchMultiplePosicoes() {
      if (!this.symbols) return;
      
      try {
        api.get(`/aggregation/PosicaoAtivo/id/count/TickerId?ativos=${this.symbols_id}&CarteiraId=${this.carteiraid}`).then((response) => {
          this.multiplePosicoes = response.data;
          
        });
      } catch (error) {
        console.error('Erro ao buscar múltiplas posições:', error);
      }
    },

    calcularRendimento_pm_historico(item) {
      const { quantidade, cotacao, preco_medio_historico } = item;

      if (!preco_medio_historico || isNaN(quantidade) || isNaN(cotacao) || isNaN(preco_medio_historico)) {
        return 0;
      }

      const rendimento = ((quantidade * cotacao - (quantidade * preco_medio_historico)) / (quantidade * preco_medio_historico)) * 100;
      return rendimento;
    },

    calcularRendimento_valor(item) {
      const { quantidade, cotacao, valor_investido } = item;

      if (!valor_investido || isNaN(quantidade) || isNaN(cotacao) || isNaN(valor_investido)) {
        return 0;
      }

      const rendimento = ((quantidade * cotacao - valor_investido) / valor_investido) * 100;
      return rendimento;
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

    // Função para direcionar página para próxima carteira
    nextCarteira() {
      if (this.carteiras.length === 0) return;

      // Encontrar o índice da carteira atual
      const currentIndex = this.carteiras.findIndex(c => c.id == this.carteiraid);
      // Calcular o índice da próxima carteira (circular)
      // Exemplo: se estiver na última carteira, volta para a primeira
      const nextIndex = (currentIndex + 1) % this.carteiras.length;
      // Obter o ID da próxima carteira
      const nextCarteiraId = this.carteiras[nextIndex].id;

      // Redirecionar para a próxima carteira
      this.$router.push({ name: 'dashboard', params: { id: nextCarteiraId } });
      // Atualizar o ID da carteira e recarregar os itens
      this.carteiraid = nextCarteiraId;
      this.loadItems();
    },

    loadItems() {
      api.get(`/dashboards?CarteiraId=${this.carteiraid}`).then((response) => {
        this.items = response.data;
        this.symbols = this.items.map(item => item.Ticker.nome);
        this.symbols_id = this.items.map(item => item.Ticker.id);
        this.fetchMultipleStockQuotes();
        this.fetchMultipleProventos();
        this.fetchMultiplePosicoes();
      });
      api.get(`/carteira?id=${this.carteiraid}`).then((response) => {
        this.CarteiraNome = response.data[0]["nome"];
      });
      api.get(`/ticker`).then((response) => {
        this.tickers = response.data;
      });
      api.get(`/carteira`).then((response) => {
        this.carteiras = response.data;
      });
    },

    loadTiposAtivo() {
      api.get("/tipoativo").then((response) => {
        this.tiposAtivo = response.data;
      }).catch(error => {
        console.error("Erro ao carregar tipos de ativo:", error);
      });
    },

    loadTiposAtivoClassificacao() {
      api.get("/tipoativoclassificacao").then((response) => {
        this.tiposAtivoClassificacao = response.data;
      }).catch(error => {
        console.error("Erro ao carregar classificação de ativos:", error);
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