import type { EstadoHorario, ResultadoSimulacion } from "@/types/bess";

import { VENTANA_HORA_PUNTA_CFE_DEFAULT } from "@/lib/core/bess";

export type ComparativaEstrategias = {
  cargado_greedy_mwh: number;
  cargado_arbitraje_mwh: number;
  descargado_greedy_mwh: number;
  descargado_arbitraje_mwh: number;
  ciclos_greedy: number;
  ciclos_arbitraje: number;
  horas_punta_greedy: number;
  horas_punta_arbitraje: number;
  energia_punta_greedy_mwh: number;
  energia_punta_arbitraje_mwh: number;
  /** Recomendación textual derivada de la diferencia en horas de punta. */
  recomendacion: string;
};

function energiaDescargadaEnPunta(
  detalle: readonly EstadoHorario[],
  ventana: readonly [number, number]
): number {
  const [ini, fin] = ventana;
  let total_kwh = 0;
  for (const e of detalle) {
    const horaEnding = e.timestamp.getHours() + 1;
    if (horaEnding >= ini && horaEnding <= fin) {
      total_kwh += e.descargado_kwh;
    }
  }
  return total_kwh / 1000;
}

export function compararEstrategias(
  greedy: ResultadoSimulacion,
  arbitraje: ResultadoSimulacion,
  ventana: readonly [number, number] = VENTANA_HORA_PUNTA_CFE_DEFAULT
): ComparativaEstrategias {
  const energia_punta_greedy = energiaDescargadaEnPunta(
    greedy.detalle_horario,
    ventana
  );
  const energia_punta_arb = energiaDescargadaEnPunta(
    arbitraje.detalle_horario,
    ventana
  );

  const recomendacion = construirRecomendacion(
    energia_punta_greedy,
    energia_punta_arb
  );

  return {
    cargado_greedy_mwh: greedy.kpis.cargado_total_mwh,
    cargado_arbitraje_mwh: arbitraje.kpis.cargado_total_mwh,
    descargado_greedy_mwh: greedy.kpis.descargado_total_mwh,
    descargado_arbitraje_mwh: arbitraje.kpis.descargado_total_mwh,
    ciclos_greedy: greedy.kpis.ciclos_periodo,
    ciclos_arbitraje: arbitraje.kpis.ciclos_periodo,
    horas_punta_greedy: greedy.kpis.horas_descarga_en_punta,
    horas_punta_arbitraje: arbitraje.kpis.horas_descarga_en_punta,
    energia_punta_greedy_mwh: energia_punta_greedy,
    energia_punta_arbitraje_mwh: energia_punta_arb,
    recomendacion,
  };
}

function construirRecomendacion(
  energia_punta_greedy: number,
  energia_punta_arb: number
): string {
  if (energia_punta_arb <= 0 && energia_punta_greedy <= 0) {
    return "Bajo los supuestos actuales, ninguna estrategia entrega energía relevante en hora-punta. Revisa la categoría seleccionada y los parámetros del PPA.";
  }
  if (energia_punta_greedy <= 0) {
    return "Arbitraje es la única estrategia que entrega energía en hora-punta CFE. Greedy descarga apenas se acaba la energía, sin esperar la ventana donde el precio es más alto.";
  }
  const ratio = energia_punta_arb / energia_punta_greedy;
  const veces = ratio.toFixed(1);
  return `Aunque greedy mueve más energía total, arbitraje entrega ${veces}× más energía durante hora-punta CFE, donde el precio del mercado es mayor. El análisis financiero cuantificará la diferencia en pesos.`;
}
