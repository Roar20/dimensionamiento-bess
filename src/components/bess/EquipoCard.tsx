import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { DOD_PCT, RTE_PCT } from "@/data/parametros-operacion";
import type { EquipoBess } from "@/data/catalogo-hyperstrong";
import { formatearVidaUtil } from "@/data/formatear-equipo";
import { TOOLTIPS_BESS } from "@/data/tooltips-bess";

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
const FORMATO_USD = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

interface Props {
  equipo: EquipoBess;
  tipoCambio: number;
  onAbrirFicha: (equipo: EquipoBess) => void;
}

export function EquipoCard({ equipo, tipoCambio, onAbrirFicha }: Props) {
  const aplicable = equipo.aplicableTequila;
  const potencia =
    equipo.potenciaKvaAc !== null
      ? `${FORMATO_ENTERO.format(equipo.potenciaKvaAc)} kVA`
      : equipo.potenciaKwDc !== null
        ? `${FORMATO_ENTERO.format(equipo.potenciaKwDc)} kW DC`
        : "—";

  const precioUnidadMxn = equipo.precioUsdUnidad * tipoCambio;
  const precioKwhMxn = equipo.precioUsdKwh * tipoCambio;

  return (
    <article
      data-equipo-id={equipo.id}
      className={[
        "flex flex-col rounded-md bg-white p-5 transition-colors",
        aplicable
          ? "border-[2px] border-[var(--color-primary)]"
          : "border-[0.5px] border-[var(--color-border-light)]",
      ].join(" ")}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-medium text-[var(--color-text-primary)]">
            {equipo.nombre}
          </h3>
          <p className="mt-0.5 break-words text-[12px] text-[var(--color-text-tertiary)]">
            {equipo.modelo}
          </p>
        </div>
        {aplicable ? (
          <span className="shrink-0 rounded-full border-[0.5px] border-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary-dark)]">
            Aplicable a Tequila
          </span>
        ) : null}
      </header>

      <SeccionLabel>Datasheet</SeccionLabel>
      <dl className="mb-4 space-y-2 text-[13px]">
        <Fila
          label="Capacidad nominal"
          valor={`${FORMATO_1DEC.format(equipo.energiaKwh)} kWh`}
          tooltip={TOOLTIPS_BESS.capacidad_nominal}
          etiquetaTooltip={`Trazabilidad: capacidad nominal de ${equipo.nombre}`}
        />
        <Fila
          label="Potencia AC PCS"
          valor={potencia}
          tooltip={TOOLTIPS_BESS.potencia_ac_pcs}
          etiquetaTooltip={`Trazabilidad: potencia AC PCS de ${equipo.nombre}`}
        />
        <Fila
          label="Vida útil"
          valor={formatearVidaUtil(equipo.vidaUtilAnos)}
          tooltip={TOOLTIPS_BESS.vida_util}
          etiquetaTooltip={`Trazabilidad: vida útil de ${equipo.nombre}`}
        />
      </dl>

      <SeccionLabel>Operación</SeccionLabel>
      <dl className="mb-4 space-y-2 text-[13px]">
        <Fila
          label="DoD"
          valor={`${DOD_PCT}%`}
          tooltip={TOOLTIPS_BESS.dod}
          etiquetaTooltip="Trazabilidad: DoD del sistema"
        />
        <Fila
          label="RTE"
          valor={`${RTE_PCT}%`}
          tooltip={TOOLTIPS_BESS.rte}
          etiquetaTooltip="Trazabilidad: RTE del sistema"
        />
      </dl>

      <SeccionLabel>Comercial</SeccionLabel>
      <dl className="mb-5 space-y-3 text-[13px]">
        <FilaPrecio
          label="Precio por unidad"
          usd={equipo.precioUsdUnidad}
          mxn={precioUnidadMxn}
          tooltipUsd={TOOLTIPS_BESS.precio_por_kwh}
          tooltipMxn={TOOLTIPS_BESS.precio_mxn}
          etiquetaUsd={`Trazabilidad: precio por unidad de ${equipo.nombre}`}
          etiquetaMxn={`Trazabilidad: conversión MXN del precio por unidad de ${equipo.nombre}`}
        />
        <FilaPrecio
          label="Precio por kWh"
          usd={equipo.precioUsdKwh}
          mxn={precioKwhMxn}
          tooltipUsd={TOOLTIPS_BESS.precio_por_kwh}
          tooltipMxn={TOOLTIPS_BESS.precio_mxn}
          etiquetaUsd={`Trazabilidad: precio por kWh de ${equipo.nombre}`}
          etiquetaMxn={`Trazabilidad: conversión MXN del precio por kWh de ${equipo.nombre}`}
        />
      </dl>

      <div className="mt-auto flex gap-2">
        <Button
          type="button"
          onClick={() => onAbrirFicha(equipo)}
          className="flex-1 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
        >
          Ficha técnica
        </Button>
        <a
          href={equipo.datasheetUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex flex-1 items-center justify-center rounded-input border-[0.5px] border-[var(--color-border-medium)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
        >
          PDF
        </a>
      </div>
    </article>
  );
}

function SeccionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
      {children}
    </p>
  );
}

function Fila({
  label,
  valor,
  tooltip,
  etiquetaTooltip,
}: {
  label: string;
  valor: string;
  tooltip: string;
  etiquetaTooltip: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]">
        <span>{label}</span>
        <InfoTooltip texto={tooltip} etiqueta={etiquetaTooltip} />
      </dt>
      <dd className="text-right tabular-nums text-[var(--color-text-primary)]">
        {valor}
      </dd>
    </div>
  );
}

function FilaPrecio({
  label,
  usd,
  mxn,
  tooltipUsd,
  tooltipMxn,
  etiquetaUsd,
  etiquetaMxn,
}: {
  label: string;
  usd: number;
  mxn: number;
  tooltipUsd: string;
  tooltipMxn: string;
  etiquetaUsd: string;
  etiquetaMxn: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="inline-flex items-center gap-1 pt-0.5 text-[var(--color-text-secondary)]">
        <span>{label}</span>
        <InfoTooltip texto={tooltipUsd} etiqueta={etiquetaUsd} />
      </dt>
      <dd className="text-right">
        <div className="tabular-nums text-[var(--color-text-primary)]">
          USD {FORMATO_USD.format(usd)}
        </div>
        <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] tabular-nums text-[var(--color-text-secondary)]">
          {FORMATO_MXN.format(mxn)}
          <InfoTooltip texto={tooltipMxn} etiqueta={etiquetaMxn} />
        </div>
      </dd>
    </div>
  );
}
