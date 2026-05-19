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

  it("cada equipo expone curvaSoh definida", () => {
    for (const e of CATALOGO_HYPERSTRONG) {
      expect(e.curvaSoh).toBeDefined();
    }
  });

  it("curvaSoh tiene 21 valores anuales (año 0 a 20) en cada equipo", () => {
    for (const e of CATALOGO_HYPERSTRONG) {
      expect(e.curvaSoh).toHaveLength(21);
    }
  });

  it("curvaSoh comienza en 0.9939 y termina en 0.6708 en cada equipo", () => {
    for (const e of CATALOGO_HYPERSTRONG) {
      expect(e.curvaSoh[0]).toBe(0.9939);
      expect(e.curvaSoh[20]).toBe(0.6708);
    }
  });

  it("los 3 equipos comparten exactamente la misma referencia de curvaSoh", () => {
    const byId = new Map(CATALOGO_HYPERSTRONG.map((e) => [e.id, e]));
    const plus = byId.get("cube-plus")!;
    const max = byId.get("cube-max")!;
    const block = byId.get("block-iii")!;
    expect(plus.curvaSoh).toBe(max.curvaSoh);
    expect(max.curvaSoh).toBe(block.curvaSoh);
  });
});
