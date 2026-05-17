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
  };
};

export type WarningCodigo =
  | "HORAS_INCOMPLETAS"
  | "PICO_EXCEDE_INSTALADA"
  | "PICO_EXCEDE_POI"
  | "ANIO_NO_COMPLETO";

export type Warning = {
  codigo: WarningCodigo;
  mensaje: string;
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
