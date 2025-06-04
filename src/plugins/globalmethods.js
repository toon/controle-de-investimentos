// src/plugins/globalMethods.js
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export default {
  install(app) {

    // Método global formatDate
    app.config.globalProperties.$formatDate = (date) => {
        try {
        const parsedDate = parseISO(date);
        if (isNaN(parsedDate.getTime())) {
            console.error('Data inválida:', date);
            return '';
        }
        return formatInTimeZone(parsedDate, 'UTC', 'dd/MM/yyyy');
        } catch (error) {
        console.error('Erro ao formatar a data:', error);
        return '';
        }
    };

    // Método global formatDateToISO
    app.config.globalProperties.$formatDateToISO = (date) => {
        try {
            const [day, month, year] = date.split('/').map(Number);
            const isoDate = new Date(year, month - 1, day).toISOString();
            return isoDate;
        } catch (error) {
            console.error('Erro ao converter a data para ISO:', error);
            return '';
        }
    };

    // Método para formatar moeda (BRL ou USD)
    app.config.globalProperties.$formatCurrency = (value, formato = 1) => {
        try {
            if (formato === 1) {
                return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                });
            } else if (formato === 2) {
                return value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                });
            }
        return value; // Retorna o valor sem formatação se o formato for inválido
        } catch (error) {
            console.error('Erro ao formatar moeda:', error);
            return value; // Retorna o valor original em caso de erro
        }
    };
    
  },
};