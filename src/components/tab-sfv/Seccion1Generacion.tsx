import { useMemo } from "react";

import { COPY_M2 } from "@/lib/copy/modulo-2";
import {
  caracterizarRecurso,
  detectarClipping,
  type ResultadoCaracterizacion,
} from "@/lib/core/sfv";
import { generarNarrativaSeccion1 } from "@/lib/tab-sfv/narrativa";
import type { PeriodoActivo } from "@/lib/tab-sfv/filtrar-por-periodo";
import type { ConfiguracionPlanta, RegistroHorario } from "@/types/sfv";

import { BloqueTecnico } from "./BloqueTecnico";
import { KPICard } from "./KPICard";
import { NarrativaIntro } from "./NarrativaIntro";

interface Props {
  registros: readonly RegistroHorario[];
  config: ConfiguracionPlanta;
  periodo: PeriodoActivo;
}

const FORMATO_MWH = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FORMATO_PCT = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function Seccion1Generacion({ registros, config, periodo }: Props) {
  const copy = COPY_M2.seccion1;

  const { recurso, horasConGen } = useMemo(() => {
    if (registros.length === 0) {
      return {
        recurso: null as ResultadoCaracterizacion | null,
        horasConGen: 0,
      };
    }
    const r = caracterizarRecurso(
      registros as RegistroHorario[],
      config.capacidad_poi_kw,
      config.capacidad_instalada_kw
    );
    const c = detectarClipping(
      registros as RegistroHorario[],
      config.capacidad_poi_kw
    );
    return { recurso: r, horasConGen: c.horas_con_generacion };
  }, [registros, config]);

  if (!recurso) return null;

  return (
    <section className="space-y-5">
      <NarrativaIntro
        titulo={copy.titulo(periodo.label)}
        texto={generarNarrativaSeccion1(recurso, horasConGen, periodo)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label={copy.energia.label}
          valor={FORMATO_MWH.format(recurso.energia_total_mwh)}
          unidad="MWh"
          sublabel={copy.energia.sublabel(periodo.label)}
          tooltip={copy.energia.tooltip}
        />
        <KPICard
          label={copy.horas.label}
          valor={FORMATO_ENTERO.format(horasConGen)}
          unidad="h"
          sublabel={copy.horas.sublabel(recurso.horas_totales)}
          tooltip={copy.horas.tooltip}
        />
        <KPICard
          label={copy.pico.label}
          valor={FORMATO_ENTERO.format(recurso.pico_kw)}
          unidad="kW"
          sublabel={copy.pico.sublabel(recurso.pico_vs_poi_pct)}
          tooltip={copy.pico.tooltip}
        />
        <KPICard
          label={copy.factorPlanta.label}
          valor={FORMATO_PCT.format(recurso.factor_planta_pct)}
          unidad="%"
          sublabel={copy.factorPlanta.sublabel}
          tooltip={copy.factorPlanta.tooltip}
        />
      </div>

      <BloqueTecnico titulo={copy.tecnico.titulo}>
        <dl className="grid gap-3 sm:grid-cols-3">
          <DatoTecnico
            label={copy.tecnico.hse}
            valor={`${recurso.horas_sol_equiv_diaria.toFixed(2)} h`}
          />
          <DatoTecnico
            label={copy.tecnico.factorCap}
            valor={`${recurso.factor_capacidad_pct.toFixed(2)} %`}
          />
          <DatoTecnico
            label={copy.tecnico.diasAnalizados}
            valor={String(recurso.dias_analizados)}
          />
        </dl>
      </BloqueTecnico>
    </section>
  );
}

function DatoTecnico({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-helper">
        {label}
      </dt>
      <dd className="text-sm font-medium text-ink-primary tabular-nums">
        {valor}
      </dd>
    </div>
  );
}
