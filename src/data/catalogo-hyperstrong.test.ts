import { describe, expect, it } from "vitest";

import { CATALOGO_HYPERSTRONG } from "./catalogo-hyperstrong";

describe("CATALOGO_HYPERSTRONG", () => {
  it("contiene los 3 equipos esperados en el orden Plus → Max → Block III", () => {
    expect(CATALOGO_HYPERSTRONG.map((e) => e.id)).toEqual([
      "cube-plus",
      "cube-max",
      "block-iii",
    ]);
  });

  it("marca Cube Plus y Cube Max como aplicables a Tequila; Block III no", () => {
    const byId = new Map(CATALOGO_HYPERSTRONG.map((e) => [e.id, e]));
    expect(byId.get("cube-plus")!.aplicableTequila).toBe(true);
    expect(byId.get("cube-max")!.aplicableTequila).toBe(true);
    expect(byId.get("block-iii")!.aplicableTequila).toBe(false);
  });

  it("precioUsdKwh ≈ round(precioUsdUnidad / energiaKwh) para los 3 equipos", () => {
    for (const e of CATALOGO_HYPERSTRONG) {
      const esperado = Math.round(e.precioUsdUnidad / e.energiaKwh);
      // Tolerancia ±1 USD/kWh por redondeo en el catálogo fuente.
      expect(Math.abs(e.precioUsdKwh - esperado)).toBeLessThanOrEqual(1);
    }
  });

  it("cada equipo apunta a un datasheet en /datasheets/", () => {
    for (const e of CATALOGO_HYPERSTRONG) {
      expect(e.datasheetUrl).toMatch(/^\/datasheets\/[a-z0-9-]+\.pdf$/);
    }
  });
});
