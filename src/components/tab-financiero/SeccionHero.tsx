interface KPI {
  label: string;
  valor: string;
  sublabel?: string;
  /** Cuando es el KPI canónico de payback / aporte, se destaca con verde teal. */
  destacar?: boolean;
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
          return (
            <div
              key={kpi.label}
              className={`rounded-[12px] px-4 py-3.5 transition-shadow ${
                destacar
                  ? "border-[1px] border-[#0F766E] bg-white shadow-[0_1px_3px_rgba(15,118,110,0.08)]"
                  : "border-[0.5px] border-[var(--color-border-light)] bg-white"
              }`}
            >
              <p className="text-[10.5px] font-medium uppercase tracking-[0.4px] text-[var(--color-text-tertiary)]">
                {kpi.label}
              </p>
              <p
                className={`mt-1.5 text-[19px] font-semibold tabular-nums leading-tight ${
                  destacar
                    ? "text-[#065F46]"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {kpi.valor}
              </p>
              {kpi.sublabel ? (
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-text-secondary)]">
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
