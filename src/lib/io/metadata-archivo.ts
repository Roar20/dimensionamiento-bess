import type {
  ConfiguracionPlanta,
  DatosSFV,
  MetadataArchivoUI,
  Warning,
} from "@/types/sfv";

/**
 * Deriva la shape camelCase de metadata para consumo de UI (banda de
 * contexto, dashboard, etc.) a partir del resultado del loader.
 *
 * Pure function. No side effects. `nombrePlanta` viene literalmente de
 * `config.nombre` (texto libre capturado en onboarding); no hardcodea
 * ningún catálogo de plantas.
 */
export function extraerMetadataArchivo(
  datos: DatosSFV,
  warnings: readonly Warning[],
  config: ConfiguracionPlanta
): MetadataArchivoUI {
  return {
    nombrePlanta: config.nombre,
    periodoInicio: datos.meta.periodo_inicio,
    periodoFin: datos.meta.periodo_fin,
    numRegistros: datos.meta.total_horas,
    granularidadDetectada: datos.meta.granularidad_detectada,
    minutosMedianaDelta: datos.meta.minutos_mediana_delta,
    cobertura: datos.meta.cobertura,
    advertencias: warnings.map((w) => w.mensaje),
  };
}
