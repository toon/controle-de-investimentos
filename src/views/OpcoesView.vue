<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div>
    <v-data-table
        :headers="visibleHeaders"
        :items="filteredItems"
        item-key="id"
        hover
        hover-color="#f5f5f5"
        :items-per-page="50"
        v-model:sort-by="sortBy"
        @click:row="handleRowClick"
        :row-props="getRowProps"
        class="sticky-column-table"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title><v-icon>mdi-file-certificate-outline</v-icon> Opções</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            icon="mdi-refresh-circle"
            density="comfortable" 
            @click="fetchMultipleStockQuotes"
            title="Atualizar cotações"
          ></v-btn>
          <v-btn
            color="blue"
            icon="mdi-calculator"
            density="comfortable" 
            @click="calculateNotionalDialog"
            title="Calcular Notional"
            class="ml-2"
          ></v-btn>
          <v-menu
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


          <v-dialog v-model="dialogNotional" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Notional: {{ $formatCurrency(this.notional, 1) }}</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="closeNotional">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog
            v-model="dialog"
            max-width="700px"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                class="mb-2"
                color="primary"
                dark
                v-bind="props"
              >
                Novo item
              </v-btn>
            </template>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="4">
                        <v-autocomplete v-model="editedItem.TipoOpcaoStatusId" :items="opcaostatus" item-title="nome" item-value="id" label="Status" :rules="[rules.required]"></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.nome" label="Código da Opção" :rules="[rules.required]"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-autocomplete v-model="editedItem.TickerId" :items="tickers" item-title="nome" item-value="id" label="Ativo Subjacente" :rules="[rules.required]"></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.data_abertura" label="Data de Abertura" type="date" :rules="[rules.required]"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.data_vencimento" label="Data de Vencimento" type="date" :rules="[rules.required]"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.strike" label="Strike" type="number" :rules="[rules.required]"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.strike_inicial" label="Strike Inicial" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.quantidade" label="Quantidade" type="number" :rules="[rules.required]"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.investido" label="Investido" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-autocomplete v-model="editedItem.TipoOpcaoOperacaoId" :items="tipoOpcaoOperacoes" item-title="nome" item-value="id" label="Tipo de Operação" :rules="[rules.required]"></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-autocomplete v-model="editedItem.InvestidorId" :items="investidores" item-title="nome" item-value="id" label="Investidor" :rules="[rules.required]"></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-autocomplete v-model="editedItem.CorretoraId" :items="corretoras" item-title="nome" item-value="id" label="Corretora" :rules="[rules.required]"></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.preco_aquisicao" label="PM de Aquisição (Underlying)" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.preco_ativo_na_compra" label="Preço Ativo na Compra" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.data_recompra" label="Data Recompra" type="date"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.preco_recompra" label="Preço Recompra" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.preco_ativo_no_encerramento" label="Preço Ativo no Encerramento" type="number"></v-text-field>
                      </v-col>
                       <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.taxas" label="Taxas" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="editedItem.resultado" label="Resultado" type="number"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue-darken-1" variant="text" @click="close">Cancelar</v-btn>
                  <v-btn color="blue-darken-1" variant="text" @click="save">Salvar</v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Confirma exclusão este item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancelar</v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogSimularRecompra" max-width="700px">
            <v-card>
              <v-card-title>
                <span class="text-h5">Simular Recompra {{ simulacaoItem.nome }}</span>
              </v-card-title>
              <v-card-text>
                <v-container v-if="simulacaoItem && simulacaoItem.nome">
                  <v-row>
                    <v-col cols="12" sm="4">
                      <strong>Strike:</strong> {{ $formatCurrency(simulacaoItem.strike, 1) }}
                    </v-col>
                    <v-col cols="12" sm="4">
                      <strong>Cotação:</strong> {{ $formatCurrency(simulacaoItem.cotacao, 1) }}
                    </v-col>
                    <v-col cols="12" sm="4">
                      <strong>PM Ativo:</strong> {{ $formatCurrency(simulacaoItem.preco_aquisicao, 1) }}
                    </v-col>
                    <v-col cols="12" sm="4">
                      <strong>Prêmio:</strong> {{ $formatCurrency(simulacaoItem.premio, 1) }}
                    </v-col>
                    <v-col cols="12" sm="4">
                      <strong>Quantidade:</strong> {{ simulacaoItem.quantidade ? parseInt(simulacaoItem.quantidade) : '' }}
                    </v-col>
                    <v-col cols="12" sm="4">
                      <strong>Total Prêmio:</strong> {{ $formatCurrency(simulacaoItem.premio * simulacaoItem.quantidade, 1) }}
                    </v-col>
                    <v-col cols="12" sm="6">
                      <strong>Valor Investido:</strong> {{ $formatCurrency(simulacaoItem.investido, 1) }}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="simulacaoPreco"
                        label="Preço de Recompra (por opção)"
                        type="number"
                        autofocus
                        @keyup.enter="executarSimulacao"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-if="simulacaoResultado !== null">
                    <v-col cols="12" md="6">
                      <h3 :class="simulacaoResultado >= 0 ? 'text-green' : 'text-red'">
                        Resultado: {{ $formatCurrency(simulacaoResultado, 1) }}
                      </h3>
                      <h4 v-if="simulacaoCustoRecompra !== null" class="text-red">
                        Valor a devolver: {{ $formatCurrency(simulacaoCustoRecompra, 1) }}
                      </h4>
                    </v-col>
                    <v-col cols="12" md="6">
                      <h4 v-if="simulacaoItem.investido > 0" :class="simulacaoResultado >= 0 ? 'text-green' : 'text-red'">
                        % op: {{ (simulacaoResultado / simulacaoItem.investido * 100).toFixed(2) }}%
                      </h4>
                      <h4 v-if="simulacaoItem.premio * simulacaoItem.quantidade > 0" :class="simulacaoResultado >= 0 ? 'text-green' : 'text-red'">
                        % prêmio: {{ (simulacaoResultado / (simulacaoItem.premio * simulacaoItem.quantidade) * 100).toFixed(2) }}%
                      </h4>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="fecharDialogSimulacao">Fechar</v-btn>
                <v-btn color="blue-darken-1" variant="tonal" @click="executarSimulacao">Simular</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>

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
                ></v-autocomplete>
              </v-col>
              
              <v-col cols="12" sm="3" md="3">
                <v-autocomplete
                  v-model="filters.status"
                  :items="opcaostatus"
                  item-title="nome"
                  item-value="id"
                  label="Status"
                  clearable
                  density="compact"
                  variant="outlined"
                  hide-details
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

      <template v-slot:item.status="{ item }">
        <v-chip
          :style="{ 
            border: item.TipoOpcaoStatus.nome == 'Exercido' ? '2px solid' : item.TipoOpcaoStatus.nome == 'Virou Pó' ? '2px solid green' : '',
            color: item.TipoOpcaoStatus.nome == 'Em andamento' || item.TipoOpcaoStatus.nome == 'Virou Pó' ? '#4caf50' : '#ff5722' 
            }"
          ><small>{{ item.TipoOpcaoStatus.nome}}</small></v-chip>

          <small>{{ item.TipoOpcaoStatus.nome == 'Em andamento' ? 
            $diasEntreDatas(item.data_abertura, new Date()) + ' dias de oper.'
            : '' }}
          </small>
      </template>

      <template v-slot:item.data_abertura="{ item }">
        {{ $formatDate(item.data_abertura) }}
        <div class="text-caption">{{ item.data_abertura != null ? 
          'Duração: ' + $diasEntreDatas(item.data_abertura, item.data_vencimento) + 'd'
          : '' }}
          </div>
      </template>

      <template v-slot:item.quantidade="{ item }">
        {{
          item.quantidade === null || item.quantidade === undefined ? '-' :
          Number(item.quantidade) % 1 === 0 ? parseInt(item.quantidade) :
          item.quantidade
        }}
      </template>

      <template v-slot:item.data_vencimento="{ item }">
        <div>
          <div>{{ $formatDate(item.data_vencimento) }}</div>
          <div v-if="!$isVencido(item.data_vencimento)" class="text-caption text-green">
            (Faltam {{ $diasParaVencer(item.data_vencimento) }}d)
          </div>
          <div v-else class="text-caption text-red">
            (Vencido)
          </div>
        </div>
      </template>

      <template v-slot:item.nome="{ item }">
        <strong>{{ item.nome }}</strong><br />
        <v-chip density="compact"
          :class="item.TipoOpcaoOperacao.id == $TIPO_OPCAO_OPERACAO.VP ? 'v-chip-vp' : item.TipoOpcaoOperacao.id == $TIPO_OPCAO_OPERACAO.VC ? 'v-chip-vc' : item.TipoOpcaoOperacao.id == $TIPO_OPCAO_OPERACAO.CP ? 'v-chip-cp' : 'v-chip-cp'"
          ><small><strong>{{ item.TipoOpcaoOperacao.nome }}</strong></small>
        </v-chip>
      </template>
      
      <template v-slot:item.strike="{ item }">
        <strong
          :class="{ 
                      'strike-destaque': item.strikeDestacado,
                      'strike-alerta': item.strikeAlerta
                  }"      
        >
          <v-tooltip 
            location="top"
            :disabled="!item.strike_inicial || item.strike_inicial <= 0"
            >
            <template v-slot:activator="{ props }">
              <span v-bind="props">
                {{ $formatCurrency(item.strike, 1) }}
              </span>
            </template>            
            <div>Strike inicial: {{ $formatCurrency(item.strike_inicial, 1) }}</div>            
          </v-tooltip>
        </strong>

        <v-icon
            v-if="item.strike_inicial > 0"
            size="small" 
            icon="mdi-swap-horizontal" 
            color="red"
            style="position: absolute; padding-left: 3px; "
        ></v-icon>
        
        
        <span v-if="item.TipoOpcaoStatus.nome == 'Em andamento'">
          <br />
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <span v-bind="props">
                {{ $formatCurrency(item.cotacao, 1) }}
              </span>
            </template>
            <div>Distância do strike: {{(((item.cotacao / item.strike) - 1) * 100).toFixed(2)}}%</div>
            <div>Distância preço de compra: {{((item.cotacao/item.preco_ativo_na_compra-1)*100).toFixed(1)}}%</div>
          </v-tooltip>
          <small><v-icon 
            size="x-small" 
            icon="mdi-information-outline" 
            style="position: absolute; padding-left: 5px; "
          ></v-icon></small>
        </span>
      </template>
      <!-- <template v-slot:item.strike_inicial="{ item }">
        {{ $formatCurrency(item.strike_inicial, 1) }}
      </template> -->
      <template v-slot:item.preco_aquisicao="{ item }">
        {{ $formatCurrency(item.preco_aquisicao, 1) }}
      </template>

      <template v-slot:item.premio="{ item }">
        <strong>{{ $formatCurrency(item.premio, 1) }}</strong><br />
        <small>
          <div v-if="item.preco_ativo_na_compra > 0">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props">
                  {{ $formatCurrency(item.preco_ativo_na_compra, 1) }}
                </span>
              </template>
              <div>Preço do ativo na compra</div>
              <div>Distância do strike: {{((item.strike/item.preco_ativo_na_compra-1)*100).toFixed(1)}}%</div>
            </v-tooltip>
            <v-icon 
              size="x-small" 
              icon="mdi-information-outline" 
              style="position: absolute; padding-left: 5px; "
            ></v-icon>
          </div>
          <div style="position: relative; top: -4px;" 
            v-if="item.preco_ativo_no_encerramento > 0">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props">
                  {{ $formatCurrency(item.preco_ativo_no_encerramento, 1) }}
                </span>
              </template>
              <div>Preço do ativo no encerramento</div>
              <div>Distância do strike: {{((item.strike/item.preco_ativo_no_encerramento-1)*100).toFixed(1)}}%</div>
            </v-tooltip>
            <v-icon 
              size="x-small" 
              icon="mdi-information-outline" 
              style="position: absolute; padding-left: 5px; "
            ></v-icon>
          </div>
        </small>
      </template>

      <template v-slot:item.premio_total="{ item }">
        {{ $formatCurrency(item.premio*item.quantidade, 1) }}
      </template>

      <template v-slot:item.retorno_exercicio="{ item }">
        {{ 
          (item.TipoOpcaoOperacao.nome=='Venda de CALL') ? $formatCurrency(item.strike*item.quantidade-item.investido, 1) : $formatCurrency(item.investido-item.strike*item.quantidade, 1)
        }}
      </template>

      <template v-slot:item.retorno_exercicio_total="{ item }">
        {{ $formatCurrency(item.strike*item.quantidade, 1) }}
      </template>

      <template v-slot:item.retorno_exercicio_premio="{ item }">
        {{ 
          (item.TipoOpcaoOperacao.nome=='Venda de CALL') ? $formatCurrency(item.premio*item.quantidade+item.strike*item.quantidade, 1) : $formatCurrency(item.strike*item.quantidade-item.premio*item.quantidade, 1)
        }}
        {{  }}
      </template>

      <template v-slot:item.investido="{ item }">
        {{ $formatCurrency(item.investido, 1) }}
      </template>

      <template v-slot:item.porcent_operacao="{ item }">
        <v-chip>{{ (item.premio*item.quantidade/item.investido*100).toFixed(2) }}%</v-chip>
      </template>

      <template v-slot:item.porcent_exercicio="{ item }">
        <v-chip>{{ 
          (item.TipoOpcaoOperacao.nome=='Venda de CALL') ? 
            (((item.strike*item.quantidade) / item.investido-1) * 100).toFixed(2) :
            (((item.strike*item.quantidade) / item.investido-1) * 100).toFixed(2) * -1
          }}%</v-chip>
      </template>

      <template v-slot:item.porcent_exercicio_total="{ item }">
        <v-chip>{{ 
          (item.TipoOpcaoOperacao.nome=='Venda de CALL') ? 
            (((item.premio*item.quantidade+item.strike*item.quantidade) / item.investido-1) * 100).toFixed(2) :
            (((item.strike*item.quantidade-item.premio*item.quantidade) / item.investido-1) * 100).toFixed(2) * -1
          }}%</v-chip>
      </template>

      <template v-slot:item.resultado="{ item }">
        {{ $formatCurrency(item.resultado, 1) }}
        <div class="text-caption">
          <span v-if="item.resultado > 0" class="text-green"><v-chip density="compact">{{ (item.resultado/item.investido*100).toFixed(2) }}%</v-chip></span>
          <span v-if="item.resultado < 0" class="text-red"><v-chip density="compact">{{ (item.resultado/item.investido*100).toFixed(2) }}%</v-chip></span>
        </div>
      </template>

      <template v-slot:item.data_recompra="{ item }">
        {{ $formatDate(item.data_recompra) }}

        <small>{{ item.data_recompra != null ? 
          $diasEntreDatas(item.data_abertura, item.data_recompra) + ' dias de oper.'
          : '' }}
          {{ item.TipoOpcaoStatus.nome == 'Virou Pó' || item.TipoOpcaoStatus.nome == 'Exercido' ? 
          $diasEntreDatas(item.data_abertura, item.data_vencimento) + ' dias de oper.'
          : '' }}
        </small>
      </template>

      <template v-slot:item.preco_recompra="{ item }">
        <span v-if="item.data_recompra">
          {{ $formatCurrency(item.preco_recompra, 1) }}
        </span>
        <v-btn
          v-else-if="item.TipoOpcaoStatus.nome == 'Em andamento'"
          size="small"
          density="compact"
          @click.stop="simularRecompra(item)"
        >
          Simular
        </v-btn>
      </template>
      
      <template v-slot:item.investidor="{ item }">
        {{ (item.InvestidorId != null ? item.Investidor.nome : null) }}<br />
        {{ (item.CorretoraId != null ? '(' + item.Corretora.nome + ')' : null) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon
          class="me-2"
          size="small"
          @click="editItem(item)"
          title="Editar"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          size="small"
          @click="deleteItem(item)"
          title="Excluir"
        >
          mdi-delete
        </v-icon>
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
  </div>
</template>
<script>
import stockService from "@/services/stockService";
import api from "../services/api";

// Defina uma chave única para o LocalStorage
const FILTERS_STORAGE_KEY = 'opcoesFilters';
const SELECTED_ROW_STORAGE_KEY = 'opcoesSelectedRow';
const COLUMN_VISIBILITY_KEY = 'opcoesColumnVisibility';
const SORT_BY_STORAGE_KEY = 'opcoesSortBy';

export default {
  data: () => ({
    notional: 0,
    mostrarCard: false,
    tickers: [],
    symbols: [],
    multipleQuotes: 0,
    opcaostatus: [],
    investidores: [],
    corretoras: [],
    tipoOpcaoOperacoes: [],
    filters: {
      status: null,
      ticker: null
    },
    selectedRow: null,
    sortBy: [{ key: 'id', order: 'desc' }],
    items: [],
    moedas: [], // Armazena os tipos de operação recuperados da API
    tiposAtivo: [], // Armazena os tipos de operação recuperados da API
    headers: [
      { title: "Cód", value: "id", key: "id", visible: true },
      { title: "Status", key:"status", value: "TipoOpcaoStatus.nome", align: "center", visible: true },
      { title: "Opção", key:"nome", value: "nome", align: "center", visible: true },
      { title: "Ativo", key:"ativo", value: "Ticker.nome", align: "center", visible: true },
      { title: "Abertura", key:"data_abertura", value: "data_abertura", visible: true },
      { title: "Vencimento", key:"data_vencimento", value: "data_vencimento", visible: true },
      { title: "PM de aquisição", key:"preco_aquisicao", value: "preco_aquisicao", visible: true },
      { title: "Investido", key:"investido", value: "investido", visible: true },
      { title: "Qtde", key:"quantidade", value: "quantidade", visible: true },
      { title: "Strike (cotação)", key:"strike", value: "strike", align: "center", visible: true  },
      // { title: "Strike Inicial", key: "strike_inicial", value: "strike_inicial", align: "center", visible: true },
      { title: "Prêmio", key:"premio", value: "premio", visible: true },
      { title: "Prêmio total", key:"premio_total", value: "premio_total", sortable: false, visible: true },
      { title: "Retorno exercício", key:"retorno_exercicio", value: "retorno_exercicio", sortable: false, visible: true },
      { title: "Retorno exercício total", key:"retorno_exercicio_total", value: "retorno_exercicio_total", sortable: false, visible: true },
      { title: "Retorno c/ prêmio", key:"retorno_exercicio_premio", value: "retorno_exercicio_premio", sortable: false, visible: true },
      { title: "% op", key:"porcent_operacao", value: "porcent_operacao", sortable: false, visible: true },
      { title: "% exerc.", key:"porcent_exercicio", value: "porcent_exercicio", sortable: false, visible: true },
      { title: "% exerc. total", key:"porcent_exercicio_total", value: "porcent_exercicio_total", sortable: false, visible: true },
      { title: "Taxas", key:"taxas", value: "taxas", sortable: false, visible: true },
      { title: "Resultado", key:"resultado", value: "resultado", visible: true },
      { title: "Data recompra", key:"data_recompra", value: "data_recompra", visible: true },
      { title: "Preço recompra", key:"preco_recompra", value: "preco_recompra", visible: true },
      { title: "Invest.", key:"investidor", value: "Investidor.nome", align: "center", visible: true },
      { title: "Ações", value: "actions", align: "end", sortable: false, minWidth: '80px', visible: true },
    ],
    dialog: false,
    dialogDelete: false,
    dialogNotional: false,
    dialogSimularRecompra: false,
    simulacaoItem: {},
    simulacaoPreco: null,
    simulacaoResultado: null,
    simulacaoCustoRecompra: null,
    valid: true,
    editedIndex: -1,
    editedItem: {
      nome: '',
      TickerId: null,
      data_abertura: null,
      data_vencimento: null,
      strike: null,
      strike_inicial: null,
      quantidade: null,
      TipoOpcaoOperacaoId: null,
      InvestidorId: null,
      CorretoraId: null,
      TipoOpcaoStatusId: null,
      preco_aquisicao: null,
      investido: null,
      preco_ativo_na_compra: null,
      preco_ativo_no_encerramento: null,
      taxas: null,
      data_recompra: null,
      preco_recompra: null,
    },
    defaultItem: {
      nome: '',
      TickerId: null,
      data_abertura: null,
      data_vencimento: null,
      strike: null,
      strike_inicial: null,
      quantidade: null,
      TipoOpcaoOperacaoId: null,
      InvestidorId: null,
      CorretoraId: null,
      TipoOpcaoStatusId: 1, // Default to "Em andamento"
      preco_aquisicao: null,
      investido: null,
      preco_ativo_na_compra: null,
      preco_ativo_no_encerramento: null,
      taxas: null,
      data_recompra: null,
      preco_recompra: null,
    },
    rules: {
      required: value => !!value || 'Campo obrigatório',
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Novo item' : 'Editar item'
    },
    dateRules() {
      return [
        value => !!value || 'Campo obrigatório',
        value => /^([0-2][0-9]|(3)[0-1])\/([0][1-9]|1[0-2])\/\d{4}$/.test(value) || 'Data inválida',
      ];
    },
    filteredItems() {
      return this.items.filter(item => {
        const matchesTicker = !this.filters.ticker || 
          item.TickerId === this.filters.ticker;
        
        const matchesOpcaoStatus = !this.filters.status || 
          item.TipoOpcaoStatusId === this.filters.status;
        
        return matchesTicker && matchesOpcaoStatus;
      });
    },
    visibleHeaders() {
      return this.headers.filter(h => h.visible)
    },
  },

  watch: {
    filters: {
      handler(newFilters) {
        // Salva qualquer mudança nos filtros no LocalStorage
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      },
      deep: true // 'deep: true' é essencial para observar mudanças dentro do objeto
    },
    selectedRow(newSelectedId) {
      if (newSelectedId) {
        // Salva o ID da linha no LocalStorage
        localStorage.setItem(SELECTED_ROW_STORAGE_KEY, newSelectedId);
      } else {
        // Remove a chave se nenhuma linha estiver selecionada
        localStorage.removeItem(SELECTED_ROW_STORAGE_KEY);
      }
    },
    sortBy: {
      handler(newSortBy) {
        // O v-model atualiza 'sortBy', e este watcher salva no LocalStorage
        localStorage.setItem(SORT_BY_STORAGE_KEY, JSON.stringify(newSortBy));
      },
      deep: true // Necessário porque 'sortBy' é um array de objetos
    },
    headers: {
      handler() {
        this.saveColumnVisibility();
      },
      deep: true
    },
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
    dialogNotional (val) {
      val || this.closeNotional()
    },
    dialogSimularRecompra (val) {
      val || this.fecharDialogSimulacao()
    },
    multipleQuotes: {
      handler(novoValor) {
        this.atualizaCotacoes();
      },
      deep: true
    },
  },

  created() {
    this.loadPersistentFilters(); // Carrega os filtros salvos ANTES de carregar os itens
    this.loadPersistentSelection();
    this.loadPersistentSort();
    this.loadColumnVisibility();
    this.loadItems();
    this.loadtiposAtivo();
    this.loadmoedas();
    this.loadInvestidores();
    this.loadCorretoras();
    this.loadTipoOpcaoOperacoes();
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
            // A verificação 'visibilityConfig[header.key] !== undefined' garante que
            // mesmo que uma nova coluna seja adicionada ao código, ela não ficará
            // invisível por não existir no LocalStorage antigo.
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

    loadPersistentFilters() {
      const persistentFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (persistentFilters) {
        try {
          this.filters = JSON.parse(persistentFilters);
        } catch (e) {
          console.error('Erro ao carregar filtros salvos:', e);
          localStorage.removeItem(FILTERS_STORAGE_KEY); // Limpa se estiver corrompido
        }
      }
    },

    loadPersistentSelection() {
      const persistentSelectedId = localStorage.getItem(SELECTED_ROW_STORAGE_KEY);
      if (persistentSelectedId) {
        // Apenas armazena o ID. 
        // A classe será aplicada pelo getRowProps quando a tabela renderizar.
        // Converte para número, já que LocalStorage armazena strings.
        this.selectedRow = Number(persistentSelectedId); 
      }
    },

    getRowProps({ item }) {
      // Este método é chamado para cada linha pela prop :row-props
      // Ele retorna um objeto de props para o <tr>
      return {
        class: {
          'selected-row': item.id === this.selectedRow
        }
      };
    },

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
    
    atualizaCotacoes() {      
      this.items.forEach(item => {
        const cotacao = this.multipleQuotes.find(c => c.ticker === item.Ticker.nome);
        if (cotacao) {
          item.cotacao = cotacao.price;
          item.open = cotacao.open;
          item.high = cotacao.high;
          item.low = cotacao.low;
          item.close = cotacao.close;

          this.destacarStrike(item.id, item.strike, item.cotacao, item.TipoOpcaoOperacao.id, item.TipoOpcaoStatus.id);

        }

        // item.rendimento = this.calcularRendimento(item);
        // item.hoje = this.calcularHoje(item);
      });
    },

    destacarStrike(itemId, strike, cotacao, tipoOperacaoId, tipoStatusId) {
        // Encontra o item pelo ID
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            // Define a classe baseada nas condições
            const isVP = tipoOperacaoId === 4;
            const isVC = tipoOperacaoId === 3;
            const isCC = tipoOperacaoId === 1;
            const isCP = tipoOperacaoId === 2;
            const isEmAndamento = tipoStatusId === 1;
            
            // Aplica classe vermelha se:
            // - VP E cotação < strike OU
            // - VC E cotação > strike
            item.strikeAlerta = isEmAndamento && ((isVP && cotacao < strike) || (isVC && cotacao > strike) || (isCC && cotacao < strike) || (isCP && cotacao > strike));
            
            // Adiciona a classe de destaque geral
//            item.strikeDestacado = true;
            
            // Remove as classes após 2 segundos
            // setTimeout(() => {
            //     item.strikeDestacado = false;
            //     item.strikeAlerta = false;
            // }, 2000);
        }
    },

    clearFilters() {
      this.filters = {
        // data: '',
        status: null,
        ticker: null,
        // tipoOperacao: null
      };
    },

    handleRowClick(event, { item }) {
      // Se a linha clicada já está selecionada
      if (this.selectedRow === item.id) {
        // Remove a seleção
        event.currentTarget.classList.remove('selected-row');
        this.selectedRow = null;
      } else {
        // Remove a seleção de todas as linhas primeiro
        document.querySelectorAll('.selected-row').forEach(row => {
          row.classList.remove('selected-row');
        });
        
        // Adiciona a classe apenas à linha clicada
        event.currentTarget.classList.add('selected-row');
        this.selectedRow = item.id;
      }
    },
    
    // Método para carregar os tipos de operação da API
    loadmoedas() {
      api.get("/moeda").then((response) => {
        this.moedas = response.data;
        // console.log(this.moedas);
      }).catch(error => {
        console.error("Erro ao carregar moedas:", error);
      });
      api.get(`/ticker`).then((response) => {
        this.tickers = response.data;
        // console.log(response.data[0]["nome"]);
      });
      api.get(`/tipoopcaostatus`).then((response) => {
        this.opcaostatus = response.data;
        // console.log(response.data[0]["nome"]);
      });
    },

    async fetchMultipleStockQuotes() {
      if (!this.symbols) return;
      
      try {
        this.multipleQuotes = await stockService.getMultipleStockQuotes(this.symbols);
      } catch (error) {
        console.error('Erro ao buscar múltiplas cotações:', error);
      }
    },

    // Função para calcular Notional com base nos registros que estão com status "Em Andamento" 
    // O Notional é a soma dos valor das operações no caso de exercício.
    calculateNotional() {
      let notional = 0;
      // Navegar pelos itens, filtrando os que estejam com status "Em Andamento"
      this.items.forEach(item => {
        if (item.TipoOpcaoStatusId === 1) {
          // Se o tipo da opção for venda de PUT o Notional é o Retorno exercício total
          if (item.TipoOpcaoOperacaoId === 4) {
            notional += item.strike*item.quantidade;
          } 
        }
      });
      this.notional = notional;
    },
    
    // Método para carregar os tipos de operação da API
    loadtiposAtivo() {
      api.get("/tipoativo").then((response) => {
        this.tiposAtivo = response.data;
        // console.log(this.tiposAtivo);
      }).catch(error => {
        console.error("Erro ao carregar tipos de ativo:", error);
      });
    },

    loadInvestidores() {
      api.get("/investidors").then((response) => {
        this.investidores = response.data;
      }).catch(error => {
        console.error("Erro ao carregar investidores:", error);
      });
    },

    loadCorretoras() {
      api.get("/corretoras").then((response) => {
        this.corretoras = response.data;
      }).catch(error => {
        console.error("Erro ao carregar corretoras:", error);
      });
    },

    loadTipoOpcaoOperacoes() {
      api.get("/tipoopcaooperacaos").then((response) => {
        this.tipoOpcaoOperacoes = response.data;
      }).catch(error => {
        console.error("Erro ao carregar tipos de operação de opção:", error);
      });
    },

    loadItems() {
      api.get("/opcaos").then((response) => {
        this.items = response.data;
        this.symbols = this.items.map(item => item.Ticker.nome);
        this.fetchMultipleStockQuotes();
        console.log(this.items);
      });
    },
    
    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      const itemToEdit = Object.assign({}, item)
      if(itemToEdit.data_abertura) {
        itemToEdit.data_abertura = new Date(itemToEdit.data_abertura).toISOString().split('T')[0];
      }
      if(itemToEdit.data_vencimento) {
        itemToEdit.data_vencimento = new Date(itemToEdit.data_vencimento).toISOString().split('T')[0];
      }
      this.editedItem = itemToEdit;
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      api.delete(`/opcaos/${this.editedItem.id}`).then(() => {
        this.loadItems()
        this.closeDelete()
      });
    },

    simularRecompra (item) {
      this.simulacaoItem = Object.assign({}, item);
      this.dialogSimularRecompra = true;
    },

    fecharDialogSimulacao() {
      this.dialogSimularRecompra = false;
      this.$nextTick(() => {
        this.simulacaoItem = {};
        this.simulacaoPreco = null;
        this.simulacaoResultado = null;
        this.simulacaoCustoRecompra = null;
      });
    },

    executarSimulacao() {
      if (!this.simulacaoPreco || !this.simulacaoItem) {
        this.simulacaoResultado = null;
        this.simulacaoCustoRecompra = null;
        return;
      }
      
      const precoRecompra = parseFloat(this.simulacaoPreco);
      this.simulacaoCustoRecompra = precoRecompra * this.simulacaoItem.quantidade;
      const operacaoNome = this.simulacaoItem.TipoOpcaoOperacao.nome;

      if (operacaoNome.startsWith('Venda')) {
        // Para Venda de CALL (VC) e Venda de PUT (VP), o lucro é o prêmio recebido menos o custo da recompra.
        this.simulacaoResultado = (this.simulacaoItem.premio * this.simulacaoItem.quantidade) - this.simulacaoCustoRecompra;
      } else { // Assumimos que são 'Compra de CALL' e 'Compra de PUT'
        // Para Compra de CALL (CC) e Compra de PUT (CP), o lucro é o valor da recompra menos o prêmio pago.
        this.simulacaoResultado = this.simulacaoCustoRecompra - (this.simulacaoItem.premio * this.simulacaoItem.quantidade);
      }
    },

    calculateNotionalDialog () {
      this.calculateNotional()
      this.dialogNotional = true
    },    

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeNotional () {
      this.dialogNotional = false
    },

    save () {

      this.$refs.form.validate().then((formResult) => {

        if (formResult.valid) {
          const itemToSave = { ...this.editedItem };

          const brlToFloat = (value) => {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            if (typeof value === 'number') {
                return value;
            }
            if (typeof value === 'string') {
                if (value.includes(',')) {
                    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
                }
                return parseFloat(value);
            }
            return value;
          };

          const fieldsToConvert = [
            'strike', 'strike_inicial', 'quantidade', 'investido', 'preco_aquisicao', 'preco_ativo_na_compra', 
            'preco_recompra', 'preco_ativo_no_encerramento', 'taxas'
          ];

          fieldsToConvert.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(itemToSave, field)) {
                itemToSave[field] = brlToFloat(itemToSave[field]);
            }
          });
          
          if (this.editedIndex > -1) {
            api.put(`/opcao/${itemToSave.id}`, itemToSave).then(() => {
              this.loadItems()
              this.close();
            })
          } else {
            api.post("/opcaos", itemToSave).then(() => {
              this.loadItems()
              this.close();
            })
          }
        }

      });      

    },

/*    save () {
      if (this.editedIndex > -1) {
        api.put(`/ticker/${this.editedItem.id}`, this.editedItem).then(() => 
          this.loadItems()
        )
      } else {
        api.post("/ticker", this.editedItem).then(() => 
          this.loadItems()
        )
      }
      this.close()
    },*/
  },
}
</script>

<style>

.strike-alerta {
    color: red !important;
    font-weight: bold;
}

.strike-destaque.strike-alerta {
    background-color: #ff5252 !important;
    color: #fff !important;
    animation: pulse-alerta 0.5s ease-in-out;
}

.selected-row {
  background-color: #e3f2fd !important;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.v-chip-cp {
  background-color: red; /* vermelho */
  color: white;          /* texto branco */
}
.v-chip-cc {
  background-color: green; /* vermelho */
  color: white;            /* texto branco */
}
.v-chip-vp {
  background-color: #FFEAE4; /* vermelho */
  color: #ff5722;          /* texto branco */
}
.v-chip-vc {
  background-color: #E0EBE1; 
  color: #4caf50;          /* texto branco */
}
</style>