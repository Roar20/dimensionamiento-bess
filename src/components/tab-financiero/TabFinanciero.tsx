import { useMemo } from "react";

import { ProjectContextHeader } from "@/components/shell/ProjectContextHeader";
import { ensureChartJsRegistered } from "@/components/tab-sfv/chart-setup";
import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";
import {
  aplicarFactorProduccion,
  calcularCapturaExcedentesAnio,
  calcularPaybackInterpolado,
  calcularPotenciaFirmeProxy,
  calcularTIR,
  calcularVPN,
  proyectar20Anios,
  sumarDescargadoEnPunta,
} from "@/lib/tab-financiero/calculos";
import { formatoCompacto } from "@/lib/tab-financiero/formato-monetario";
import { COPY_TAB_FINANCIERO } from "@/lib/copy/tab-financiero";
import { DOD_DEFAULT, simularUna } from "@/lib/core/bess";
import { useParametrosFinancieros } from "@/hooks/useParametrosFinancieros";
import { useTipoCambio } from "@/hooks/useTipoCambio";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
} from "@/types/bess";
import type { DatosSFV } from "@/types/sfv";

import { COPY_PROXY_PFIRME } from "./copy-proxy-pfirme";
import { DisclaimerTransversal } from "./DisclaimerTransversal";
import { MetodologiaFinanciero } from "./MetodologiaFinanciero";
import { PanelConfiguracion } from "./PanelConfiguracion";
// SeccionBreakdownIngresos: removida del render por redundancia con el
// master chart, el waterfall simplificado, la comparativa y la tabla
// anual. El archivo se conserva en el filesystem por si fuera necesario
// restaurarla.
import { SeccionComparativa } from "./SeccionComparativa";
import { SeccionEvolucionEconomica } from "./SeccionEvolucionEconomica";
import { SeccionFlujoAcumulado } from "./SeccionFlujoAcumulado";
import { SeccionGeneracionFactor } from "./SeccionGeneracionFactor";
import { SeccionHero } from "./SeccionHero";
import { SeccionSensibilidades } from "./SeccionSensibilidades";
import { SeccionSohErosion } from "./SeccionSohErosion";
import { SeccionWaterfall } from "./SeccionWaterfall";
import { TablaAnual21 } from "./TablaAnual21";

interface Props {
  datos: DatosSFV;
}

ensureChartJsRegistered();

const VENTANA_PUNTA: readonly [number, number] = [18, 22];

const CATEGORIA_TODA_ENERGIA: CategoriaEnergia = {
  tipo: "toda_energia",
  etiqueta: "Toda la energía",
  descripcion: "Universo total capturable; el modelo financiero no acota la energía cargable.",
};

const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function TabFinanciero({ datos }: Props) {
  const { params, actualizar } = useParametrosFinancieros();
  const { tipoCambio } = useTipoCambio();
  const { registros } = datos;

  const calculo = useMemo(() => {
    const equipo =
      CATALOGO_HYPERSTRONG.find((e) => e.id === params.equipo_id) ??
      CATALOGO_HYPERSTRONG[0]!;
    const n = params.numero_unidades;
    const p_kw_unidad =
      equipo.potenciaKvaAc ?? equipo.potenciaKwDc ?? 0;
    const config: ConfiguracionBESS = {
      p_kw: p_kw_unidad * n,
      e_kwh: equipo.energiaKwh * n,
      dod: DOD_DEFAULT,
      rte: 0.85,
      soc_inicial_kwh: 0,
    };
    const capexCatalogo =
      equipo.precioUsdUnidad * n * tipoCambio;
    const capex =
      params.capex_override_mxn !== null
        ? params.capex_override_mxn
        : capexCatalogo;

    const registrosAjustados = aplicarFactorProduccion(
      registros,
      params.factor_produccion
    );
    const POI_kw = datos.config.capacidad_poi_kw;
    // Generación entregable al POI: lo que el SFV realmente vende al PPA.
    // Con factor 1.0 y pico < POI, equivale al total generado. Con factor
    // > 1, descuenta la fracción que excede POI (curtailment sin BESS).
    const generacion_entregable_mwh = registrosAjustados.reduce(
      (s, r) => s + Math.min(r.potencia_kw_prom, POI_kw) / 1000,
      0
    );
    const generacion_total_mwh = registrosAjustados.reduce(
      (s, r) => s + r.energia_mwh,
      0
    );

    const resultado = simularUna(
      registrosAjustados,
      config,
      CATEGORIA_TODA_ENERGIA,
      "arbitraje"
    );
    const detalle = resultado.detalle_horario;
    const kpis = resultado.kpis;

    const potencia_firme_kw = calcularPotenciaFirmeProxy(
      detalle,
      VENTANA_PUNTA,
      params.factor_credibilidad_pfirme
    );
    const descargado_punta_mwh = sumarDescargadoEnPunta(
      detalle,
      VENTANA_PUNTA
    );

    // Captura de excedentes: energía que excede POI capturable por el BESS.
    // Para una planta cuyo pico está por debajo del POI con factor_produccion = 1
    // es ~0. Con factor > 1 emerge captura real.
    const captura_excedentes_mwh = calcularCapturaExcedentesAnio(
      registrosAjustados,
      POI_kw,
      config.p_kw,
      config.rte
    );

    const flujos = proyectar20Anios({
      captura_excedentes_anio1_mwh: captura_excedentes_mwh,
      descargado_anio1_punta_mwh: descargado_punta_mwh,
      generacion_anual_mwh: generacion_entregable_mwh,
      potencia_firme_kw,
      curva_soh: equipo.curvaSoh,
      capex_mxn: capex,
      opex_tasa_anual: params.opex_tasa_anual,
      precio_energia_mxn_mwh: params.precio_energia_mxn_mwh,
      precio_cel_mxn: params.precio_cel_mxn,
      precio_potencia_firme_mxn_mw_mes:
        params.precio_potencia_firme_mxn_mw_mes,
      lmp_mxn_mwh: params.lmp_mxn_mwh,
      diferencial_lmp_pct: params.diferencial_lmp_pct,
    });

    const payback = calcularPaybackInterpolado(flujos);
    const tir = calcularTIR(flujos);
    const vpn = calcularVPN(flujos, params.wacc_pct);

    // INFORMATIVOS para narrativa, NO para payback.
    const ingreso_sfv_solo_anio1 =
      (flujos[1]?.ingreso_ppa_generacion_mxn ?? 0) +
      (flujos[1]?.ingreso_cels_mxn ?? 0);
    const ingreso_incremental_bess_anio1 =
      flujos[1]?.ingreso_incremental_bess_mxn ?? 0;
    const ingreso_proyecto_anio1 =
      flujos[1]?.ingreso_proyecto_total_mxn ?? 0;
    // Acumulado del incremental BESS sobre 20 años (con SOH aplicado).
    const ingreso_incremental_acumulado = flujos
      .slice(1)
      .reduce((s, f) => s + f.ingreso_incremental_bess_mxn, 0);
    const ingreso_proyecto_acumulado = flujos
      .slice(1)
      .reduce((s, f) => s + f.ingreso_proyecto_total_mxn, 0);
    const captura_excedentes_anio1_mwh = captura_excedentes_mwh;

    const horas_en_operacion = detalle.filter(
      (e) => e.descargado_kwh > 0 || e.cargado_kwh > 0
    ).length;
    const utilizacion_pct =
      detalle.length > 0
        ? (horas_en_operacion / detalle.length) * 100
        : 0;

    return {
      equipo,
      config,
      capex,
      capex_catalogo: capexCatalogo,
      generacion_entregable_mwh,
      generacion_total_mwh,
      kpis,
      detalle,
      potencia_firme_kw,
      descargado_punta_mwh,
      flujos,
      payback,
      tir,
      vpn,
      ingreso_sfv_solo_anio1,
      ingreso_incremental_bess_anio1,
      ingreso_proyecto_anio1,
      ingreso_incremental_acumulado,
      ingreso_proyecto_acumulado,
      utilizacion_pct,
      captura_excedentes_anio1_mwh,
      registros_ajustados: registrosAjustados,
    };
  }, [registros, params, tipoCambio, datos.config.capacidad_poi_kw]);

  // KPI hero. Hero limpio (6 cards). El distintivo "proyecto" vs "BESS
  // incremental" se comunica con sublabel + agrupación visual, sin saturar.
  const heroKpis = useMemo(
    () => [
      {
        label: "Payback BESS",
        valor:
          calculo.payback !== null
            ? `${FMT_PCT.format(calculo.payback)} años`
            : ">20 años",
        sublabel: "Solo flujo incremental",
        destacar: true,
      },
      {
        label: COPY_TAB_FINANCIERO.hero.aporteBess.label,
        valor: formatoCompacto(calculo.ingreso_incremental_bess_anio1),
        sublabel: COPY_TAB_FINANCIERO.hero.aporteBess.sublabel,
        destacar: true,
        badge: COPY_TAB_FINANCIERO.hero.aporteBess.badge,
        badge_tooltip: COPY_PROXY_PFIRME,
      },
      {
        label: "Acumulado BESS · 20 años",
        valor: formatoCompacto(calculo.ingreso_incremental_acumulado),
        sublabel: "Con SOH aplicado",
      },
      {
        label: "Proyecto total · año 1",
        valor: formatoCompacto(calculo.ingreso_proyecto_anio1),
        sublabel: "SFV existente + aporte BESS",
        secundaria: true,
      },
      {
        label: "Utilización BESS",
        valor: `${FMT_PCT.format(calculo.utilizacion_pct)}%`,
        sublabel: "Horas/año en operación",
      },
      {
        label: "CAPEX BESS",
        valor: formatoCompacto(calculo.capex),
        sublabel: `${calculo.config.e_kwh.toFixed(0)} kWh totales`,
      },
    ],
    [calculo]
  );

  return (
    <div>
      <ProjectContextHeader
        titulo={
          datos.config.nombre
            ? `Valor incremental del BESS sobre un SFV existente — ${datos.config.nombre}`
            : "Valor incremental del BESS sobre un SFV existente"
        }
        meta={{
          anio: datos.meta.anio,
          totalRegistros: datos.meta.total_horas,
          poiKw: datos.config.capacidad_poi_kw,
          zonaLmp: datos.config.zona_lmp,
        }}
      />
      <p className="mb-8 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
        El SFV ya produce ingreso por sí mismo. Este modelo cuantifica
        únicamente el valor incremental que el BESS suma, cómo evoluciona
        bajo degradación SOH a 20 años, y cuándo se paga.
      </p>

      <DisclaimerTransversal />

      <SeccionHero kpis={heroKpis} />

      <PanelConfiguracion
        params={params}
        capex_catalogo_mxn={calculo.capex_catalogo}
        onChange={actualizar}
        onResetCapex={() => actualizar({ capex_override_mxn: null })}
      />

      {params.factor_produccion > 1 ? (
        <div className="mb-6 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-3 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Sensibilidad operativa del perfil:
          </strong>{" "}
          el factor {(params.factor_produccion * 100).toFixed(0)}% modela
          condiciones operativas óptimas sobre el perfil horario (tracker
          alineado, strings limpios, irradiancia favorable). No representa
          ampliación de capacidad CFE ni overbuild adicional del SFV; la
          generación que excede POI sin BESS se perdería por curtailment.
        </div>
      ) : null}

      <SeccionGeneracionFactor
        registros_ajustados={calculo.registros_ajustados}
        capacidad_poi_kw={datos.config.capacidad_poi_kw}
        capacidad_carga_bess_kw={calculo.config.p_kw}
      />

      <SeccionComparativa
        ingreso_sfv_solo_anio1={calculo.ingreso_sfv_solo_anio1}
        ingreso_proyecto_anio1={calculo.ingreso_proyecto_anio1}
        ingreso_incremental_bess_anio1={calculo.ingreso_incremental_bess_anio1}
        payback={calculo.payback}
        ingreso_acumulado_sfv_solo={calculo.ingreso_sfv_solo_anio1 * 20}
        ingreso_acumulado_proyecto={calculo.ingreso_proyecto_acumulado}
      />

      <SeccionEvolucionEconomica
        flujos_base={calculo.flujos}
        curva_soh={calculo.equipo.curvaSoh}
        payback={calculo.payback}
      />

      <SeccionWaterfall
        ingreso_captura_excedentes_mxn={
          calculo.flujos[1]?.ingreso_captura_excedentes_mxn ?? 0
        }
        ingreso_arbitraje_mxn={calculo.flujos[1]?.ingreso_arbitraje_mxn ?? 0}
        ingreso_potencia_firme_mxn={
          calculo.flujos[1]?.ingreso_potencia_firme_mxn ?? 0
        }
        opex_mxn={calculo.flujos[1]?.opex_mxn ?? 0}
      />

      <SeccionFlujoAcumulado
        flujos_sfv_bess={calculo.flujos}
        ingreso_sfv_solo_anio={calculo.ingreso_sfv_solo_anio1}
        capex_mxn={calculo.capex}
        payback={calculo.payback}
      />

      <SeccionSohErosion
        flujos={calculo.flujos}
        curva_soh={calculo.equipo.curvaSoh}
      />

      <SeccionSensibilidades
        entradas_base={{
          captura_excedentes_anio1_mwh: calculo.captura_excedentes_anio1_mwh,
          descargado_anio1_punta_mwh: calculo.descargado_punta_mwh,
          generacion_anual_mwh: calculo.generacion_entregable_mwh,
          potencia_firme_kw: calculo.potencia_firme_kw,
          curva_soh: calculo.equipo.curvaSoh,
          capex_mxn: calculo.capex,
          opex_tasa_anual: params.opex_tasa_anual,
          precio_energia_mxn_mwh: params.precio_energia_mxn_mwh,
          precio_cel_mxn: params.precio_cel_mxn,
          precio_potencia_firme_mxn_mw_mes:
            params.precio_potencia_firme_mxn_mw_mes,
          lmp_mxn_mwh: params.lmp_mxn_mwh,
          diferencial_lmp_pct: params.diferencial_lmp_pct,
        }}
        flujos_base={calculo.flujos}
      />

      <TablaAnual21 flujos={calculo.flujos} payback={calculo.payback} />

      <MetodologiaFinanciero />

      <FooterEstandar fuente="Fuente: dispatch BESS sobre los datos cargados · precios proxy actuales · catálogo Hyperstrong" />
    </div>
  );
}
