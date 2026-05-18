import { cn } from "@/lib/utils";

export type KpiCardVariant = "default" | "primary" | "capture";

interface Props {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  /** Tooltip nativo (atributo `title`). */
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
 * - Tooltip nativo via `title` (no requiere ícono Info).
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
      title={tooltip}
      className={cn(
        "rounded-md border-[0.5px] border-[var(--color-border-light)] bg-white px-[18px] py-4 transition-colors hover:border-[var(--color-border-medium)]",
        tooltip && "cursor-help",
        VARIANT_CLASS[variant]
      )}
    >
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-secondary)]">
        {label}
      </p>
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
