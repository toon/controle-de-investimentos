import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:3000/api",
  baseURL: "https://express-sequelize-mysql-production.up.railway.app/api",
});

export default api;
