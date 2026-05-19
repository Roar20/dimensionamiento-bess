import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPI {
  label: string;
  valor: string;
  sublabel?: string;
  /** KPI canónico (payback / aporte BESS): borde teal + valor verde. */
  destacar?: boolean;
  /** KPI contextual: card más débil visualmente, sin border destacado. */
  secundaria?: boolean;
  /** Etiqueta pequeña inline (ej. "incluye potencia firme proxy"). */
  badge?: string;
  /** Tooltip que aparece al hacer hover en el badge. */
  badge_tooltip?: string;
}

interface Props {
  kpis: readonly KPI[];
}

export function SeccionHero({ kpis }: Props) {
  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Síntesis ejecutiva
      </p>
      <header className="mb-4">
        <h2 className="text-[16px] font-medium text-[var(--color-text-primary)]">
          Indicadores clave del proyecto
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Valores bajo la configuración del panel; recalculan en vivo con
          cada cambio.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => {
          const destacar = kpi.destacar;
          const secundaria = kpi.secundaria;
          const cardClase = destacar
            ? "border-[1px] border-[#0F766E] bg-white shadow-[0_1px_3px_rgba(15,118,110,0.08)]"
            : secundaria
              ? "border-[0.5px] border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]"
              : "border-[0.5px] border-[var(--color-border-light)] bg-white";
          const labelClase = secundaria
            ? "text-[10.5px] font-normal uppercase tracking-[0.4px] text-[var(--color-text-tertiary)]"
            : "text-[10.5px] font-medium uppercase tracking-[0.4px] text-[var(--color-text-tertiary)]";
          const valorClase = destacar
            ? "mt-1.5 text-[19px] font-semibold tabular-nums leading-tight text-[#065F46]"
            : secundaria
              ? "mt-1.5 text-[17px] font-medium tabular-nums leading-tight text-[var(--color-text-secondary)]"
              : "mt-1.5 text-[19px] font-semibold tabular-nums leading-tight text-[var(--color-text-primary)]";
          return (
            <div
              key={kpi.label}
              className={`rounded-[12px] px-4 py-3.5 transition-shadow ${cardClase}`}
            >
              <p className={labelClase}>{kpi.label}</p>
              <p className={valorClase}>{kpi.valor}</p>
              {kpi.badge ? (
                kpi.badge_tooltip ? (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="mt-1 inline-flex max-w-full cursor-help items-center rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#78350F]">
                          {kpi.badge}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[320px] leading-snug">
                        {kpi.badge_tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <p className="mt-1 inline-flex max-w-full items-center rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#78350F]">
                    {kpi.badge}
                  </p>
                )
              ) : null}
              {kpi.sublabel ? (
                <p
                  className={`mt-0.5 text-[11px] leading-snug ${
                    secundaria
                      ? "text-[var(--color-text-tertiary)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {kpi.sublabel}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
