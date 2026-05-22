import type {
  ConfiguracionEvaluada,
  ResultadoBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";

export type FilaConfiguracion = {
  evaluada: ConfiguracionEvaluada;
  enFrente: boolean;
  esCodo: boolean;
};

/**
 * Construye las filas para la tabla de configuraciones, ordenadas por
 * e_kwh ascendente → estrategia → p_kw.
 * Cada fila lleva flags `enFrente` y `esCodo` para renderizar badges.
 */
export function construirFilasTabla(
  resultado: ResultadoBarridoConfiguraciones
): FilaConfiguracion[] {
  const { evaluadas, frentePareto, codo } = resultado;

  // Reference-equality set: correrBarridoConfiguraciones comparte las
  // mismas referencias entre evaluadas y frentePareto/codo.
  const setFrente = new Set<ConfiguracionEvaluada>(frentePareto);

  const filas: FilaConfiguracion[] = evaluadas.map((ev) => ({
    evaluada: ev,
    enFrente: setFrente.has(ev),
    esCodo: codo !== null && esMismaConfiguracionEvaluada(ev, codo),
  }));

  filas.sort((a, b) => {
    const eA = a.evaluada.config.e_kwh;
    const eB = b.evaluada.config.e_kwh;
    if (eA !== eB) return eA - eB;
    const strCmp = a.evaluada.estrategia.localeCompare(b.evaluada.estrategia);
    if (strCmp !== 0) return strCmp;
    return a.evaluada.config.p_kw - b.evaluada.config.p_kw;
  });

  return filas;
}

export function esMismaConfiguracionEvaluada(
  a: ConfiguracionEvaluada,
  b: ConfiguracionEvaluada
): boolean {
  return (
    a.config.p_kw === b.config.p_kw &&
    a.config.e_kwh === b.config.e_kwh &&
    a.estrategia === b.estrategia
  );
}

/** "400 kW × 4 h" */
export function formatearConfig(p_kw: number, horas: number): string {
  return `${p_kw} kW × ${horas} h`;
}

/** fraccion 0–1 → "78.5 %" */
export function formatearPct(fraccion: number): string {
  return `${(fraccion * 100).toFixed(1)} %`;
}

/** ciclos (float) → "142" */
export function formatearCiclos(ciclos: number): string {
  return String(Math.round(ciclos));
}
