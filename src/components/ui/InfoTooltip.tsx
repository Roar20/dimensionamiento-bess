import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  /** Texto del tooltip. */
  texto: string;
  /** Etiqueta accesible para el botón trigger. Aparece como `aria-label`. */
  etiqueta: string;
}

/**
 * Trigger Radix `info-circle` 12px tertiary + tooltip oscuro 280px max.
 * Patrón compartido por `KpiCard` (Tab SFV) y los renglones de
 * `EquipoCard` (Tab BESS). Hover en desktop, tap/focus en mobile.
 */
export function InfoTooltip({ texto, etiqueta }: Props) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={etiqueta}
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
