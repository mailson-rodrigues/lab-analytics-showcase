import { pick, rng } from "./rng.js";

// Tudo aqui e inventado: nao ha paciente, medico, laboratorio ou resultado real.
export const EXAMES = [
  { codigo: "EX-A", nome: "Exame Demonstracao A", prazoHoras: 24 },
  { codigo: "EX-B", nome: "Exame Demonstracao B", prazoHoras: 48 },
  { codigo: "EX-C", nome: "Exame Demonstracao C", prazoHoras: 72 }
];
export const STATUS = ["liberado", "em_analise", "cancelado"];

/** Pedidos ficticios com horas de coleta, liberacao e valor. Deterministico pela semente. */
export function gerarPedidos({ semente = 7, total = 200 } = {}) {
  const r = rng(semente);
  const inicio = Date.UTC(2026, 0, 1);
  return Array.from({ length: total }, (_, i) => {
    const exame = pick(r, EXAMES);
    const coleta = inicio + Math.floor(r() * 150) * 86400000 + Math.floor(r() * 10) * 3600000;
    const r2 = r();
    const status = r2 < 0.82 ? "liberado" : r2 < 0.94 ? "em_analise" : "cancelado";
    const horas = Math.round(exame.prazoHoras * (0.5 + r() * 1.1));
    return {
      protocolo: `PED-${String(i + 1).padStart(4, "0")}`,
      exame: exame.codigo,
      prazoHoras: exame.prazoHoras,
      coleta: new Date(coleta).toISOString(),
      liberacao: status === "liberado" ? new Date(coleta + horas * 3600000).toISOString() : null,
      status,
      valor: Math.round((40 + r() * 160) * 100) / 100
    };
  });
}
