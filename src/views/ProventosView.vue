<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="filteredItems"
    :sort-by="[{ key: 'data', order: 'desc' }]"
    items-per-page="50"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title><v-icon>mdi-currency-usd</v-icon> Proventos {{ CarteiraNome }}</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>

        <v-dialog
          v-model="dialog"
          max-width="600px"
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
                      md="4"
                    >
                      <v-autocomplete
                        key="select-key" 
                        v-model="editedItem.TipoProventoId"
                        :items="tiposProvento"
                        item-title="nome"
                        item-value="id"
                        label="Tipo provento"
                        :rules="[rules.required]"
                      ></v-autocomplete>
                    </v-col>

                    <v-col 
                      cols="12" 
                      md="4" 
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
                      md="4"
                    >
                      <v-text-field
                        v-model="formattedDate"
                        label="Data"
                        :rules="[rules.required, rules.data]"
                      ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.valor_unitario"
                        label="Valor unitário"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.total"
                        label="Total"
                        :rules="[rules.required]"
                      ></v-text-field>
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
                v-model="filters.tipoProvento"
                :items="tiposProvento"
                item-title="nome"
                item-value="id"
                label="Tipo provento"
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
    </template>
    <template v-slot:item.carteira="{ item }">{{ item.Carteira.nome }}</template>
    <template v-slot:item.valor_unitario="{ item }">
      {{ $formatCurrency(item.valor_unitario, item.Ticker.MoedaId) }}
    </template>
    <template v-slot:item.total="{ item }">
      {{ $formatCurrency(item.total, item.Ticker.MoedaId) }}
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
// import { format, parseISO } from 'date-fns';
// import { ptBR } from 'date-fns/locale';
import MenuCarteira from '@/components/MenuCarteira.vue'

const FILTERS_STORAGE_KEY = 'proventosFilters';

export default {
  components: {
    MenuCarteira,
  },
  data: () => ({
    mostrarCard: true,
    filters: {
      data: '',
      ticker: [],
      tipoProvento: [],
      carteiras: []
    },
    tiposProvento: [], // Armazena os tipos de operação recuperados da API
    valid: false,
    // carteiraid: null,
    CarteiraNome: "carregando...",
    formattedDate: '',
    tickers: [],
    carteiras: [],
    items: [],
    headers: [
      { title: "Data", value: "data", align: "center", key: "data" },
      { title: "Carteira", key:"carteira", align: "center", value: "Carteira.nome" },
      { title: "Ticker", key:"ticker", align: "center", value: "Ticker.nome" },
      { title: "Tipo provento", key:"tipoprovento", align: "center", value: "TipoProvento.nome" },
      { title: "Valor unitário", key: "valor_unitario", align: "center", value: "valor_unitario" },
      { title: "Total", key: "total", align: "center", value: "total" },
      { title: "Ações", value: "actions", align: "end", sortable: false },
    ],
    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedItem: {
      data: '',
      ticker: '',
      tipoprovento: '',
      valor_unitario: '',
      total: '',
      TickerId: '',
      TipoProventoId: '',
      CarteiraId: ''
    },
    defaultItem: {
      // data: '',
      // ticker: 'BBDC4',
      // tipoprovento: '1',
      // quantidade: 10,
      // valor_unitario: 10.8,
      // taxas: 1.6,
      // TickerId: 2,
      // TipoProventoId: 1,
      // CarteiraId: 1

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
        const matchesData = !this.filters.data || 
          this.$formatDate(item.data).includes(this.filters.data);
        
        const matchesTicker = !this.filters.ticker || this.filters.ticker.length === 0 ||
          this.filters.ticker.includes(item.TickerId);
        
        const matchesTipoProvento = !this.filters.tipoProvento || this.filters.tipoProvento.length === 0 ||
          this.filters.tipoProvento.includes(item.TipoProventoId);
        
        const matchesCarteira = !this.filters.carteiras || this.filters.carteiras.length === 0 ||
          this.filters.carteiras.includes(item.CarteiraId);

        return matchesData && matchesTicker && matchesTipoProvento && matchesCarteira;
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
    filters: {
      handler(newFilters) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      },
      deep: true
    },
  },

  created() {
    this.loadPersistentFilters();
    // this.carteiraid = this.$route.params.id;
    this.loadItems();
    this.loadtiposProvento();
  },

  methods: {

    clearFilters() {
      this.filters = {
        data: '',
        ticker: [],
        tipoProvento: [],
        carteiras: []
      };
    },

    loadPersistentFilters() {
      const persistentFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (persistentFilters) {
        try {
          this.filters = JSON.parse(persistentFilters);
        } catch (e) {
          console.error('Erro ao carregar filtros salvos:', e);
          localStorage.removeItem(FILTERS_STORAGE_KEY);
        }
      }
    },

    // Método para carregar os tipos de operação da API
    loadtiposProvento() {
      api.get("/tipoprovento").then((response) => {
        this.tiposProvento = response.data;
        // console.log(this.tiposProvento);
      }).catch(error => {
        console.error("Erro ao carregar tipos de operação:", error);
      });
    },

    calculateTotal(quantidade, precoUnitario, taxas) {
      const total = quantidade * precoUnitario + taxas;
      // Formata o valor total como moeda
      return total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    },

    loadItems() {
      api.get(`/proventos`).then((response) => {
        this.items = response.data;
      });
      // api.get(`/carteira?id=${this.carteiraid}`).then((response) => {
      //   this.CarteiraNome = response.data[0]["nome"];
      //   // console.log(response.data[0]["nome"]);
      // });
      api.get(`/ticker`).then((response) => {
        this.tickers = response.data;
        // console.log(response.data[0]["nome"]);
      });
      api.get(`/carteira`).then((response) => {
        this.carteiras = response.data;
      });
    },

    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.formattedDate = this.$formatDate(item.data)
      console.log(this.editedItem)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      api.delete(`/provento/${this.editedItem.id}`).then(() => 
        this.loadItems(),
        this.closeDelete()
      );
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
          // this.editedItem.CarteiraId = this.carteiraid;
          
          if (this.editedIndex > -1) {
            api.put(`/provento/${this.editedItem.id}`, this.editedItem).then(() => 
              this.loadItems()
            )
          } else {
            api.post("/provento", this.editedItem).then(() => 
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