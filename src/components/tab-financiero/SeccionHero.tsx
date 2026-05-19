interface KPI {
  label: string;
  valor: string;
  sublabel?: string;
}

interface Props {
  kpis: readonly KPI[];
}

export function SeccionHero({ kpis }: Props) {
  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Hero ejecutivo
      </p>
      <header className="mb-4">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Síntesis financiera del SFV + BESS
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Indicadores clave bajo la configuración modelada actual. Recalculan
          en vivo con cada cambio del panel.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white px-4 py-3"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
              {kpi.label}
            </p>
            <p className="mt-1 text-[18px] font-medium tabular-nums leading-tight text-[var(--color-text-primary)]">
              {kpi.valor}
            </p>
            {kpi.sublabel ? (
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                {kpi.sublabel}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
