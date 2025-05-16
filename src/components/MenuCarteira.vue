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
        :to="(item.value=='carteiras') ? `/carteiras` : `/carteiras/${item.to}/${carteiraId}`"
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
          { title: 'Carteiras', icon: 'mdi-wallet', to: 'carteiras', value: 'carteiras' },
          { title: 'Dashboard', icon: 'mdi-view-dashboard', to: 'dashboard', value: 'dashboard' },
          { title: 'Operações', icon: 'mdi-swap-horizontal', to: 'operacoes', value: 'operacoes' },
          { title: 'Proventos', icon: 'mdi-cash', to: 'proventos', value: 'proventos' },
        ]
      }
    },
    watch: {
      $route(to) {
        // Atualiza a tab ativa quando a rota muda
        this.tab = to.path.split('/')[3] || 'dashboard'
      }
    },
    created() {
      // Define a tab ativa inicial
      this.tab = this.$route.path.split('/')[3] || 'dashboard'
    }
  }
  </script>