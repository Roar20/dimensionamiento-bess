import { useMemo } from "react";

import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { HallazgoEjecutivo } from "@/components/ui/HallazgoEjecutivo";
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
const UMBRAL_EXCEDENTE_ANUAL_MWH = 1;

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
      hora_pico: perfil.hora_pico,
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

  const excedenteAnualMwh = useMemo(
    () => resumenMensual.reduce((acc, m) => acc + m.excedente_mwh, 0),
    [resumenMensual]
  );

  const sinExcedentes = excedenteAnualMwh < UMBRAL_EXCEDENTE_ANUAL_MWH;

  // Mejor día del mes en kWh = generación bruta del día con mayor MWh.
  // (FIX E: antes pasábamos el excedente del mejor día, que en plantas sin
  // excedentes da 0 kWh. La columna "Mejor día" muestra generación, no
  // excedente.)
  const mejoresDiaKwhPorMes = useMemo(() => {
    const out = new Map<string, number>();
    for (const m of resumenMensual) {
      if (!m.mejor_dia_fecha) continue;
      const clave = `${m.anio}-${String(m.mes + 1).padStart(2, "0")}`;
      out.set(clave, m.mejor_dia_mwh * 1000);
    }
    return out;
  }, [resumenMensual]);

  const lecturaEjecutiva = construirLecturaEjecutiva({
    factor_capacidad_pct: indicadores.factor_capacidad_pct,
    pico_vs_poi_pct:
      config.capacidad_poi_kw > 0
        ? (indicadores.pico_kw / config.capacidad_poi_kw) * 100
        : 0,
    ventana_diurna_horas: indicadores.ventana_diurna_horas,
    hora_pico: indicadores.hora_pico,
    excedente_promedio_kwh: excedentesDiarios.promedio_kwh,
    sin_excedentes: sinExcedentes,
  });

  const parrafosHallazgo = useMemo(() => {
    const horasCal = meta.total_horas;
    const picoKw = indicadores.pico_kw;
    const pctPoi =
      config.capacidad_poi_kw > 0
        ? (picoKw / config.capacidad_poi_kw) * 100
        : 0;
    return [
      `El SFV opera consistentemente por debajo del POI: ${FORMATO_ENTERO.format(horasCal)} horas sin clipping, pico anual ${FORMATO_1DEC.format(picoKw)} kW (${FORMATO_ENTERO.format(pctPoi)}% del techo CFE). No hay energía solar perdida por restricción de inyección.`,
      "La oportunidad de almacenamiento se evalúa por desplazamiento horario y potencia firme, no por captura de excedentes.",
    ];
  }, [meta.total_horas, indicadores.pico_kw, config.capacidad_poi_kw]);

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
        anio={meta.anio}
      />

      <LecturaEjecutiva texto={lecturaEjecutiva} />

      <ChartPerfilHorario registros={registros} />

      {sinExcedentes ? (
        <PlaceholderExcedentesMensuales />
      ) : (
        <ChartExcedentesMensuales
          registros={registros}
          poiKw={config.capacidad_poi_kw}
        />
      )}

      {sinExcedentes ? (
        <HallazgoEjecutivo
          titulo="Sin excedentes físicos en el año base"
          parrafos={parrafosHallazgo}
          ctaLabel="Ver Tab SFV + BESS"
          ctaHref="/sfv-bess"
        />
      ) : (
        <MiniKpisExcedentesDiarios stats={excedentesDiarios} />
      )}

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
  hora_pico: number;
  excedente_promedio_kwh: number;
  sin_excedentes: boolean;
}): string {
  const fc = FORMATO_1DEC.format(args.factor_capacidad_pct);
  const ventana = args.ventana_diurna_horas > 0 ? args.ventana_diurna_horas : 0;

  if (args.sin_excedentes) {
    const horaPicoStr = String(args.hora_pico).padStart(2, "0");
    return (
      `El SFV opera consistentemente por debajo del POI con un factor de capacidad de ${fc}%. ` +
      `La generación se concentra en una ventana diurna de ${ventana} horas con pico promedio cerca de las ${horaPicoStr}:00 y sin excedentes físicos capturables ` +
      `— la oportunidad de almacenamiento se evalúa por arbitraje horario y potencia firme bajo régimen CNE 2026.`
    );
  }

  const apertura =
    args.pico_vs_poi_pct >= 95
      ? `El SFV toca con frecuencia el techo del POI`
      : `El SFV opera consistentemente por debajo del POI`;
  return (
    `${apertura} con un factor de capacidad de ${fc}%. ` +
    `La generación se concentra en una ventana diurna de ~${ventana} horas con excedentes diarios promedio de ${FORMATO_ENTERO.format(args.excedente_promedio_kwh)} kWh, ` +
    `definiendo el potencial técnico de captura para almacenamiento.`
  );
}

function PlaceholderExcedentesMensuales() {
  return (
    <section className="mb-8">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Excedentes mensuales
          </h2>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Energía generada por encima del techo POI agregada por mes
          </p>
        </div>
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          MWh/mes
        </span>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-6 text-center text-[13px] text-[var(--color-text-secondary)]">
        Sin excedentes mensuales sobre POI durante el año base.
      </div>
    </section>
  );
}
