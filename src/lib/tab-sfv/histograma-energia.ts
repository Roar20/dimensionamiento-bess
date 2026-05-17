export type HistogramaBin = {
  rangoInicio: number;
  rangoFin: number;
  label: string;
  dias: number;
};

const NUM_BINS_DEFAULT = 10;

export function calcularHistogramaEnergia(
  serieDiaria: Readonly<Record<string, number>>,
  numBins: number = NUM_BINS_DEFAULT
): HistogramaBin[] {
  const valores = Object.values(serieDiaria);
  if (valores.length === 0 || numBins <= 0) return [];

  const min = 0;
  const maxValor = Math.max(...valores);
  const max = Math.max(Math.ceil(maxValor), 1);
  const tamBin = (max - min) / numBins;

  const bins: HistogramaBin[] = Array.from({ length: numBins }, (_, i) => {
    const inicio = min + i * tamBin;
    const fin = min + (i + 1) * tamBin;
    return {
      rangoInicio: inicio,
      rangoFin: fin,
      label: `${inicio.toFixed(1)}–${fin.toFixed(1)}`,
      dias: 0,
    };
  });

  for (const v of valores) {
    if (!Number.isFinite(v)) continue;
    const idx = Math.min(
      Math.max(Math.floor((v - min) / tamBin), 0),
      numBins - 1
    );
    bins[idx]!.dias += 1;
  }

  return bins;
}
