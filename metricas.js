const HORA = 3600000;

/** Tempo de liberacao em horas (null se o pedido nao foi liberado). */
export function horasAteLiberar(p) {
  if (!p.liberacao) return null;
  return Math.round((Date.parse(p.liberacao) - Date.parse(p.coleta)) / HORA);
}

/** Percentil por interpolacao linear (p entre 0 e 100); lista vazia vira null. */
export function percentil(valores, p) {
  if (!valores.length) return null;
  const v = [...valores].sort((a, b) => a - b);
  const pos = ((v.length - 1) * p) / 100;
  const baixo = Math.floor(pos);
  const alto = Math.ceil(pos);
  return Math.round((v[baixo] + (v[alto] - v[baixo]) * (pos - baixo)) * 10) / 10;
}

/** Por exame: volume, liberados, mediana/p90 de horas e % dentro do prazo (so entre os liberados). */
export function resumoPorExame(pedidos) {
  const grupos = new Map();
  for (const p of pedidos) {
    if (!grupos.has(p.exame)) grupos.set(p.exame, []);
    grupos.get(p.exame).push(p);
  }
  return [...grupos]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([exame, lista]) => {
      const liberados = lista.filter((p) => p.status === "liberado");
      const horas = liberados.map(horasAteLiberar);
      const noPrazo = liberados.filter((p) => horasAteLiberar(p) <= p.prazoHoras).length;
      return {
        exame,
        volume: lista.length,
        liberados: liberados.length,
        medianaHoras: percentil(horas, 50),
        p90Horas: percentil(horas, 90),
        pctNoPrazo: liberados.length ? Math.round((noPrazo / liberados.length) * 1000) / 10 : null
      };
    });
}

/** Receita dos pedidos liberados por mes (AAAA-MM), em ordem cronologica. Cancelados e em analise nao contam. */
export function receitaMensal(pedidos) {
  const mapa = new Map();
  for (const p of pedidos) {
    if (p.status !== "liberado") continue;
    const mes = p.coleta.slice(0, 7);
    mapa.set(mes, Math.round(((mapa.get(mes) ?? 0) + p.valor) * 100) / 100);
  }
  return [...mapa].sort(([a], [b]) => a.localeCompare(b)).map(([mes, receita]) => ({ mes, receita }));
}
