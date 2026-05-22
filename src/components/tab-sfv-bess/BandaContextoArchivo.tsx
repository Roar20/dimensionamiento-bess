import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import type { MetadataArchivoUI } from "@/types/sfv";

interface Props {
  metadataArchivo: MetadataArchivoUI | null;
}

const FECHA_FMT = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatearFecha(d: Date | null): string {
  if (!d) return "—";
  try {
    return FECHA_FMT.format(d);
  } catch {
    return "—";
  }
}

function esClean(meta: MetadataArchivoUI): boolean {
  return (
    meta.cobertura === "anual" &&
    meta.granularidadDetectada === "horaria" &&
    meta.advertencias.length === 0
  );
}

export function BandaContextoArchivo({ metadataArchivo }: Props) {
  if (!metadataArchivo) return null;

  const copy = COPY_SFV_BESS.comparacionConfiguraciones.banda;

  if (esClean(metadataArchivo)) {
    return (
      <div
        data-testid="banda-limpia"
        className="mb-4 flex flex-wrap gap-x-6 gap-y-1 rounded-[10px] border-[0.5px] border-[var(--color-info-border)]/30 bg-[var(--color-info-bg)] px-4 py-3 text-[12px] text-[var(--color-info)]"
      >
        <span>{copy.limpio.granularidad}</span>
        <span>{copy.limpio.cobertura}</span>
        <span>{copy.limpio.registros(metadataArchivo.numRegistros)}</span>
        <span>
          {copy.limpio.periodo(
            formatearFecha(metadataArchivo.periodoInicio),
            formatearFecha(metadataArchivo.periodoFin)
          )}
        </span>
      </div>
    );
  }

  const granularidadLabel =
    metadataArchivo.granularidadDetectada !== "horaria"
      ? [
          `Granularidad: ${metadataArchivo.granularidadDetectada}`,
          metadataArchivo.minutosMedianaDelta !== null
            ? `(mediana ${metadataArchivo.minutosMedianaDelta} min)`
            : null,
        ]
          .filter(Boolean)
          .join(" ")
      : null;

  const coberturaLabel =
    metadataArchivo.cobertura !== "anual"
      ? `Cobertura: ${metadataArchivo.cobertura}`
      : null;

  return (
    <div
      data-testid="banda-advertencia"
      className="mb-4 rounded-[10px] border border-status-warning/30 bg-amber-50 px-4 py-3 text-[12px] text-amber-800"
    >
      <p className="mb-1.5 font-medium">
        {copy.advertencia.titulo}
      </p>
      <ul className="list-inside list-disc space-y-0.5">
        {metadataArchivo.advertencias.map((adv, i) => (
          <li key={i}>{adv}</li>
        ))}
        {granularidadLabel && (
          <li data-testid="item-granularidad">{granularidadLabel}</li>
        )}
        {coberturaLabel && (
          <li data-testid="item-cobertura">{coberturaLabel}</li>
        )}
      </ul>
    </div>
  );
}
