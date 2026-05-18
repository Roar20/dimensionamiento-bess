import { useMemo } from "react";

import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { LecturaEjecutiva } from "@/components/ui/LecturaEjecutiva";
import {
  calcularPerfilHorario,
  caracterizarRecurso,
  estadisticasExcedenteDiario,
} from "@/lib/core/sfv";
import { agregarPorMes } from "@/lib/tab-sfv/agregaciones-mensuales";
import type { DatosSFV } from "@/types/sfv";

import { BandaKpis } from "./BandaKpis";
import { ChartExcedentesMensuales } from "./ChartExcedentesMensuales";
import { ChartPerfilHorario } from "./ChartPerfilHorario";
import { HeaderDossier } from "./HeaderDossier";
import { MetodologiaSFV } from "./MetodologiaSFV";
import { MiniKpisExcedentesDiarios } from "./MiniKpisExcedentesDiarios";
import { TablaResumenMensual } from "./TablaResumenMensual";
import { ensureChartJsRegistered } from "./chart-setup";

interface Props {
  datos: DatosSFV;
}

const UMBRAL_GENERACION_KW = 50;
const HORAS_ANIO = 8760;

const FECHA_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

ensureChartJsRegistered();

export function TabSFV({ datos }: Props) {
  const { config, registros, meta } = datos;

  const indicadores = useMemo(() => {
    const car = caracterizarRecurso(
      registros,
      config.capacidad_poi_kw,
      config.capacidad_instalada_kw
    );
    const perfil = calcularPerfilHorario(registros);

    let horas_con_gen = 0;
    let suma_kw = 0;
    for (const r of registros) {
      const kW = r.energia_mwh * 1000;
      if (kW >= UMBRAL_GENERACION_KW) {
        horas_con_gen += 1;
        suma_kw += kW;
      }
    }
    const potencia_promedio_kw =
      horas_con_gen > 0 ? suma_kw / horas_con_gen : 0;
    const factor_capacidad_anual_pct =
      (car.energia_total_mwh * 1000) / (config.capacidad_poi_kw * HORAS_ANIO) *
      100;

    return {
      generacion_mwh: car.energia_total_mwh,
      pico_kw: car.pico_kw,
      dias_operativos: car.dias_analizados,
      factor_capacidad_pct: factor_capacidad_anual_pct,
      horas_con_gen,
      potencia_promedio_kw,
      pct_del_poi:
        config.capacidad_poi_kw > 0
          ? (potencia_promedio_kw / config.capacidad_poi_kw) * 100
          : 0,
      ventana_diurna_horas:
        perfil.hora_inicio_generacion !== null &&
        perfil.hora_fin_generacion !== null
          ? perfil.hora_fin_generacion - perfil.hora_inicio_generacion + 1
          : 0,
    };
  }, [registros, config.capacidad_poi_kw, config.capacidad_instalada_kw]);

  const excedentesDiarios = useMemo(
    () => estadisticasExcedenteDiario(registros, config.capacidad_poi_kw),
    [registros, config.capacidad_poi_kw]
  );

  const resumenMensual = useMemo(
    () => agregarPorMes(registros, config.capacidad_poi_kw),
    [registros, config.capacidad_poi_kw]
  );

  const excedentePorDia = useMemo(() => {
    const poiMwhH = config.capacidad_poi_kw / 1000;
    const acc = new Map<string, number>();
    for (const r of registros) {
      const y = r.timestamp.getFullYear();
      const m = String(r.timestamp.getMonth() + 1).padStart(2, "0");
      const d = String(r.timestamp.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      const exc = Math.max(0, r.energia_mwh - poiMwhH);
      acc.set(key, (acc.get(key) ?? 0) + exc);
    }
    return acc;
  }, [registros, config.capacidad_poi_kw]);

  const mejoresDiaKwhPorMes = useMemo(() => {
    const out = new Map<string, number>();
    for (const m of resumenMensual) {
      if (!m.mejor_dia_fecha) continue;
      const mes = `${m.anio}-${String(m.mes + 1).padStart(2, "0")}`;
      const excMwh = excedentePorDia.get(m.mejor_dia_fecha) ?? 0;
      out.set(mes, excMwh * 1000);
    }
    return out;
  }, [resumenMensual, excedentePorDia]);

  const lecturaEjecutiva = construirLecturaEjecutiva({
    factor_capacidad_pct: indicadores.factor_capacidad_pct,
    pico_vs_poi_pct:
      config.capacidad_poi_kw > 0
        ? (indicadores.pico_kw / config.capacidad_poi_kw) * 100
        : 0,
    ventana_diurna_horas: indicadores.ventana_diurna_horas,
    excedente_promedio_kwh: excedentesDiarios.promedio_kwh,
  });

  const fechaFooter = (() => {
    try {
      return FECHA_FORMATTER.format(new Date(meta.fecha_carga));
    } catch {
      return meta.fecha_carga;
    }
  })();

  return (
    <div>
      <HeaderDossier
        nombrePlanta={config.nombre || null}
        anio={meta.anio}
        totalRegistros={meta.total_horas}
        poiKw={config.capacidad_poi_kw}
        zonaLmp={config.zona_lmp}
      />

      <BandaKpis
        generacionAnualMwh={indicadores.generacion_mwh}
        factorCapacidadPct={indicadores.factor_capacidad_pct}
        poiKw={config.capacidad_poi_kw}
        horasConGeneracion={indicadores.horas_con_gen}
        horasCalendarioTotales={meta.total_horas}
        potenciaPromedioKw={indicadores.potencia_promedio_kw}
        pctDelPoi={indicadores.pct_del_poi}
        diasOperativos={indicadores.dias_operativos}
      />

      <LecturaEjecutiva texto={lecturaEjecutiva} />

      <ChartPerfilHorario registros={registros} />
      <ChartExcedentesMensuales
        registros={registros}
        poiKw={config.capacidad_poi_kw}
      />

      <MiniKpisExcedentesDiarios stats={excedentesDiarios} />

      <TablaResumenMensual
        resumen={resumenMensual}
        mejoresDiaKwhPorMes={mejoresDiaKwhPorMes}
      />

      <MetodologiaSFV
        totalRegistros={meta.total_horas}
        nombrePlanta={config.nombre || null}
        anio={meta.anio}
        poiKw={config.capacidad_poi_kw}
      />

      <FooterEstandar
        fuente={`Fuente: cincominutales SFV ${
          config.nombre || "—"
        } · año base ${meta.anio}`}
        fecha={fechaFooter}
      />
    </div>
  );
}

const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

function construirLecturaEjecutiva(args: {
  factor_capacidad_pct: number;
  pico_vs_poi_pct: number;
  ventana_diurna_horas: number;
  excedente_promedio_kwh: number;
}): string {
  // Si el pico anual está cerca o por encima del POI, la planta sí toca el
  // techo con frecuencia (clipping efectivo); cambia la primera frase.
  const tocaPoi = args.pico_vs_poi_pct >= 95;
  const apertura = tocaPoi
    ? `El SFV toca con frecuencia el techo del POI`
    : `El SFV opera consistentemente por debajo del POI`;
  const ventana = args.ventana_diurna_horas > 0 ? args.ventana_diurna_horas : 0;
  return (
    `${apertura} con un factor de capacidad de ${FORMATO_1DEC.format(args.factor_capacidad_pct)}%. ` +
    `La generación se concentra en una ventana diurna de ~${ventana} horas con excedentes diarios promedio de ${FORMATO_ENTERO.format(args.excedente_promedio_kwh)} kWh, ` +
    `definiendo el potencial técnico de captura para almacenamiento.`
  );
}
