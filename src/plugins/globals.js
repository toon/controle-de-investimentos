export default {
  install(app) {
    app.config.globalProperties.$TIPO_OPCAO_PERIODO = {
        MENSAL: 1,
        SEMANAL: 2
    }
    app.config.globalProperties.$TIPO_OPCAO_STATUS = {
        EM_ANDAMENTO: 1,
        ENCERRADA: 2,
        EXERCIDO: 3,
        VIROU_PO: 4
    }
    app.config.globalProperties.$TIPO_OPCAO_OPERACAO = {
        CC: 1, // Compra de CALL
        CP: 2, // Compra de PUT
        VC: 3, // Venda de CALL
        VP: 4, // Venda de PUT
    }
    app.config.globalProperties.$CORRETORA = {
        INTER: 1,
        CM: 2,
        BTG: 3
    }
    app.config.globalProperties.$INVESTIDOR = {
        IGOR: 1,
        CRIS: 2
    }
    app.config.globalProperties.$TIPO_ATIVO = {
        ACAO: 1,
        FII: 2,
        ETF: 3,
        STOCK: 4,
        ETF_USA: 5,
        CRIPTO: 6
    }
    app.config.globalProperties.$TICKER = {
        ISAE4: 1,
        MSFT: 2,
        LFTS11: 3,
        NVDA: 4,
        BRFS3: 5,
        AAPL: 6,
        DIRR3: 7,
        JALL3: 8,
        MOVI3: 9,
        EGIE3: 10,
        CSNA3: 11,
        TOTS3: 12,
        CMIN3: 13,
        DMVF3: 14,
        BRST3: 15,
        MILS3: 16,
        EMBR3: 17,
        BBSE3: 18,
        CXSE3: 19,
        ITSA4: 20,
        BBDC4: 21,
        BBAS3: 22,
        KEPL3: 23,
        SMTO3: 24,
        HYPE3: 25,
        ODPV3: 26,
        CSMG3: 27,
        SAPR11: 28,
        CMIG4: 29,
        CYRE3: 30,
        BTLG11: 31,
        HGBS11: 32,
        HSML11: 33,
        VISC11: 34,
        BTAL11: 35,
        RZTR11: 36,
        BTCUSD: 37,
        AAPLUSD: 38,
        ETHUSD: 39,
        IAU: 40,
        VOO: 41,
        SGOV: 42,
        GLD: 43,
        BOVA11: 44,
        LFTB11: 45,
        CONY: 46,
        POMO4: 47
    }
    app.config.globalProperties.$CARTEIRA = {
        MAGAR_BRASIL: 1,
        MAGAR_USA: 2,
        DIVERSAS: 3
    }
    app.config.globalProperties.$TIPO_OPERACAO = {
        COMPRA: 1,
        VENDA: 2,
        BONIFICACAO: 3,
        SUBSCRICAO: 4
    }
    app.config.globalProperties.$TIPO_PROVENTO = {
        DIVIDENDOS: 1,
        JCP: 2,
        RENDIMENTOS: 3
    }
  }
}
