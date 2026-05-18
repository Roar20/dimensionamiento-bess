/**
 * Helpers de formateo compartidos por ComparativaTecnica, EquipoCard y
 * FichaTecnicaModal. Mantienen consistencia cuando un campo del catálogo
 * es "n/d" — sin sufijos de unidad redundantes.
 */

function esNoDeclarado(v: string): boolean {
  return v.trim().toLowerCase().startsWith("n/d");
}

/** Vida útil del datasheet. Omite "años" cuando el valor es n/d. */
export function formatearVidaUtil(vidaUtilAnos: string): string {
  return esNoDeclarado(vidaUtilAnos) ? vidaUtilAnos : `${vidaUtilAnos} años`;
}

/** Eficiencia máxima del datasheet. Omite "%" cuando el valor es n/d. */
export function formatearEficienciaMax(eficienciaMax: string): string {
  return esNoDeclarado(eficienciaMax) ? eficienciaMax : `${eficienciaMax}%`;
}
