import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { TOOLTIPS_SFV_BESS } from "@/data/tooltips-sfv-bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import type { EquipoBess } from "@/data/catalogo-hyperstrong";

const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FORMATO_MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
const FORMATO_USD = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export type SimulacionEquipo = {
  descargadoMwh: number;
  ciclosAnuales: number;
  fraccionCapturada: number;
  rteEfectivo: number | null;
  ingresoAnualMxn: number;
  paybackAnios: number | null;
};

interface Props {
  equipo: EquipoBess;
  fueraDeEscala: boolean;
  razonFueraDeEscala: string | null;
  capexMxn: number;
  capexUsd: number;
  simulacion: SimulacionEquipo | null;
}

const EM_DASH = "—";

export function CardEquipoComparativo({
  equipo,
  fueraDeEscala,
  razonFueraDeEscala,
  capexMxn,
  capexUsd,
  simulacion,
}: Props) {
  return (
    <article
      data-equipo-id={equipo.id}
      className={[
        "flex flex-col rounded-md bg-white p-5",
        fueraDeEscala
          ? "border-[0.5px] border-[var(--color-border-light)]"
          : "border-[2px] border-[var(--color-primary)]",
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
        {fueraDeEscala ? (
          <span className="shrink-0 rounded-full border-[0.5px] border-[var(--color-border-medium)] bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
            {COPY_SFV_BESS.comparativaEquipos.fueraDeEscala}
          </span>
        ) : null}
      </header>

      {fueraDeEscala && razonFueraDeEscala ? (
        <p className="mb-4 text-[12px] text-[var(--color-text-secondary)]">
          {razonFueraDeEscala}
        </p>
      ) : null}

      <SeccionLabel>Datasheet</SeccionLabel>
      <dl className="mb-4 space-y-2 text-[13px]">
        <Fila
          label="Arquitectura"
          valor={equipo.arquitectura}
          tooltip={TOOLTIPS_SFV_BESS.arquitectura}
          etiquetaTooltip={`Trazabilidad: arquitectura ${equipo.nombre}`}
        />
        <Fila
          label="Capacidad nominal"
          valor={`${FORMATO_1DEC.format(equipo.energiaKwh)} kWh`}
        />
        <Fila
          label="Potencia AC PCS"
          valor={
            equipo.potenciaKvaAc !== null
              ? `${FORMATO_ENTERO.format(equipo.potenciaKvaAc)} kVA`
              : EM_DASH
          }
        />
      </dl>

      <SeccionLabel>Simulación</SeccionLabel>
      <dl className="mb-4 space-y-2 text-[13px]">
        <Fila
          label="Descargado anual"
          valor={
            simulacion
              ? `${FORMATO_1DEC.format(simulacion.descargadoMwh)} MWh`
              : EM_DASH
          }
          mute={!simulacion}
        />
        <Fila
          label="Ciclos anuales"
          valor={
            simulacion ? FORMATO_ENTERO.format(simulacion.ciclosAnuales) : EM_DASH
          }
          mute={!simulacion}
        />
        <Fila
          label="Fracción capturada"
          valor={
            simulacion
              ? `${FORMATO_1DEC.format(simulacion.fraccionCapturada * 100)}%`
              : EM_DASH
          }
          mute={!simulacion}
        />
        <Fila
          label="RTE efectivo"
          valor={
            simulacion && simulacion.rteEfectivo !== null
              ? `${FORMATO_1DEC.format(simulacion.rteEfectivo * 100)}%`
              : EM_DASH
          }
          mute={!simulacion || simulacion.rteEfectivo === null}
        />
      </dl>

      <SeccionLabel>Economía</SeccionLabel>
      <dl className="mb-5 space-y-2 text-[13px]">
        <Fila
          label="Ingreso anual estimado"
          valor={
            simulacion
              ? FORMATO_MXN.format(simulacion.ingresoAnualMxn)
              : EM_DASH
          }
          tooltip={TOOLTIPS_SFV_BESS.ingreso_anual}
          etiquetaTooltip={`Trazabilidad: ingreso anual ${equipo.nombre}`}
          mute={!simulacion}
        />
        <Fila
          label="Payback preliminar"
          valor={
            simulacion && simulacion.paybackAnios !== null
              ? `${FORMATO_1DEC.format(simulacion.paybackAnios)} años`
              : EM_DASH
          }
          tooltip={TOOLTIPS_SFV_BESS.payback_preliminar}
          etiquetaTooltip={`Trazabilidad: payback ${equipo.nombre}`}
          mute={!simulacion || simulacion.paybackAnios === null}
        />
      </dl>

      <SeccionLabel>Comercial</SeccionLabel>
      <dl className="space-y-2 text-[13px]">
        <Fila
          label="CAPEX"
          valor={`USD ${FORMATO_USD.format(capexUsd)}`}
        />
        <FilaMxn
          label="CAPEX (MXN)"
          valor={FORMATO_MXN.format(capexMxn)}
          tooltip={TOOLTIPS_SFV_BESS.capex_mxn}
          etiquetaTooltip={`Trazabilidad: CAPEX MXN ${equipo.nombre}`}
        />
      </dl>
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

interface FilaProps {
  label: string;
  valor: string;
  tooltip?: string;
  etiquetaTooltip?: string;
  mute?: boolean;
}

function Fila({ label, valor, tooltip, etiquetaTooltip, mute }: FilaProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]">
        <span>{label}</span>
        {tooltip && etiquetaTooltip ? (
          <InfoTooltip texto={tooltip} etiqueta={etiquetaTooltip} />
        ) : null}
      </dt>
      <dd
        className={[
          "text-right tabular-nums",
          mute
            ? "text-[var(--color-text-tertiary)]"
            : "text-[var(--color-text-primary)]",
        ].join(" ")}
      >
        {valor}
      </dd>
    </div>
  );
}

function FilaMxn({
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
      <dd className="text-right tabular-nums text-[var(--color-text-secondary)]">
        {valor}
      </dd>
    </div>
  );
}
