import { useMemo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calcularPaybackInterpolado,
  calcularTIR,
  proyectar20Anios,
  type EntradasProyeccion,
  type FlujoAnual,
} from "@/lib/tab-financiero/calculos";

interface Props {
  /**
   * Entradas base del hero. Sirven para reescalar precios/CAPEX/pfirme en
   * Conservador y Optimista. Para Base NO se recalcula: se reusa el array
   * `flujos_base` para garantizar identidad exacta con el hero.
   */
  entradas_base: EntradasProyeccion;
  /** Flujos del hero. La card "Base" reusa este array sin recalcular. */
  flujos_base: readonly FlujoAnual[];
}

const FMT_NUM = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

type Escenario = {
  nombre: "Conservador" | "Optimista";
  ajuste_precios: number;
  ajuste_capex: number;
  ff: number;
  variante: "conservador" | "optimista";
};

const ESCENARIOS_AJUSTABLES: readonly Escenario[] = [
  {
    nombre: "Conservador",
    ajuste_precios: 0.85,
    ajuste_capex: 1.10,
    ff: 0.75,
    variante: "conservador",
  },
  {
    nombre: "Optimista",
    ajuste_precios: 1.10,
    ajuste_capex: 0.95,
    ff: 1.25,
    variante: "optimista",
  },
];

export function SeccionSensibilidades({ entradas_base, flujos_base }: Props) {
  // Conservador y Optimista: se recalculan con ajustes relativos.
  const escenariosCalculados = useMemo(() => {
    return ESCENARIOS_AJUSTABLES.map((esc) => {
      const entradas: EntradasProyeccion = {
        ...entradas_base,
        capex_mxn: entradas_base.capex_mxn * esc.ajuste_capex,
        precio_energia_mxn_mwh:
          entradas_base.precio_energia_mxn_mwh * esc.ajuste_precios,
        precio_cel_mxn: entradas_base.precio_cel_mxn * esc.ajuste_precios,
        precio_potencia_firme_mxn_mw_mes:
          entradas_base.precio_potencia_firme_mxn_mw_mes * esc.ajuste_precios,
        potencia_firme_kw: entradas_base.potencia_firme_kw * esc.ff,
      };
      const flujos = proyectar20Anios(entradas);
      return {
        esc,
        payback: calcularPaybackInterpolado(flujos),
        tir: calcularTIR(flujos),
        capex: entradas.capex_mxn,
      };
    });
  }, [entradas_base]);

  // Base: reuse del array del hero. Identidad por construcción.
  const baseResultado = useMemo(
    () => ({
      payback: calcularPaybackInterpolado(flujos_base),
      tir: calcularTIR(flujos_base),
      capex: entradas_base.capex_mxn,
    }),
    [flujos_base, entradas_base.capex_mxn]
  );

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Sensibilidades
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Conservador · Base · Optimista
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          La card <strong className="font-medium">Base</strong> reusa el
          mismo array de flujos del hero — son idénticas por construcción,
          sin recálculo. Conservador aplica precios −15%, CAPEX +10%, FF
          0.75× sobre el proxy actual. Optimista aplica precios +10%, CAPEX
          −5%, FF 1.25×. El FF escala la potencia firme proxy; no se
          recorre el dispatch.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card
          nombre={ESCENARIOS_AJUSTABLES[0]!.nombre}
          variante={ESCENARIOS_AJUSTABLES[0]!.variante}
          ajuste_precios={ESCENARIOS_AJUSTABLES[0]!.ajuste_precios}
          ajuste_capex={ESCENARIOS_AJUSTABLES[0]!.ajuste_capex}
          ff={ESCENARIOS_AJUSTABLES[0]!.ff}
          payback={escenariosCalculados[0]!.payback}
          tir={escenariosCalculados[0]!.tir}
          capex_mxn={escenariosCalculados[0]!.capex}
        />
        <Card
          nombre="Base"
          variante="base"
          ajuste_precios={1.0}
          ajuste_capex={1.0}
          ff={1.0}
          payback={baseResultado.payback}
          tir={baseResultado.tir}
          capex_mxn={baseResultado.capex}
        />
        <Card
          nombre={ESCENARIOS_AJUSTABLES[1]!.nombre}
          variante={ESCENARIOS_AJUSTABLES[1]!.variante}
          ajuste_precios={ESCENARIOS_AJUSTABLES[1]!.ajuste_precios}
          ajuste_capex={ESCENARIOS_AJUSTABLES[1]!.ajuste_capex}
          ff={ESCENARIOS_AJUSTABLES[1]!.ff}
          payback={escenariosCalculados[1]!.payback}
          tir={escenariosCalculados[1]!.tir}
          capex_mxn={escenariosCalculados[1]!.capex}
        />
      </div>
    </section>
  );
}

function Card({
  nombre,
  variante,
  ajuste_precios,
  ajuste_capex,
  ff,
  payback,
  tir,
  capex_mxn,
}: {
  nombre: string;
  variante: "conservador" | "base" | "optimista";
  ajuste_precios: number;
  ajuste_capex: number;
  ff: number;
  payback: number | null;
  tir: number | null;
  capex_mxn: number;
}) {
  const colorBg =
    variante === "base"
      ? "bg-[#0F766E] text-white"
      : variante === "optimista"
        ? "bg-[#065F46] text-white"
        : "bg-[#92400E] text-white";
  return (
    <div className="overflow-hidden rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
      <div className={`px-4 py-3 ${colorBg}`}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[14px] font-medium leading-tight">{nombre}</p>
          {variante === "base" ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium tracking-wide">
                    = hero
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] leading-snug">
                  Idéntico al escenario del Hero. Esta tarjeta reusa el mismo
                  array de flujos por construcción, no recalcula.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
        <p className="text-[11px] opacity-90">
          Precios ×{ajuste_precios.toFixed(2)} · CAPEX ×{ajuste_capex.toFixed(2)} · FF {(ff * 100).toFixed(0)}%
        </p>
      </div>
      <div className="px-4 py-3">
        <Fila
          label="Payback BESS"
          valor={payback !== null ? `${FMT_NUM.format(payback)} años` : ">20 años"}
        />
        <Fila
          label="TIR preliminar"
          valor={tir !== null ? `${(tir * 100).toFixed(1)}%` : "n/d"}
        />
        <Fila
          label="CAPEX escenario"
          valor={`${FMT_NUM.format(capex_mxn / 1_000_000)} M MXN`}
        />
      </div>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between border-t-[0.5px] border-[var(--color-border-light)] py-1.5 first:border-t-0">
      <span className="text-[12px] text-[var(--color-text-secondary)]">
        {label}
      </span>
      <span className="text-[14px] font-medium tabular-nums text-[var(--color-text-primary)]">
        {valor}
      </span>
    </div>
  );
}
