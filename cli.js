import { gerarPedidos } from "./dados.js";
import { receitaMensal, resumoPorExame } from "./metricas.js";

const pedidos = gerarPedidos();
console.table(resumoPorExame(pedidos));
console.table(receitaMensal(pedidos));
