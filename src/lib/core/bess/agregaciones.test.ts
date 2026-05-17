import { describe, expect, it } from "vitest";

import { calcularKPIs } from "./agregaciones";
import { CONFIG_BESS_TEST } from "@/test/fixtures/bess-fixtures";
import type { EstadoHorario } from "@/types/bess";

function estadoVacio(timestamp: Date): EstadoHorario {
  return {
    timestamp,
    gen_mwh: 0,
    energia_categoria_mwh: 0,
    cargado_kwh: 0,
    descargado_kwh: 0,
    no_capturada_kwh: 0,
    soc_kwh: 0,
  };
}

describe("calcularKPIs", () => {
  it("detalle vacío de ceros: todos los KPIs en 0", () => {
    const detalle = Array.from({ length: 24 }, (_, h) => {
      const ts = new Date(2025, 0, 1, h, 0, 0, 0);
      return estadoVacio(ts);
    });
    const kpis = calcularKPIs(detalle, CONFIG_BESS_TEST);
    expect(kpis.cargado_total_mwh).toBe(0);
    expect(kpis.descargado_total_mwh).toBe(0);
    expect(kpis.fraccion_capturada).toBe(0);
    expect(kpis.ciclos_periodo).toBe(0);
    expect(kpis.horas_descarga_en_punta).toBe(0);
  });

  it("fracción capturada = cargado / energía categoría", () => {
    const detalle = Array.from({ length: 24 }, (_, h) => {
      const ts = new Date(2025, 0, 1, h, 0, 0, 0);
      return {
        ...estadoVacio(ts),
        energia_categoria_mwh: 100 / 24,
        cargado_kwh: (80 * 1000) / 24,
      };
    });
    const kpis = calcularKPIs(detalle, CONFIG_BESS_TEST);
    expect(kpis.energia_categoria_total_mwh).toBeCloseTo(100, 4);
    expect(kpis.cargado_total_mwh).toBeCloseTo(80, 4);
    expect(kpis.fraccion_capturada).toBeCloseTo(0.8, 4);
  });

  it("ciclos equivalentes = cargado_kwh / cap_util_kwh", () => {
    // cap_util = 1000 * 0.95 = 950 kWh. Cargado total 1900 kWh → 2 ciclos.
    const detalle = Array.from({ length: 24 }, (_, h) => {
      const ts = new Date(2025, 0, 1, h, 0, 0, 0);
      return {
        ...estadoVacio(ts),
        cargado_kwh: 1900 / 24,
      };
    });
    const kpis = calcularKPIs(detalle, CONFIG_BESS_TEST);
    expect(kpis.ciclos_periodo).toBeCloseTo(2, 2);
  });

  it("cuenta horas con descarga > 0 dentro de hora-punta CFE", () => {
    // Descargas en h=17 (h-end 18), h=18 (h-end 19), h=19 (h-end 20). 3 horas en punta.
    const detalle = Array.from({ length: 24 }, (_, h) => {
      const ts = new Date(2025, 0, 1, h, 0, 0, 0);
      const enPunta = h === 17 || h === 18 || h === 19;
      return {
        ...estadoVacio(ts),
        descargado_kwh: enPunta ? 50 : 0,
      };
    });
    const kpis = calcularKPIs(detalle, CONFIG_BESS_TEST);
    expect(kpis.horas_descarga_en_punta).toBe(3);
  });
});
