import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  // baseURL: "stock-api-production-f7f4.up.railway.app",
});

export default api;
