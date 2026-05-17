import { describe, expect, it } from "vitest";

import { recomendarEquipoOptimo } from "./recomendacion";

describe("recomendarEquipoOptimo", () => {
  it("energía capturable ~0: devuelve null + alerta", () => {
    const r = recomendarEquipoOptimo(500, 0, "exceso_capacidad_cfe_kw");
    expect(r.equipo_recomendado).toBeNull();
    expect(r.alerta).toBeTruthy();
    expect(r.razon).toMatch(/no produce energía capturable/i);
  });

  it("planta chica (≤200 kW) con energía suficiente → II Plus", () => {
    const r = recomendarEquipoOptimo(150, 80, "toda_energia");
    expect(r.equipo_recomendado?.id).toBe("hypercube-plus");
    expect(r.alerta).toBeUndefined();
  });

  it("planta mediana (500 kW) con poca energía (<100 MWh) → II Plus", () => {
    const r = recomendarEquipoOptimo(
      500,
      50,
      "compromiso_ppa_mensual_mwh"
    );
    expect(r.equipo_recomendado?.id).toBe("hypercube-plus");
    expect(r.razon).toMatch(/sobredimensionar/i);
  });

  it("planta mediana (500 kW) con mucha energía (>100 MWh) → II Max", () => {
    const r = recomendarEquipoOptimo(500, 800, "fuera_hora_punta_cfe");
    expect(r.equipo_recomendado?.id).toBe("hypercube-max");
    expect(r.razon).toMatch(/Max/);
  });

  it("planta grande (>600 kW) utility → HyperBlock III", () => {
    const r = recomendarEquipoOptimo(2000, 5000, "toda_energia");
    expect(r.equipo_recomendado?.id).toBe("hyperblock-iii");
  });

  it("Tequila típico (POI 500, toda_energia 913 MWh) → II Max", () => {
    const r = recomendarEquipoOptimo(500, 913, "toda_energia");
    expect(r.equipo_recomendado?.id).toBe("hypercube-max");
  });

  it("Tequila con compromiso PPA dejando ~50 MWh libres → II Plus", () => {
    const r = recomendarEquipoOptimo(500, 50, "compromiso_ppa_mensual_mwh");
    expect(r.equipo_recomendado?.id).toBe("hypercube-plus");
  });

  it("la razón cita la energía capturable formateada", () => {
    const r = recomendarEquipoOptimo(500, 913, "toda_energia");
    expect(r.razon).toContain("913");
  });
});
