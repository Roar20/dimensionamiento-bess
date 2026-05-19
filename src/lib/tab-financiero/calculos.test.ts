import { describe, expect, it } from "vitest";

import {
  aplicarFactorProduccion,
  calcularPaybackInterpolado,
  calcularPercentil,
  calcularPotenciaFirmeProxy,
  calcularTIR,
  calcularVPN,
  filtrarHoraPunta,
  proyectar20Anios,
  sumarDescargadoEnPunta,
  type EntradasProyeccion,
  type FlujoAnual,
} from "./calculos";
import type { EstadoHorario } from "@/types/bess";
import type { RegistroHorario } from "@/types/sfv";

const CURVA_SOH_TEST: readonly number[] = [
  0.9939, 0.9497, 0.9223, 0.8998, 0.8799, 0.8619, 0.8452,
  0.8295, 0.8146, 0.8004, 0.7868, 0.7736, 0.7610, 0.7487,
  0.7367, 0.7251, 0.7138, 0.7027, 0.6918, 0.6808, 0.6708,
];

function registroEn(hora: number, energia_mwh: number): RegistroHorario {
  return {
    timestamp: new Date(2026, 0, 1, hora),
    energia_mwh,
    potencia_kw_prom: energia_mwh * 1000,
  };
}

function estadoEn(hora: number, descargado_kwh: number): EstadoHorario {
  return {
    timestamp: new Date(2026, 0, 1, hora),
    gen_mwh: 0,
    energia_categoria_mwh: 0,
    cargado_kwh: 0,
    descargado_kwh,
    no_capturada_kwh: 0,
    soc_kwh: 0,
  };
}

describe("aplicarFactorProduccion", () => {
  it("factor 1.0 devuelve copia equivalente sin alterar valores", () => {
    const registros = [registroEn(10, 0.5), registroEn(11, 0.6)];
    const out = aplicarFactorProduccion(registros, 1);
    expect(out).not.toBe(registros);
    expect(out[0]!.energia_mwh).toBe(0.5);
    expect(out[1]!.potencia_kw_prom).toBe(600);
  });

  it("factor 1.5 escala energía y potencia por 1.5", () => {
    const registros = [registroEn(10, 0.4)];
    const out = aplicarFactorProduccion(registros, 1.5);
    expect(out[0]!.energia_mwh).toBeCloseTo(0.6, 6);
    expect(out[0]!.potencia_kw_prom).toBeCloseTo(600, 6);
  });
});

describe("calcularPercentil", () => {
  it("lista vacía → 0", () => {
    expect(calcularPercentil([], 0.8)).toBe(0);
  });

  it("percentil 80 de [1..10] ≈ 8.2", () => {
    const v = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(calcularPercentil(v, 0.8)).toBeCloseTo(8.2, 6);
  });
});

describe("filtrarHoraPunta", () => {
  it("ventana [18, 22] hora-ending captura horas con timestamp.getHours() ∈ [17..21]", () => {
    const estados = [
      estadoEn(16, 100),
      estadoEn(17, 200),
      estadoEn(18, 300),
      estadoEn(21, 400),
      estadoEn(22, 500),
    ];
    const out = filtrarHoraPunta(estados, [18, 22]);
    // hora 17 → ending 18 ✓, 18 → 19 ✓, 21 → 22 ✓, 22 → 23 ✗.
    expect(out.map((e) => e.descargado_kwh)).toEqual([200, 300, 400]);
  });
});

describe("calcularPotenciaFirmeProxy", () => {
  it("percentil 80 sobre las descargas en ventana hora-punta", () => {
    const estados: EstadoHorario[] = [];
    for (let h = 17; h <= 21; h += 1) estados.push(estadoEn(h, h * 10));
    // En ventana: descargas 170, 180, 190, 200, 210.
    const p80 = calcularPotenciaFirmeProxy(estados, [18, 22]);
    expect(p80).toBeCloseTo(202, 0);
  });

  it("sin horas en punta → 0", () => {
    const estados = [estadoEn(10, 100), estadoEn(11, 200)];
    expect(calcularPotenciaFirmeProxy(estados, [18, 22])).toBe(0);
  });
});

describe("sumarDescargadoEnPunta", () => {
  it("convierte kWh a MWh y filtra por ventana", () => {
    const estados = [
      estadoEn(10, 1000),
      estadoEn(18, 2000),
      estadoEn(19, 3000),
    ];
    expect(sumarDescargadoEnPunta(estados, [18, 22])).toBeCloseTo(5, 6);
  });
});

describe("proyectar20Anios", () => {
  const ENTRADAS_BASE: EntradasProyeccion = {
    captura_excedentes_anio1_mwh: 50,
    descargado_anio1_punta_mwh: 50,
    generacion_anual_mwh: 913,
    potencia_firme_kw: 100,
    curva_soh: CURVA_SOH_TEST,
    capex_mxn: 1_000_000,
    opex_tasa_anual: 0.02,
    precio_energia_mxn_mwh: 1000,
    precio_cel_mxn: 190,
    precio_potencia_firme_mxn_mw_mes: 333_334,
    lmp_mxn_mwh: 360,
    diferencial_lmp_pct: 0.30,
  };

  it("devuelve 21 elementos (año 0 al 20)", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    expect(f).toHaveLength(21);
    expect(f[0]!.anio).toBe(0);
    expect(f[20]!.anio).toBe(20);
  });

  it("año 0 = -CAPEX, sin ingresos ni opex", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    expect(f[0]!.flujo_neto_mxn).toBe(-1_000_000);
    expect(f[0]!.flujo_acumulado_mxn).toBe(-1_000_000);
    expect(f[0]!.ingreso_total_mxn).toBe(0);
    expect(f[0]!.opex_mxn).toBe(0);
  });

  it("año 1: ingreso captura y arbitraje = base sin degradación relativa", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    expect(f[1]!.energia_descargada_punta_mwh).toBeCloseTo(50, 6);
    expect(f[1]!.ingreso_captura_excedentes_mxn).toBeCloseTo(50 * 1000, 4);
    expect(f[1]!.ingreso_arbitraje_mxn).toBeCloseTo(50 * 360 * 0.30, 4);
  });

  it("año 20: ingreso_captura = base × curva[20]/curva[1]", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    const ratio = (CURVA_SOH_TEST[20] as number) / (CURVA_SOH_TEST[1] as number);
    expect(f[20]!.ingreso_captura_excedentes_mxn).toBeCloseTo(
      50 * 1000 * ratio,
      2
    );
  });

  it("ingreso_ppa_generacion = gen × precio_PPA constante en años 1..20", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    const esperado = 913 * 1000;
    for (let i = 1; i <= 20; i += 1) {
      expect(f[i]!.ingreso_ppa_generacion_mxn).toBeCloseTo(esperado, 4);
    }
  });

  it("CELs NO degradan con SOH (constantes año a año)", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    const expected = 913 * 190;
    for (let i = 1; i <= 20; i += 1) {
      expect(f[i]!.ingreso_cels_mxn).toBeCloseTo(expected, 4);
    }
  });

  it("OPEX = capex × tasa constante en años 1..20, 0 en año 0", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    expect(f[0]!.opex_mxn).toBe(0);
    for (let i = 1; i <= 20; i += 1) {
      expect(f[i]!.opex_mxn).toBeCloseTo(20_000, 4);
    }
  });

  it("flujo_acumulado es monótono creciente desde año 1 si flujo_neto > 0", () => {
    const f = proyectar20Anios(ENTRADAS_BASE);
    for (let i = 2; i <= 20; i += 1) {
      if ((f[i]!.flujo_neto_mxn as number) > 0) {
        expect(f[i]!.flujo_acumulado_mxn).toBeGreaterThan(
          f[i - 1]!.flujo_acumulado_mxn
        );
      }
    }
  });

  it("rechaza curva con menos de 21 valores", () => {
    expect(() =>
      proyectar20Anios({ ...ENTRADAS_BASE, curva_soh: [0.99, 0.95] })
    ).toThrow();
  });
});

describe("calcularPaybackInterpolado", () => {
  function flujosArtificiales(neto: readonly number[]): FlujoAnual[] {
    let acum = 0;
    return neto.map((n, i) => {
      acum += n;
      return {
        anio: i,
        factor_soh: 1,
        energia_descargada_punta_mwh: 0,
        ingreso_ppa_generacion_mxn: 0,
        ingreso_captura_excedentes_mxn: 0,
        ingreso_arbitraje_mxn: 0,
        ingreso_potencia_firme_mxn: 0,
        ingreso_cels_mxn: 0,
        ingreso_total_mxn: 0,
        opex_mxn: 0,
        flujo_neto_mxn: n,
        flujo_acumulado_mxn: acum,
      };
    });
  }

  it("CAPEX 100, flujo neto 50/año → payback año 2.0 (cruce exacto)", () => {
    const flujos = flujosArtificiales([-100, 50, 50, 50]);
    const payback = calcularPaybackInterpolado(flujos);
    expect(payback).toBeCloseTo(2.0, 6);
  });

  it("interpola fraccionario: CAPEX 100, +40/+40/+40 → cruce en 2.5", () => {
    const flujos = flujosArtificiales([-100, 40, 40, 40]);
    // acumulado: -100, -60, -20, +20.
    // cruce entre año 2 (-20) y año 3 (+20). frac = 20/40 = 0.5 → 2.5.
    const payback = calcularPaybackInterpolado(flujos);
    expect(payback).toBeCloseTo(2.5, 6);
  });

  it("sin cruce en el horizonte → null", () => {
    const flujos = flujosArtificiales([-1000, 10, 10, 10]);
    expect(calcularPaybackInterpolado(flujos)).toBeNull();
  });
});

describe("calcularTIR y calcularVPN", () => {
  it("flujo 0 CAPEX, ingresos constantes → TIR > 0", () => {
    const flujos: FlujoAnual[] = [];
    let acum = 0;
    for (let i = 0; i <= 20; i += 1) {
      const neto = i === 0 ? -1_000_000 : 150_000;
      acum += neto;
      flujos.push({
        anio: i,
        factor_soh: 1,
        energia_descargada_punta_mwh: 0,
        ingreso_ppa_generacion_mxn: 0,
        ingreso_captura_excedentes_mxn: 0,
        ingreso_arbitraje_mxn: 0,
        ingreso_potencia_firme_mxn: 0,
        ingreso_cels_mxn: 0,
        ingreso_total_mxn: 0,
        opex_mxn: 0,
        flujo_neto_mxn: neto,
        flujo_acumulado_mxn: acum,
      });
    }
    const tir = calcularTIR(flujos);
    // anualidad 150k sobre CAPEX 1M en 20 años ≈ 13-14% TIR.
    expect(tir).not.toBeNull();
    expect(tir!).toBeGreaterThan(0.10);
    expect(tir!).toBeLessThan(0.20);
  });

  it("VPN a tasa = TIR ≈ 0", () => {
    const flujos: FlujoAnual[] = [];
    let acum = 0;
    for (let i = 0; i <= 20; i += 1) {
      const neto = i === 0 ? -1_000_000 : 150_000;
      acum += neto;
      flujos.push({
        anio: i,
        factor_soh: 1,
        energia_descargada_punta_mwh: 0,
        ingreso_ppa_generacion_mxn: 0,
        ingreso_captura_excedentes_mxn: 0,
        ingreso_arbitraje_mxn: 0,
        ingreso_potencia_firme_mxn: 0,
        ingreso_cels_mxn: 0,
        ingreso_total_mxn: 0,
        opex_mxn: 0,
        flujo_neto_mxn: neto,
        flujo_acumulado_mxn: acum,
      });
    }
    const tir = calcularTIR(flujos)!;
    const vpn = calcularVPN(flujos, tir);
    expect(Math.abs(vpn)).toBeLessThan(100);
  });
});
