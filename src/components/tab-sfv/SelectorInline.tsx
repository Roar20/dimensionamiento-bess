import type { Granularidad, PeriodoActivo } from "@/lib/tab-sfv/filtrar-por-periodo";

const GRANULARIDADES: { value: Granularidad; label: string }[] = [
  { value: "anual", label: "Año" },
  { value: "semestral", label: "Semestre" },
  { value: "trimestral", label: "Trimestre" },
  { value: "mensual", label: "Mes" },
  { value: "semanal", label: "Semana" },
  { value: "diario", label: "Día" },
];

interface Props {
  granularidad: Granularidad;
  onGranularidadChange: (g: Granularidad) => void;
  periodo: PeriodoActivo | null;
  periodos: PeriodoActivo[];
  onSeleccionarPorId: (id: string) => void;
  onAnterior: () => void;
  onSiguiente: () => void;
  hayAnterior: boolean;
  haySiguiente: boolean;
}

/**
 * Selector temporal inline compacto para charts del Tab SFV. Reemplaza
 * al `SelectorTemporal` sticky global de Wave 1. Cada chart instancia
 * su propio selector y mantiene su propio estado de granularidad.
 */
export function SelectorInline({
  granularidad,
  onGranularidadChange,
  periodo,
  periodos,
  onSeleccionarPorId,
  onAnterior,
  onSiguiente,
  hayAnterior,
  haySiguiente,
}: Props) {
  const mostrarNavegacion = granularidad !== "anual" && periodos.length > 1;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
      <select
        aria-label="Granularidad temporal"
        className="h-7 rounded border-[0.5px] border-[var(--color-border-medium)] bg-white px-2 text-[12px] text-[var(--color-text-primary)] focus:outline-none focus-visible:border-[var(--color-primary)]"
        value={granularidad}
        onChange={(e) => onGranularidadChange(e.target.value as Granularidad)}
      >
        {GRANULARIDADES.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>

      {mostrarNavegacion ? (
        <>
          <button
            type="button"
            aria-label="Periodo anterior"
            onClick={onAnterior}
            disabled={!hayAnterior}
            className="flex h-7 w-7 items-center justify-center rounded border-[0.5px] border-[var(--color-border-medium)] bg-white text-[var(--color-text-secondary)] disabled:opacity-40"
          >
            <i className="ti ti-chevron-left" aria-hidden="true" />
          </button>
          <select
            aria-label="Periodo"
            className="h-7 max-w-[180px] truncate rounded border-[0.5px] border-[var(--color-border-medium)] bg-white px-2 text-[12px] text-[var(--color-text-primary)] focus:outline-none focus-visible:border-[var(--color-primary)]"
            value={periodo?.id ?? ""}
            onChange={(e) => onSeleccionarPorId(e.target.value)}
          >
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Periodo siguiente"
            onClick={onSiguiente}
            disabled={!haySiguiente}
            className="flex h-7 w-7 items-center justify-center rounded border-[0.5px] border-[var(--color-border-medium)] bg-white text-[var(--color-text-secondary)] disabled:opacity-40"
          >
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}
