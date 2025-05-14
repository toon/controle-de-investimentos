export default {
  namespaced: true,
  state: () => ({
    filtrosAtivos: {
      // Estrutura para armazenar filtros de diferentes páginas
      dashboard: {
        ticker: null
      }
    }
  }),
  mutations: {
    SET_FILTROS(state, { pagina, filtros }) {
      state.filtrosAtivos[pagina] = { ...filtros }
    },
    CLEAR_FILTROS(state, pagina) {
      state.filtrosAtivos[pagina] = {}
    }
  },
  actions: {
    aplicarFiltros({ commit }, { pagina, filtros }) {
      commit('SET_FILTROS', { pagina, filtros })
    },
    limparFiltros({ commit }, pagina) {
      commit('CLEAR_FILTROS', pagina)
    }
  },
  getters: {
    getFiltros: (state) => (pagina) => {
      return state.filtrosAtivos[pagina] || {}
    }
  }
}