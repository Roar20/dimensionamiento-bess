import { useMemo, useState } from "react";

import { SelectorTemporal } from "@/components/tab-sfv/SelectorTemporal";
import { usePeriodoActivo } from "@/hooks/usePeriodoActivo";
import { useParametrosPPA } from "@/hooks/useParametrosPPA";
import { useConfiguracionBESS } from "@/hooks/useConfiguracionBESS";
import {
  calcularKPIs,
  construirCategoriasDefault,
  simularCompleto,
} from "@/lib/core/bess";
import {
  contarDiasDistintos,
  filtrarSimulacion,
} from "@/lib/tab-sfv-bess/filtrar-detalle-por-periodo";
import type { DatosSFV } from "@/types/sfv";
import type { Granularidad } from "@/lib/tab-sfv/filtrar-por-periodo";
import type {
  ResultadoCompleto,
  ResultadoSimulacion,
  SeleccionCategoria,
} from "@/types/bess";

import { HeroNarrativo } from "./HeroNarrativo";
import { Seccion1ConfiguracionEquipo } from "./Seccion1ConfiguracionEquipo";
import { Seccion2AnatomiaCaptura } from "./Seccion2AnatomiaCaptura";
import { Seccion3DespachoDiario } from "./Seccion3DespachoDiario";
import { Seccion4CapturaPorPeriodo } from "./Seccion4CapturaPorPeriodo";
import { Seccion5Comparativa } from "./Seccion5Comparativa";
import { Seccion6Resumen } from "./Seccion6Resumen";
import { SelectorCategoriaCompacto } from "./SelectorCategoriaCompacto";
import { compararEstrategias } from "@/lib/tab-sfv-bess/recomendar-estrategia";
import { generarResumenEjecutivo } from "@/lib/tab-sfv-bess/narrativa";

const GRANULARIDADES_SFV_BESS: readonly Granularidad[] = [
  "anual",
  "semestral",
  "trimestral",
  "mensual",
  "semanal",
  "diario",
];

interface Props {
  datos: DatosSFV;
}

export function TabSFVBess({ datos }: Props) {
  const periodo = usePeriodoActivo(datos);
  const { params } = useParametrosPPA(datos);
  const [seleccion, setSeleccion] = useState<SeleccionCategoria>("ninguna");

  const config = useConfiguracionBESS(datos, params, seleccion);

  const categorias = useMemo(() => {
    if (!params) return [];
    return construirCategoriasDefault(params);
  }, [params]);

  const resultadoCompletoAnual = useMemo(() => {
    if (categorias.length === 0) return null;
    return simularCompleto(
      datos.registros,
      config.configuracionBESS,
      categorias
    );
  }, [datos.registros, config.configuracionBESS, categorias]);

  /** Resultado filtrado al periodo activo + KPIs recalculados sobre ese subset. */
  const resultadoCompleto: ResultadoCompleto | null = useMemo(() => {
    if (!resultadoCompletoAnual) return null;
    return {
      config: resultadoCompletoAnual.config,
      simulaciones: resultadoCompletoAnual.simulaciones.map((s) => {
        const filtrado = filtrarSimulacion(s, periodo.periodo);
        return {
          ...filtrado,
          kpis: calcularKPIs(filtrado.detalle_horario, filtrado.config),
        };
      }),
    };
  }, [resultadoCompletoAnual, periodo.periodo]);

  const simActiva = useMemo(() => {
    if (!resultadoCompleto) return { greedy: null, arbitraje: null };
    const tipoActivo =
      seleccion === "ninguna" ? "fuera_hora_punta_cfe" : seleccion;
    const greedy =
      resultadoCompleto.simulaciones.find(
        (s) => s.categoria.tipo === tipoActivo && s.estrategia === "greedy"
      ) ?? null;
    const arbitraje =
      resultadoCompleto.simulaciones.find(
        (s) => s.categoria.tipo === tipoActivo && s.estrategia === "arbitraje"
      ) ?? null;
    return { greedy, arbitraje } as {
      greedy: ResultadoSimulacion | null;
      arbitraje: ResultadoSimulacion | null;
    };
  }, [resultadoCompleto, seleccion]);

  const nDiasPeriodo = useMemo(() => {
    if (!simActiva.greedy) return 0;
    return contarDiasDistintos(simActiva.greedy.detalle_horario);
  }, [simActiva.greedy]);

  const labelDiaUnico =
    periodo.granularidad === "diario" && periodo.periodo
      ? periodo.periodo.label
      : undefined;

  return (
    <div>
      <HeroNarrativo capacidad_poi_kw={datos.config.capacidad_poi_kw} />

      <SelectorTemporal
        granularidad={periodo.granularidad}
        setGranularidad={periodo.setGranularidad}
        periodo={periodo.periodo}
        periodos={periodo.periodosDisponibles}
        irAnterior={periodo.irAnterior}
        irSiguiente={periodo.irSiguiente}
        hayAnterior={periodo.hayAnterior}
        haySiguiente={periodo.haySiguiente}
        seleccionarPorId={periodo.seleccionarPorId}
        granularidadesDisponibles={GRANULARIDADES_SFV_BESS}
      />

      <div className="container mx-auto max-w-[1080px] space-y-12 px-4 py-8">
        <Seccion1ConfiguracionEquipo
          equipoSeleccionado={config.equipoSeleccionado}
          multiplicador={config.multiplicador}
          equipoRecomendado={config.equipoRecomendado}
          min={config.MULTIPLICADOR_MIN}
          max={config.MULTIPLICADOR_MAX}
          setEquipo={config.setEquipo}
          setMultiplicador={config.setMultiplicador}
        />

        <SelectorCategoriaCompacto
          seleccion={seleccion}
          resumenes={config.resumenes}
          onSeleccionar={setSeleccion}
        />

        <Seccion2AnatomiaCaptura resultado={resultadoCompleto} />

        <Seccion3DespachoDiario
          simGreedy={simActiva.greedy}
          simArbitraje={simActiva.arbitraje}
          config={config.configuracionBESS}
          nDias={nDiasPeriodo}
          labelDiaUnico={labelDiaUnico}
        />

        <Seccion4CapturaPorPeriodo
          simArbitraje={simActiva.arbitraje}
          granularidad={periodo.granularidad}
        />

        <Seccion5Comparativa
          simGreedy={simActiva.greedy}
          simArbitraje={simActiva.arbitraje}
        />

        {simActiva.greedy && simActiva.arbitraje && periodo.periodo ? (
          <Seccion6Resumen
            bullets={generarResumenEjecutivo({
              totalEnergiaSFV_mwh: simActiva.arbitraje.detalle_horario.reduce(
                (s, e) => s + e.gen_mwh,
                0
              ),
              equipo: config.equipoSeleccionado,
              multiplicador: config.multiplicador,
              config: config.configuracionBESS,
              simArbitraje: simActiva.arbitraje,
              comparativa: compararEstrategias(
                simActiva.greedy,
                simActiva.arbitraje
              ),
              poi_kw: datos.config.capacidad_poi_kw,
              periodoLabel: periodo.periodo.label,
            })}
          />
        ) : null}
      </div>
    </div>
  );
}
