import type {
  ConfiguracionBESS,
  EstadoHorario,
  KPIsSimulacion,
} from "@/types/bess";

import { VENTANA_HORA_PUNTA_CFE_DEFAULT } from "./constantes";

export function calcularKPIs(
  detalle: readonly EstadoHorario[],
  config: ConfiguracionBESS,
  ventana_punta: readonly [number, number] = VENTANA_HORA_PUNTA_CFE_DEFAULT
): KPIsSimulacion {
  let cargado_total_kwh = 0;
  let descargado_total_kwh = 0;
  let energia_categoria_total_mwh = 0;
  let no_capturada_total_kwh = 0;
  let soc_max_kwh = 0;
  let horas_descarga_en_punta = 0;

  const [puntaIni, puntaFin] = ventana_punta;

  for (const e of detalle) {
    cargado_total_kwh += e.cargado_kwh;
    descargado_total_kwh += e.descargado_kwh;
    energia_categoria_total_mwh += e.energia_categoria_mwh;
    no_capturada_total_kwh += e.no_capturada_kwh;
    if (e.soc_kwh > soc_max_kwh) soc_max_kwh = e.soc_kwh;

    const horaEnding = e.timestamp.getHours() + 1;
    if (
      horaEnding >= puntaIni &&
      horaEnding <= puntaFin &&
      e.descargado_kwh > 0
    ) {
      horas_descarga_en_punta += 1;
    }
  }

  const cap_util_kwh = config.e_kwh * config.dod;
  const cargado_total_mwh = cargado_total_kwh / 1000;
  const fraccion_capturada =
    energia_categoria_total_mwh > 0
      ? cargado_total_mwh / energia_categoria_total_mwh
      : 0;

  return {
    cargado_total_mwh,
    descargado_total_mwh: descargado_total_kwh / 1000,
    energia_categoria_total_mwh,
    no_capturada_total_mwh: no_capturada_total_kwh / 1000,
    fraccion_capturada,
    ciclos_periodo: cap_util_kwh > 0 ? cargado_total_kwh / cap_util_kwh : 0,
    soc_max_kwh,
    horas_descarga_en_punta,
  };
}
