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
    </template>
    <template v-slot:item.data="{ item }">
      {{ formatDate(item.data) }}
    </template>
    <template v-slot:item.valor_unitario="{ item }">
      {{ formatCurrency(item.valor_unitario) }}
    </template>
    <template v-slot:item.total="{ item }">
      {{ formatCurrency(item.total) }}
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
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default {
  data: () => ({
    valid: false,
    carteiraid: null,
    tiposProvento: [], // Armazena os tipos de operação recuperados da API
    CarteiraNome: "carregando...",
    formattedDate: '',
    tickers: [],
    items: [],
    headers: [
      { title: "Data", value: "data", align: "center", key: "data" },
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
    this.carteiraid = this.$route.params.id;
    this.loadItems();
    this.loadtiposProvento();
  },

  methods: {

    // Método para carregar os tipos de operação da API
    loadtiposProvento() {
      api.get("/tipoprovento").then((response) => {
        this.tiposProvento = response.data;
        // console.log(this.tiposProvento);
      }).catch(error => {
        console.error("Erro ao carregar tipos de operação:", error);
      });
    },

    formatDate(date) {
      try {
        const parsedDate = parseISO(date);
        if (isNaN(parsedDate.getTime())) {
          console.error('Data inválida:', date);
          return '';
        }
        return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
      } catch (error) {
        console.error('Erro ao formatar a data:', error);
        return '';
      }
    },

    formatDateToISO(date) {
      try {
        const [day, month, year] = date.split('/').map(Number);
        const isoDate = new Date(year, month - 1, day).toISOString();
        return isoDate;
      } catch (error) {
        console.error('Erro ao converter a data para ISO:', error);
        return '';
      }
    },

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
      api.get(`/proventos?CarteiraId=${this.carteiraid}`).then((response) => {
        this.items = response.data;
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

    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.formattedDate = this.formatDate(item.data)
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

          this.editedItem.data = this.formatDateToISO(this.formattedDate);
          this.editedItem.CarteiraId = this.carteiraid;
          
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