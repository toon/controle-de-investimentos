<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="filteredItems"
    :sort-by="[{ key: 'data', order: 'asc' }]"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>
          <v-icon>mdi-finance</v-icon> Operações 
        </v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>

        <v-dialog
          v-model="dialog"
          max-width="750px"
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

          <v-form ref="form" v-model="valid">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span> 
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    
                    <v-col 
                    cols="12"
                      md="3"
                    >
                      <v-autocomplete
                        key="select-key" 
                        v-model="editedItem.TipoOperacaoId"
                        :items="tiposOperacao"
                        item-title="nome"
                        item-value="id"
                        label="Operação"
                        :rules="[rules.required]"
                      ></v-autocomplete>
                    </v-col>

                    <v-col 
                      cols="12" 
                      md="3" 
                    >
                      <v-autocomplete
                        v-model="editedItem.TickerId"
                        label="Ticker"
                        :items="tickers"
                        item-title="nome"
                        item-value="id"
                        :rules="[rules.required]"
                      ></v-autocomplete> 
                    </v-col>

                    <v-col
                    cols="12"
                      md="3"
                    >
                      <v-text-field
                        v-model="formattedDate"
                        label="Data"
                        :rules="[rules.required, rules.data]"
                      ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                      md="3"
                    >
                      <v-text-field
                        v-model="editedItem.quantidade"
                        label="Quantidade"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                      md="3"
                    >
                      <v-text-field
                        v-model="editedItem.valor_unitario"
                        label="Valor unitário"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                      md="3"
                    >
                      <v-text-field
                        v-model="editedItem.cotacao_dolar"
                        label="Cotação do Dólar"                        
                      ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                      md="3"
                    >
                      <v-text-field
                        v-model="editedItem.taxas"
                        label="Taxas"
                      ></v-text-field>
                    </v-col>

                    <v-col 
                    cols="12"
                      md="3"
                    >
                      <v-autocomplete
                        v-model="editedItem.PosicaoAtivoId"
                        :items="posicoesTicker"
                        item-title="id"
                        item-value="id"
                        label="Posição"
                        :rules="[rules.required]"
                      ></v-autocomplete>
                    </v-col>

                    <v-col 
                    cols="12"
                      md="3"
                    >
                      <v-autocomplete
                        v-model="editedItem.Investidor"
                        :items="Investidores"
                        item-title="nome"
                        item-value="id"
                        label="Investidor"
                        :rules="[rules.required]"
                      ></v-autocomplete>
                    </v-col>

                    <v-col 
                    cols="12"
                      md="3"
                    >
                      <v-autocomplete
                        v-model="editedItem.Corretora"
                        :items="Corretoras"
                        item-title="nome"
                        item-value="id"
                        label="Corretora"
                        :rules="[rules.required]"
                      ></v-autocomplete>
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

              <v-card
                class="mb-4"
                outlined
                elevation="0"
                v-if="editedItem.TickerId"
              >
                <v-card-title class="text-h6">
                  Posições do ativo {{ tickers.find(t => t.id === editedItem.TickerId)?.nome || '' }}
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col
                      v-for="pos in posicoesTicker"
                      :key="pos.id"
                      cols="12"
                      md="4"
                    >
                      <v-card outlined class="pa-2">
                        <v-card-title class="text-caption font-weight-medium">
                          Posição #{{ pos.id }}
                        </v-card-title>
                        <v-card-text class="text-caption pa-1">
                          <div>Data abertura: {{ $formatDate(pos.data_abertura) }}</div>
                          <div>
                            Data fechamento: {{ $formatDate(pos.data_fechamento) }}
                            <span v-if="pos.data_fechamento == null">(em aberto)</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-row v-if="!posicoesTicker.length">
                    <v-col cols="12" md="12">
                      <div class="text-caption text-grey">
                      Nenhuma posição encontrada para este ativo.
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="12">
                      
                      <v-btn
                        color="primary"
                        variant="outlined"
                        @click="novaPosicao"
                      >
                        <v-icon start>mdi-plus</v-icon>
                        Nova posição
                      </v-btn>

                      <v-dialog v-model="dialogNovaPosicao" max-width="400px">
                      <v-card>
                        <v-card-title class="text-h6">Nova posição</v-card-title>
                        <v-card-text>
                        <v-text-field
                          v-model="novaPosicaoData"
                          label="Data de abertura"
                          placeholder="dd/mm/aaaa"
                          :rules="[rules.required, rules.data]"
                        ></v-text-field>
                        </v-card-text>
                        <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="dialogNovaPosicao = false">Cancelar</v-btn>
                        <v-btn color="primary" text @click="confirmNovaPosicao">Salvar</v-btn>
                        </v-card-actions>
                      </v-card>
                      </v-dialog>

                    </v-col>
                  </v-row>
                  
                </v-card-text>
              </v-card>

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

      <MenuCarteira />

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
              <v-text-field
                v-model="filters.data"
                label="Data"
                placeholder="dd/mm/aaaa"
                clearable
                density="compact"
                variant="outlined"
                hide-details
                @click:clear="filters.data = ''"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" sm="2" md="2">
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
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="2" md="2">
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
              ></v-autocomplete>
            </v-col>
            
            <v-col cols="12" sm="3" md="3">
              <v-autocomplete
                v-model="filters.tipoOperacao"
                :items="tiposOperacao"
                item-title="nome"
                item-value="id"
                label="Operação"
                multiple
                chips
                closable-chips
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
    <template v-slot:item.data="{ item }">
      {{ $formatDate(item.data) }}
      <!-- Se o campo cotacao_dolar for diferente de null, exibir -->
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
    <template v-slot:item.total="{ item }">
      {{ calculateTotal(item.quantidade, item.valor_unitario, item.taxas, item.Ticker.MoedaId) }}
      <span v-if="item.cotacao_dolar">
        <br />{{ calculateTotal(item.quantidade, item.valor_unitario*item.cotacao_dolar, item.taxas*item.cotacao_dolar, 1) }}
      </span>
    </template>
    <template v-slot:item.ticker="{ item }">
      {{ item.Ticker.nome }} ({{ item.Ticker.id }})
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
    <template v-slot:item.ativo="{ item }">
      <v-icon v-if="item.ativo == true" color="success" title="Ativo">mdi-check-circle</v-icon>
      <v-icon v-else color="error" title="Inativo">mdi-close-circle</v-icon>
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
import MenuCarteira from '@/components/MenuCarteira.vue'

export default {
  components: {
    MenuCarteira,
  },
  data: () => ({
    mostrarCard: true,
    valid: false,
    filters: {
      data: '',
      ticker: [],
      tipoOperacao: [],
      carteiras: []
    },
    tiposOperacao: [], // Armazena os tipos de operação recuperados da API
    carteiras: [],
    posicoesTicker: [], // Armazena recuperados da API
    Investidores: [], // Armazena recuperados da API
    Corretoras: [], // Armazena recuperados da API
    formattedDate: '',
    tickers: [],
    items: [],
    headers: [
      // { title: "#", value: "id", align: "center", key: "id" },
      { title: "Pos.", value: "PosicaoAtivoId", align: "center", key: "PosicaoAtivoId" },
      { title: "Data", value: "data", align: "center", key: "data" },
      { title: "Ticker", key:"ticker", align: "center", value: "Ticker.nome" },
      { title: "Operação", key:"tipooperacao", align: "center", value: "TipoOperacao.nome" },
      { title: "Quantidade", key: "quantidade", align: "center", value: "quantidade" },
      { title: "Valor unitário", key: "valor_unitario", align: "center", value: "valor_unitario" },
      { title: "Taxas", key: "taxas", align: "center", value: "taxas" },
      { title: "Montante da operação", key: "total", align: "center", value: "total" },
      { title: "Invest.", key: "investidor", align: "center" },
      { title: "Ações", value: "actions", align: "end", sortable: false },
    ],
    dialog: false,
    dialogDelete: false,
    dialogNovaPosicao: false,
    novaPosicaoData: '',
    editedIndex: -1,
    editedItem: {
      data: '',
      ticker: '',
      tipooperacao: '',
      posicoesticker: '',
      investidores: '',
      corretoras: '',
      quantidade: '',
      valor_unitario: '',
      taxas: '',
      TickerId: '',
      TipoOperacaoId: '',
      PosicaoAtivoId: '',
    },
    defaultItem: {
      // data: '',
      // ticker: 'BBDC4',
      // tipooperacao: '1',
      // quantidade: 10,
      // valor_unitario: 10.8,
      // taxas: 1.6,
      // TickerId: 2,
      // TipoOperacaoId: 1,

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

    // Validação personalizada
    dateRules() {
      return [
        (value) => {
          return /^([0-2][0-9]|(3)[0-1])\/([0][1-9]|1[0-2])\/\d{4}$/.test(value) || 'Data inválida';
        },
      ];
    },

    filteredItems() {
      return this.items.filter(item => {
        const matchesData = !this.filters.data || 
          this.$formatDate(item.data).includes(this.filters.data);
        
        const matchesTicker = !this.filters.ticker || this.filters.ticker.length === 0 ||
          this.filters.ticker.includes(item.TickerId);
        
        const matchesTipoOperacao = !this.filters.tipoOperacao || this.filters.tipoOperacao.length === 0 ||
          this.filters.tipoOperacao.includes(item.TipoOperacaoId);
        
        const matchesCarteira = !this.filters.carteiras || this.filters.carteiras.length === 0 ||
          this.filters.carteiras.includes(item.CarteiraId);

        return matchesData && matchesTicker && matchesTipoOperacao && matchesCarteira;
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
    dialogNovaPosicao (val) {
      val || this.closeNovaPosicao()
    },
    'editedItem.TickerId': {
      handler(novoValor) {
        if (novoValor) {
          this.loadPosicoesTicker(novoValor);
        }
      }
    },
  },

  created() {
    this.loadItems();
    this.loadTiposOperacao();
  },

  methods: {

    clearFilters() {
      this.filters = {
        data: '',
        ticker: [],
        tipoOperacao: [],
        carteiras: []
      };
    },
    
    // Método para carregar os tipos de operação da API
    loadTiposOperacao() {
      api.get("/tipooperacao").then((response) => {
        this.tiposOperacao = response.data;
        // console.log(this.tiposOperacao);
      }).catch(error => {
        console.error("Erro ao carregar tipos de operação:", error);
      });
    },

    // Método para carregar os tipos de operação da API
    loadPosicoesTicker(item) {
      api.get(`/posicaoativoe?TickerId=${item}`).then((response) => {
        this.posicoesTicker = response.data;
      }).catch(error => {
        console.error("Erro ao carregar posições de ticker:", error);
      });
    },

    calculateTotal(quantidade, precoUnitario, taxas, moedaId) {
      const total = quantidade * precoUnitario + taxas;
      // Formata o valor total como moeda
      return this.$formatCurrency(total, moedaId);
    },

    loadItems() {
      api.get(`/operacaos`).then((response) => {
        this.items = response.data;
      });
      api.get(`/ticker`).then((response) => {
        this.tickers = response.data;
        // console.log(response.data[0]["nome"]);
      });
      api.get(`/carteira`).then((response) => {
        this.carteiras = response.data;
      });
      api.get(`/investidor`).then((response) => {
        this.Investidores = response.data;
      });
      api.get(`/corretora`).then((response) => {
        this.Corretoras = response.data;
      });

    },

    gotoOperacoes (item) {
      this.$router.push({ name: 'Operacoes', params: { id: item.id } });
    },
    
    novaPosicao() {
      this.novaPosicaoData = '';
      this.dialogNovaPosicao = true;
    },

    closeNovaPosicao() {
      this.dialogNovaPosicao = false;
      this.novaPosicaoData = '';
    },

    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.formattedDate = this.$formatDate(item.data)
      // console.log(this.editedItem)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      api.delete(`/operacao/${this.editedItem.id}`).then(() => 
        this.loadItems(),
        this.closeDelete()
      );
    },

    confirmNovaPosicao() {
      if (!this.novaPosicaoData || !this.rules.data(this.novaPosicaoData) === true) {
        alert('Data inválida. Use o formato dd/mm/aaaa.');
        return;
      }

      const novaPosicao = {
        data_abertura: this.$formatDateToISO(this.novaPosicaoData),
        data_fechamento: null,
        TickerId: this.editedItem.TickerId,
      };

      api.post('/posicaoativo', novaPosicao).then(() => {
        this.loadPosicoesTicker(this.editedItem.TickerId);
        this.dialogNovaPosicao = false;
      }).catch(error => {
        console.error("Erro ao criar nova posição:", error);
      });
    },

    close () {
      this.dialog = false
      this.formattedDate = "";
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

          this.editedItem.data = this.$formatDateToISO(this.formattedDate);
          
          if (this.editedIndex > -1) {
            api.put(`/operacao/${this.editedItem.id}`, this.editedItem).then(() => 
              this.loadItems()
            )
          } else {
            api.post("/operacao", this.editedItem).then(() => 
              this.loadItems()
            )
          }
          this.close();
        }

      });

    },
  },
}
</script>