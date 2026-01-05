<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :sort-by="[{ key: 'nome', order: 'asc' }]"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon>mdi-domain</v-icon> Corretoras
        </v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props">
              Novo Item
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
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedItem.nome"
                        label="Nome"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedItem.descricao"
                        label="Descrição"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="editedItem.ativo"
                        label="Ativo"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="close">
                  Cancelar
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="save">
                  Salvar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
        
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Confirma exclusão deste item?</v-card-title>
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
    
    <template v-slot:item.ativo="{ item }">
      <v-icon v-if="item.ativo" color="success" title="Ativo">mdi-check-circle</v-icon>
      <v-icon v-else color="error" title="Inativo">mdi-close-circle</v-icon>
    </template>
    
    <template v-slot:item.actions="{ item }">
      <v-icon size="small" class="me-2" @click="editItem(item)" title="Editar">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteItem(item)" title="Excluir">
        mdi-delete
      </v-icon>
    </template>
    
    <template v-slot:no-data>
      <v-btn color="primary" @click="loadItems">
        Recarregar
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import api from "../services/api";

export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    valid: false,
    headers: [
      { title: 'ID', key: 'id', align: 'start' },
      { title: 'Nome', key: 'nome' },
      { title: 'Descrição', key: 'descricao' },
      { title: 'Ativo', key: 'ativo', align: 'center' },
      { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
    ],
    items: [],
    editedIndex: -1,
    editedItem: {
      id: null,
      nome: '',
      descricao: '',
      ativo: true,
    },
    defaultItem: {
      id: null,
      nome: '',
      descricao: '',
      ativo: true,
    },
    rules: {
      required: value => !!value || 'Campo obrigatório',
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Novo Item' : 'Editar Item'
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  created() {
    this.loadItems()
  },

  methods: {
    loadItems() {
      api.get('/corretora')
        .then(response => {
          this.items = response.data
        })
        .catch(error => {
          console.error('Erro ao carregar corretoras:', error)
        })
    },

    editItem(item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      api.delete(`/corretora/${this.editedItem.id}`)
        .then(() => {
          this.loadItems()
          this.closeDelete()
        })
        .catch(error => {
          console.error('Erro ao excluir corretora:', error)
        })
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save() {
      this.$refs.form.validate().then((formResult) => {
        if (formResult.valid) {
          if (this.editedIndex > -1) {
            api.put(`/corretora/${this.editedItem.id}`, this.editedItem)
              .then(() => {
                this.loadItems()
                this.close()
              })
              .catch(error => {
                console.error('Erro ao atualizar corretora:', error)
              })
          } else {
            api.post('/corretora', this.editedItem)
              .then(() => {
                this.loadItems()
                this.close()
              })
              .catch(error => {
                console.error('Erro ao criar corretora:', error)
              })
          }
        }
      })
    },
  },
}
</script>
