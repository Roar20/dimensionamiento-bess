import { useMemo } from "react";

import { CATALOGO_HYPERSTRONG as CATALOGO_NUEVO } from "@/data/catalogo-hyperstrong";
import { CATALOGO_HYPERSTRONG as CATALOGO_VIEJO } from "@/lib/bess/catalogo-hyperstrong";
import {
  DOD_DEFAULT,
  simularUna,
} from "@/lib/core/bess";
import {
  esFueraDeEscala,
  idViejoDeEquipoNuevo,
  razonFueraDeEscala,
} from "@/lib/tab-sfv-bess/comparativa-equipos";
import {
  calcularCapex,
  calcularIngresoAnual,
  calcularPaybackPreliminar,
} from "@/lib/tab-sfv-bess/economia-preliminar";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import type { PreciosProxy } from "@/hooks/usePreciosProxy";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
  EstrategiaDespacho,
} from "@/types/bess";
import type { RegistroHorario } from "@/types/sfv";

import {
  CardEquipoComparativo,
  type SimulacionEquipo,
} from "./CardEquipoComparativo";

interface Props {
  registros: readonly RegistroHorario[];
  categoriaActiva: CategoriaEnergia | null;
  estrategia: EstrategiaDespacho;
  precios: PreciosProxy;
  tipoCambio: number;
}

export function SeccionComparativaEquipos({
  registros,
  categoriaActiva,
  estrategia,
  precios,
  tipoCambio,
}: Props) {
  const tarjetas = useMemo(() => {
    return CATALOGO_NUEVO.map((equipoNuevo) => {
      const fuera = esFueraDeEscala(equipoNuevo);
      const razon = razonFueraDeEscala(equipoNuevo);
      const capex = calcularCapex(
        equipoNuevo.precioUsdUnidad,
        equipoNuevo.precioUsdKwh,
        tipoCambio
      );

      let simulacion: SimulacionEquipo | null = null;
      if (!fuera && categoriaActiva) {
        const idViejo = idViejoDeEquipoNuevo(equipoNuevo);
        const equipoViejo = CATALOGO_VIEJO.find((e) => e.id === idViejo);
        if (equipoViejo) {
          const config: ConfiguracionBESS = {
            p_kw: equipoViejo.kw_ac,
            e_kwh: equipoViejo.kwh,
            dod: DOD_DEFAULT,
            rte: equipoViejo.eficiencia_max,
            soc_inicial_kwh: 0,
          };
          const sim = simularUna(registros, config, categoriaActiva, estrategia);
          const kpis = sim.kpis;
          const ingreso = calcularIngresoAnual(kpis, precios);
          const payback = calcularPaybackPreliminar(
            capex.capex_mxn,
            ingreso.total_mxn
          );
          const rteEfectivo =
            kpis.cargado_total_mwh > 0
              ? kpis.descargado_total_mwh / kpis.cargado_total_mwh
              : null;
          simulacion = {
            descargadoMwh: kpis.descargado_total_mwh,
            ciclosAnuales: Math.round(kpis.ciclos_periodo),
            fraccionCapturada: kpis.fraccion_capturada,
            rteEfectivo,
            ingresoAnualMxn: ingreso.total_mxn,
            paybackAnios: payback.payback_anios,
          };
        }
      }

      return {
        equipo: equipoNuevo,
        fuera,
        razon,
        capexMxn: capex.capex_mxn,
        capexUsd: equipoNuevo.precioUsdUnidad,
        simulacion,
      };
    });
  }, [registros, categoriaActiva, estrategia, precios, tipoCambio]);

  const estrategiaLabel =
    estrategia === "greedy"
      ? COPY_SFV_BESS.estrategias.greedy
      : COPY_SFV_BESS.estrategias.arbitraje;

  return (
    <section className="mb-8">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {COPY_SFV_BESS.comparativaEquipos.seccionLabel}
      </p>
      <p
        data-testid="contexto-lectura-equipos"
        className="mb-4 text-[12px] text-[var(--color-text-tertiary)]"
      >
        {COPY_SFV_BESS.comparativaEquipos.contextoLectura(estrategiaLabel)}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tarjetas.map((t) => (
          <CardEquipoComparativo
            key={t.equipo.id}
            equipo={t.equipo}
            fueraDeEscala={t.fuera}
            razonFueraDeEscala={t.razon}
            capexMxn={t.capexMxn}
            capexUsd={t.capexUsd}
            simulacion={t.simulacion}
          />
        ))}
      </div>
    </section>
  );
}
