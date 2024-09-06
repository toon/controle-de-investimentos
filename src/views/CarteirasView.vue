<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :sort-by="[{ key: 'nome', order: 'asc' }]"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title><v-icon>mdi-wallet</v-icon> Carteiras</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialogTickers"
          max-width="500px"
        >
          <v-card>
            <v-card-title>
              <span class="text-h5">Tickers</span>
            </v-card-title>

            <v-card-text>
              <v-container>

                <v-list select-strategy="classic">

                  <v-list-item 
                    v-for="ticker, index in tickers"
                    :key="index"
                  >
                    <template v-slot:prepend>

                      <v-list-item-action start>
                        <v-checkbox-btn v-model="ticker.checked"></v-checkbox-btn>
                      </v-list-item-action>
                    </template>

                    <v-list-item-title>{{ ticker.nome }}</v-list-item-title>

                  </v-list-item>

                </v-list>

              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="closeDialogTickers"
              >
                Cancelar
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="saveTicker"
              >
                Salvar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
                      v-model="editedItem.nome"
                      label="Carteira"
                    ></v-text-field>
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
    
    <template v-slot:item.actions="{ item }">
      <v-icon
        class="me-1"
        
        @click="gotoDashboard(item)"
        title="Dashboard"
      >
        mdi-monitor-dashboard
      </v-icon>
      <v-icon
        class="me-1"
        
        @click="gotoOperacoes(item)"
        title="Operações"
      >
        mdi-finance
      </v-icon>
      <v-icon
        class="me-1"
        
        @click="gotoProventos(item)"
        title="Proventos"
      >
        mdi-currency-usd
      </v-icon>
      <v-icon
        class="me-1"
        
        @click="editTickers(item)"
        title="Tickers"
      >
        mdi-factory
      </v-icon>
      <v-icon
        class="me-1"
        
        @click="editItem(item)"
        title="Editar"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        
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

export default {
  data: () => ({
    tickers: [],
    items: [],
    headers: [
      { title: "Cód", value: "id", key: "id" },
      { title: "Carteira", key:"nome", value: "nome" },
      { title: "Status", key: "ativo", align: "center", value: "ativo" },
      { title: "Ações", value: "actions", align: "end", sortable: false },
    ],
    dialog: false,
    dialogDelete: false,
    dialogTickers: false,
    editedIndex: -1,
    editedItem: {
      nome: ''
    },
    defaultItem: {
      nome: ''
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Novo item' : 'Editar item'
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
    dialogTickers (val) {
      val || this.closeDialogTickers()
    },
  },

  created() {
    this.loadItems();
  },

  methods: {

    loadItems() {
      api.get("/carteira").then((response) => {
        this.items = response.data;
        console.log(this.items);
      });
    },

    gotoDashboard (item) {
      this.$router.push({ name: 'dashboard', params: { id: item.id } });
    },
    
    gotoOperacoes (item) {
      this.$router.push({ name: 'operacoes', params: { id: item.id } });
    },
    
    gotoProventos (item) {
      this.$router.push({ name: 'proventos', params: { id: item.id } });
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
      api.delete(`/carteira/${this.editedItem.id}`).then(() => 
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

    editTickers(item) {
      // Definir qual item está sendo editado
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      
      // Recuperar da API os Tickers desta carteira
      api.get(`/getmanytomany/Carteira/${item.id}/Ticker/`).then((response) => {
        
        this.tickers = response.data.allRelatedItems;
        
        const markedPairs = response.data.relatedItemIds;

        this.tickers.forEach(ticker => {
          ticker.checked = markedPairs.includes(ticker.id);
        });

      });

      // Mostrar a tela de diálogo
      this.dialogTickers = true
    },

    closeDialogTickers () {
      this.dialogTickers = false
    },

    saveTicker () {
      
      // Filtrar apenas os pares de moeda que estão marcados (checked)
      const markedPairs = this.tickers.filter(parmoeda => parmoeda.checked);

      // Criar o JSON para enviar para a API apenas com os IDs dos pares marcados
      const payload = {
        relatedIds: markedPairs.map(parmoeda => parmoeda.id) // Supondo que 'id' é o identificador do par de moeda
      };

      // Fazer a requisição para a API usando axios
      api.put(`/putmanytomany/Carteira/${this.editedItem.id}/Ticker`, payload).then(() => {
        // Carregar os itens novamente ou fazer outra ação após salvar
        this.loadItems();
      }).catch(error => {
        // Tratamento de erro
        console.error("Erro ao salvar os dados:", error);
      });

      // Fechar o diálogo ou card
      this.closeDialogTickers();
    },

    
    save () {
      if (this.editedIndex > -1) {
        api.put(`/carteira/${this.editedItem.id}`, this.editedItem).then(() => 
          this.loadItems()
        )
      } else {
        api.post("/carteira", this.editedItem).then(() => 
          this.loadItems()
        )
      }
      this.close()
    },
  },
}
</script>