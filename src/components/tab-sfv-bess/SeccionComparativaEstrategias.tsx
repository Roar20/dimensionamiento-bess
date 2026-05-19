import type { EstrategiaDespacho, KPIsSimulacion } from "@/types/bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import { TOOLTIPS_SFV_BESS } from "@/data/tooltips-sfv-bess";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface Props {
  greedy: KPIsSimulacion;
  arbitraje: KPIsSimulacion;
  estrategiaActiva: EstrategiaDespacho;
  onCambiarEstrategia: (e: EstrategiaDespacho) => void;
}

const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function SeccionComparativaEstrategias({
  greedy,
  arbitraje,
  estrategiaActiva,
  onCambiarEstrategia,
}: Props) {
  const copy = COPY_SFV_BESS.estrategias;
  return (
    <section className="mb-8">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {copy.seccionLabel}
      </p>
      <p className="mb-3 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
        El dispatch operativo aquí mostrado habilita la monetización del
        BESS. El componente económico dominante del proyecto, sin embargo,
        no es el arbitraje energético sino la potencia firme proxy que el
        almacenamiento permite ofrecer en horas críticas. El detalle
        económico se cuantifica en Análisis financiero.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CardEstrategia
          nombre={copy.greedy}
          descripcion={copy.descripcionGreedy}
          kpis={greedy}
          activa={estrategiaActiva === "greedy"}
          onSeleccionar={() => onCambiarEstrategia("greedy")}
        />
        <CardEstrategia
          nombre={copy.arbitraje}
          descripcion={copy.descripcionArbitraje}
          kpis={arbitraje}
          activa={estrategiaActiva === "arbitraje"}
          onSeleccionar={() => onCambiarEstrategia("arbitraje")}
        />
      </div>
    </section>
  );
}

function CardEstrategia({
  nombre,
  descripcion,
  kpis,
  activa,
  onSeleccionar,
}: {
  nombre: string;
  descripcion: string;
  kpis: KPIsSimulacion;
  activa: boolean;
  onSeleccionar: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={activa}
      onClick={onSeleccionar}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSeleccionar();
        }
      }}
      className={[
        "flex cursor-pointer flex-col items-stretch rounded-md bg-white p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30",
        activa
          ? "border-[2px] border-[var(--color-primary)]"
          : "border-[0.5px] border-[var(--color-border-light)] hover:border-[var(--color-border-medium)]",
      ].join(" ")}
    >
      <header className="mb-3">
        <h3 className="text-base font-medium text-[var(--color-text-primary)]">
          {nombre}
        </h3>
        <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
          {descripcion}
        </p>
      </header>
      <dl className="grid grid-cols-3 gap-3 text-[12px]">
        <Mini
          label="Descargado"
          valor={`${FORMATO_1DEC.format(kpis.descargado_total_mwh)} MWh`}
          tooltip={TOOLTIPS_SFV_BESS.energia_despachada}
          etiqueta={`Trazabilidad: descarga estrategia ${nombre}`}
        />
        <Mini
          label="Fracción"
          valor={`${FORMATO_1DEC.format(kpis.fraccion_capturada * 100)}%`}
          tooltip={TOOLTIPS_SFV_BESS.fraccion_capturada}
          etiqueta={`Trazabilidad: fracción captura estrategia ${nombre}`}
        />
        <Mini
          label="Ciclos"
          valor={FORMATO_ENTERO.format(kpis.ciclos_periodo)}
          tooltip={TOOLTIPS_SFV_BESS.ciclos_anuales}
          etiqueta={`Trazabilidad: ciclos estrategia ${nombre}`}
        />
      </dl>
    </div>
  );
}

function Mini({
  label,
  valor,
  tooltip,
  etiqueta,
}: {
  label: string;
  valor: string;
  tooltip: string;
  etiqueta: string;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1">
        <dt className="text-[10px] uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
          {label}
        </dt>
        <InfoTooltip texto={tooltip} etiqueta={etiqueta} />
      </div>
      <dd className="text-[15px] font-medium tabular-nums text-[var(--color-text-primary)]">
        {valor}
      </dd>
    </div>
  );
}
