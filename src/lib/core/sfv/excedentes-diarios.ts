import type { RegistroHorario } from "@/types/sfv";

import { fechaISO, median, quantileSorted, redondear } from "./_utils";

export type EstadisticasExcedenteDiario = {
  mediana_kwh: number;
  promedio_kwh: number;
  p75_kwh: number;
  p90_kwh: number;
  dia_critico_kwh: number;
  /** Fecha (YYYY-MM-DD) del día con mayor generación bruta. */
  dia_critico_fecha: string | null;
};

/**
 * Estadísticos del excedente diario.
 *
 * Para cada día calendario, agrega:
 *  - Generación bruta total (suma de energia_mwh) — para identificar el
 *    "día crítico" (el de mayor generación).
 *  - Excedente diario en kWh: suma horaria de `max(0, gen_h − POI_kWh)`,
 *    convertida a kWh.
 *
 * Devuelve mediana, promedio, P75, P90 y excedente del día crítico.
 */
export function estadisticasExcedenteDiario(
  registros: readonly RegistroHorario[],
  poi_kw: number
): EstadisticasExcedenteDiario {
  if (!Number.isFinite(poi_kw) || poi_kw <= 0) {
    throw new Error("poi_kw debe ser un número positivo.");
  }
  if (registros.length === 0) {
    return {
      mediana_kwh: 0,
      promedio_kwh: 0,
      p75_kwh: 0,
      p90_kwh: 0,
      dia_critico_kwh: 0,
      dia_critico_fecha: null,
    };
  }

  const poi_mwh_h = poi_kw / 1000;
  const excedentePorDia = new Map<string, number>();
  const brutoPorDia = new Map<string, number>();

  for (const r of registros) {
    const dia = fechaISO(r.timestamp);
    const excedente = Math.max(0, r.energia_mwh - poi_mwh_h);
    excedentePorDia.set(dia, (excedentePorDia.get(dia) ?? 0) + excedente);
    brutoPorDia.set(dia, (brutoPorDia.get(dia) ?? 0) + r.energia_mwh);
  }

  const excedentes_kwh: number[] = [];
  for (const mwh of excedentePorDia.values()) {
    excedentes_kwh.push(mwh * 1000);
  }
  const sorted = [...excedentes_kwh].sort((a, b) => a - b);

  let acum = 0;
  for (const x of excedentes_kwh) acum += x;
  const promedio_kwh = acum / excedentes_kwh.length;
  const mediana_kwh = median(sorted);
  const p75_kwh = quantileSorted(sorted, 0.75);
  const p90_kwh = quantileSorted(sorted, 0.9);

  let dia_critico_fecha: string | null = null;
  let mayorBruto = -Infinity;
  for (const [dia, mwh] of brutoPorDia) {
    if (mwh > mayorBruto) {
      mayorBruto = mwh;
      dia_critico_fecha = dia;
    }
  }
  const dia_critico_kwh =
    dia_critico_fecha === null
      ? 0
      : (excedentePorDia.get(dia_critico_fecha) ?? 0) * 1000;

  return {
    mediana_kwh: redondear(mediana_kwh, 2),
    promedio_kwh: redondear(promedio_kwh, 2),
    p75_kwh: redondear(p75_kwh, 2),
    p90_kwh: redondear(p90_kwh, 2),
    dia_critico_kwh: redondear(dia_critico_kwh, 2),
    dia_critico_fecha,
  };
}
