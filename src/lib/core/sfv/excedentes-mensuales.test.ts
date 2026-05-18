import { describe, expect, it } from "vitest";

import { agregarExcedentesPorMes } from "./excedentes-mensuales";
import { generarDiaPlano } from "@/test/fixtures/sfv-fixtures";

describe("agregarExcedentesPorMes", () => {
  it("devuelve 12 entradas cronológicas para un año completo, una por mes", () => {
    // Un día por mes en 2025, sin excedente (genera por debajo de POI).
    const registros = [];
    for (let m = 1; m <= 12; m += 1) {
      const dia = `2025-${String(m).padStart(2, "0")}-15`;
      registros.push(...generarDiaPlano(dia, 100, 8, 17));
    }
    const r = agregarExcedentesPorMes(registros, 500);
    expect(r).toHaveLength(12);
    expect(r[0]!.mes).toBe("2025-01");
    expect(r[0]!.mes_label).toBe("Ene");
    expect(r[11]!.mes).toBe("2025-12");
    expect(r[11]!.mes_label).toBe("Dic");
  });

  it("ningún excedente es negativo y son 0 cuando la generación no supera POI", () => {
    const registros = generarDiaPlano("2025-03-10", 400, 8, 17);
    const r = agregarExcedentesPorMes(registros, 500);
    for (const m of r) {
      expect(m.excedente_mwh).toBeGreaterThanOrEqual(0);
    }
    // 400 kW < 500 kW POI → cero excedente en marzo (y resto).
    expect(r.find((x) => x.mes === "2025-03")!.excedente_mwh).toBe(0);
  });

  it("acumula excedente correctamente cuando la generación supera POI", () => {
    // 600 kW por hora durante 10 horas (8..17) un solo día.
    // Excedente horario = 600 - 500 = 100 kW = 0.1 MWh.
    // 10 horas × 0.1 MWh = 1.0 MWh el día → 1.0 MWh en marzo.
    const registros = generarDiaPlano("2025-03-10", 600, 8, 17);
    const r = agregarExcedentesPorMes(registros, 500);
    const marzo = r.find((x) => x.mes === "2025-03")!;
    expect(marzo.excedente_mwh).toBeCloseTo(1.0, 4);
    // El resto del año queda en 0.
    const otros = r.filter((x) => x.mes !== "2025-03");
    for (const m of otros) expect(m.excedente_mwh).toBe(0);
  });

  it("rechaza poi_kw inválido", () => {
    expect(() => agregarExcedentesPorMes([], 0)).toThrow();
    expect(() => agregarExcedentesPorMes([], -10)).toThrow();
  });
});
