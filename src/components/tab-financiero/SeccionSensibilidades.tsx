import { useMemo } from "react";

import {
  calcularPaybackInterpolado,
  calcularTIR,
  proyectar20Anios,
  type EntradasProyeccion,
} from "@/lib/tab-financiero/calculos";

interface Props {
  /** Entradas base del escenario "Base". Las sensibilidades aplican
   *  factores escalares sobre precios, CAPEX y FF (factor escalar de
   *  potencia firme, sin re-dispatch). */
  entradas_base: EntradasProyeccion;
}

const FMT_NUM = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

type Escenario = {
  nombre: "Conservador" | "Base" | "Optimista";
  ajuste_precios: number;
  ajuste_capex: number;
  ff: number;
  variante: "conservador" | "base" | "optimista";
};

const ESCENARIOS: readonly Escenario[] = [
  {
    nombre: "Conservador",
    ajuste_precios: 0.85,
    ajuste_capex: 1.10,
    ff: 0.60,
    variante: "conservador",
  },
  {
    nombre: "Base",
    ajuste_precios: 1.0,
    ajuste_capex: 1.0,
    ff: 0.80,
    variante: "base",
  },
  {
    nombre: "Optimista",
    ajuste_precios: 1.10,
    ajuste_capex: 0.95,
    ff: 0.90,
    variante: "optimista",
  },
];

export function SeccionSensibilidades({ entradas_base }: Props) {
  const resultados = useMemo(() => {
    return ESCENARIOS.map((esc) => {
      // Aplica el escenario a las entradas: precios escalados, CAPEX
      // escalado. El FF se aplica como factor escalar sobre la potencia
      // firme proxy (no requiere re-dispatch).
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
          Tres escenarios sobre la configuración actual. Conservador aplica
          precios −15%, CAPEX +10%, factor de potencia firme 60%. Base usa
          los valores actuales del panel y FF 80%. Optimista aplica precios
          +10%, CAPEX −5%, FF 90%. El FF se aplica como factor escalar a la
          potencia firme proxy; no se recorre el dispatch.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {resultados.map(({ esc, payback, tir, capex }) => (
          <Card
            key={esc.nombre}
            nombre={esc.nombre}
            variante={esc.variante}
            ajuste_precios={esc.ajuste_precios}
            ajuste_capex={esc.ajuste_capex}
            ff={esc.ff}
            payback={payback}
            tir={tir}
            capex_mxn={capex}
          />
        ))}
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
        <p className="text-[14px] font-medium leading-tight">{nombre}</p>
        <p className="text-[11px] opacity-90">
          Precios ×{ajuste_precios.toFixed(2)} · CAPEX ×{ajuste_capex.toFixed(2)} · FF {(ff * 100).toFixed(0)}%
        </p>
      </div>
      <div className="px-4 py-3">
        <Fila
          label="Payback"
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
