import type { RegistroHorario } from "@/types/sfv";
import type { DiagnosticoClipping } from "@/types/sfv-kpis";

import { TOLERANCIA_CLIPPING_PCT_DEFAULT } from "./constantes";
import { fechaISO, redondear } from "./_utils";

/**
 * Sección 6 del Colab (`detectar_clipping_real`).
 *
 * Una hora se considera "en clipping" si:
 *   energia_mwh >= umbral_mwh
 * donde:
 *   umbral_mwh = (poi_kw / 1000) * (1 - tolerancia_pct / 100)
 *
 * En Wave 1 (SFV existente sin overbuild), lo normal es 0 horas de clipping.
 */
export function detectarClipping(
  registros: readonly RegistroHorario[],
  poi_kw: number,
  tolerancia_pct: number = TOLERANCIA_CLIPPING_PCT_DEFAULT
): DiagnosticoClipping {
  if (!Number.isFinite(poi_kw) || poi_kw <= 0) {
    throw new Error("poi_kw debe ser un número positivo.");
  }
  if (!Number.isFinite(tolerancia_pct) || tolerancia_pct < 0) {
    throw new Error("tolerancia_pct debe ser un número no negativo.");
  }

  const umbral_mwh = (poi_kw / 1000) * (1 - tolerancia_pct / 100);

  let horas_en_clipping = 0;
  let horas_con_generacion = 0;
  const diasConClip = new Set<string>();
  const diasTotales = new Set<string>();

  for (const r of registros) {
    const fecha = fechaISO(r.timestamp);
    diasTotales.add(fecha);
    if (r.energia_mwh > 0) horas_con_generacion += 1;
    if (r.energia_mwh >= umbral_mwh) {
      horas_en_clipping += 1;
      diasConClip.add(fecha);
    }
  }

  const pct_horas_clipping =
    horas_con_generacion > 0
      ? (horas_en_clipping / horas_con_generacion) * 100
      : 0;

  return {
    horas_en_clipping,
    horas_con_generacion,
    pct_horas_clipping: redondear(pct_horas_clipping, 2),
    dias_con_clipping: diasConClip.size,
    dias_totales: diasTotales.size,
    umbral_kwh_horario: redondear(umbral_mwh * 1000, 2),
    hay_clipping_real: horas_en_clipping > 0,
  };
}
