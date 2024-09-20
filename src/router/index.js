import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/CarteirasView.vue"),
    meta: { title: "Home" }
  },
  {
    path: "/tickers",
    name: "tickers",
    component: () => import("../views/TickersView.vue"),
    meta: { title: "Tickers" }
  },
  {
    path: "/carteiras",
    name: "carteiras",
    component: () => import("../views/CarteirasView.vue"),
    meta: { title: "Carteiras" }
  },
  {
    path: "/carteiras/operacoes/:id",
    name: "operacoes",
    component: () => import("../views/OperacoesView.vue"),
    meta: { title: "Operações" }
  },
  {
    path: "/carteiras/investimentos/:id",
    name: "investimentos",
    component: () => import("../views/InvestimentosView.vue"),
    meta: { title: "Investimentos" }
  },
  {
    path: "/carteiras/proventos/:id",
    name: "proventos",
    component: () => import("../views/ProventosView.vue"),
    meta: { title: "Proventos" }
  },
  {
    path: "/carteiras/dashboard/:id",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { title: "Dashboard" }
  },
  {
    path: "/tiposoperacao",
    name: "tiposoperacao",
    component: () => import("../views/TiposOperacaoView.vue"),
    meta: { title: "Tipos de operação" }
  },
  {
    path: "/tiposprovento",
    name: "tiposprovento",
    component: () => import("../views/TiposProventoView.vue"),
    meta: { title: "Tipos de provento" }
  },
  {
    path: "/carregarcsv",
    name: "carregarcsv",
    component: () => import("../views/CarregarCSVView.vue"),
    meta: { title: "Carregar CSV" }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
