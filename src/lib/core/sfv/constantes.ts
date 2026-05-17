/** Ventana hora-punta CFE GDMTH: horas-ending 18 a 22 inclusive (1-24). */
export const VENTANA_PUNTA_CFE: readonly [number, number] = [18, 22] as const;

/** Tolerancia default para detección de clipping (% del POI). */
export const TOLERANCIA_CLIPPING_PCT_DEFAULT = 1.0;

/** Umbral para detectar "inicio/fin de generación" en perfil horario (% del pico). */
export const UMBRAL_GENERACION_PCT = 0.05;

/** Percentil para detección de días anómalos. */
export const PERCENTIL_DIAS_ANOMALOS = 0.1;
