import { useEffect, useMemo, useState } from "react";

import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { ProjectContextHeader } from "@/components/shell/ProjectContextHeader";
import { ensureChartJsRegistered } from "@/components/tab-sfv/chart-setup";
import { CATALOGO_HYPERSTRONG as CATALOGO_VIEJO } from "@/lib/bess/catalogo-hyperstrong";
import {
  DOD_DEFAULT,
  construirCategoriasDefault,
  simularUna,
} from "@/lib/core/bess";
import {
  calcularCapex,
  calcularIngresoAnual,
  calcularPaybackPreliminar,
} from "@/lib/tab-sfv-bess/economia-preliminar";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import { useParametrosPPA } from "@/hooks/useParametrosPPA";
import { usePreciosProxy } from "@/hooks/usePreciosProxy";
import { useTipoCambio } from "@/hooks/useTipoCambio";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
  EstrategiaDespacho,
} from "@/types/bess";
import type { DatosSFV } from "@/types/sfv";

import { BandaKPIsSFVBess } from "./BandaKPIsSFVBess";
import { FiltrosAnalisisSFVBess } from "./FiltrosAnalisisSFVBess";
import { HeroCapturaCiclosSFVBess } from "./HeroCapturaCiclosSFVBess";
import { LecturaEjecutivaSFVBess } from "./LecturaEjecutivaSFVBess";
import { MetodologiaSFVBess } from "./MetodologiaSFVBess";
import { PanelPreciosEditables } from "./PanelPreciosEditables";
import { SeccionCapturaPorPeriodo } from "./SeccionCapturaPorPeriodo";
import { SeccionComparacionConfiguraciones } from "./SeccionComparacionConfiguraciones";
import { SeccionComparativaEquipos } from "./SeccionComparativaEquipos";
import { SeccionComparativaEstrategias } from "./SeccionComparativaEstrategias";
import { SeccionDespachoDiarioPromedio } from "./SeccionDespachoDiarioPromedio";

interface Props {
  datos: DatosSFV;
}

const FECHA_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

ensureChartJsRegistered();

export function TabSFVBess({ datos }: Props) {
  const { config, registros, meta } = datos;
  const { params } = useParametrosPPA(datos);
  const preciosProxy = usePreciosProxy();
  const tipoCambioState = useTipoCambio();
  const { precios } = preciosProxy;
  const { tipoCambio } = tipoCambioState;

  const categorias = useMemo<readonly CategoriaEnergia[]>(() => {
    if (!params) return [];
    return construirCategoriasDefault(params);
  }, [params]);

  // Defaults que producen señal: toda_energia entrega el universo total
  // capturable. Greedy es la estrategia simple de referencia.
  const [categoriaTipo, setCategoriaTipo] = useState<CategoriaEnergia["tipo"]>(
    "toda_energia"
  );
  const [estrategia, setEstrategia] = useState<EstrategiaDespacho>("greedy");

  useEffect(() => {
    if (categorias.length === 0) return;
    const existe = categorias.some((c) => c.tipo === categoriaTipo);
    if (!existe) setCategoriaTipo(categorias[0]!.tipo);
  }, [categorias, categoriaTipo]);

  const categoriaActiva = useMemo(
    () => categorias.find((c) => c.tipo === categoriaTipo) ?? null,
    [categorias, categoriaTipo]
  );

  // Equipo "principal" para BandaKPIs, charts y lectura ejecutiva: Cube
  // Plus (escala C&I conservadora, alineada con los precios proxy
  // actuales). El usuario compara los 3 abajo en SeccionComparativaEquipos.
  const equipoPrincipal = useMemo(
    () => CATALOGO_VIEJO.find((e) => e.id === "hypercube-plus"),
    []
  );
  const nombreEquipoPrincipal = "Cube Plus";

  const configPrincipal = useMemo<ConfiguracionBESS | null>(() => {
    if (!equipoPrincipal) return null;
    return {
      p_kw: equipoPrincipal.kw_ac,
      e_kwh: equipoPrincipal.kwh,
      dod: DOD_DEFAULT,
      rte: equipoPrincipal.eficiencia_max,
      soc_inicial_kwh: 0,
    };
  }, [equipoPrincipal]);

  const simulacionPrincipal = useMemo(() => {
    if (!configPrincipal || !categoriaActiva) return null;
    return {
      greedy: simularUna(registros, configPrincipal, categoriaActiva, "greedy"),
      arbitraje: simularUna(
        registros,
        configPrincipal,
        categoriaActiva,
        "arbitraje"
      ),
    };
  }, [registros, configPrincipal, categoriaActiva]);

  const activa =
    simulacionPrincipal === null
      ? null
      : estrategia === "greedy"
        ? simulacionPrincipal.greedy
        : simulacionPrincipal.arbitraje;

  const economia = useMemo(() => {
    if (!activa || !equipoPrincipal) return null;
    const capex = calcularCapex(
      equipoPrincipal.precio_usd,
      equipoPrincipal.precio_usd / equipoPrincipal.kwh,
      tipoCambio
    );
    const ingreso = calcularIngresoAnual(activa.kpis, precios);
    const payback = calcularPaybackPreliminar(
      capex.capex_mxn,
      ingreso.total_mxn
    );
    return { capex, ingreso, payback };
  }, [activa, equipoPrincipal, precios, tipoCambio]);

  const fechaFooter = (() => {
    try {
      return FECHA_FORMATTER.format(new Date(meta.fecha_carga));
    } catch {
      return meta.fecha_carga;
    }
  })();

  return (
    <div>
      <ProjectContextHeader
        titulo={
          config.nombre
            ? `Análisis del SFV + BESS — ${config.nombre}`
            : "Análisis del SFV + BESS"
        }
        meta={{
          anio: meta.anio,
          totalRegistros: meta.total_horas,
          poiKw: config.capacidad_poi_kw,
          zonaLmp: config.zona_lmp,
        }}
      />

      <PanelPreciosEditables
        precios={precios}
        setPrecio={preciosProxy.setPrecio}
        reset={preciosProxy.reset}
        esProxy={preciosProxy.esProxy}
        tipoCambio={tipoCambio}
        setTipoCambio={tipoCambioState.setTipoCambio}
      />

      {categorias.length > 0 && (
        <FiltrosAnalisisSFVBess
          categorias={categorias}
          categoriaTipo={categoriaTipo}
          onCambiarCategoria={setCategoriaTipo}
        />
      )}

      {!activa || !simulacionPrincipal ? (
        <p className="mb-8 rounded-md border-[0.5px] border-[var(--color-border-light)] bg-white p-5 text-[13px] text-[var(--color-text-secondary)]">
          Sin parámetros PPA o categorías disponibles para simular el BESS.
        </p>
      ) : (
        <>
          <LecturaEjecutivaSFVBess
            energiaCapturadaMwh={activa.kpis.cargado_total_mwh}
            ciclosAnuales={Math.round(activa.kpis.ciclos_periodo)}
            paybackAnios={economia?.payback.payback_anios ?? null}
            estrategia={estrategia}
            equipoNombre={nombreEquipoPrincipal}
          />

          <BandaKPIsSFVBess
            cargadoMwh={activa.kpis.cargado_total_mwh}
            descargadoMwh={activa.kpis.descargado_total_mwh}
            fraccionCapturada={activa.kpis.fraccion_capturada}
            ciclosAnuales={Math.round(activa.kpis.ciclos_periodo)}
          />

          {categoriaActiva ? (
            <HeroCapturaCiclosSFVBess
              configNombre={nombreEquipoPrincipal}
              fraccionCapturada={activa.kpis.fraccion_capturada}
              ciclosAnuales={Math.round(activa.kpis.ciclos_periodo)}
              categoria={categoriaActiva}
            />
          ) : null}

          <SeccionDespachoDiarioPromedio
            detalle={activa.detalle_horario}
            capUtilKwh={activa.kpis.soc_max_kwh}
          />

          <SeccionCapturaPorPeriodo
            detalle={activa.detalle_horario}
            categoriaEtiqueta={categoriaActiva?.etiqueta ?? "—"}
            nombrePlanta={config.nombre || "el SFV"}
            poiKw={config.capacidad_poi_kw}
          />

          <SeccionComparativaEstrategias
            greedy={simulacionPrincipal.greedy.kpis}
            arbitraje={simulacionPrincipal.arbitraje.kpis}
            estrategiaActiva={estrategia}
            onCambiarEstrategia={setEstrategia}
          />

          {categoriaActiva && (
            <SeccionComparacionConfiguraciones
              registros={registros}
              categoriaActiva={categoriaActiva}
            />
          )}

          <SeccionComparativaEquipos
            registros={registros}
            categoriaActiva={categoriaActiva}
            estrategia={estrategia}
            precios={precios}
            tipoCambio={tipoCambio}
          />
        </>
      )}

      <MetodologiaSFVBess
        nombrePlanta={config.nombre || null}
        anio={meta.anio}
      />

      <FooterEstandar
        fuente={COPY_SFV_BESS.footer.fuente(config.nombre || "—", meta.anio)}
        fecha={fechaFooter}
      />
    </div>
  );
}
