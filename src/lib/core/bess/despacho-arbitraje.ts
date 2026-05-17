import type { RegistroHorario } from "@/types/sfv";
import type { ConfiguracionBESS, EstadoHorario } from "@/types/bess";

import {
  SOC_MIN_PCT_DEFAULT,
  VENTANA_HORA_PUNTA_CFE_DEFAULT,
} from "./constantes";

/**
 * Despacho arbitraje:
 * - Cargar fuera de hora-punta CFE cuando hay energía en la categoría.
 * - Descargar SOLO durante hora-punta CFE.
 * - Si hay energía de la categoría DURANTE hora-punta, no se carga
 *   (la estrategia prioriza descarga en esa ventana). Esa energía se
 *   reporta como `no_capturada_kwh`.
 */
export function simularDespachoArbitraje(
  registros: readonly RegistroHorario[],
  energia_categoria_mwh: readonly number[],
  config: ConfiguracionBESS,
  ventana_punta: readonly [number, number] = VENTANA_HORA_PUNTA_CFE_DEFAULT
): EstadoHorario[] {
  if (registros.length !== energia_categoria_mwh.length) {
    throw new Error(
      "registros y energia_categoria_mwh deben tener la misma longitud."
    );
  }

  const dt_h = 1.0;
  const soc_max_kwh = config.e_kwh * config.dod;
  const soc_min_pct = config.soc_min_pct ?? SOC_MIN_PCT_DEFAULT;
  const soc_min_kwh = soc_max_kwh * soc_min_pct;
  const sqrt_rte = Math.sqrt(config.rte);
  const [puntaIni, puntaFin] = ventana_punta;

  let soc = Math.max(soc_min_kwh, config.soc_inicial_kwh);
  const resultado: EstadoHorario[] = [];

  for (let i = 0; i < registros.length; i += 1) {
    const r = registros[i]!;
    const cat_mwh = energia_categoria_mwh[i]!;
    const cat_kwh = cat_mwh * 1000;
    const horaEnding = r.timestamp.getHours() + 1;
    const enPunta = horaEnding >= puntaIni && horaEnding <= puntaFin;

    let cargado_kwh = 0;
    let descargado_kwh = 0;
    let no_capturada_kwh = 0;

    if (enPunta) {
      const max_descarga_potencia = config.p_kw * dt_h;
      const max_descarga_soc = (soc - soc_min_kwh) * sqrt_rte;
      const descarga_real = Math.max(
        0,
        Math.min(max_descarga_potencia, max_descarga_soc)
      );

      descargado_kwh = descarga_real;
      soc -= sqrt_rte > 0 ? descarga_real / sqrt_rte : 0;

      // Energía de la categoría durante hora-punta: la estrategia no la carga.
      no_capturada_kwh = cat_kwh;
    } else if (cat_kwh > 0) {
      const max_carga_potencia = config.p_kw * dt_h;
      const max_carga_soc =
        sqrt_rte > 0 ? (soc_max_kwh - soc) / sqrt_rte : 0;
      const carga_real = Math.max(
        0,
        Math.min(cat_kwh, max_carga_potencia, max_carga_soc)
      );

      cargado_kwh = carga_real;
      soc += carga_real * sqrt_rte;
      no_capturada_kwh = cat_kwh - carga_real;
    }

    soc = Math.max(soc_min_kwh, Math.min(soc_max_kwh, soc));

    resultado.push({
      timestamp: r.timestamp,
      gen_mwh: r.energia_mwh,
      energia_categoria_mwh: cat_mwh,
      cargado_kwh,
      descargado_kwh,
      no_capturada_kwh,
      soc_kwh: soc,
    });
  }

  return resultado;
}
