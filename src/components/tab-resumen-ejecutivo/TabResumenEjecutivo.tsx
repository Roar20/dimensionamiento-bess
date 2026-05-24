import { useMemo } from "react";

import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { ProjectContextHeader } from "@/components/shell/ProjectContextHeader";
import { CATALOGO_HYPERSTRONG as CATALOGO_VIEJO } from "@/lib/bess/catalogo-hyperstrong";
import {
  DOD_DEFAULT,
  construirCategoriasDefault,
  simularUna,
} from "@/lib/core/bess";
import { COPY_RESUMEN_EJECUTIVO } from "@/lib/copy/resumen-ejecutivo";
import { useParametrosPPA } from "@/hooks/useParametrosPPA";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
  KPIsSimulacion,
} from "@/types/bess";
import type { DatosSFV } from "@/types/sfv";

import { CardsOperacion } from "./CardsOperacion";
import { HeroResumen } from "./HeroResumen";
import { SeccionDeDondeSaleEsto } from "./SeccionDeDondeSaleEsto";
import { SeccionShell } from "./SeccionShell";
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
 * Tab Resumen Ejecutivo — scaffold inicial de seis secciones.
 *
 * Estado actual:
 * - Hero, secciones 1, 3 ("Qué pasa hoy", "Recomendación preliminar") y
 *   parte de la 6 quedan como shells: contenido se incorpora post-deck.
 * - Sección 2 ("Qué cambia con almacenamiento") tiene contenido real
 *   para Estanzuela vía CardsOperacion (lectura ejecutiva read-only de
 *   las dos estrategias del motor).
 * - Sección 5 ("Supuestos y alcance") tiene contenido real con los
 *   tres disclaimers despersonalizados.
 *
 * El motor de simulación se invoca aquí en lugar de extraerse a un hook
 * compartido con TabSFVBess: a) cada tab es dueño de su composición de
 * datos, b) la simulación es barata, c) extracción prematura sin
 * tercer consumidor.
 */
export function TabResumenEjecutivo({ datos }: Props) {
  const { config, registros, meta } = datos;
  const { params } = useParametrosPPA(datos);

  const categorias = useMemo<readonly CategoriaEnergia[]>(() => {
    if (!params) return [];
    return construirCategoriasDefault(params);
  }, [params]);

  // Para el resumen ejecutivo se usa la categoría más amplia
  // ("toda_energia") y el equipo de referencia (Cube Plus), igual que
  // el hero de TabSFVBess. Las cards muestran las dos estrategias del
  // motor lado a lado, sin interactividad.
  const categoriaTodaEnergia = useMemo(
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
    if (!configPrincipal || !categoriaTodaEnergia) {
      return { libre: null, restringida: null };
    }
    return {
      libre: simularUna(registros, configPrincipal, categoriaTodaEnergia, "greedy")
        .kpis,
      restringida: simularUna(
        registros,
        configPrincipal,
        categoriaTodaEnergia,
        "arbitraje"
      ).kpis,
    };
  }, [registros, configPrincipal, categoriaTodaEnergia]);

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

      <HeroResumen nombrePlanta={nombrePlanta} />

      <SeccionShell titulo="¿Qué está pasando hoy?" pregunta />

      <SeccionShell titulo="¿Qué cambia con almacenamiento?" pregunta>
        <CardsOperacion
          libre={kpisOperaciones.libre}
          restringida={kpisOperaciones.restringida}
        />
      </SeccionShell>

      <SeccionShell titulo="Recomendación preliminar" />

      <SeccionSupuestosYAlcance />

      <SeccionDeDondeSaleEsto />

      <FooterEstandar
        fuente={`Resumen ejecutivo — ${nombrePlanta}, año ${meta.anio}.`}
        fecha={fechaFooter}
      />
    </div>
  );
}
