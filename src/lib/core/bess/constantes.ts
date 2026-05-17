/** Ventana hora-punta CFE GDMTH default: 18-22h inclusive (hora-ending). */
export const VENTANA_HORA_PUNTA_CFE_DEFAULT: readonly [number, number] = [
  18, 22,
] as const;

export const HORA_MIN_VALIDA = 1;
export const HORA_MAX_VALIDA = 24;

/** DOD default para LFP. */
export const DOD_DEFAULT = 0.95;

/** RTE default para BESS C&I (HyperCube Plus/Max). */
export const RTE_CI_DEFAULT = 0.85;

/** RTE default para BESS Utility (HyperBlock III). */
export const RTE_UTILITY_DEFAULT = 0.93;

/** Tolerancia numérica para validaciones (kWh). */
export const TOLERANCIA_KWH = 0.01;

/**
 * Piso de SoC permitido como fracción de la capacidad útil (`e_kwh × dod`).
 * Estándar industrial LFP: 5% mínimo para preservar vida útil del
 * electroquímico. Se aplica DENTRO de la capacidad útil, no del nominal.
 */
export const SOC_MIN_PCT_DEFAULT = 0.05;
