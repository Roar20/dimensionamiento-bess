export { caracterizarRecurso } from "./caracterizar";
export { detectarClipping } from "./deteccion-clipping";
export { calcularPerfilHorario } from "./perfil-horario";
export { caracterizarVariabilidad } from "./variabilidad";
export {
  agregarExcedentesPorMes,
  type ExcedenteMensual,
} from "./excedentes-mensuales";
export {
  estadisticasExcedenteDiario,
  type EstadisticasExcedenteDiario,
} from "./excedentes-diarios";
export {
  VENTANA_PUNTA_CFE,
  TOLERANCIA_CLIPPING_PCT_DEFAULT,
  UMBRAL_GENERACION_PCT,
  PERCENTIL_DIAS_ANOMALOS,
} from "./constantes";

export type {
  ResultadoCaracterizacion,
  DiagnosticoClipping,
  PerfilHorario,
  PerfilPorHoraEntrada,
  Variabilidad,
} from "@/types/sfv-kpis";
