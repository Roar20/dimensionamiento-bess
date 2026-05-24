import { describe, expect, it } from "vitest";

import { PRECIOS_DEFAULT } from "@/hooks/usePreciosProxy";
import type { KPIsSimulacion } from "@/types/bess";
import {
  calcularCapex,
  calcularIngresoAnual,
  calcularPaybackPreliminar,
} from "./economia-preliminar";

function kpis(descargado_mwh: number): KPIsSimulacion {
  return {
    cargado_total_mwh: descargado_mwh / 0.85,
    descargado_total_mwh: descargado_mwh,
    energia_categoria_total_mwh: descargado_mwh / 0.85,
    no_capturada_total_mwh: 0,
    fraccion_capturada: 1,
    ciclos_periodo: 200,
    soc_max_kwh: 1000,
    horas_descarga_en_punta: 1500,
  };
}

describe("calcularIngresoAnual", () => {
  it("ingreso = descargado × (precio energía + precio CEL); potencia firme NO se usa todavía", () => {
    const r = calcularIngresoAnual(kpis(100), PRECIOS_DEFAULT);
    // 100 MWh × 1010.8 = 101,080. 100 × 190 = 19,000. Total = 120,080.
    expect(r.energia_mxn).toBeCloseTo(101_080, 2);
    expect(r.cels_mxn).toBeCloseTo(19_000, 2);
    expect(r.total_mxn).toBeCloseTo(120_080, 2);
  });

  it("0 MWh descargados → ingreso 0", () => {
    const r = calcularIngresoAnual(kpis(0), PRECIOS_DEFAULT);
    expect(r.total_mxn).toBe(0);
  });

  it("escala lineal con descargado", () => {
    const r1 = calcularIngresoAnual(kpis(100), PRECIOS_DEFAULT);
    const r2 = calcularIngresoAnual(kpis(200), PRECIOS_DEFAULT);
    expect(r2.total_mxn).toBeCloseTo(2 * r1.total_mxn, 2);
  });
});

describe("calcularCapex y calcularPaybackPreliminar", () => {
  it("CAPEX = USD × tipo de cambio para unidad y por kWh", () => {
    const c = calcularCapex(55_997, 214, 20);
    expect(c.capex_mxn).toBe(1_119_940);
    expect(c.capex_mxn_por_kwh).toBe(4_280);
  });

  it("payback = CAPEX / ingreso anual; null si ingreso = 0", () => {
    expect(calcularPaybackPreliminar(1_000_000, 250_000).payback_anios).toBe(4);
    expect(
      calcularPaybackPreliminar(1_000_000, 0).payback_anios
    ).toBeNull();
  });
});
