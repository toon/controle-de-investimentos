<template>
    <v-data-table
      v-model:expanded="expanded"
      :headers="headers"
      :items="items"
      item-value="id"
      show-expand
    >
      <template v-slot:top>
        <v-toolbar flat>
            <v-toolbar-title>
                <v-icon>mdi-monitor-dashboard</v-icon>
                <v-btn
                color="green"
                icon="mdi-refresh-circle"
                density="comfortable" 
                @click="fetchMultipleStockQuotes"
                ></v-btn>

                Investimentos {{ CarteiraNome }} 
                </v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            More info about {{ item.id }}
          </td>
        </tr>
      </template>
    </v-data-table>
  </template>

<script>
export default {
    data () {
        return {
            expanded: [],
            headers: [
                { title: "Ticker", key:"ticker", value: "Ticker.nome" },
                { title: "Cotação", key: "cotacao", value: "cotacao" },
                { title: "Qtde.", key:"quantidade", value: "quantidade" },
                { title: "Preço médio", key: "preco_medio", value: "preco_medio" },
                { title: "Investido", key: "investido", value: "investido" },
                { title: "Atual", key: "atual", value: "atual" },
                { title: "Rendimento", key: "rendimento", value: "rendimento" },
                { title: "Proventos", key: "proventos", value: "proventos" },
                { title: "% Hoje", key: "hoje", value: "hoje" },
            ],
            items: [
                {
                    "id": 3,
                    "quantidade": 0,
                    "preco_medio": 5.47,
                    "investido": 4377.29,
                    "proventos": 0,
                    "CarteiraId": 1,
                    "TickerId": 5,
                    "Carteira": {
                        "id": 1,
                        "nome": "MAGAR Brasil",
                        "ativo": true,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    },
                    "Ticker": {
                        "id": 5,
                        "nome": "CMIN3.SA",
                        "descricao": "CMIN3",
                        "ativo": true,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    }
                },
                {
                    "id": 10,
                    "quantidade": 314,
                    "preco_medio": 28.02,
                    "investido": 8798.880000000001,
                    "proventos": 100.6,
                    "CarteiraId": 1,
                    "TickerId": 1,
                    "Carteira": {
                        "id": 1,
                        "nome": "MAGAR Brasil",
                        "ativo": true,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    },
                    "Ticker": {
                        "id": 1,
                        "nome": "BBAS3.SA",
                        "descricao": "Banco do Brasil SA",
                        "ativo": true,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    }
                },
                {
                    "id": 11,
                    "quantidade": 780,
                    "preco_medio": 14.08,
                    "investido": 10985,
                    "proventos": 40,
                    "CarteiraId": 1,
                    "TickerId": 2,
                    "Carteira": {
                        "id": 1,
                        "nome": "MAGAR Brasil",
                        "ativo": true,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    },
                    "Ticker": {
                        "id": 2,
                        "nome": "BBDC4.SA",
                        "descricao": "Banco Bradesco SA",
                        "ativo": false,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    }
                },
                {
                    "id": 18,
                    "quantidade": 1140,
                    "preco_medio": 10.96,
                    "investido": 26528.95,
                    "proventos": 0,
                    "CarteiraId": 1,
                    "TickerId": 4,
                    "Carteira": {
                        "id": 1,
                        "nome": "MAGAR Brasil",
                        "ativo": true,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    },
                    "Ticker": {
                        "id": 4,
                        "nome": "CMIG4.SA",
                        "descricao": "CMIG4",
                        "ativo": true,
                        "createdAt": "2024-09-17T02:02:18.000Z",
                        "updatedAt": "2024-09-17T02:02:18.000Z"
                    }
                }
            ],
            desserts: [
                {
                name: 'Frozen Yogurt',
                calories: 159,
                fat: 6.0,
                carbs: 24,
                protein: 4.0,
                iron: 1,
                },
                {
                name: 'Ice cream sandwich',
                calories: 237,
                fat: 9.0,
                carbs: 37,
                protein: 4.3,
                iron: 1,
                },
                {
                name: 'Eclair',
                calories: 262,
                fat: 16.0,
                carbs: 23,
                protein: 6.0,
                iron: 7,
                },
                {
                name: 'Cupcake',
                calories: 305,
                fat: 3.7,
                carbs: 67,
                protein: 4.3,
                iron: 8,
                },
                {
                name: 'Gingerbread',
                calories: 356,
                fat: 16.0,
                carbs: 49,
                protein: 3.9,
                iron: 16,
                },
                {
                name: 'Jelly bean',
                calories: 375,
                fat: 0.0,
                carbs: 94,
                protein: 0.0,
                iron: 0,
                },
                {
                name: 'Lollipop',
                calories: 392,
                fat: 0.2,
                carbs: 98,
                protein: 0,
                iron: 2,
                },
                {
                name: 'Honeycomb',
                calories: 408,
                fat: 3.2,
                carbs: 87,
                protein: 6.5,
                iron: 45,
                },
                {
                name: 'Donut',
                calories: 452,
                fat: 25.0,
                carbs: 51,
                protein: 4.9,
                iron: 22,
                },
                {
                name: 'KitKat',
                calories: 518,
                fat: 26.0,
                carbs: 65,
                protein: 7,
                iron: 6,
                },
            ],
        }
    },
}
</script>