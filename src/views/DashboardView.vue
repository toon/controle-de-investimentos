<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-monitor-dashboard</v-icon>
        Dashboard {{ tituloDashboard }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="exibirConsole" class="mr-2">Console</v-btn>
      <v-btn
        color="green"
        icon="mdi-refresh-circle"
        density="comfortable"
        @click="fetchMultipleStockQuotes"
        title="Atualizar cotações"
      ></v-btn>
    </v-toolbar>

    <MenuCarteira />

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

          <v-btn-toggle v-model="viewMode" mandatory density="compact">
            <v-btn value="table" icon="mdi-table" title="Visualização em tabela"></v-btn>
            <v-btn value="cards" icon="mdi-view-grid" title="Visualização em cards"></v-btn>
          </v-btn-toggle>

          <v-menu v-if="viewMode === 'table'" offset-y :close-on-content-click="false">
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
          
          <v-col cols="12" sm="6" md="2">
            <v-autocomplete
              v-model="filters.carteiras"
              :items="carteiras"
              item-title="nome"
              item-value="id"
              label="Carteiras"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="applyFilters"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-autocomplete
              v-model="filters.tipoAtivo"
              :items="tiposAtivo"
              item-title="nome"
              item-value="id"
              label="Tipo de Ativo"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="applyFilters"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-autocomplete
              v-model="filters.classificacao"
              :items="tiposAtivoClassificacao"
              item-title="nome"
              item-value="id"
              label="Classificação"
              clearable
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="applyFilters"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-autocomplete
              v-model="filters.agrupamento"
              :items="tiposAtivoAgrupamento"
              item-title="nome"
              item-value="id"
              label="Agrupamento"
              clearable
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="applyFilters"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="4" md="3">
            <v-autocomplete
              v-model="filters.ticker"
              :items="tickers"
              item-title="nome"
              item-value="id"
              label="Ticker"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="applyFilters"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="4" md="1" class="text-right">
            <v-btn
              color="secondary"
              variant="outlined"
              size="small"
              icon="mdi-filter-off"
              @click="clearFilters"
              title="Limpar filtros"
            >
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
      :items-per-page="50"
    >
      <template v-slot:item.carteira="{ item }">
         {{ item.Carteira.nome }}
      </template>

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
          {{ $formatCurrency(item.investido * this.dolar, 1) }}
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
      <template v-slot:item.tipo_ativo_agrupamento="{ item }">
        {{ item.tipoAtivoAgrupamentoNome }}
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
        <v-col cols="12" md="4" lg="4">
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

        <v-col cols="12" md="4" lg="4">
          <v-card elevation="2" height="100%">
            <v-card-text>
                <apexchart 
                  type="donut" 
                  height="350" 
                  :options="chartOptionsClassificacaoComputed" 
                  :series="allocationClassificacaoData.series"
                ></apexchart>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" lg="4">
          <v-card elevation="2" height="100%">
            <v-card-text>
                <apexchart 
                  type="donut" 
                  height="350" 
                  :options="chartOptionsAgrupamentoComputed" 
                  :series="allocationAgrupamentoData.series"
                ></apexchart>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="6">
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

        <v-col cols="12" md="6" lg="6">
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
                :color="getSaldoPosicao(posicao) > 0 ? 'green-darken-1' : 'red'"
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
            <br /> Valor em carteira: {{ $formatCurrency(itemSelecionado?.quantidade * itemSelecionado?.cotacao, itemSelecionado?.Ticker.MoedaId) }}
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
                <td>
                  <strong>{{ this.posicaoQuantidade.toFixed(2) }}</strong>
                  <br />
                  {{ $formatCurrency(this.posicaoQuantidade * itemSelecionado?.cotacao, itemSelecionado?.Ticker.MoedaId) }}
                  <span v-if="itemSelecionado?.Ticker.MoedaId != 1">
                    <br />
                    {{ $formatCurrency(this.posicaoQuantidade * itemSelecionado?.cotacao * this.dolar, 1) }}
                  </span>
                </td>
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

const SORT_BY_STORAGE_KEY = 'DashboardSortBy';
const COLUMN_VISIBILITY_KEY = 'dashboardColumnVisibility';
const FILTERS_STORAGE_KEY = 'dashboardFilters';

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
    viewMode: 'table', 
    rendimento_reais: 0,
    dolar: 0,
    taxas: 0,
    stockSymbol: null,
    operacoes: [],
    operacoesselecionadas: [],
    dialog: false,
    itemSelecionado: null,
    mostrarCard: true,
    filters: {
      ticker: [],
      carteiras: [], // Novo filtro de carteiras
      tipoAtivo: [],      // NOVO: Array para múltipla escolha
      classificacao: null, // NOVO: Valor único (ou mude para [] se quiser múltiplo também)
      agrupamento: null // NOVO
    },
    carteiras: [],
    tickers: [],
    symbols: [],
    symbols_id: null,
    quote: 'carregando...',
    multipleQuotes: 0,
    valid: false,
    // carteiraid: null, // REMOVIDO: Não dependemos mais da rota
    CarteiraNome: "Geral",
    items: [],
    tiposAtivo: [],
    tiposAtivoClassificacao: [],
    tiposAtivoAgrupamento: [],
    multipleProventos: [],
    multiplePosicoes: [],
    headers: [ 
      // Adicionei coluna de Carteira opcional
      { title: "Ticker", key:"ticker", value: "Ticker.nome", align: "center", visible: true },
      { title: "Carteira", key:"carteira", value: "Carteira.nome", align: "start", visible: true },
      { title: "Tipo", key:"tipo_ativo", value: "tipoAtivoNome", align: "center", visible: true },
      { title: "Agrupamento", key:"tipo_ativo_agrupamento", value: "tipoAtivoAgrupamentoNome", align: "center", visible: true },
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
    // ... (opções de gráficos permanecem iguais) ...
    chartOptions: {
      chart: { type: 'donut' },
      labels: [], 
      colors: ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#8E24AA', '#00ACC1'],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: { show: true, fontSize: '16px', fontFamily: 'Roboto, sans-serif', offsetY: -10 },
              value: {
                show: true, fontSize: '20px', fontFamily: 'Roboto, sans-serif', offsetY: 5,
                formatter: function (val) { return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
              },
              total: {
                show: true, showAlways: true, label: 'Patrimônio', fontSize: '16px', fontFamily: 'Roboto, sans-serif', color: '#373d3f',
                formatter: function (w) {
                  const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                }
              }
            }
          }
        }
      },
      tooltip: { enabled: true, y: { formatter: function (val) { return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } } },
      dataLabels: { enabled: true, formatter: function (val, opts) { return val.toFixed(1) + "%"; }, dropShadow: { enabled: false } },
      title: { text: 'Alocação por Tipo de Ativo', align: 'center' },
      legend: { position: 'bottom' },
    },
    barChartOptions: {
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 }, },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: [], },
      yaxis: { labels: { formatter: (value) => { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); } } },
      fill: { opacity: 1 },
      colors: ['#78909C', '#4CAF50'], 
      tooltip: { y: { formatter: function (val) { return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } } },
      title: { text: 'Performance por Classe (Investido vs Atual)', align: 'left' }
    },
  }),

  computed: {
    ...mapGetters('filters', {
      filtrosDashboard: 'getFiltros'
    }),

    // Título dinâmico
    tituloDashboard() {
      if (this.filters.carteiras && this.filters.carteiras.length > 0) {
        // Encontra os nomes das carteiras selecionadas
        const nomes = this.carteiras
          .filter(c => this.filters.carteiras.includes(c.id))
          .map(c => c.nome)
          .join(', ');
        return nomes ? `(${nomes})` : 'Geral';
      }
      return 'Geral';
    },

    totalPortfolioValue() {
      // Use filteredItems para calcular o total baseado nos filtros ativos
      const lista = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      
      if (!lista || lista.length === 0 || !this.dolar) {
        return 0;
      }
      return lista.reduce((total, item) => {
        const valorAtual = (item.quantidade || 0) * (item.cotacao || 0);
        const valorEmReais = item.Ticker.MoedaId !== 1 ? valorAtual * this.dolar : valorAtual;
        return total + valorEmReais;
      }, 0);
    },
    
    filteredItems() {
      const filtros = this.filtrosDashboard('dashboard');
      
      return this.items.filter(item => {
        // 1. Filtro de Ticker
        const matchesTicker = !filtros.ticker || filtros.ticker.length === 0 || filtros.ticker.includes(item.Ticker.id);
        
        // 2. Filtro de Carteiras
        let matchesCarteira = true;
        if (filtros.carteiras && filtros.carteiras.length > 0) {
            matchesCarteira = filtros.carteiras.includes(item.CarteiraId);
        }

        // 3. Filtro de Tipo de Ativo (Múltiplo)
        let matchesTipo = true;
        if (filtros.tipoAtivo && filtros.tipoAtivo.length > 0) {
            // Verifica se o ID do tipo do ativo está na lista de selecionados
            matchesTipo = filtros.tipoAtivo.includes(item.Ticker.TipoAtivoId);
        }

        // 4. Filtro de Classificação
        let matchesClassificacao = true;
        if (filtros.classificacao) {
            matchesClassificacao = item.Ticker.TipoAtivoClassificacaoId === filtros.classificacao;
        }

        // 5. Filtro de Agrupamento
        let matchesAgrupamento = true;
        if (filtros.agrupamento) {
            matchesAgrupamento = item.Ticker.TipoAtivoAgrupamentoId === filtros.agrupamento;
        }

        return matchesTicker && matchesCarteira && matchesTipo && matchesClassificacao && matchesAgrupamento;
      })
    },
    
    visibleHeaders() {
      return this.headers.filter(h => h.visible)
    },

    // carteiraId() { // Removido
    //   return this.$route.params.id
    // },

    allocationData() {
      // Usa filteredItems para respeitar os filtros
      const lista = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      if (!lista || lista.length === 0) return { series: [], labels: [] };

      const groups = {};

      lista.forEach(item => {
        const typeName = item.tipoAtivoNome || 'Outros';
        const totalValue = (item.quantidade || 0) * (item.cotacao || 0) * (item.Ticker.MoedaId !== 1 ? this.dolar : 1);

        if (!groups[typeName]) { groups[typeName] = 0; }
        groups[typeName] += totalValue;
      });

      return { series: Object.values(groups), labels: Object.keys(groups) };
    },
    
    chartOptionsComputed() {
        return { ...this.chartOptions, labels: this.allocationData.labels };
    },

    allocationClassificacaoData() {
      const lista = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      if (!lista || lista.length === 0) return { series: [], labels: [] };

      const groups = {};

      lista.forEach(item => {
        const typeName = item.tipoAtivoClassificacaoNome || 'Outros';
        const totalValue = (item.quantidade || 0) * (item.cotacao || 0) * (item.Ticker.MoedaId !== 1 ? this.dolar : 1);

        if (!groups[typeName]) { groups[typeName] = 0; }
        groups[typeName] += totalValue;
      });

      return { series: Object.values(groups), labels: Object.keys(groups) };
    },
    
    chartOptionsClassificacaoComputed() {
        return { 
          ...this.chartOptions, 
          labels: this.allocationClassificacaoData.labels,
          title: { text: 'Alocação por Classificação', align: 'center' }
        };
    },

    allocationAgrupamentoData() {
      const lista = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      if (!lista || lista.length === 0) return { series: [], labels: [] };

      const groups = {};

      lista.forEach(item => {
        const typeName = item.tipoAtivoAgrupamentoNome || 'Outros';
        const totalValue = (item.quantidade || 0) * (item.cotacao || 0) * (item.Ticker.MoedaId !== 1 ? this.dolar : 1);

        if (!groups[typeName]) { groups[typeName] = 0; }
        groups[typeName] += totalValue;
      });

      return { series: Object.values(groups), labels: Object.keys(groups) };
    },
    
    chartOptionsAgrupamentoComputed() {
        return { 
          ...this.chartOptions, 
          labels: this.allocationAgrupamentoData.labels,
          title: { text: 'Alocação por Agrupamento', align: 'center' }
        };
    },

    performanceData() {
      // Usa filteredItems para respeitar os filtros
      const lista = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      if (!lista || lista.length === 0) return { series: [], categories: [] };

      const groups = {};

      lista.forEach(item => {
        const typeName = item.tipoAtivoNome || 'Outros';
        const factor = item.Ticker.MoedaId !== 1 ? this.dolar : 1;
        const investidoBRL = (item.investido || 0) * factor;
        const atualBRL = (item.quantidade || 0) * (item.cotacao || 0) * factor;

        if (!groups[typeName]) { groups[typeName] = { investido: 0, atual: 0 }; }
        groups[typeName].investido += investidoBRL;
        groups[typeName].atual += atualBRL;
      });

      const categories = Object.keys(groups);
      return {
        categories: categories,
        series: [
          { name: 'Valor Investido', data: categories.map(c => groups[c].investido) },
          { name: 'Valor Atual', data: categories.map(c => groups[c].atual) }
        ]
      };
    },

    barChartOptionsComputed() {
      return {
        ...this.barChartOptions,
        xaxis: { ...this.barChartOptions.xaxis, categories: this.performanceData.categories }
      };
    },    

    totalComparativoData() {
      const lista = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      if (!lista || lista.length === 0) return { series: [], colors: [] };

      let totalInvestido = 0;
      let totalAtual = 0;

      lista.forEach(item => {
        const factor = item.Ticker.MoedaId !== 1 ? this.dolar : 1;
        totalInvestido += (item.investido || 0) * factor;
        totalAtual += (item.quantidade || 0) * (item.cotacao || 0) * factor;
      });

      const corAtual = totalAtual >= totalInvestido ? '#4CAF50' : '#E53935';

      return {
        series: [{ name: 'Valor', data: [totalInvestido, totalAtual] }],
        colors: ['#78909C', corAtual]
      };
    },

    totalBarChartOptions() {
      const dados = this.totalComparativoData.series[0]?.data || [0, 0];
      const investido = dados[0] || 0;
      const atual = dados[1] || 0;

      let percentual = 0;
      if (investido > 0) {
        percentual = ((atual - investido) / investido) * 100;
      }

      const sinal = percentual >= 0 ? '+' : '';
      const textoPercentual = `${sinal}${percentual.toFixed(2)}%`;

      return {
        chart: { type: 'bar', height: 350, toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: '40%', borderRadius: 6, distributed: true } },
        dataLabels: {
          enabled: true,
          formatter: (val) => { if(val > 1000) return (val/1000).toFixed(1) + 'k'; return val.toFixed(0); },
          offsetY: -20, style: { colors: ['#304758'] }
        },
        legend: { show: false },
        xaxis: { categories: ['Total Investido', 'Valor Atual'], labels: { style: { fontSize: '14px', fontWeight: 'bold' } } },
        yaxis: { labels: { formatter: (value) => { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); } } },
        tooltip: { y: { formatter: function (val) { return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } } },
        colors: this.totalComparativoData.colors,
        title: {
          text: `Patrimônio Total (${textoPercentual})`, 
          align: 'center',
          style: { color: percentual >= 0 ? '#4CAF50' : '#E53935', fontSize: '16px', fontWeight: 'bold' }
        }
      };
    },
  },

  watch: {
    headers: {
      handler() { this.saveColumnVisibility(); },
      deep: true
    },
    sortBy: {
      handler(newSortBy) { localStorage.setItem(SORT_BY_STORAGE_KEY, JSON.stringify(newSortBy)); },
      deep: true
    },
    multipleQuotes: {
      handler(novoValor) { this.atualizaCotacoes(); },
      deep: true
    },
    multipleProventos: {
      handler(novoValor) { this.atualizaProventos(); },
      deep: true
    },
    multiplePosicoes: {
      handler(novoValor) { this.atualizaPosicoes(); },
      deep: true
    },
    filters: {
      handler(newFilters) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      },
      deep: true // 'deep: true' é essencial para observar mudanças dentro do objeto
    },
  },

  created() {
    this.loadPersistentFilters();
    this.loadPersistentSort();
    this.loadColumnVisibility();
    // this.carteiraid = this.$route.params.id; // REMOVIDO
    this.loadItems();
    this.loadTiposAtivo();
    this.loadTiposAtivoClassificacao();
    this.loadTiposAtivoAgrupamento();
    this.fetchDolarQuote();
  },

  methods: {

    // Adicione este método em 'methods'
    getSaldoPosicao(posicaoId) {
      // Filtra apenas as operações desta posição específica
      const ops = this.operacoes.filter(op => op.PosicaoAtivoId === posicaoId);
      
      // Calcula o total acumulado
      const saldo = ops.reduce((acc, op) => {
        // Tipos que aumentam a posição: 1 (Compra), 3 (Bonificação), 4 (Subscrição)
        if ([1, 3, 4].includes(op.TipoOperacaoId)) {
          return acc + op.quantidade;
        } 
        // Tipos que diminuem a posição: 2 (Venda)
        else if (op.TipoOperacaoId === 2) {
          return acc - op.quantidade;
        }
        return acc;
      }, 0);

      return saldo;
    },

    saveColumnVisibility() {
      const visibilityConfig = this.headers.reduce((acc, header) => {
        acc[header.key] = header.visible;
        return acc;
      }, {});
      localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(visibilityConfig));
    },

    loadPersistentFilters() {
      const persistentFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (persistentFilters) {
        try {
          this.filters = JSON.parse(persistentFilters);
          this.applyFilters();
        } catch (e) {
          console.error('Erro ao carregar filtros salvos:', e);
          localStorage.removeItem(FILTERS_STORAGE_KEY);
        }
      }
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
      if (!this.tiposAtivoClassificacao.length) return '';
      const tipoAtivoClassificacao = this.tiposAtivoClassificacao.find(t => t.id === tipoAtivoClassificacaoId);
      return tipoAtivoClassificacao ? tipoAtivoClassificacao.nome : '';
    },

    getTipoAtivoAgrupamentoNome(tipoAtivoAgrupamentoId) {
      if (!this.tiposAtivoAgrupamento.length) return '';
      const tipoAtivoAgrupamento = this.tiposAtivoAgrupamento.find(t => t.id === tipoAtivoAgrupamentoId);
      return tipoAtivoAgrupamento ? tipoAtivoAgrupamento.nome : '';
    },

    loadPersistentSort() {
      const persistentSortBy = localStorage.getItem(SORT_BY_STORAGE_KEY);
      if (persistentSortBy) {
        try {
          const parsedSortBy = JSON.parse(persistentSortBy);
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
      // Ajuste na chamada do Dialog para usar o CarteiraId do item específico, já que pode ser de qualquer carteira
      // api.get(`/operacaose?TipoOperacaoId=1&TipoOperacaoId=2&TipoOperacaoId=3&TipoOperacaoId=4&CarteiraId=${item.CarteiraId}&TickerId=${item.Ticker.id}`).then((response) => {
      api.get(`/operacaose?TipoOperacaoId=1&TipoOperacaoId=2&TipoOperacaoId=3&TipoOperacaoId=4&TickerId=${item.Ticker.id}`).then((response) => {
        this.operacoes = response.data;
        // ... (resto da lógica de processamento das operações permanece igual) ...
        // Como é muito código repetido de cálculo, abreviei aqui, mas você deve manter o código original do método abrirDialog
        
        // Atribuir ao this.posicoesAtivo o array com somente o código das posições únicas
        this.posicoesAtivo = [...new Set(this.operacoes.map(op => op.PosicaoAtivoId))];
        
        let selecionadas = [];
        if (this.operacoes.length === 0) {
          this.dialog = false;
          return;
        } else {
          const ultimaOperacao = this.operacoes[this.operacoes.length - 1];
          selecionadas = this.operacoes.filter(op => op.PosicaoAtivoId === ultimaOperacao.PosicaoAtivoId);
          this.posicaoAtivoSelecionado = ultimaOperacao.PosicaoAtivoId;
        }

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

        let pmPosicaoAnterior = 0;
        let quantidadeAcumulada = 0;
        let taxasAcumuladas = 0;
        let valorInvestidoAcumulado = 0;
        selecionadas = selecionadas.map(op => {
          if (op.TipoOperacaoId === 1 || op.TipoOperacaoId === 3 || op.TipoOperacaoId === 4) {
            const totalAnterior = pmPosicaoAnterior * quantidadeAcumulada;
            quantidadeAcumulada += op.quantidade;
            pmPosicaoAnterior = (totalAnterior + (op.valor_unitario * op.quantidade)) / quantidadeAcumulada;
            valorInvestidoAcumulado += op.valor_unitario * op.quantidade;
          } else if (op.TipoOperacaoId === 2) {
            quantidadeAcumulada -= op.quantidade;
          }
          taxasAcumuladas += op.taxas || 0;
          return { ...op, PM_posicao: pmPosicaoAnterior, taxas_acumuladas: taxasAcumuladas, valor_investido_acumulado: valorInvestidoAcumulado };
        });

        this.posicaoPrecoMedio = pmPosicaoAnterior;

        selecionadas = selecionadas.map(op => {
          if (op.TipoOperacaoId === 2) {
            const lucro = (op.valor_unitario - op.PM_posicao) * op.quantidade;
            return { ...op, lucro };
          }
          return { ...op, lucro: 0 };
        });

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
      if (this.operacoes.length === 0) {
        this.dialog = false;
        return;
      } else {
        selecionadas = this.operacoes.filter(op => op.PosicaoAtivoId === posicaoId);
        this.posicaoAtivoSelecionado = posicaoId;
      }
      
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

      let pmPosicaoAnterior = 0;
      let quantidadeAcumulada = 0;
      selecionadas = selecionadas.map(op => {
        if (op.TipoOperacaoId === 1 || op.TipoOperacaoId === 3 || op.TipoOperacaoId === 4) {
          const totalAnterior = pmPosicaoAnterior * quantidadeAcumulada;
          quantidadeAcumulada += op.quantidade;
          pmPosicaoAnterior = (totalAnterior + (op.valor_unitario * op.quantidade)) / quantidadeAcumulada;
        } else if (op.TipoOperacaoId === 2) {
          quantidadeAcumulada -= op.quantidade;
        }
        return { ...op, PM_posicao: pmPosicaoAnterior };
      });

      this.posicaoPrecoMedio = pmPosicaoAnterior;

      selecionadas = selecionadas.map(op => {
        if (op.TipoOperacaoId === 2) {
          const lucro = (op.valor_unitario - op.PM_posicao) * op.quantidade;
          return { ...op, lucro };
        }
        return { ...op, lucro: 0 };
      });

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
      // Limpa todos os filtros
      this.filters = { 
        ticker: [], 
        carteiras: [], 
        tipoAtivo: [], 
        classificacao: null,
        agrupamento: null
      }
      this.limparFiltros('dashboard')
    },
    
    loadFilters() {
      const savedFilters = this.filtrosDashboard('dashboard')
      this.filters = { ...this.filters, ...savedFilters }
    },

    exibirConsole() {
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
        // Atualiza percentual com base no novo total (que agora pode variar conforme o filtro)
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
          item.tipoAtivoNome = this.getTipoAtivoNome(item.Ticker.TipoAtivoId);
          item.tipoAtivoAgrupamentoNome = this.getTipoAtivoAgrupamentoNome(item.Ticker.TipoAtivoAgrupamentoId);
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
        // Remover ID da carteira se a API suportar agregação global, senão pode dar conflito
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
        // Removido CarteiraId da query string para pegar posições globais (se a API suportar)
        // Caso contrário, talvez precise passar todas as carteiras IDs
        api.get(`/aggregation/PosicaoAtivo/id/count/TickerId?ativos=${this.symbols_id}`).then((response) => {
          this.multiplePosicoes = response.data;
        });
      } catch (error) {
        console.error('Erro ao buscar múltiplas posições:', error);
      }
    },

    // Métodos de cálculo mantidos...
    calcularRendimento_pm_historico(item) {
      const { quantidade, cotacao, preco_medio_historico } = item;
      if (!preco_medio_historico || isNaN(quantidade) || isNaN(cotacao) || isNaN(preco_medio_historico)) return 0;
      const rendimento = ((quantidade * cotacao - (quantidade * preco_medio_historico)) / (quantidade * preco_medio_historico)) * 100;
      return rendimento;
    },

    calcularRendimento_valor(item) {
      const { quantidade, cotacao, valor_investido } = item;
      if (!valor_investido || isNaN(quantidade) || isNaN(cotacao) || isNaN(valor_investido)) return 0;
      const rendimento = ((quantidade * cotacao - valor_investido) / valor_investido) * 100;
      return rendimento;
    },

    calcularRendimento(item) {
      const { quantidade, cotacao, investido } = item;
      if (!investido || isNaN(quantidade) || isNaN(cotacao) || isNaN(investido)) return 0;
      const rendimento = ((quantidade * cotacao - investido) / investido) * 100;
      return rendimento;
    },

    calcularRendimentoReais(compras, valorAtualAtivo) {
      const totalInvestido = this.calcularTotalInvestido(compras);
      if (totalInvestido <= 0) return 0;
      const rendimento = ((valorAtualAtivo - totalInvestido) / totalInvestido) * 100;
      return parseFloat(rendimento.toFixed(2));
    },
    
    calcularTotalInvestido(compras) {
      if (!compras || compras.length === 0) return 0;
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
      // CARREGAR TUDO: Removemos o CarteiraId da query
      api.get(`/dashboards`).then((response) => {
        this.items = response.data;
        this.symbols = this.items.map(item => item.Ticker.nome);
        this.symbols_id = this.items.map(item => item.Ticker.id);
        this.fetchMultipleStockQuotes();
        this.fetchMultipleProventos();
        this.fetchMultiplePosicoes();
      });
      // Carrega tickers e carteiras para os filtros
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
      }).catch(error => { console.error("Erro ao carregar tipos de ativo:", error); });
    },

    loadTiposAtivoClassificacao() {
      api.get("/tipoativoclassificacao").then((response) => {
        this.tiposAtivoClassificacao = response.data;
      }).catch(error => { console.error("Erro ao carregar classificação de ativos:", error); });
    },

    loadTiposAtivoAgrupamento() {
      api.get("/tipoativoagrupamento").then((response) => {
        this.tiposAtivoAgrupamento = response.data;
      }).catch(error => { console.error("Erro ao carregar agrupamento de ativos:", error); });
    },
  },
}
</script>

<style scoped>
.card-ativo {
  transition: transform 0.2s;
}
.card-ativo:hover {
  transform: translateY(-5px);
}
.card-list .v-list-item {
  min-height: 32px;
  padding: 0 8px;
}
.card-list .v-icon {
  margin-right: 8px;
}
.selected-posicao-chip {
  border: 2px solid currentColor !important;
  font-weight: bold;
}
</style>