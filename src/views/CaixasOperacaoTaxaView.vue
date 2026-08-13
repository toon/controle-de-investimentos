<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :sort-by="[{ key: 'data_abertura', order: 'desc' }]"
    items-per-page="50"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title><v-icon>mdi-archive</v-icon> Operação de Taxa: {{ ItemNome }}</v-toolbar-title>
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
                <span class="text-h5">{{ formTitle }}</span> <span v-if="this.editedIndex !== -1">{{ this.editedItem.id }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    
                    <v-col
                    cols="12"
                      md="4"
                    >
                      <v-text-field
                        v-model="formattedDate1"
                        label="Data abertura"
                        :rules="[rules.required, rules.data]"
                      ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                      md="4"
                    >
                      <v-text-field
                        v-model="formattedDate2"
                        label="Data fechamento"
                        :rules="[rules.data]"
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
        <v-dialog v-model="dialogSelectId" max-width="500px" persistent>
          <v-card>
            <v-card-title class="text-h5">Selecionar Operação</v-card-title>
            <v-card-text>
              <v-autocomplete
                v-model="selectedItemId"
                :items="tiposOperacaoTaxa"
                item-title="nome"
                item-value="id"
                label="Buscar por ID ou Nome da Operação"
                placeholder="Digite para buscar..."
              ></v-autocomplete>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="cancelarSelecaoId">Cancelar</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="confirmarSelecaoId" :disabled="!selectedItemId">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>

      <MenuOpcoes />

    </template>
    <template v-slot:item.data="{ item }">
      {{ $formatDate(item.data) }}
    </template>
    <template v-slot:item.valor="{ item }">
      <span :class="item.valor < 0 ? 'text-red' : 'text-green-darken-3'">
      {{ $formatCurrency(item.valor, 1) }}
      </span>
    </template>
    <template v-slot:item.saldo="{ item }">
      <span :class="item.valor < 0 ? 'text-red' : 'text-green-darken-3'">
      {{ $formatCurrency(item.saldo, 1) }}
      </span>
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
import MenuOpcoes from "@/components/MenuOpcoes.vue";
import api from "../services/api";


export default {
  components: {
    MenuOpcoes,
  },
  data: () => ({
    mostrarCard: false,
    valid: false,
    itemid: null,
    ItemNome: "carregando...",
    formattedDate1: '',
    formattedDate2: '',
    items: [],
    headers: [
      { title: "Id", value: "id", align: "center", key: "id" },
      { title: "Data", key:"data", align: "center", value: "data" },
      { title: "Descrição", key:"descricao", value: "descricao" },
      { title: "Valor", key:"valor", align: "center", value: "valor" },
      { title: "Saldo", key:"saldo", align: "center", value: "saldo" },
      { title: "Ações", value: "actions", align: "end", sortable: false },
    ],
    dialog: false,
    dialogDelete: false,
    dialogSelectId: false,
    selectedItemId: null,
    tiposOperacaoTaxa: [],
    editedIndex: -1,
    editedItem: {
      data_abertura: '',
      data_fechamento: '',
      TickerId: '',
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
      // ItemId: 1

    },
    rules: {
      required: value => !!value || 'Campo obrigatório',
      data: value => {
        if (!value) return true; // Se vazio, não valida formato
        return /^([0-2][0-9]|(3)[0-1])\/([0][1-9]|1[0-2])\/\d{4}$/.test(value) || 'Data inválida';
      },
      // data: value => /^([0-2][0-9]|(3)[0-1])\/([0][1-9]|1[0-2])\/\d{4}$/.test(value) || 'Data inválida',
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
    // Aceita o ID tanto por parâmetro da rota quanto pela query string
    this.itemid = this.$route.params.id || this.$route.query.id;
    
    if (!this.itemid) {
      this.dialogSelectId = true;
      this.loadTiposOperacaoTaxa();
    } else {
      this.loadItems();
    }
  },

  methods: {
    loadTiposOperacaoTaxa() {
      api.get("/tipooperacaotaxas").then((response) => {
        this.tiposOperacaoTaxa = response.data;
      }).catch(error => {
        console.error("Erro ao carregar tipos de operação de taxa:", error);
      });
    },
    confirmarSelecaoId() {
      if (this.selectedItemId) {
        this.itemid = this.selectedItemId;
        this.dialogSelectId = false;
        this.$router.replace({ name: 'caixa', params: { id: this.selectedItemId } }).catch(() => {});
        this.loadItems();
      }
    },
    cancelarSelecaoId() {
      this.dialogSelectId = false;
      this.$router.back();
    },

    loadItems() {
      api.get(`/caixaoperacaotaxas?TipoOperacaoTaxaId=${this.itemid}`).then((response) => {
        this.items = response.data;
      });
      api.get(`/tipooperacaotaxae?id=${this.itemid}`).then((response) => {
        this.ItemNome = response.data[0]["nome"];
        // console.log(response.data[0]["nome"]);
      });
      // api.get(`/ticker`).then((response) => {
      //   this.tickers = response.data;
      //   // console.log(response.data[0]["nome"]);
      // });
    },

    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.formattedDate1 = this.$formatDate(item.data_abertura)
      this.formattedDate2 = this.$formatDate(item.data_fechamento)
      console.log(this.editedItem)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      api.delete(`/caixaoperacaotaxa/${this.editedItem.id}`).then(() => 
        this.loadItems(),
        this.closeDelete()
      );
    },

    close () {
      this.dialog = false
      this.formattedDate1 = "";
      this.formattedDate2 = "";
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

          this.editedItem.data_abertura = this.$formatDateToISO(this.formattedDate1);
          this.editedItem.data_fechamento = this.formattedDate2 ? this.$formatDateToISO(this.formattedDate2) : null;
          this.editedItem.TickerId = this.itemid; 
          this.editedItem.TipoOperacaoTaxaId = this.itemid;
          
          if (this.editedIndex > -1) {
            api.put(`/caixaoperacaotaxa/${this.editedItem.id}`, this.editedItem).then(() => 
              this.loadItems()
            )
          } else {
            api.post("/caixaoperacaotaxa", this.editedItem).then(() => 
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