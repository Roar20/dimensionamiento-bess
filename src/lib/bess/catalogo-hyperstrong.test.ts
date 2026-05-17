import { describe, expect, it } from "vitest";

import {
  CATALOGO_HYPERSTRONG,
  buscarEquipo,
  costoPorKwh,
  densidadEnergetica,
  duracionNominalHoras,
  huellaEnSueloM2,
} from "./catalogo-hyperstrong";

describe("catálogo Hyperstrong", () => {
  it("tiene 3 equipos con IDs únicos", () => {
    expect(CATALOGO_HYPERSTRONG).toHaveLength(3);
    const ids = CATALOGO_HYPERSTRONG.map((e) => e.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("todos los equipos tienen campos requeridos no vacíos", () => {
    for (const e of CATALOGO_HYPERSTRONG) {
      expect(e.id).toBeTruthy();
      expect(e.nombre_corto).toBeTruthy();
      expect(e.nombre_completo).toBeTruthy();
      expect(e.kw_ac).toBeGreaterThan(0);
      expect(e.kwh).toBeGreaterThan(0);
      expect(e.precio_usd).toBeGreaterThan(0);
      expect(e.eficiencia_max).toBeGreaterThan(0);
      expect(e.eficiencia_max).toBeLessThanOrEqual(1);
      expect(e.certificaciones.length).toBeGreaterThan(0);
      expect(e.datasheet_pdf).toMatch(/^\/datasheets\//);
    }
  });

  it("costoPorKwh es correcto", () => {
    const plus = buscarEquipo("hypercube-plus")!;
    expect(costoPorKwh(plus)).toBeCloseTo(55997 / 261.2, 4);
    const max = buscarEquipo("hypercube-max")!;
    expect(costoPorKwh(max)).toBeCloseTo(147726 / 835.9, 4);
    const block = buscarEquipo("hyperblock-iii")!;
    expect(costoPorKwh(block)).toBeCloseTo(565008 / 5015.96, 4);
  });

  it("densidadEnergetica calcula correctamente", () => {
    const plus = buscarEquipo("hypercube-plus")!;
    const areaPlus = (1030 / 1000) * (1350 / 1000);
    expect(densidadEnergetica(plus)).toBeCloseTo(261.2 / areaPlus, 4);
  });

  it("duracionNominalHoras = kWh / kW_ac", () => {
    const max = buscarEquipo("hypercube-max")!;
    expect(duracionNominalHoras(max)).toBeCloseTo(835.9 / 250, 4);
  });

  it("huellaEnSueloM2 usa ancho × profundidad en metros", () => {
    const block = buscarEquipo("hyperblock-iii")!;
    expect(huellaEnSueloM2(block)).toBeCloseTo(
      (6058 / 1000) * (2438 / 1000),
      4
    );
  });

  it("buscarEquipo devuelve null si el ID no existe", () => {
    expect(buscarEquipo("inexistente")).toBeNull();
  });
});
