import type { RegistroHorario } from "./sfv";

/**
 * Salida de la sección 5 del Colab `Motor_BESS_v2_05152026.ipynb`
 * (`caracterizar_recurso_real`). Replica los mismos campos en TS, sin
 * `headroom_al_poi_pct` (lenguaje overbuild, fuera de Wave 1).
 */
export type ResultadoCaracterizacion = {
  energia_total_mwh: number;
  pico_kw: number;
  horas_totales: number;
  dias_analizados: number;
  /** Utilización del POI: energia / (poi_kw × horas_totales). */
  factor_planta_pct: number;
  /** Utilización del activo PV instalado. */
  factor_capacidad_pct: number;
  /** Horas sol equivalentes diarias (HSE): kWh / cap_pv / días. */
  horas_sol_equiv_diaria: number;
  /** pico_kw / poi_kw × 100. */
  pico_vs_poi_pct: number;
};

/** Salida de la sección 6 del Colab (`detectar_clipping_real`). */
export type DiagnosticoClipping = {
  horas_en_clipping: number;
  horas_con_generacion: number;
  pct_horas_clipping: number;
  dias_con_clipping: number;
  dias_totales: number;
  /** Umbral en kWh por hora a partir del cual se considera clipping. */
  umbral_kwh_horario: number;
  hay_clipping_real: boolean;
};

export type PerfilPorHoraEntrada = {
  kW_promedio: number;
  kW_maximo: number;
};

/** Salida de la sección 7 del Colab (`calcular_perfil_horario`). */
export type PerfilHorario = {
  /** Mapa hora-ending (1..24) → {kW_promedio, kW_maximo}. */
  perfil_por_hora: Record<number, PerfilPorHoraEntrada>;
  hora_inicio_generacion: number | null;
  hora_fin_generacion: number | null;
  hora_pico: number;
  /** Ventana CFE GDMTH: horas-ending 18..22 inclusive. */
  ventana_punta_cfe: readonly [number, number];
  energia_durante_punta_mwh: number;
  pct_energia_en_punta: number;
};

/** Salida de la sección 8 del Colab (`caracterizar_variabilidad_diaria`). */
export type Variabilidad = {
  dia_mejor_fecha: string;
  dia_mejor_mwh: number;
  dia_peor_fecha: string;
  dia_peor_mwh: number;
  promedio_mwh: number;
  mediana_mwh: number;
  p10_mwh: number;
  p90_mwh: number;
  /** std / mean (sample std, ddof=1). */
  coef_variacion: number;
  /** Fechas con MWh estrictamente menor a p10, ordenadas ascendente por MWh. */
  dias_anomalos: string[];
  n_dias_anomalos: number;
  /** Serie diaria: clave fecha ISO YYYY-MM-DD → MWh sumados ese día. */
  serie_diaria: Record<string, number>;
  /**
   * Heatmap día×hora.
   * - Clave: `MM-DD` para garantizar unicidad en datasets multianuales.
   * - Valor: array de 24 kW; el índice 0 corresponde a hora-ending 1
   *   (timestamp con `getHours() === 0`), índice 23 a hora-ending 24.
   * - Las horas sin registro se llenan con 0.
   */
  heatmap: Record<string, number[]>;
};

export type { RegistroHorario };
