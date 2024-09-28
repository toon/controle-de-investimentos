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


        <template v-slot:expanded-row="{ item, columns }">
            <tr>
                <td :colspan="columns.length">
                    <v-table v-if="item.Operacoes && item.Operacoes.length > 0">
                        <thead>
                        <tr>
                            <th class="text-left">
                            Data compra
                            </th>
                            <th class="text-left">
                            Preço compra
                            </th>
                            <th class="text-left">
                            Quantidade
                            </th>
                            <th class="text-left">
                            Valor compra
                            </th>
                            <th class="text-left">
                            %
                            </th>
                            <th class="text-left">
                            Valor atual
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr
                            v-for="subitem in item.Operacoes"
                            :key="subitem.id"
                        >
                            <td>{{ formatDate(subitem.data_compra) }}</td>
                            <td>{{ formatCurrency(subitem.preco_compra) }}</td>
                            <td>{{ subitem.quantidade }}</td>
                            <td>{{ formatCurrency(subitem.quantidade * subitem.preco_compra) }}</td>
                            <td>{{ ((1 - (subitem.preco_compra / item.cotacao))*100).toFixed(2) + "%" }}</td>
                            <td>{{ formatCurrency(subitem.quantidade * item.cotacao) }}</td>
                        </tr>
                        </tbody>
                    </v-table>
                    <div v-else>
                        <p class="text-center">Nenhuma operação encontrada para este ativo.</p>
                    </div>
                </td>
            </tr>
        </template>
        
        <template v-slot:item.atual="{ item }">
            {{ formatCurrency(item.quantidade * item.cotacao) }}
        </template>

        <template v-slot:item.rendimento="{ item }">
            <v-chip :style="{ color: ((((item.quantidade * item.cotacao)-item.investido)/item.investido*100).toFixed(2)) < 0 ? 'red' : ((((item.quantidade * item.cotacao)-item.investido)/item.investido*100).toFixed(2)) > 10 ? 'green' : 'black' }">
                {{ (((item.quantidade * item.cotacao)-item.investido)/item.investido*100).toFixed(2) }}%
            </v-chip>
        </template>

        <template v-slot:item.cotacao="{ item }">
            {{ item.cotacao ? formatCurrency(item.cotacao) : 'N/A' }}
        </template>
      
        <template v-slot:item.preco_medio="{ item }">
            {{ item.preco_medio ? formatCurrency(item.preco_medio) : 'N/A' }}
        </template>
      
        <template v-slot:item.investido="{ item }">
            {{ item.investido ? formatCurrency(item.investido) : 'N/A' }}
        </template>
      
        <template v-slot:item.proventos="{ item }">
            {{ formatCurrency(item.proventos) }}
        </template>
      
    </v-data-table>
</template>

<script>
import api from "../services/api";
import stockService from "@/services/stockService";

export default {
    data () {
        return {
            symbols: [ "CMIN3.SA", "BBAS3.SA", "BBDC4.SA", "CMIG4.SA" ],
            symbols_id: null,
            multipleQuotes: 0,
            carteiraid: null,
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
                    },
                    "Operacoes": [
                        {
                            "id": 1,
                            "data_compra": "2024-09-17T00:00:00.000Z",
                            "preco_compra": 28,
                            "quantidade": 300
                        },
                        {
                            "id": 2,
                            "data_compra": "2024-09-18T00:00:00.000Z",
                            "preco_compra": 30,
                            "quantidade": 14
                        }
                    ]
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
        }
    },

    watch: {

        multipleQuotes: {
            handler(novoValor) {
                this.atualizaCotacoes();
            },
            deep: true
        },

        // multipleProventos: {
        //     handler(novoValor) {
        //         this.atualizaProventos();
        //     },
        //     deep: true
        // },

    },

    created() {
        this.carteiraid = this.$route.params.id;
        this.loadItems();
    },


    methods: {

        loadItems() {
            // api.get(`/dashboards?CarteiraId=${this.carteiraid}`).then((response) => {
            //     this.items = response.data;
            //     // Extrair os tickers que foram recebidos
            //     this.symbols = this.items.map(item => item.Ticker.nome);
            //     // Extrair os códigos dos tickers que foram recebidos
            //     this.symbols_id = this.items.map(item => item.Ticker.id);
                // Invocar o método que recupera os dados de preço dos tickers
                this.fetchMultipleStockQuotes();
                // Invocar o método que recupera os proventos de cada ticker
                // this.fetchMultipleProventos();
            // });
            // api.get(`/carteira?id=${this.carteiraid}`).then((response) => {
            //     this.CarteiraNome = response.data[0]["nome"];
            //     // console.log(response.data[0]["nome"]);
            // });
        },


        atualizaCotacoes () {

            // Itera sobre o primeiro array e adiciona o preço
            this.items.forEach(item => {

                // Busca o item correspondente pelo nome do ticker
                const cotacao = this.multipleQuotes.find(c => c.ticker === item.Ticker.nome);
                
                // Se encontrar uma correspondência, adiciona o preço ao objeto
                if (cotacao) {
                    item.cotacao = cotacao.price;
                    item.open = cotacao.open;
                    item.high = cotacao.high;
                    item.low = cotacao.low;
                }
                
            });
        },

        async fetchMultipleStockQuotes() {
            if (!this.symbols) return;
            
            try {
                this.multipleQuotes = await stockService.getMultipleStockQuotes(this.symbols);
            } catch (error) {
                console.error('Erro ao buscar múltiplas cotações:', error);
            }
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        },

        formatCurrency(value) {
            // Formata o valor como moeda brasileira (R$)
            return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        },


    }
}
</script>
