// src/plugins/globalMethods.js
import { parseISO, differenceInDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export default {
  install(app) {

    // Método global formatDate
    app.config.globalProperties.$formatDate = (date) => {
        try {
            if (!(!date || typeof date !== 'string')) {

                const parsedDate = parseISO(date);

                if (isNaN(parsedDate.getTime())) {
                    throw new Error(`Data inválida após parse: ${date}`);
                }

                return formatInTimeZone(parsedDate, 'UTC', 'dd/MM/yyyy');
            }
        } catch (error) {
            console.error('Erro ao formatar a data:', error.message);
            return '';
        }
    };

    // Método global formatDateToISO
    app.config.globalProperties.$formatDateToISO = (date) => {
        try {
            if (!date || typeof date !== 'string') {
                throw new Error('Data inválida ou nula');
            }

            const [day, month, year] = date.split('/').map(Number);

            if (!day || !month || !year) {
                throw new Error('Formato de data inválido');
            }

            const isoDate = new Date(year, month - 1, day).toISOString();
            return isoDate;
        } catch (error) {
            console.error('Erro ao converter a data para ISO:', error.message);
            return '';
        }
    };

    // Método para formatar moeda (BRL ou USD)
    app.config.globalProperties.$formatCurrency = (value, formato = 1) => {
        try {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                //console.warn('Valor não é um número:', value);
                return value;
            }
            
            if (formato === 1) {
                return numValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                });
            } else if (formato === 2) {
                return numValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                });
            }
            return numValue;
        } catch (error) {
            console.error('Erro ao formatar moeda:', error);
            return value;
        }
    };
    
    app.config.globalProperties.$isVencido = (dataVencimento) => {
      try {
        const vencimento = new Date(dataVencimento);
        vencimento.setHours(0, 0, 0, 0);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // adiciona 1 dia à data de vencimento
        const vencimentoComDiaExtra = new Date(vencimento);
        vencimentoComDiaExtra.setDate(vencimento.getDate() + 1);

        return vencimentoComDiaExtra < hoje;
        
      } catch (error) {
        console.error('Erro ao verificar data de vencimento:', error);
        return false;
      }
    };

    // Novo método: Calcula dias restantes para vencer
    app.config.globalProperties.$diasParaVencer = (dataVencimento) => {
      try {
        const hoje = new Date();
        const vencimento = new Date(dataVencimento);
        const diffTime = vencimento - hoje;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch (error) {
        console.error('Erro ao calcular dias para vencer:', error);
        return 0;
      }
    };

    // Método para calcular dias entre datas com verificação de null
    app.config.globalProperties.$diasEntreDatas = (dataInicial, dataFinal, padrao = null) => {
      try {
        // Verifica se alguma data é null ou undefined
        if (dataInicial === null || dataInicial === undefined || 
            dataFinal === null || dataFinal === undefined) {
          return padrao;
        }

        // Converte para objetos Date
        const inicio = dataInicial instanceof Date ? dataInicial : new Date(dataInicial);
        const fim = dataFinal instanceof Date ? dataFinal : new Date(dataFinal);
        
        // Verifica se as datas são válidas
        if (isNaN(inicio.getTime())) {
          console.warn('Data inicial inválida:', dataInicial);
          return padrao;
        }
        
        if (isNaN(fim.getTime())) {
          console.warn('Data final inválida:', dataFinal);
          return padrao;
        }
        
        // Calcula a diferença em dias
        const diferenca = differenceInDays(fim, inicio);
        
        // Retorna o valor calculado ou o padrão se for NaN
        return isNaN(diferenca) ? padrao : diferenca;
        
      } catch (error) {
        console.error('Erro ao calcular dias entre datas:', error);
        return padrao;
      }
    };  

  },
};