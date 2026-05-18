import type { EstadisticasExcedenteDiario } from "@/lib/core/sfv";

interface Props {
  stats: EstadisticasExcedenteDiario;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function MiniKpisExcedentesDiarios({ stats }: Props) {
  return (
    <>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Distribución de excedentes diarios
      </p>
      <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Mini
          label="Mediana"
          value={stats.mediana_kwh}
          tooltip="Mediana del excedente diario. La mitad de los días del año el excedente fue menor a este valor."
        />
        <Mini
          label="Promedio"
          value={stats.promedio_kwh}
          tooltip="Promedio aritmético del excedente diario durante el año."
        />
        <Mini
          label="P90"
          value={stats.p90_kwh}
          tooltip="Percentil 90. Solo el 10% de los días supera este valor — útil para dimensionar capacidad de captura."
        />
        <Mini
          label="Día crítico"
          value={stats.dia_critico_kwh}
          tooltip="Excedente del día con mayor generación bruta del año. Escenario superior de diseño."
        />
      </div>
    </>
  );
}

function Mini({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: number;
  tooltip: string;
}) {
  return (
    <div
      title={tooltip}
      className="cursor-help rounded-md bg-[var(--color-bg-secondary)] px-3.5 py-3"
    >
      <p className="mb-1 text-[11px] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className="text-[20px] font-medium leading-[1.1] text-[var(--color-text-primary)] tabular-nums">
        {FORMATO_ENTERO.format(value)}
        <span className="ml-1 text-[11px] font-normal text-[var(--color-text-tertiary)]">
          kWh
        </span>
      </p>
    </div>
  );
}
