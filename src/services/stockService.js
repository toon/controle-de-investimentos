// src/services/stockService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';  // URL do seu backend Node.js

const getStockQuote = async (symbol) => {
  try {
    const response = await axios.get(`${API_URL}/quote/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao recuperar cotação:', error);
    throw error;
  }
};

const getMultipleStockQuotes = async (symbols) => {
  try {
    const response = await axios.get(`${API_URL}/quotes`, {
      params: {
        symbols: symbols.join(','),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao recuperar cotações:', error);
    throw error;
  }
};

export default {
  getStockQuote,
  getMultipleStockQuotes,
};
