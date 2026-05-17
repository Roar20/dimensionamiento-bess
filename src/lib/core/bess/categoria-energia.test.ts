import { describe, expect, it } from "vitest";

import {
  calcularEnergiaPorCategoria,
  calcularPromedioMensualSFV,
  calcularResumenCategorias,
  construirCategoriasDefault,
} from "./categoria-energia";
import {
  createRegistro,
  generarDiaPlano,
  sumarDias,
} from "@/test/fixtures/sfv-fixtures";
import type { ParametrosPPA } from "@/types/bess";

const PARAMS_BASE: ParametrosPPA = {
  compromiso_mensual_mwh: 60,
  ventana_punta_cfe: [18, 22],
  capacidad_poi_kw: 500,
};

describe("calcularEnergiaPorCategoria", () => {
  it("toda_energia: devuelve el array igual a energia_mwh", () => {
    const registros = generarDiaPlano("2025-03-01", 100, 8, 17);
    const arr = calcularEnergiaPorCategoria(registros, {
      tipo: "toda_energia",
      etiqueta: "x",
      descripcion: "y",
    });
    expect(arr).toEqual(registros.map((r) => r.energia_mwh));
  });

  it("fuera_hora_punta_cfe: horas-ending 18-22 devuelven 0, las demás energia_mwh", () => {
    // generarDiaPlano usa horaInicio 8-17 (inicio-intervalo) ⇒ hora-ending 9-18.
    // Punta [18,22] → solo hora-ending 18 (inicio 17) cae en punta.
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    const arr = calcularEnergiaPorCategoria(registros, {
      tipo: "fuera_hora_punta_cfe",
      ventana_punta: [18, 22],
      etiqueta: "x",
      descripcion: "y",
    });
    // El registro con timestamp.getHours()=17 debe quedar en 0.
    const idx17 = registros.findIndex((r) => r.timestamp.getHours() === 17);
    expect(arr[idx17]).toBe(0);
    // El registro con timestamp.getHours()=12 (mediodía) debe quedar intacto.
    const idx12 = registros.findIndex((r) => r.timestamp.getHours() === 12);
    expect(arr[idx12]).toBe(registros[idx12]!.energia_mwh);
  });

  it("compromiso_ppa_mensual_mwh: cada hora aporta la fracción libre del mes", () => {
    // 1 mes con 80 MWh totales (4 días × 24 h × 0.83 MWh ≈ 80 MWh). Compromiso 60.
    // Fracción libre = (80 - 60) / 80 = 0.25.
    const registros = [];
    for (let d = 0; d < 4; d += 1) {
      const fecha = sumarDias("2025-03-01", d);
      for (let h = 0; h < 24; h += 1) {
        registros.push(createRegistro(fecha, h, 80 / (4 * 24)));
      }
    }
    const arr = calcularEnergiaPorCategoria(registros, {
      tipo: "compromiso_ppa_mensual_mwh",
      mwh_mes: 60,
      etiqueta: "x",
      descripcion: "y",
    });
    expect(arr[0]).toBeCloseTo(registros[0]!.energia_mwh * 0.25, 6);
    const total = arr.reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(80 - 60, 4);
  });

  it("compromiso: si el mes está por debajo del compromiso, devuelve 0", () => {
    const registros = generarDiaPlano("2025-04-01", 100, 8, 17); // 1 MWh total
    const arr = calcularEnergiaPorCategoria(registros, {
      tipo: "compromiso_ppa_mensual_mwh",
      mwh_mes: 50,
      etiqueta: "x",
      descripcion: "y",
    });
    expect(arr.every((v) => v === 0)).toBe(true);
  });

  it("exceso_capacidad_cfe_kw: solo cuenta lo que excede el techo", () => {
    const r1 = createRegistro("2025-05-01", 12, 0.6); // 600 kW
    const r2 = createRegistro("2025-05-01", 13, 0.4); // 400 kW
    const arr = calcularEnergiaPorCategoria([r1, r2], {
      tipo: "exceso_capacidad_cfe_kw",
      techo_kw: 500,
      etiqueta: "x",
      descripcion: "y",
    });
    expect(arr[0]).toBeCloseTo(0.1, 6);
    expect(arr[1]).toBe(0);
  });
});

describe("construirCategoriasDefault + calcularResumenCategorias", () => {
  it("produce 4 categorías con etiquetas en español", () => {
    const cats = construirCategoriasDefault(PARAMS_BASE);
    expect(cats).toHaveLength(4);
    expect(cats[0]!.tipo).toBe("toda_energia");
    expect(cats[1]!.tipo).toBe("fuera_hora_punta_cfe");
    expect(cats[2]!.tipo).toBe("compromiso_ppa_mensual_mwh");
    expect(cats[3]!.tipo).toBe("exceso_capacidad_cfe_kw");
  });

  it("promedio mensual = total / meses únicos", () => {
    const registros = [];
    for (let mes = 0; mes < 3; mes += 1) {
      const fechaInicio = `2025-${String(mes + 1).padStart(2, "0")}-01`;
      const diasMes = new Date(2025, mes + 1, 0).getDate();
      for (let d = 0; d < diasMes; d += 1) {
        registros.push(...generarDiaPlano(sumarDias(fechaInicio, d), 100, 8, 17));
      }
    }
    const cats = construirCategoriasDefault(PARAMS_BASE);
    const resumenes = calcularResumenCategorias(registros, cats);
    const totalToda = resumenes[0]!.total_mwh;
    expect(resumenes[0]!.promedio_mensual_mwh).toBeCloseTo(totalToda / 3, 4);
  });
});

describe("calcularPromedioMensualSFV", () => {
  it("devuelve total / meses únicos", () => {
    const registros = [
      ...generarDiaPlano("2025-01-15", 100, 8, 17),
      ...generarDiaPlano("2025-02-15", 200, 8, 17),
    ];
    // Total: 1 + 2 = 3 MWh en 2 meses → 1.5 MWh/mes.
    expect(calcularPromedioMensualSFV(registros)).toBeCloseTo(1.5, 4);
  });

  it("devuelve 0 si no hay registros", () => {
    expect(calcularPromedioMensualSFV([])).toBe(0);
  });
});
