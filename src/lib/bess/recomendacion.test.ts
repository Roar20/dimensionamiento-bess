import { describe, expect, it } from "vitest";

import { recomendarEquipoOptimo } from "./recomendacion";

describe("recomendarEquipoOptimo", () => {
  it("POI 100 kW → recomienda HyperCube II Plus", () => {
    const r = recomendarEquipoOptimo(100);
    expect(r.equipo_recomendado.id).toBe("hypercube-plus");
    expect(r.equipos_descartados).toHaveLength(2);
  });

  it("POI 200 kW (límite inferior del Max) → recomienda HyperCube II Plus", () => {
    const r = recomendarEquipoOptimo(200);
    expect(r.equipo_recomendado.id).toBe("hypercube-plus");
  });

  it("POI 500 kW (Tequila) → recomienda HyperCube II Max", () => {
    const r = recomendarEquipoOptimo(500);
    expect(r.equipo_recomendado.id).toBe("hypercube-max");
  });

  it("POI 600 kW (límite superior del Max) → recomienda HyperCube II Max", () => {
    const r = recomendarEquipoOptimo(600);
    expect(r.equipo_recomendado.id).toBe("hypercube-max");
  });

  it("POI 2000 kW → recomienda HyperBlock III", () => {
    const r = recomendarEquipoOptimo(2000);
    expect(r.equipo_recomendado.id).toBe("hyperblock-iii");
  });

  it("la razón es un string no vacío y los equipos descartados son los dos restantes", () => {
    const r = recomendarEquipoOptimo(500);
    expect(r.razon).toMatch(/HyperCube/);
    expect(r.equipos_descartados.map((d) => d.equipo.id).sort()).toEqual([
      "hyperblock-iii",
      "hypercube-plus",
    ]);
  });
});
