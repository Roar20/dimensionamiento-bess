import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type KpiCardVariant = "default" | "primary" | "capture";

interface Props {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  /**
   * Tooltip de trazabilidad. Si se pasa, se renderiza un ícono
   * `info-circle` discreto al lado del label como trigger Radix.
   * Si no, no aparece ícono.
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
 * - Tooltip Radix opcional, con trigger ícono `ti-info-circle` al lado
 *   del label (no en card completa). Hover en desktop, tap en mobile.
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
        {tooltip ? <InfoTooltip texto={tooltip} label={label} /> : null}
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

function InfoTooltip({ texto, label }: { texto: string; label: string }) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Trazabilidad: ${label}`}
            className="inline-flex h-3 w-3 items-center justify-center rounded-full text-[var(--color-text-tertiary)] outline-none transition-colors hover:text-[var(--color-text-secondary)] focus-visible:text-[var(--color-text-primary)]"
          >
            <i
              className="ti ti-info-circle text-[12px] leading-none"
              aria-hidden="true"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={4}
          className="max-w-[280px] bg-[var(--color-text-primary)] px-3 py-2 text-[12px] leading-snug text-white"
        >
          {texto}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
