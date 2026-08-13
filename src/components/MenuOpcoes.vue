<!-- eslint-disable vue/valid-v-slot -->
<template>
    <v-tabs
      v-model="tab"
      bg-color="primary"
      align-tabs="center"
      density="comfortable"
    >
      <v-tab
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :to="(item.value=='opcoes') ? `/opcoes` : `/opcoes/${item.to}`"
        :prepend-icon="item.icon"
      >
        {{ item.title }}
      </v-tab>
    </v-tabs>
  </template>
  
  <script>
  export default {
    props: {
      carteiraId: {
        type: [String, Number],
        required: true
      }
    },
    data() {
      return {
        tab: null,
        items: [
          { title: 'Opções', icon: 'mdi-wallet', to: 'opcoes', value: 'opcoes' },
          { title: 'Operações de Taxa', icon: 'mdi-view-dashboard', to: 'taxa', value: 'taxa' },
          { title: 'Caixa', icon: 'mdi-view-dashboard', to: 'taxa/caixa', value: 'caixa' },
        ]
      }
    },
    watch: {
      $route(to) {
        // Atualiza a tab ativa quando a rota muda
        this.tab = to.path.split('/')[3] || 'opcoes'
      }
    },
    created() {
      // Define a tab ativa inicial
      this.tab = this.$route.path.split('/')[3] || 'opcoes'
    }
  }
  </script>