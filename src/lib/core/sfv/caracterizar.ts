import type { RegistroHorario } from "@/types/sfv";
import type { ResultadoCaracterizacion } from "@/types/sfv-kpis";

import { fechaISO, redondear } from "./_utils";

/**
 * Sección 5 del Colab `Motor_BESS_v2_05152026.ipynb`
 * (`caracterizar_recurso_real`).
 *
 * Calcula métricas del recurso solar tal como opera HOY, sin escalado.
 * Replica las fórmulas del Colab 1:1, excluyendo `headroom_al_poi_pct`
 * (lenguaje overbuild, fuera de Wave 1).
 */
export function caracterizarRecurso(
  registros: readonly RegistroHorario[],
  poi_kw: number,
  cap_pv_instalada_kw: number
): ResultadoCaracterizacion {
  if (registros.length === 0) {
    throw new Error("caracterizarRecurso requiere al menos un registro.");
  }
  if (!Number.isFinite(poi_kw) || poi_kw <= 0) {
    throw new Error("poi_kw debe ser un número positivo.");
  }
  if (!Number.isFinite(cap_pv_instalada_kw) || cap_pv_instalada_kw <= 0) {
    throw new Error("cap_pv_instalada_kw debe ser un número positivo.");
  }

  let energia_total_mwh = 0;
  let pico_energia_mwh = 0;
  const dias = new Set<string>();

  for (const r of registros) {
    energia_total_mwh += r.energia_mwh;
    if (r.energia_mwh > pico_energia_mwh) pico_energia_mwh = r.energia_mwh;
    dias.add(fechaISO(r.timestamp));
  }

  const horas_totales = registros.length;
  const dias_analizados = dias.size;
  const pico_kw = pico_energia_mwh * 1000;
  const energia_total_kwh = energia_total_mwh * 1000;

  const factor_planta_pct =
    (energia_total_kwh / (poi_kw * horas_totales)) * 100;
  const factor_capacidad_pct =
    (energia_total_kwh / (cap_pv_instalada_kw * horas_totales)) * 100;
  const horas_sol_equiv_diaria =
    energia_total_kwh / cap_pv_instalada_kw / dias_analizados;
  const pico_vs_poi_pct = (pico_kw / poi_kw) * 100;

  return {
    energia_total_mwh: redondear(energia_total_mwh, 4),
    pico_kw: redondear(pico_kw, 2),
    horas_totales,
    dias_analizados,
    factor_planta_pct: redondear(factor_planta_pct, 2),
    factor_capacidad_pct: redondear(factor_capacidad_pct, 2),
    horas_sol_equiv_diaria: redondear(horas_sol_equiv_diaria, 2),
    pico_vs_poi_pct: redondear(pico_vs_poi_pct, 2),
  };
}
