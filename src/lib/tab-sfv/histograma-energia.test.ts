import { describe, expect, it } from "vitest";

import { calcularHistogramaEnergia } from "./histograma-energia";

describe("calcularHistogramaEnergia", () => {
  it("distribución uniforme: cada bin recibe ~igual número de días", () => {
    const serie: Record<string, number> = {};
    for (let i = 0; i < 100; i += 1) {
      serie[`2025-01-${String(i + 1).padStart(2, "0")}`] = i * 0.1; // 0..9.9
    }
    const bins = calcularHistogramaEnergia(serie, 10);
    expect(bins).toHaveLength(10);
    const sumaDias = bins.reduce((acc, b) => acc + b.dias, 0);
    expect(sumaDias).toBe(100);
  });

  it("distribución sesgada hacia valores bajos: bins bajos tienen más count", () => {
    const serie: Record<string, number> = {
      "2025-01-01": 0.1,
      "2025-01-02": 0.2,
      "2025-01-03": 0.15,
      "2025-01-04": 0.05,
      "2025-01-05": 8.5,
    };
    const bins = calcularHistogramaEnergia(serie, 5);
    expect(bins[0]!.dias).toBeGreaterThan(bins[bins.length - 1]!.dias);
  });

  it("serie vacía devuelve array vacío", () => {
    expect(calcularHistogramaEnergia({}, 10)).toEqual([]);
  });
});
