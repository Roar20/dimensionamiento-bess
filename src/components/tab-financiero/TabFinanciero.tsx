import { useMemo } from "react";

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
import { DOD_DEFAULT, simularUna } from "@/lib/core/bess";
import { useParametrosFinancieros } from "@/hooks/useParametrosFinancieros";
import { useTipoCambio } from "@/hooks/useTipoCambio";
import type {
  CategoriaEnergia,
  ConfiguracionBESS,
} from "@/types/bess";
import type { DatosSFV } from "@/types/sfv";

import { DisclaimerTransversal } from "./DisclaimerTransversal";
import { PanelConfiguracion } from "./PanelConfiguracion";
import { SeccionBreakdownIngresos } from "./SeccionBreakdownIngresos";
import { SeccionComparativa } from "./SeccionComparativa";
import { SeccionFlujoAcumulado } from "./SeccionFlujoAcumulado";
import { SeccionHero } from "./SeccionHero";
import { SeccionWaterfall } from "./SeccionWaterfall";

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

const FMT_MXN_ENTERO = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
const FMT_MXN_M = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function formatMxnMillones(v: number): string {
  return `${FMT_MXN_M.format(v / 1_000_000)} M`;
}

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
    const generacion_anual_mwh = registrosAjustados.reduce(
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
      VENTANA_PUNTA
    );
    const descargado_punta_mwh = sumarDescargadoEnPunta(
      detalle,
      VENTANA_PUNTA
    );

    // Captura de excedentes: energía que excede POI capturable por el BESS.
    // Para factor_produccion = 1 con Tequila (pico 446.7 < POI 500) es ~0.
    // Con factor > 1 emerge captura real.
    const captura_excedentes_mwh = calcularCapturaExcedentesAnio(
      registrosAjustados,
      datos.config.capacidad_poi_kw,
      config.p_kw,
      config.rte
    );

    const flujos = proyectar20Anios({
      captura_excedentes_anio1_mwh: captura_excedentes_mwh,
      descargado_anio1_punta_mwh: descargado_punta_mwh,
      generacion_anual_mwh,
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

    const ingreso_acumulado = flujos
      .slice(1)
      .reduce((s, f) => s + f.ingreso_total_mxn, 0);

    // Escenario SFV solo: energía generada × precio_PPA + CELs (sin BESS).
    const ingreso_sfv_solo_anio1 =
      generacion_anual_mwh *
        (params.precio_energia_mxn_mwh + params.precio_cel_mxn);
    const ingreso_sfv_bess_anio1 = flujos[1]?.ingreso_total_mxn ?? 0;
    const delta_vs_sfv_solo = ingreso_sfv_bess_anio1 - ingreso_sfv_solo_anio1;
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
      generacion_anual_mwh,
      kpis,
      detalle,
      potencia_firme_kw,
      descargado_punta_mwh,
      flujos,
      payback,
      tir,
      vpn,
      ingreso_acumulado,
      ingreso_sfv_solo_anio1,
      ingreso_sfv_bess_anio1,
      delta_vs_sfv_solo,
      utilizacion_pct,
      captura_excedentes_anio1_mwh,
      registros_ajustados: registrosAjustados,
    };
  }, [registros, params, tipoCambio, datos.config.capacidad_poi_kw]);

  const heroKpis = useMemo(
    () => [
      {
        label: "Payback",
        valor:
          calculo.payback !== null
            ? `${FMT_PCT.format(calculo.payback)} años`
            : ">20 años",
        sublabel:
          calculo.payback !== null
            ? "Cruce de flujo acumulado"
            : "No recupera en horizonte",
      },
      {
        label: "Ingreso bruto año 1",
        valor: formatMxnMillones(calculo.ingreso_sfv_bess_anio1),
        sublabel: "SFV + BESS",
      },
      {
        label: "Ingreso acum. 20 años",
        valor: formatMxnMillones(calculo.ingreso_acumulado),
        sublabel: "Con SOH aplicado",
      },
      {
        label: "Δ vs SFV solo",
        valor: formatMxnMillones(calculo.delta_vs_sfv_solo),
        sublabel: "Año 1",
      },
      {
        label: "Utilización BESS",
        valor: `${FMT_PCT.format(calculo.utilizacion_pct)}%`,
        sublabel: "Horas/año en operación",
      },
      {
        label: "CAPEX",
        valor: FMT_MXN_ENTERO.format(calculo.capex),
        sublabel: `${calculo.config.e_kwh.toFixed(0)} kWh totales`,
      },
    ],
    [calculo]
  );

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[20px] font-medium text-[var(--color-text-primary)]">
          Análisis Financiero · SFV + BESS
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          ¿Qué cambia económicamente cuando agrego BESS al SFV existente, y
          cuánto mejora bajo distintos escenarios de producción?
        </p>
      </header>

      <DisclaimerTransversal />

      <SeccionHero kpis={heroKpis} />

      <PanelConfiguracion
        params={params}
        capex_catalogo_mxn={calculo.capex_catalogo}
        onChange={actualizar}
        onResetCapex={() => actualizar({ capex_override_mxn: null })}
      />

      <SeccionComparativa
        ingreso_sfv_solo_anio1={calculo.ingreso_sfv_solo_anio1}
        ingreso_sfv_bess_anio1={calculo.ingreso_sfv_bess_anio1}
        delta_anio1={calculo.delta_vs_sfv_solo}
        payback={calculo.payback}
        ingreso_acumulado_sfv_bess={calculo.ingreso_acumulado}
        ingreso_acumulado_sfv_solo={calculo.ingreso_sfv_solo_anio1 * 20}
      />

      <SeccionWaterfall
        ingreso_sfv_base_mxn={calculo.flujos[1]?.ingreso_ppa_generacion_mxn ?? 0}
        ingreso_captura_excedentes_mxn={
          calculo.flujos[1]?.ingreso_captura_excedentes_mxn ?? 0
        }
        ingreso_arbitraje_mxn={calculo.flujos[1]?.ingreso_arbitraje_mxn ?? 0}
        ingreso_potencia_firme_mxn={
          calculo.flujos[1]?.ingreso_potencia_firme_mxn ?? 0
        }
        ingreso_cels_mxn={calculo.flujos[1]?.ingreso_cels_mxn ?? 0}
        opex_mxn={calculo.flujos[1]?.opex_mxn ?? 0}
      />

      <SeccionFlujoAcumulado
        flujos_sfv_bess={calculo.flujos}
        ingreso_sfv_solo_anio={calculo.ingreso_sfv_solo_anio1}
        capex_mxn={calculo.capex}
        payback={calculo.payback}
      />

      <SeccionBreakdownIngresos
        ingreso_energia_ppa_mxn={
          calculo.flujos[1]?.ingreso_ppa_generacion_mxn ?? 0
        }
        ingreso_captura_excedentes_mxn={
          calculo.flujos[1]?.ingreso_captura_excedentes_mxn ?? 0
        }
        ingreso_arbitraje_mxn={calculo.flujos[1]?.ingreso_arbitraje_mxn ?? 0}
        ingreso_potencia_firme_mxn={
          calculo.flujos[1]?.ingreso_potencia_firme_mxn ?? 0
        }
        ingreso_cels_mxn={calculo.flujos[1]?.ingreso_cels_mxn ?? 0}
      />

      <FooterEstandar fuente="Fuente: dispatch BESS sobre dataset Tequila 2025 · precios proxy Estanzuela 2 marzo 2026 · catálogo Hyperstrong" />
    </div>
  );
}
