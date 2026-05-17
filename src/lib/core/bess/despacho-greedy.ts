import type { RegistroHorario } from "@/types/sfv";
import type { ConfiguracionBESS, EstadoHorario } from "@/types/bess";

import { SOC_MIN_PCT_DEFAULT } from "./constantes";

/**
 * Despacho greedy:
 * - Cargar el BESS apenas hay energía en la categoría hasta saturar SoC o
 *   alcanzar la potencia nominal.
 * - Descargar el BESS apenas la energía de la categoría se acaba (cualquier
 *   hora del día/noche).
 * - Sin restricción de horario para descargar.
 *
 * Convención energética: cargado/descargado expresan la energía AC
 * intercambiada con la red. Las pérdidas por RTE se aplican como √rte en
 * carga y √rte en descarga.
 */
export function simularDespachoGreedy(
  registros: readonly RegistroHorario[],
  energia_categoria_mwh: readonly number[],
  config: ConfiguracionBESS
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

  let soc = Math.max(soc_min_kwh, config.soc_inicial_kwh);
  const resultado: EstadoHorario[] = [];

  for (let i = 0; i < registros.length; i += 1) {
    const r = registros[i]!;
    const cat_mwh = energia_categoria_mwh[i]!;
    const cat_kwh = cat_mwh * 1000;

    let cargado_kwh = 0;
    let descargado_kwh = 0;
    let no_capturada_kwh = 0;

    if (cat_kwh > 0) {
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
    } else {
      const max_descarga_potencia = config.p_kw * dt_h;
      // El piso de SoC limita cuánto se puede descargar: solo lo que está
      // ARRIBA del piso es entregable, escalado por √rte hacia AC.
      const max_descarga_soc = (soc - soc_min_kwh) * sqrt_rte;
      const descarga_real = Math.max(
        0,
        Math.min(max_descarga_potencia, max_descarga_soc)
      );

      descargado_kwh = descarga_real;
      soc -= sqrt_rte > 0 ? descarga_real / sqrt_rte : 0;
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
