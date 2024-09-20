<template>
    <v-container>
      <v-form @submit.prevent="submitForm">
        <v-file-input
          v-model="file"
          label="Upload CSV"
          accept=".csv"
          required
        ></v-file-input>
  
        <v-select
          v-model="selectedModel"
          :items="models"
          label="Selecione o Modelo"
          required
        ></v-select>
  
        <v-btn type="submit">Importar CSV</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import api from "../services/api";
  
  export default {
    data() {
      return {
        file: null,
        selectedModel: null,
        models: ['Operacao', 'Provento', 'Ticker'], // Adapte para os modelos disponíveis
      };
    },
    methods: {
      async submitForm() {
        if (!this.selectedModel) {
          alert('Selecione um modelo!');
          return;
        }
  
        const formData = new FormData();
        formData.append('file', this.file);
  
        try {
          const response = await api.post(`/${this.selectedModel}/import-csv`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log(response.data.message);
        } catch (error) {
          console.error('Erro ao importar o arquivo:', error);
        }
      },
    },
  };
  </script>
  