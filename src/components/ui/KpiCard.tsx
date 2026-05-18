import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { cn } from "@/lib/utils";

export type KpiCardVariant = "default" | "primary" | "capture";

interface Props {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  /**
   * Tooltip de trazabilidad. Si se pasa, se renderiza un ícono
   * `info-circle` discreto al lado del label (vía `InfoTooltip`
   * compartido). Si no, no aparece ícono.
   */
  tooltip?: string;
  variant?: KpiCardVariant;
}

const VARIANT_CLASS: Record<KpiCardVariant, string> = {
  default: "",
  primary:
    "border-l-[3px] border-l-[var(--color-primary)] rounded-l-none rounded-r-md",
  capture:
    "border-l-[3px] border-l-[var(--color-capture)] rounded-l-none rounded-r-md",
};

/**
 * KPI card del sistema de diseño P1.
 * - Border 0.5px translúcido.
 * - Variantes con border-left 3px de color.
 * - Sin shadow, sin gradiente.
 * - Tooltip Radix opcional via `<InfoTooltip>`.
 */
export function KpiCard({
  label,
  value,
  unit,
  sub,
  tooltip,
  variant = "default",
}: Props) {
  return (
    <div
      className={cn(
        "rounded-md border-[0.5px] border-[var(--color-border-light)] bg-white px-[18px] py-4 transition-colors hover:border-[var(--color-border-medium)]",
        VARIANT_CLASS[variant]
      )}
    >
      <div className="mb-2 flex items-center gap-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-secondary)]">
          {label}
        </p>
        {tooltip ? (
          <InfoTooltip texto={tooltip} etiqueta={`Trazabilidad: ${label}`} />
        ) : null}
      </div>
      <p className="text-[26px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)] tabular-nums">
        {value}
        {unit ? (
          <span className="ml-1 text-sm font-normal text-[var(--color-text-secondary)]">
            {unit}
          </span>
        ) : null}
      </p>
      {sub ? (
        <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
