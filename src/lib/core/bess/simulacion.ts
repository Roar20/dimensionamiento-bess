import type { RegistroHorario } from "@/types/sfv";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
  EstrategiaDespacho,
  ResultadoCompleto,
  ResultadoSimulacion,
} from "@/types/bess";

import { calcularKPIs } from "./agregaciones";
import { calcularEnergiaPorCategoria } from "./categoria-energia";
import { simularDespachoArbitraje } from "./despacho-arbitraje";
import { simularDespachoGreedy } from "./despacho-greedy";

const ESTRATEGIAS: EstrategiaDespacho[] = ["greedy", "arbitraje"];

export function simularUna(
  registros: readonly RegistroHorario[],
  config: ConfiguracionBESS,
  categoria: CategoriaEnergia,
  estrategia: EstrategiaDespacho
): ResultadoSimulacion {
  const energia_categoria = calcularEnergiaPorCategoria(registros, categoria);
  const detalle =
    estrategia === "greedy"
      ? simularDespachoGreedy(registros, energia_categoria, config)
      : simularDespachoArbitraje(registros, energia_categoria, config);
  const kpis = calcularKPIs(detalle, config);
  return {
    estrategia,
    categoria,
    config,
    detalle_horario: detalle,
    kpis,
  };
}

/**
 * 2 estrategias × N categorías. Con las 4 categorías default = 8 simulaciones.
 */
export function simularCompleto(
  registros: readonly RegistroHorario[],
  config: ConfiguracionBESS,
  categorias: readonly CategoriaEnergia[]
): ResultadoCompleto {
  const simulaciones: ResultadoSimulacion[] = [];
  for (const cat of categorias) {
    for (const est of ESTRATEGIAS) {
      simulaciones.push(simularUna(registros, config, cat, est));
    }
  }
  return { config, simulaciones };
}
