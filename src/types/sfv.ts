export type RegistroHorario = {
  /** Inicio del intervalo de 1 hora, zona horaria local sin offset. */
  timestamp: Date;
  /** Energía entregada en esa hora, en MWh. */
  energia_mwh: number;
  /** Potencia promedio durante esa hora, en kW. Derivada: energia_mwh * 1000. */
  potencia_kw_prom: number;
};

export type ConfiguracionPlanta = {
  /** Sección 1 — Datos del cliente */
  nombre: string;
  cliente: string | null;
  ubicacion: string | null;

  /** Sección 2 — Parámetros contractuales */
  capacidad_poi_kw: number;
  capacidad_instalada_kw: number;
  zona_lmp: string | null;
  precio_ppa_mxn_mwh: number | null;
};

/**
 * Granularidad temporal detectada en el archivo cargado. Solo `"horaria"`
 * es válida para el motor de despacho actual (que asume `dt_h = 1.0`);
 * las otras clases se reportan como advertencia para que el operador
 * sepa que los KPIs pueden ser incorrectos.
 */
export type Granularidad =
  | "horaria"
  | "sub_horaria"
  | "supra_horaria"
  | "desconocida";

/**
 * Cobertura temporal del archivo. `"anual"` solo se afirma cuando la
 * granularidad es horaria y el conteo cae en 8,760 / 8,784 (bisiesto).
 * Si la granularidad NO es horaria, cobertura se reporta `"desconocida"`
 * porque el conteo deja de mapear a tiempo de calendario.
 */
export type Cobertura = "anual" | "parcial" | "desconocida";

export type DatosSFV = {
  config: ConfiguracionPlanta;
  registros: RegistroHorario[];
  meta: {
    nombre_archivo: string;
    fecha_carga: string;
    anio: number;
    total_horas: number;
    total_energia_mwh: number;
    horas_con_generacion: number;
    pico_horario_kw: number;
    /** Timestamp mínimo de la serie; `null` si no hay registros. */
    periodo_inicio: Date | null;
    /** Timestamp máximo de la serie; `null` si no hay registros. */
    periodo_fin: Date | null;
    granularidad_detectada: Granularidad;
    /** Mediana de deltas entre timestamps consecutivos, en minutos. */
    minutos_mediana_delta: number | null;
    cobertura: Cobertura;
  };
};

export type WarningCodigo =
  | "HORAS_INCOMPLETAS"
  | "PICO_EXCEDE_INSTALADA"
  | "PICO_EXCEDE_POI"
  | "ANIO_NO_COMPLETO"
  | "GRANULARIDAD_SUB_HORARIA"
  | "GRANULARIDAD_SUPRA_HORARIA"
  | "GRANULARIDAD_DESCONOCIDA";

export type Warning = {
  codigo: WarningCodigo;
  mensaje: string;
};

/**
 * Vista camelCase de metadata del archivo para consumo de UI. Se deriva
 * de `DatosSFV.meta` + `warnings` + `config.nombre` vía
 * `extraerMetadataArchivo()`. No hardcodea nombres de planta:
 * `nombrePlanta` es el texto libre que el usuario capturó en onboarding.
 */
export type MetadataArchivoUI = {
  nombrePlanta: string;
  periodoInicio: Date | null;
  periodoFin: Date | null;
  numRegistros: number;
  granularidadDetectada: Granularidad;
  minutosMedianaDelta: number | null;
  cobertura: Cobertura;
  advertencias: string[];
};

export class ErrorFormatoArchivo extends Error {
  public readonly razon: string;
  public readonly detalle: string | undefined;

  constructor(razon: string, detalle?: string) {
    super(razon);
    this.name = "ErrorFormatoArchivo";
    this.razon = razon;
    this.detalle = detalle;
  }
}
