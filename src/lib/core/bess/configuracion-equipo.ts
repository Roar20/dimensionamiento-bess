import type { EquipoBESS } from "@/lib/bess/catalogo-hyperstrong";
import type { ConfiguracionBESS } from "@/types/bess";

import { DOD_DEFAULT } from "./constantes";

/**
 * Escala un equipo del catálogo por N unidades en paralelo y produce una
 * `ConfiguracionBESS` lista para el motor de despacho.
 *
 * - Potencia total = `kw_ac × multiplicador`.
 * - Capacidad total = `kwh × multiplicador`.
 * - RTE = el del equipo individual (independiente de cuántas unidades).
 * - DoD = `DOD_DEFAULT` salvo override explícito.
 */
export function escalarEquipo(
  equipo: EquipoBESS,
  multiplicador: number,
  overrides: Partial<Pick<ConfiguracionBESS, "dod" | "soc_inicial_kwh">> = {}
): ConfiguracionBESS {
  if (!Number.isFinite(multiplicador) || multiplicador <= 0) {
    throw new Error("multiplicador debe ser un entero positivo.");
  }
  const n = Math.max(1, Math.round(multiplicador));
  return {
    p_kw: equipo.kw_ac * n,
    e_kwh: equipo.kwh * n,
    dod: overrides.dod ?? DOD_DEFAULT,
    rte: equipo.eficiencia_max,
    soc_inicial_kwh: overrides.soc_inicial_kwh ?? 0,
  };
}

export function inversionTotal(
  equipo: EquipoBESS,
  multiplicador: number
): number {
  return equipo.precio_usd * Math.max(1, Math.round(multiplicador));
}
