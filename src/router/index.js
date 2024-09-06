import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/tickers",
    name: "tickers",
    component: () => import("../views/TickersView.vue"),
  },
  {
    path: "/carteiras",
    name: "carteiras",
    component: () => import("../views/CarteirasView.vue"),
  },
  {
    path: "/operacoes/:id",
    name: "operacoes",
    component: () => import("../views/OperacoesView.vue"),
  },
  {
    path: "/proventos/:id",
    name: "proventos",
    component: () => import("../views/ProventosView.vue"),
  },
  {
    path: "/dashboard/:id",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
  },
  {
    path: "/tiposoperacao",
    name: "tiposoperacao",
    component: () => import("../views/TiposOperacaoView.vue"),
  },
  {
    path: "/tiposprovento",
    name: "tiposprovento",
    component: () => import("../views/TiposProventoView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
