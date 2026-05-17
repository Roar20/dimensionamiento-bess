/** Helpers internos del motor SFV (no se exportan en index.ts). */

export function fechaISO(ts: Date): string {
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fechaMMDD(ts: Date): string {
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

/**
 * `getHours()` devuelve 0..23 (inicio de intervalo). El Colab agrupa por
 * hora-ending 1..24, por lo que sumamos 1 para mantener paridad.
 */
export function horaEnding(ts: Date): number {
  return ts.getHours() + 1;
}

export function redondear(n: number, decimales: number): number {
  if (!Number.isFinite(n)) return n;
  const factor = 10 ** decimales;
  return Math.round(n * factor) / factor;
}

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  let acc = 0;
  for (const x of xs) acc += x;
  return acc / xs.length;
}

/** Mediana sobre array sin ordenar (se ordena internamente). */
export function median(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Quantile lineal (interpolación entre vecinos), método default de numpy/pandas.
 * Asume `sorted` ya está ordenado ascendente.
 */
export function quantileSorted(sorted: readonly number[], p: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0]!;
  const rank = p * (n - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo]!;
  const frac = rank - lo;
  return sorted[lo]! * (1 - frac) + sorted[hi]! * frac;
}

/** Desviación estándar muestral (ddof=1), igual que `pandas.Series.std()`. */
export function stdSample(xs: readonly number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const m = mean(xs);
  let acc = 0;
  for (const x of xs) acc += (x - m) ** 2;
  return Math.sqrt(acc / (n - 1));
}
