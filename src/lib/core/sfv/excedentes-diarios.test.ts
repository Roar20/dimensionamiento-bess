import { describe, expect, it } from "vitest";

import { estadisticasExcedenteDiario } from "./excedentes-diarios";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";

describe("estadisticasExcedenteDiario", () => {
  it("respeta mediana ≤ P75 ≤ P90 ≤ día crítico sobre dataset variable", () => {
    // 30 días con excedente creciente día a día.
    const registros = [];
    for (let i = 0; i < 30; i += 1) {
      const dia = sumarDias("2025-04-01", i);
      // Pico kW crece de 510 a 800 → excedente crece linealmente.
      registros.push(...generarDiaPlano(dia, 510 + i * 10, 8, 17));
    }
    const r = estadisticasExcedenteDiario(registros, 500);
    expect(r.mediana_kwh).toBeLessThanOrEqual(r.p75_kwh);
    expect(r.p75_kwh).toBeLessThanOrEqual(r.p90_kwh);
    expect(r.p90_kwh).toBeLessThanOrEqual(r.dia_critico_kwh);
  });

  it("identifica el día crítico como el de mayor generación bruta", () => {
    // 3 días con generación creciente.
    const registros = [
      ...generarDiaPlano("2025-05-01", 300, 8, 17),
      ...generarDiaPlano("2025-05-02", 450, 8, 17),
      ...generarDiaPlano("2025-05-03", 600, 8, 17),
    ];
    const r = estadisticasExcedenteDiario(registros, 500);
    expect(r.dia_critico_fecha).toBe("2025-05-03");
    // Día 3: 600-500=100 kW × 10h = 1,000 kWh.
    expect(r.dia_critico_kwh).toBeCloseTo(1000, 1);
  });

  it("devuelve 0 en todos los estadísticos cuando ningún día supera POI", () => {
    const registros = [
      ...generarDiaPlano("2025-06-01", 300, 8, 17),
      ...generarDiaPlano("2025-06-02", 200, 8, 17),
    ];
    const r = estadisticasExcedenteDiario(registros, 500);
    expect(r.mediana_kwh).toBe(0);
    expect(r.promedio_kwh).toBe(0);
    expect(r.p75_kwh).toBe(0);
    expect(r.p90_kwh).toBe(0);
    // Día crítico se identifica de todas formas (mayor generación bruta).
    expect(r.dia_critico_fecha).toBe("2025-06-01");
    expect(r.dia_critico_kwh).toBe(0);
  });

  it("rechaza poi_kw inválido", () => {
    expect(() => estadisticasExcedenteDiario([], 0)).toThrow();
    expect(() => estadisticasExcedenteDiario([], NaN)).toThrow();
  });
});
