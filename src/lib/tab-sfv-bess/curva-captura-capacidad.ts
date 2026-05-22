import type {
  ConfiguracionEvaluada,
  ResultadoBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";

export type PuntoCurva = {
  x: number; // kWh instalados
  y: number; // % de captura (0–100)
  enFrente: boolean;
  config: ConfiguracionEvaluada;
};

export type DatosCurva = {
  /** Las 32 evaluadas como puntos {x,y}, en orden de input. */
  evaluadas: PuntoCurva[];
  /** Subconjunto del frente Pareto, ORDENADO por x (e_kwh) ascendente. */
  frente: Array<{ x: number; y: number; config: ConfiguracionEvaluada }>;
  /** Codo orientativo o null si la geometría no lo admite. */
  codo: { x: number; y: number; config: ConfiguracionEvaluada } | null;
  /** Máximo `y` observado en evaluadas; sirve para fijar techo del eje Y. */
  yMaxObservado: number;
};

/**
 * Mapea el resultado del barrido a coordenadas para la curva descriptiva.
 *
 * Convenciones:
 *  - X = `config.e_kwh` (kWh instalados).
 *  - Y = `kpis.fraccion_capturada * 100` (porcentaje).
 *  - `enFrente` se determina por reference-equality contra `frentePareto`,
 *    igual que `construirFilasTabla` (mismo patrón ya probado).
 *  - `frente` se devuelve ordenado por X ascendente — para trazar la línea.
 *  - `codo` se mapea al mismo shape; null se propaga.
 *
 * No INTERPRETA la curva; sólo expone coordenadas. Toda decisión visual
 * (zona de saturación, marker, etiquetas) vive en el componente.
 */
export function prepararDatosCurva(
  resultado: ResultadoBarridoConfiguraciones
): DatosCurva {
  const setFrente = new Set<ConfiguracionEvaluada>(resultado.frentePareto);

  const evaluadas: PuntoCurva[] = resultado.evaluadas.map((ev) => ({
    x: ev.config.e_kwh,
    y: ev.kpis.fraccion_capturada * 100,
    enFrente: setFrente.has(ev),
    config: ev,
  }));

  const frente = resultado.frentePareto
    .map((ev) => ({
      x: ev.config.e_kwh,
      y: ev.kpis.fraccion_capturada * 100,
      config: ev,
    }))
    .sort((a, b) => a.x - b.x);

  const codo =
    resultado.codo === null
      ? null
      : {
          x: resultado.codo.config.e_kwh,
          y: resultado.codo.kpis.fraccion_capturada * 100,
          config: resultado.codo,
        };

  const yMaxObservado =
    evaluadas.length === 0
      ? 0
      : evaluadas.reduce((acc, p) => (p.y > acc ? p.y : acc), 0);

  return { evaluadas, frente, codo, yMaxObservado };
}
