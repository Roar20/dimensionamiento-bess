/**
 * Categoría de energía almacenable del SFV.
 *
 * NO son escenarios optimista/probable/conservador. Son descomposiciones
 * complementarias de la misma energía del SFV según qué supuestos del PPA
 * aplican.
 */
export type CategoriaEnergia =
  | {
      tipo: "toda_energia";
      etiqueta: string;
      descripcion: string;
    }
  | {
      tipo: "fuera_hora_punta_cfe";
      ventana_punta: readonly [number, number];
      etiqueta: string;
      descripcion: string;
    }
  | {
      tipo: "compromiso_ppa_mensual_mwh";
      mwh_mes: number;
      etiqueta: string;
      descripcion: string;
    }
  | {
      tipo: "exceso_capacidad_cfe_kw";
      techo_kw: number;
      etiqueta: string;
      descripcion: string;
    };

export type CategoriaTipo = CategoriaEnergia["tipo"];

export type SeleccionCategoria = "ninguna" | CategoriaTipo;

/** Parámetros configurables que el usuario captura en Sección 2A. */
export type ParametrosPPA = {
  compromiso_mensual_mwh: number;
  ventana_punta_cfe: readonly [number, number];
  /** Heredado del onboarding; no editable en Tab BESS. */
  capacidad_poi_kw: number;
};

export type ResumenCategoria = {
  categoria: CategoriaEnergia;
  total_mwh: number;
  porcentaje: number;
  promedio_mensual_mwh: number;
};

/** Configuración del BESS a simular. */
export type ConfiguracionBESS = {
  /** Potencia AC nominal en kW. */
  p_kw: number;
  /** Capacidad de energía nominal en kWh. */
  e_kwh: number;
  /** Depth of Discharge permitido (0-1). Típico 0.95 para LFP. */
  dod: number;
  /** Round-trip efficiency (0-1). 0.85 C&I, 0.93 Utility. */
  rte: number;
  /** SoC inicial en kWh. */
  soc_inicial_kwh: number;
};

export type EstrategiaDespacho = "greedy" | "arbitraje";

/** Estado del BESS en una hora simulada. */
export type EstadoHorario = {
  timestamp: Date;
  gen_mwh: number;
  energia_categoria_mwh: number;
  cargado_kwh: number;
  descargado_kwh: number;
  /** Energía de la categoría que no se logró capturar. */
  no_capturada_kwh: number;
  soc_kwh: number;
};

export type KPIsSimulacion = {
  cargado_total_mwh: number;
  descargado_total_mwh: number;
  energia_categoria_total_mwh: number;
  no_capturada_total_mwh: number;
  /** Fracción capturada de la energía en la categoría (0-1). */
  fraccion_capturada: number;
  /** Ciclos equivalentes en el periodo simulado. */
  ciclos_periodo: number;
  soc_max_kwh: number;
  horas_descarga_en_punta: number;
};

export type ResultadoSimulacion = {
  estrategia: EstrategiaDespacho;
  categoria: CategoriaEnergia;
  config: ConfiguracionBESS;
  detalle_horario: EstadoHorario[];
  kpis: KPIsSimulacion;
};

export type ResultadoCompleto = {
  config: ConfiguracionBESS;
  simulaciones: ResultadoSimulacion[];
};
