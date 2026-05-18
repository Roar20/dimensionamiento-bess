import type { RegistroHorario } from "@/types/sfv";
import type {
  PerfilHorario,
  PerfilPorHoraEntrada,
} from "@/types/sfv-kpis";

import { UMBRAL_GENERACION_PCT, VENTANA_PUNTA_CFE } from "./constantes";
import { horaEnding, quantileSorted, redondear } from "./_utils";

/**
 * Sección 7 del Colab (`calcular_perfil_horario`).
 *
 * Agrupa registros por hora-ending (1..24) y calcula promedio y máximo
 * de potencia para cada hora del día.
 *
 * - Ventana de generación: horas donde kW_promedio supera el 5% del pico.
 * - Ventana hora-punta CFE: horas-ending [18, 22] inclusive.
 *
 * Convención: el archivo del SFV usa hora-ending 1..24. Los timestamps de
 * los `RegistroHorario` están en convención inicio-de-intervalo
 * (timestamp 00:00 ↔ hora-ending 1), así que sumamos 1 al `getHours()`.
 */
export function calcularPerfilHorario(
  registros: readonly RegistroHorario[]
): PerfilHorario {
  if (registros.length === 0) {
    throw new Error("calcularPerfilHorario requiere al menos un registro.");
  }

  const muestrasPorHora = new Map<number, number[]>();

  let energia_total_mwh = 0;
  let energia_durante_punta_mwh = 0;
  const [puntaInicio, puntaFin] = VENTANA_PUNTA_CFE;

  for (const r of registros) {
    const hora = horaEnding(r.timestamp);
    const kW = r.energia_mwh * 1000;

    const muestras = muestrasPorHora.get(hora);
    if (muestras) muestras.push(kW);
    else muestrasPorHora.set(hora, [kW]);

    energia_total_mwh += r.energia_mwh;
    if (hora >= puntaInicio && hora <= puntaFin) {
      energia_durante_punta_mwh += r.energia_mwh;
    }
  }

  const perfil_por_hora: Record<number, PerfilPorHoraEntrada> = {};
  let pico_prom = 0;
  let hora_pico = 1;

  for (let h = 1; h <= 24; h += 1) {
    const muestras = muestrasPorHora.get(h) ?? [];
    if (muestras.length === 0) {
      perfil_por_hora[h] = { kW_promedio: 0, kW_maximo: 0, kW_p25: 0, kW_p75: 0 };
      continue;
    }
    const sorted = [...muestras].sort((a, b) => a - b);
    let suma = 0;
    for (const x of sorted) suma += x;
    const prom = suma / sorted.length;
    const max = sorted[sorted.length - 1] ?? 0;
    const p25 = quantileSorted(sorted, 0.25);
    const p75 = quantileSorted(sorted, 0.75);

    perfil_por_hora[h] = {
      kW_promedio: redondear(prom, 2),
      kW_maximo: redondear(max, 2),
      kW_p25: redondear(p25, 2),
      kW_p75: redondear(p75, 2),
    };
    if (prom > pico_prom) {
      pico_prom = prom;
      hora_pico = h;
    }
  }

  const umbral_inicio = pico_prom * UMBRAL_GENERACION_PCT;
  let hora_inicio_generacion: number | null = null;
  let hora_fin_generacion: number | null = null;

  for (let h = 1; h <= 24; h += 1) {
    const entrada = perfil_por_hora[h];
    if (!entrada) continue;
    if (entrada.kW_promedio > umbral_inicio) {
      if (hora_inicio_generacion === null) hora_inicio_generacion = h;
      hora_fin_generacion = h;
    }
  }

  const pct_energia_en_punta =
    energia_total_mwh > 0
      ? (energia_durante_punta_mwh / energia_total_mwh) * 100
      : 0;

  return {
    perfil_por_hora,
    hora_inicio_generacion,
    hora_fin_generacion,
    hora_pico,
    ventana_punta_cfe: VENTANA_PUNTA_CFE,
    energia_durante_punta_mwh: redondear(energia_durante_punta_mwh, 4),
    pct_energia_en_punta: redondear(pct_energia_en_punta, 2),
  };
}
