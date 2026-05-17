import type { RegistroHorario } from "@/types/sfv";
import type { Variabilidad } from "@/types/sfv-kpis";

import { PERCENTIL_DIAS_ANOMALOS } from "./constantes";
import {
  fechaISO,
  fechaMMDD,
  mean,
  median,
  quantileSorted,
  redondear,
  stdSample,
} from "./_utils";

/**
 * Sección 8 del Colab (`caracterizar_variabilidad_diaria`) + heatmap día×hora.
 *
 * - Serie diaria: clave `YYYY-MM-DD` → MWh sumados ese día.
 * - Estadísticos: mejor/peor día, promedio, mediana, p10, p90, coef. variación.
 * - Días anómalos: fechas con MWh estrictamente menor a p10, ordenadas ascendente por MWh.
 * - Heatmap: clave `MM-DD` → array de 24 kW (índice = `timestamp.getHours()`,
 *   equivalente a hora-ending - 1).
 */
export function caracterizarVariabilidad(
  registros: readonly RegistroHorario[]
): Variabilidad {
  if (registros.length === 0) {
    throw new Error(
      "caracterizarVariabilidad requiere al menos un registro."
    );
  }

  const sumasPorFecha = new Map<string, number>();
  const heatmap: Record<string, number[]> = {};

  for (const r of registros) {
    const fecha = fechaISO(r.timestamp);
    sumasPorFecha.set(
      fecha,
      (sumasPorFecha.get(fecha) ?? 0) + r.energia_mwh
    );

    const claveHM = fechaMMDD(r.timestamp);
    if (!heatmap[claveHM]) {
      heatmap[claveHM] = new Array<number>(24).fill(0);
    }
    const idx = r.timestamp.getHours();
    heatmap[claveHM][idx] = r.energia_mwh * 1000;
  }

  const fechasOrdenadas = [...sumasPorFecha.keys()].sort();
  const valores = fechasOrdenadas.map((f) => sumasPorFecha.get(f)!);
  const valoresOrdenados = [...valores].sort((a, b) => a - b);

  const promedio = mean(valores);
  const mediana = median(valores);
  const p10 = quantileSorted(valoresOrdenados, PERCENTIL_DIAS_ANOMALOS);
  const p90 = quantileSorted(valoresOrdenados, 0.9);
  const std = stdSample(valores);
  const coef_variacion = promedio > 0 ? std / promedio : 0;

  let mejorFecha = fechasOrdenadas[0]!;
  let peorFecha = fechasOrdenadas[0]!;
  let mejorMwh = sumasPorFecha.get(mejorFecha)!;
  let peorMwh = mejorMwh;

  for (const fecha of fechasOrdenadas) {
    const v = sumasPorFecha.get(fecha)!;
    if (v > mejorMwh) {
      mejorMwh = v;
      mejorFecha = fecha;
    }
    if (v < peorMwh) {
      peorMwh = v;
      peorFecha = fecha;
    }
  }

  const anomalos = fechasOrdenadas
    .filter((f) => sumasPorFecha.get(f)! < p10)
    .sort((a, b) => sumasPorFecha.get(a)! - sumasPorFecha.get(b)!);

  const serie_diaria: Record<string, number> = {};
  for (const f of fechasOrdenadas) {
    serie_diaria[f] = redondear(sumasPorFecha.get(f)!, 4);
  }

  return {
    dia_mejor_fecha: mejorFecha,
    dia_mejor_mwh: redondear(mejorMwh, 4),
    dia_peor_fecha: peorFecha,
    dia_peor_mwh: redondear(peorMwh, 4),
    promedio_mwh: redondear(promedio, 4),
    mediana_mwh: redondear(mediana, 4),
    p10_mwh: redondear(p10, 4),
    p90_mwh: redondear(p90, 4),
    coef_variacion: redondear(coef_variacion, 3),
    dias_anomalos: anomalos,
    n_dias_anomalos: anomalos.length,
    serie_diaria,
    heatmap,
  };
}
