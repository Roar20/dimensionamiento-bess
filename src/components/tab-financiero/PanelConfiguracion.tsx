import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";
import type { ParametrosFinancieros } from "@/hooks/useParametrosFinancieros";

import { formatoCompleto } from "@/lib/tab-financiero/formato-monetario";
import { COPY_TAB_FINANCIERO } from "@/lib/copy/tab-financiero";

const COPY_CAMPOS = COPY_TAB_FINANCIERO.panelConfiguracion.campos;

interface Props {
  params: ParametrosFinancieros;
  capex_catalogo_mxn: number;
  onChange: (parcial: Partial<ParametrosFinancieros>) => void;
  onResetCapex: () => void;
}

export function PanelConfiguracion({
  params,
  capex_catalogo_mxn,
  onChange,
  onResetCapex,
}: Props) {
  return (
    <section className="mb-8 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
      <details className="panel-config-details">
        <summary className="panel-config-summary flex cursor-pointer items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="panel-config-indicator inline-block h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-[var(--color-text-tertiary)] transition-transform" />
            <div>
              <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
                Configuración modelada
              </h2>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Modelo en vivo · recalcula con cada cambio
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-medium text-[#065F46]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            en vivo
          </span>
        </summary>

        <div className="mt-4">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <CampoSelector
          label="Equipo Hyperstrong"
          valor={params.equipo_id}
          opciones={CATALOGO_HYPERSTRONG.map((e) => ({
            valor: e.id,
            etiqueta: `${e.nombre.replace("HyperCube C&I II ", "Cube ").replace("Hyper", "")} (${e.energiaKwh.toFixed(0)} kWh)`,
          }))}
          onChange={(v) =>
            onChange({ equipo_id: v as ParametrosFinancieros["equipo_id"] })
          }
        />

        <CampoNumero
          label="Número de unidades"
          valor={params.numero_unidades}
          min={1}
          step={1}
          onChange={(n) => onChange({ numero_unidades: Math.max(1, Math.round(n)) })}
        />

        <CampoCapex
          valor_actual={
            params.capex_override_mxn !== null
              ? params.capex_override_mxn
              : capex_catalogo_mxn
          }
          es_override={params.capex_override_mxn !== null}
          capex_catalogo={capex_catalogo_mxn}
          onChange={(n) => onChange({ capex_override_mxn: n })}
          onReset={onResetCapex}
        />

        <CampoNumero
          label="OPEX anual (% sobre CAPEX)"
          valor={params.opex_tasa_anual * 100}
          min={0}
          step={0.1}
          sufijo="%"
          onChange={(n) =>
            onChange({ opex_tasa_anual: Math.max(0, n / 100) })
          }
        />

        <CampoNumero
          label={COPY_CAMPOS.wacc.label}
          tooltip={COPY_CAMPOS.wacc.tooltip}
          valor={params.wacc_pct * 100}
          min={0}
          step={0.5}
          sufijo="%"
          onChange={(n) => onChange({ wacc_pct: Math.max(0, n / 100) })}
        />

        <CampoSlider
          label="Sensibilidad operativa · factor de producción"
          valor_pct={params.factor_produccion * 100}
          onChange={(pct) =>
            onChange({ factor_produccion: pct / 100 })
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 border-t-[0.5px] border-[var(--color-border-light)] pt-4">
        <CampoNumero
          label="Precio energía PPA (MXN/MWh)"
          valor={params.precio_energia_mxn_mwh}
          min={0}
          step={1}
          onChange={(n) =>
            onChange({ precio_energia_mxn_mwh: Math.max(0, n) })
          }
        />
        <CampoNumero
          label="Precio CEL (MXN/CEL)"
          valor={params.precio_cel_mxn}
          min={0}
          step={1}
          onChange={(n) =>
            onChange({ precio_cel_mxn: Math.max(0, n) })
          }
        />
        <CampoNumero
          label={COPY_CAMPOS.precioPotenciaFirme.label}
          tooltip={COPY_CAMPOS.precioPotenciaFirme.tooltip}
          valor={params.precio_potencia_firme_mxn_mw_mes}
          min={0}
          step={1000}
          onChange={(n) =>
            onChange({ precio_potencia_firme_mxn_mw_mes: Math.max(0, n) })
          }
        />
        <CampoNumero
          label={COPY_CAMPOS.zonaNodal.label}
          tooltip={COPY_CAMPOS.zonaNodal.tooltip}
          valor={params.lmp_mxn_mwh}
          min={0}
          step={1}
          onChange={(n) => onChange({ lmp_mxn_mwh: Math.max(0, n) })}
        />
        <CampoNumero
          label={COPY_CAMPOS.diferencialPuntaValle.label}
          tooltip={COPY_CAMPOS.diferencialPuntaValle.tooltip}
          valor={params.diferencial_lmp_pct * 100}
          min={0}
          step={1}
          sufijo="%"
          ayuda={COPY_CAMPOS.diferencialPuntaValle.ayuda}
          onChange={(n) =>
            onChange({ diferencial_lmp_pct: Math.max(0, n / 100) })
          }
        />
        <CampoSliderCredibilidad
          valor={params.factor_credibilidad_pfirme}
          onChange={(pct) =>
            onChange({
              factor_credibilidad_pfirme: Math.max(0, Math.min(1, pct / 100)),
            })
          }
        />
        </div>
        </div>
      </details>
      <style>{`
        .panel-config-details > .panel-config-summary::-webkit-details-marker { display: none; }
        .panel-config-details > .panel-config-summary { list-style: none; }
        .panel-config-details[open] > .panel-config-summary .panel-config-indicator { transform: rotate(90deg); }
      `}</style>
    </section>
  );
}

function CampoSelector({
  label,
  valor,
  opciones,
  onChange,
}: {
  label: string;
  valor: string;
  opciones: readonly { valor: string; etiqueta: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[6px] border-[0.5px] border-[var(--color-border-light)] bg-white px-3 py-2 text-[13px] text-[var(--color-text-primary)]"
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}

function CampoNumero({
  label,
  valor,
  min,
  step,
  sufijo,
  ayuda,
  tooltip,
  onChange,
}: {
  label: string;
  valor: number;
  min?: number;
  step?: number;
  sufijo?: string;
  ayuda?: string;
  /** Texto del tooltip al hover/focus del ícono info junto al label. */
  tooltip?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
        {label}
        {tooltip ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Información sobre ${label}`}
                  className="inline-flex h-3.5 w-3.5 items-center justify-center text-[var(--color-text-tertiary)] outline-none transition-colors hover:text-[var(--color-text-secondary)]"
                >
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[320px] leading-snug">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={valor}
          min={min}
          step={step}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
          className="w-full rounded-[6px] border-[0.5px] border-[var(--color-border-light)] bg-white px-3 py-2 text-[13px] tabular-nums text-[var(--color-text-primary)]"
        />
        {sufijo ? (
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            {sufijo}
          </span>
        ) : null}
      </div>
      {ayuda ? (
        <span className="text-[10px] text-[var(--color-text-tertiary)]">
          {ayuda}
        </span>
      ) : null}
    </label>
  );
}

function CampoCapex({
  valor_actual,
  es_override,
  capex_catalogo,
  onChange,
  onReset,
}: {
  valor_actual: number;
  es_override: boolean;
  capex_catalogo: number;
  onChange: (n: number) => void;
  onReset: () => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
        CAPEX (MXN)
        {es_override ? (
          <span className="ml-1 text-[#B45309]">· override</span>
        ) : (
          <span className="ml-1 text-[var(--color-text-tertiary)]">
            · auto del catálogo
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={Math.round(valor_actual)}
          min={0}
          step={10000}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
          className="w-full rounded-[6px] border-[0.5px] border-[var(--color-border-light)] bg-white px-3 py-2 text-[13px] tabular-nums text-[var(--color-text-primary)]"
        />
        {es_override ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-[6px] border-[0.5px] border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)] hover:bg-white"
          >
            Reset
          </button>
        ) : null}
      </div>
      {es_override ? (
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          Catálogo: {formatoCompleto(capex_catalogo)}
        </span>
      ) : null}
    </label>
  );
}

function CampoSlider({
  label,
  valor_pct,
  onChange,
}: {
  label: string;
  valor_pct: number;
  onChange: (pct: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
          {label}
        </span>
        <span className="text-[13px] font-medium tabular-nums text-[var(--color-text-primary)]">
          {valor_pct.toFixed(0)}%
        </span>
      </div>
      <input
        type="range"
        min={100}
        max={200}
        step={5}
        value={valor_pct}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)]">
        <span>100% base</span>
        <span>150%</span>
        <span>200% óptimo</span>
      </div>
    </label>
  );
}

function CampoSliderCredibilidad({
  valor,
  onChange,
}: {
  /** Valor entre 0 y 1. */
  valor: number;
  /** Recibe el porcentaje 0..100. */
  onChange: (pct: number) => void;
}) {
  const pct = Math.round(valor * 100);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
        {COPY_CAMPOS.factorCredibilidadPfirme.label}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Información sobre ${COPY_CAMPOS.factorCredibilidadPfirme.label}`}
                className="inline-flex h-3.5 w-3.5 items-center justify-center text-[var(--color-text-tertiary)] outline-none transition-colors hover:text-[var(--color-text-secondary)]"
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px] leading-snug">
              {COPY_CAMPOS.factorCredibilidadPfirme.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <span className="text-[11px] text-[var(--color-text-secondary)]">
        Factor de credibilidad potencia firme proxy: {pct}%
      </span>
    </label>
  );
}
