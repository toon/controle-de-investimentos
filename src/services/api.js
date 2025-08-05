import axios from "axios";

const api = axios.create({
  // Arquivo .env
  baseURL: process.env.VUE_APP_BACKEND_URL,
});

export default api;
