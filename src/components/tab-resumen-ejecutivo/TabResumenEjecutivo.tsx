import { useMemo } from "react";

import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { ProjectContextHeader } from "@/components/shell/ProjectContextHeader";
import { CATALOGO_HYPERSTRONG as CATALOGO_VIEJO } from "@/lib/bess/catalogo-hyperstrong";
import { slugDePlanta } from "@/lib/contrato/derivar";
import {
  DOD_DEFAULT,
  construirCategoriasDefault,
  simularUna,
} from "@/lib/core/bess";
import {
  COPY_PLANTAS_CURADAS,
  COPY_RESUMEN_EJECUTIVO,
  type CopyPlantaCurada,
} from "@/lib/copy/resumen-ejecutivo";
import { useParametrosPPA } from "@/hooks/useParametrosPPA";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
  KPIsSimulacion,
} from "@/types/bess";
import type { DatosSFV } from "@/types/sfv";

import { SeccionDeDondeSaleEsto } from "./SeccionDeDondeSaleEsto";
import { SeccionHero } from "./SeccionHero";
import { SeccionQueCambia } from "./SeccionQueCambia";
import { SeccionQuePasaHoy } from "./SeccionQuePasaHoy";
import { SeccionRecomendacionPreliminar } from "./SeccionRecomendacionPreliminar";
import { SeccionSupuestosYAlcance } from "./SeccionSupuestosYAlcance";

interface Props {
  datos: DatosSFV;
}

const FECHA_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Tab Resumen Ejecutivo — narrativa de junta separada de los tabs de
 * análisis. Seis secciones en orden de aparición:
 *   1. Hero (apertura por planta, sin encabezado).
 *   2. ¿Qué está pasando hoy? (estado observable curado).
 *   3. ¿Qué cambia con almacenamiento? (visual+narrativa por planta).
 *   4. Recomendación preliminar (card curada).
 *   5. Supuestos y alcance (universal — disclaimers).
 *   6. ¿De dónde sale esto? (universal — trazabilidad, accordion).
 *
 * Las secciones 1, 2, 3, 4 leen del mapa `COPY_PLANTAS_CURADAS` con
 * clave = `slugDePlanta(config.nombre)`. Si la planta no existe en el
 * mapa, cada sección degrada a "vacío honesto" — nunca renderiza copy
 * de otra planta. La sección 3 elige visual (`cards-operacion` vs
 * `factor-generacion`) leyendo del propio mapa, sin hardcodear nombres.
 *
 * Las secciones 3 (cards) y 5/6 corren del motor / son universales:
 * se renderizan igual para cualquier planta con datos cargados.
 */
export function TabResumenEjecutivo({ datos }: Props) {
  const { config, registros, meta } = datos;
  const { params } = useParametrosPPA(datos);

  const plantaId = useMemo(
    () => slugDePlanta(config.nombre || ""),
    [config.nombre]
  );
  const copyCurado: CopyPlantaCurada | null =
    COPY_PLANTAS_CURADAS[plantaId] ?? null;

  const categorias = useMemo<readonly CategoriaEnergia[]>(() => {
    if (!params) return [];
    return construirCategoriasDefault(params);
  }, [params]);

  // Las cards de operación libre/restringida usan `toda_energia` como
  // base del contraste operativo. La frontera contractual (categoría
  // `arriba_compromiso_ppa`) sigue pendiente de validar con el offtaker;
  // el disclaimer correspondiente vive en la sección 5.
  const categoriaBase = useMemo(
    () => categorias.find((c) => c.tipo === "toda_energia") ?? null,
    [categorias]
  );

  const equipoPrincipal = useMemo(
    () => CATALOGO_VIEJO.find((e) => e.id === "hypercube-plus"),
    []
  );

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

  const kpisOperaciones = useMemo<{
    libre: KPIsSimulacion | null;
    restringida: KPIsSimulacion | null;
  }>(() => {
    if (!configPrincipal || !categoriaBase) {
      return { libre: null, restringida: null };
    }
    return {
      libre: simularUna(registros, configPrincipal, categoriaBase, "greedy")
        .kpis,
      restringida: simularUna(
        registros,
        configPrincipal,
        categoriaBase,
        "arbitraje"
      ).kpis,
    };
  }, [registros, configPrincipal, categoriaBase]);

  const fechaFooter = (() => {
    try {
      return FECHA_FORMATTER.format(new Date(meta.fecha_carga));
    } catch {
      return meta.fecha_carga;
    }
  })();

  const nombrePlanta = config.nombre || "la planta";

  return (
    <div>
      <ProjectContextHeader
        titulo={COPY_RESUMEN_EJECUTIVO.tab.tituloPagina(config.nombre || "")}
        meta={{
          anio: meta.anio,
          totalRegistros: meta.total_horas,
          poiKw: config.capacidad_poi_kw,
          zonaLmp: config.zona_lmp,
        }}
      />

      <SeccionContextoTab />

      <SeccionHero curado={copyCurado} nombrePlanta={nombrePlanta} />

      <SeccionQuePasaHoy curado={copyCurado} />

      <SeccionQueCambia
        curado={copyCurado}
        datosVisual={{
          registros,
          capacidadPoiKw: config.capacidad_poi_kw,
          capacidadCargaBessKw: configPrincipal?.p_kw ?? 0,
        }}
        kpisOperaciones={kpisOperaciones}
      />

      <SeccionRecomendacionPreliminar curado={copyCurado} />

      <SeccionSupuestosYAlcance />

      <SeccionDeDondeSaleEsto />

      <FooterEstandar
        fuente={`Resumen ejecutivo — ${nombrePlanta}, año ${meta.anio}.`}
        fecha={fechaFooter}
      />
    </div>
  );
}

function SeccionContextoTab() {
  const c = COPY_RESUMEN_EJECUTIVO.contextoTab;
  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {c.kicker}
      </p>
      <p className="max-w-[680px] text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
        {c.intro}
      </p>
    </section>
  );
}
