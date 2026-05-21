import type { RegistroHorario } from "@/types/sfv";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
  EstrategiaDespacho,
  KPIsSimulacion,
} from "@/types/bess";

import { simularUna } from "./simulacion";

export const POTENCIAS_KW_DEFAULT: readonly number[] = [200, 300, 400, 500];
export const HORAS_DEFAULT: readonly number[] = [2, 3, 4, 6];

/** Epsilon absoluto para comparar fracciones en la dominancia Pareto. */
const EPS_FRACCION = 1e-6;
/** Epsilon absoluto para comparar ciclos en la dominancia Pareto. */
const EPS_CICLOS = 1e-6;

export type ParametrosBarrido = {
  potencias_kw: readonly number[];
  horas: readonly number[];
};

export type ConfiguracionEvaluada = {
  config: ConfiguracionBESS;
  estrategia: EstrategiaDespacho;
  kpis: KPIsSimulacion;
};

export type ResultadoBarridoConfiguraciones = {
  /** Todas las combinaciones evaluadas, en orden de input. */
  evaluadas: ConfiguracionEvaluada[];
  /** Subconjunto no-dominado. NO está ordenado por una métrica escalar. */
  frentePareto: ConfiguracionEvaluada[];
  /**
   * Sugerencia heurística del punto de rendimientos decrecientes sobre el
   * frente (X = e_kwh, Y = fraccion_capturada). No es un veredicto ni
   * "la mejor"; es orientativo. `null` si el frente tiene <3 puntos o la
   * geometría no admite un codo (puntos colineales o sin lado convexo).
   */
  codo: ConfiguracionEvaluada | null;
};

/**
 * Corre `simularUna()` sobre el producto cartesiano
 * `potencias_kw × horas × estrategias`, agrega los KPIs y devuelve el
 * frente de Pareto y una sugerencia de codo.
 *
 * Cada hardware se construye como `{ p_kw, e_kwh: p_kw × horas, ...params }`.
 *
 * NO ordena por una métrica única ni declara ganador. La elección final
 * la hace quien lea el resultado.
 *
 * Dominancia Pareto (3 dimensiones):
 *  - mayor `fraccion_capturada` (mejor)
 *  - mayor `ciclos_periodo` (mejor)
 *  - menor `e_kwh` instalada (mejor — proxy de inversión)
 *
 * Nota: "más ciclos" y "menos e_kwh" están acoplados (ciclos ∝ 1/e_kwh
 * para misma energía cargada). Eso es intencional: el frente premia el
 * uso intensivo del activo.
 */
export function correrBarridoConfiguraciones(
  registros: readonly RegistroHorario[],
  sweep: ParametrosBarrido,
  categoria: CategoriaEnergia,
  estrategias: readonly EstrategiaDespacho[],
  params: Pick<ConfiguracionBESS, "dod" | "rte" | "soc_inicial_kwh">
): ResultadoBarridoConfiguraciones {
  if (sweep.potencias_kw.length === 0) {
    throw new Error("sweep.potencias_kw no puede estar vacío.");
  }
  if (sweep.horas.length === 0) {
    throw new Error("sweep.horas no puede estar vacío.");
  }
  if (estrategias.length === 0) {
    throw new Error("estrategias no puede estar vacío.");
  }
  if (!(params.dod > 0 && params.dod <= 1)) {
    throw new Error("params.dod debe estar en (0, 1].");
  }
  if (!(params.rte > 0 && params.rte <= 1)) {
    throw new Error("params.rte debe estar en (0, 1].");
  }

  const evaluadas: ConfiguracionEvaluada[] = [];
  for (const p_kw of sweep.potencias_kw) {
    for (const horas of sweep.horas) {
      const config: ConfiguracionBESS = {
        p_kw,
        e_kwh: p_kw * horas,
        dod: params.dod,
        rte: params.rte,
        soc_inicial_kwh: params.soc_inicial_kwh,
      };
      for (const estrategia of estrategias) {
        const { kpis } = simularUna(registros, config, categoria, estrategia);
        evaluadas.push({ config, estrategia, kpis });
      }
    }
  }

  const frentePareto = computarFrentePareto(evaluadas);
  const codo = encontrarCodo(frentePareto);
  return { evaluadas, frentePareto, codo };
}

/**
 * Devuelve el subconjunto no-dominado. Exportado para testing aislado.
 * El orden de salida preserva el orden de `evaluadas`.
 */
export function computarFrentePareto(
  evaluadas: readonly ConfiguracionEvaluada[]
): ConfiguracionEvaluada[] {
  const resultado: ConfiguracionEvaluada[] = [];
  for (let i = 0; i < evaluadas.length; i += 1) {
    let dominado = false;
    for (let j = 0; j < evaluadas.length; j += 1) {
      if (i === j) continue;
      if (domina(evaluadas[j]!, evaluadas[i]!)) {
        dominado = true;
        break;
      }
    }
    if (!dominado) resultado.push(evaluadas[i]!);
  }
  return resultado;
}

/**
 * A domina a B si A es mejor-o-igual en las 3 dimensiones y
 * estrictamente mejor en al menos una.
 */
function domina(a: ConfiguracionEvaluada, b: ConfiguracionEvaluada): boolean {
  const af = a.kpis.fraccion_capturada;
  const bf = b.kpis.fraccion_capturada;
  const ac = a.kpis.ciclos_periodo;
  const bc = b.kpis.ciclos_periodo;
  const ae = a.config.e_kwh;
  const be = b.config.e_kwh;

  const fracMejorOIgual = af >= bf - EPS_FRACCION;
  const ciclosMejorOIgual = ac >= bc - EPS_CICLOS;
  const eKwhMejorOIgual = ae <= be;
  if (!(fracMejorOIgual && ciclosMejorOIgual && eKwhMejorOIgual)) return false;

  const fracEstricto = af > bf + EPS_FRACCION;
  const ciclosEstricto = ac > bc + EPS_CICLOS;
  const eKwhEstricto = ae < be;
  return fracEstricto || ciclosEstricto || eKwhEstricto;
}

/**
 * Sobre el frente, ordena por `e_kwh` ascendente y devuelve el punto
 * interior con máxima distancia perpendicular (positiva, lado convexo)
 * a la cuerda entre el primer y último punto del frente ordenado.
 *
 * Devuelve `null` si:
 *  - el frente tiene <3 puntos;
 *  - todos los puntos comparten `e_kwh` (chord degenerado);
 *  - ningún punto interior queda por encima de la cuerda.
 *
 * Exportado para testing aislado.
 */
export function encontrarCodo(
  frente: readonly ConfiguracionEvaluada[]
): ConfiguracionEvaluada | null {
  if (frente.length < 3) return null;

  const ordenados = [...frente].sort((a, b) => {
    if (a.config.e_kwh !== b.config.e_kwh) {
      return a.config.e_kwh - b.config.e_kwh;
    }
    return a.kpis.fraccion_capturada - b.kpis.fraccion_capturada;
  });

  const primero = ordenados[0]!;
  const ultimo = ordenados[ordenados.length - 1]!;
  const x0 = primero.config.e_kwh;
  const y0 = primero.kpis.fraccion_capturada;
  const x1 = ultimo.config.e_kwh;
  const y1 = ultimo.kpis.fraccion_capturada;

  if (x1 === x0) return null;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const norma = Math.hypot(dx, dy);

  let mejorIdx = -1;
  let mejorDist = -Infinity;
  for (let i = 1; i < ordenados.length - 1; i += 1) {
    const p = ordenados[i]!;
    const x = p.config.e_kwh;
    const y = p.kpis.fraccion_capturada;
    const distSigned = (dx * (y - y0) - dy * (x - x0)) / norma;
    if (distSigned > mejorDist) {
      mejorDist = distSigned;
      mejorIdx = i;
    }
  }

  if (mejorIdx === -1 || mejorDist <= 0) return null;
  return ordenados[mejorIdx]!;
}
