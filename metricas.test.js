import assert from "node:assert/strict";
import { test } from "node:test";
import { gerarPedidos } from "./dados.js";
import { horasAteLiberar, percentil, receitaMensal, resumoPorExame } from "./metricas.js";

test("dados deterministicos e sem informacao real", () => {
  assert.deepEqual(gerarPedidos({ semente: 3 }), gerarPedidos({ semente: 3 }));
  assert.doesNotMatch(JSON.stringify(gerarPedidos()), /@|\d{3}\.\d{3}\.\d{3}/);
});
test("horasAteLiberar: diferenca em horas e null quando nao liberado", () => {
  assert.equal(horasAteLiberar({ coleta: "2026-01-01T00:00:00Z", liberacao: "2026-01-02T06:00:00Z" }), 30);
  assert.equal(horasAteLiberar({ coleta: "2026-01-01T00:00:00Z", liberacao: null }), null);
});
test("percentil: interpolacao, lista vazia e unico valor", () => {
  assert.equal(percentil([], 50), null);
  assert.equal(percentil([7], 90), 7);
  assert.equal(percentil([10, 20, 30, 40], 50), 25);
  assert.equal(percentil([1, 2, 3, 4, 5], 90), 4.6);
});
test("resumoPorExame conta volume, liberados e % no prazo", () => {
  const p = (exame, h, status = "liberado") => ({ exame, prazoHoras: 24, status, coleta: "2026-01-01T00:00:00Z", liberacao: status === "liberado" ? new Date(Date.UTC(2026, 0, 1) + h * 3600000).toISOString() : null });
  const r = resumoPorExame([p("EX-A", 10), p("EX-A", 30), p("EX-A", 5, "cancelado"), p("EX-B", 20)]);
  assert.deepEqual(r[0], { exame: "EX-A", volume: 3, liberados: 2, medianaHoras: 20, p90Horas: 28, pctNoPrazo: 50 });
  assert.equal(r[1].pctNoPrazo, 100);
});
test("resumo sem liberados nao divide por zero", () => {
  const r = resumoPorExame([{ exame: "EX-A", prazoHoras: 24, status: "cancelado", coleta: "2026-01-01T00:00:00Z", liberacao: null }]);
  assert.equal(r[0].pctNoPrazo, null);
  assert.equal(r[0].medianaHoras, null);
});
test("receita mensal soma so liberados e ordena por mes", () => {
  const r = receitaMensal([
    { status: "liberado", coleta: "2026-02-10T00:00:00Z", valor: 10.1 },
    { status: "liberado", coleta: "2026-01-05T00:00:00Z", valor: 5 },
    { status: "liberado", coleta: "2026-02-11T00:00:00Z", valor: 0.2 },
    { status: "cancelado", coleta: "2026-01-06T00:00:00Z", valor: 99 }
  ]);
  assert.deepEqual(r, [{ mes: "2026-01", receita: 5 }, { mes: "2026-02", receita: 10.3 }]);
});
