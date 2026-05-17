import { describe, expect, it } from "vitest";

import { caracterizarRecurso } from "./caracterizar";
import {
  generarDiaPlano,
  generarDiaSintetico,
  sumarDias,
} from "@/test/fixtures/sfv-fixtures";

describe("caracterizarRecurso", () => {
  it("agrega correctamente 24 registros de un día plano (10h × 100 kW)", () => {
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    const r = caracterizarRecurso(registros, 500, 500);

    expect(r.energia_total_mwh).toBe(1);
    expect(r.pico_kw).toBe(100);
    expect(r.horas_totales).toBe(24);
    expect(r.dias_analizados).toBe(1);
    expect(r.factor_planta_pct).toBe(8.33);
    expect(r.factor_capacidad_pct).toBe(8.33);
    expect(r.horas_sol_equiv_diaria).toBe(2);
    expect(r.pico_vs_poi_pct).toBe(20);
  });

  it("HSE de un mes sintético cae en rango [4.5, 5.5] h/día", () => {
    const registros = [];
    for (let d = 0; d < 30; d += 1) {
      const fecha = sumarDias("2025-04-01", d);
      registros.push(...generarDiaSintetico(fecha, 400, 2.5));
    }
    const r = caracterizarRecurso(registros, 500, 500);

    expect(r.dias_analizados).toBe(30);
    expect(r.horas_totales).toBe(30 * 24);
    expect(r.horas_sol_equiv_diaria).toBeGreaterThanOrEqual(4.5);
    expect(r.horas_sol_equiv_diaria).toBeLessThanOrEqual(5.5);
  });

  it("rechaza inputs inválidos", () => {
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    expect(() => caracterizarRecurso([], 500, 500)).toThrow();
    expect(() => caracterizarRecurso(registros, 0, 500)).toThrow();
    expect(() => caracterizarRecurso(registros, 500, -1)).toThrow();
  });
});
