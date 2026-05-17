export {
  calcularEnergiaPorCategoria,
  calcularPromedioMensualSFV,
  calcularResumenCategorias,
  construirCategoriasDefault,
} from "./categoria-energia";
export {
  DOD_DEFAULT,
  HORA_MAX_VALIDA,
  HORA_MIN_VALIDA,
  RTE_CI_DEFAULT,
  RTE_UTILITY_DEFAULT,
  TOLERANCIA_KWH,
  VENTANA_HORA_PUNTA_CFE_DEFAULT,
} from "./constantes";
export { simularDespachoGreedy } from "./despacho-greedy";
export { simularDespachoArbitraje } from "./despacho-arbitraje";
export { calcularKPIs } from "./agregaciones";
export { simularCompleto, simularUna } from "./simulacion";

export type {
  CategoriaEnergia,
  ConfiguracionBESS,
  EstadoHorario,
  EstrategiaDespacho,
  KPIsSimulacion,
  ParametrosPPA,
  ResultadoCompleto,
  ResultadoSimulacion,
  ResumenCategoria,
} from "@/types/bess";
