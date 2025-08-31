<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
      :headers="headers"
      :items="filteredItems"
      item-key="id"
      hover
      hover-color="#f5f5f5"
      :items-per-page="25"
      :sort-by="[{ key: 'id', order: 'desc' }]"
      @click:row="handleRowClick"
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
        <v-dialog
          v-model="dialog"
          max-width="500px"
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

                    <v-col
                      cols="12"
                      md="12"
                      sm="12"
                    >
                      <v-text-field
                        v-model="editedItem.descricao"
                        label="Descrição"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="12"
                      sm="12"
                    >
                      <v-text-field
                        v-model="editedItem.nome"
                        label="Ticker"
                      ></v-text-field>
                    </v-col>

                    <v-col
                      cols="12"
                      md="12"
                      sm="12"
                    >
                      <v-autocomplete
                        key="select-key" 
                        v-model="editedItem.TipoAtivoId"
                        :items="tiposAtivo"
                        item-title="nome"
                        item-value="id"
                        label="Tipo ativo"
                        :rules="[rules.required]"
                      ></v-autocomplete>
                    </v-col>

                    <v-col
                      cols="12"
                      md="12"
                      sm="12"
                    >
                      <v-autocomplete
                        key="select-key" 
                        v-model="editedItem.MoedaId"
                        :items="moedas"
                        item-title="nome"
                        item-value="id"
                        label="Moeda"
                        :rules="[rules.required]"
                      ></v-autocomplete>
                    </v-col>


                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-checkbox
                        v-model="editedItem.ativo"
                        label="Ativo?"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="close"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="save"
                >
                  Salvar
                </v-btn>
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
        :style="{ color: item.TipoOpcaoOperacao.nome == 'Venda de CALL' ? '#4caf50' : '#ff5722' }"
        ><small><strong>{{ item.TipoOpcaoOperacao.nome }}</strong></small>
      </v-chip>
    </template>
    
    <template v-slot:item.strike="{ item }">
      <strong>{{ $formatCurrency(item.strike, 1) }}</strong>
    </template>
    <template v-slot:item.preco_aquisicao="{ item }">
      {{ $formatCurrency(item.preco_aquisicao, 1) }}
    </template>
    <template v-slot:item.premio="{ item }">
      {{ $formatCurrency(item.premio, 1) }}
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
    <template v-slot:item.status="{ item }">
      <v-chip
        :style="{ color: item.TipoOpcaoStatus.nome == 'Em andamento' ? '#4caf50' : '#ff5722' }"
        ><small>{{ item.TipoOpcaoStatus.nome}}</small></v-chip>

        <small>{{ item.TipoOpcaoStatus.nome == 'Em andamento' ? 
          $diasEntreDatas(item.data_abertura, new Date()) + ' dias de oper.'
          : '' }}
        </small>

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
      </small>

    </template>
    <template v-slot:item.preco_recompra="{ item }">
      {{ $formatCurrency(item.preco_recompra, 1) }}
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
</template>
<script>
import { isToday } from "date-fns";
import api from "../services/api";

export default {
  data: () => ({
    mostrarCard: false,
    tickers: [],
    opcaostatus: [],
    filters: {
      status: null,
      ticker: null
    },
    selectedRow: null,
    items: [],
    moedas: [], // Armazena os tipos de operação recuperados da API
    tiposAtivo: [], // Armazena os tipos de operação recuperados da API
    headers: [
      { title: "Cód", value: "id", key: "id" },
      { title: "Status", key:"status", value: "TipoOpcaoStatus.nome", align: "center" },
      { title: "Ativo alvo", key:"ativo", value: "Ticker.nome" },
      { title: "Opção", key:"nome", value: "nome" },
      { title: "Abertura", key:"data_abertura", value: "data_abertura" },
      { title: "Vencimento", key:"data_vencimento", value: "data_vencimento" },
      { title: "PM de aquisição", key:"preco_aquisicao", value: "preco_aquisicao" },
      { title: "Investido", key:"investido", value: "investido" },
      { title: "Qtde", key:"quantidade", value: "quantidade" },
      { title: "Strike", key:"strike", value: "strike" },
      { title: "Prêmio", key:"premio", value: "premio" },
      { title: "Prêmio total", key:"premio_total", value: "premio_total", sortable: false },
      { title: "Retorno exercício", key:"retorno_exercicio", value: "retorno_exercicio", sortable: false },
      { title: "Retorno exercício total", key:"retorno_exercicio_total", value: "retorno_exercicio_total", sortable: false },
      { title: "Retorno c/ prêmio", key:"retorno_exercicio_premio", value: "retorno_exercicio_premio", sortable: false },
      { title: "% op", key:"porcent_operacao", value: "porcent_operacao", sortable: false },
      { title: "% exerc.", key:"porcent_exercicio", value: "porcent_exercicio", sortable: false },
      { title: "% exerc. total", key:"porcent_exercicio_total", value: "porcent_exercicio_total", sortable: false },
      { title: "Taxas", key:"taxas", value: "taxas", sortable: false },
      { title: "Resultado", key:"resultado", value: "resultado" },
      { title: "Data recompra", key:"data_recompra", value: "data_recompra" },
      { title: "Preço recompra", key:"preco_recompra", value: "preco_recompra" },
      { title: "Ações", value: "actions", align: "end", sortable: false, minWidth: '80px' },
    ],
    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedItem: {
      nome: '',
      TipoAtivoId: '',
    },
    defaultItem: {
      nome: ''
    },
    rules: {
      required: value => !!value || 'Campo obrigatório',
      data: value => /^([0-2][0-9]|(3)[0-1])\/([0][1-9]|1[0-2])\/\d{4}$/.test(value) || 'Data inválida',
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
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  created() {
    this.loadItems();
    this.loadtiposAtivo();
    this.loadmoedas();
  },

  methods: {

    clearFilters() {
      this.filters = {
        data: '',
        ticker: null,
        tipoOperacao: null
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
    
    // Método para carregar os tipos de operação da API
    loadtiposAtivo() {
      api.get("/tipoativo").then((response) => {
        this.tiposAtivo = response.data;
        // console.log(this.tiposAtivo);
      }).catch(error => {
        console.error("Erro ao carregar tipos de ativo:", error);
      });
    },

    loadItems() {
      api.get("/opcaos").then((response) => {
        this.items = response.data;
        console.log(this.items);
      });
    },
    
    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      api.delete(`/ticker/${this.editedItem.id}`).then(() => 
        this.loadItems(),
        this.closeDelete()
      );
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

    save () {

      this.$refs.form.validate().then((formResult) => {

        if (formResult.valid) {

          //this.editedItem.data = this.formatDateToISO(this.formattedDate);
          //this.editedItem.CarteiraId = this.carteiraid;
          
          if (this.editedIndex > -1) {
            api.put(`/ticker/${this.editedItem.id}`, this.editedItem).then(() => 
              this.loadItems()
            )
          } else {
            api.post("/ticker", this.editedItem).then(() => 
              this.loadItems()
            )
          }
          this.close();
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
.selected-row {
  background-color: #e3f2fd !important;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
</style>