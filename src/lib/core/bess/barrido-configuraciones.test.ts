import { describe, expect, it } from "vitest";

import type {
  CategoriaEnergia,
  ConfiguracionBESS,
  EstrategiaDespacho,
  KPIsSimulacion,
} from "@/types/bess";
import type { RegistroHorario } from "@/types/sfv";
import {
  createRegistro,
  generarDiaPlano,
  generarDiaSintetico,
  sumarDias,
} from "@/test/fixtures/sfv-fixtures";

import {
  HORAS_DEFAULT,
  POTENCIAS_KW_DEFAULT,
  computarFrentePareto,
  correrBarridoConfiguraciones,
  encontrarCodo,
  type ConfiguracionEvaluada,
} from "./barrido-configuraciones";

const PARAMS = { dod: 0.95, rte: 0.85, soc_inicial_kwh: 0 };
const CATEGORIA_TODA: CategoriaEnergia = {
  tipo: "toda_energia",
  etiqueta: "Toda la energía es candidata",
  descripcion: "",
};
const TODAS_ESTRATEGIAS: readonly EstrategiaDespacho[] = ["greedy", "arbitraje"];

// ───────────────────────────────────────────────────────────────
// Helpers para construir ConfiguracionEvaluada sintéticas y testear
// las piezas Pareto/codo aisladas de la simulación.
// ───────────────────────────────────────────────────────────────

function evaluadaSintetica(
  p_kw: number,
  horas: number,
  fraccion_capturada: number,
  ciclos_periodo: number,
  estrategia: EstrategiaDespacho = "greedy"
): ConfiguracionEvaluada {
  const e_kwh = p_kw * horas;
  const config: ConfiguracionBESS = {
    p_kw,
    e_kwh,
    dod: 0.95,
    rte: 0.85,
    soc_inicial_kwh: 0,
  };
  const kpis: KPIsSimulacion = {
    cargado_total_mwh: 0,
    descargado_total_mwh: 0,
    energia_categoria_total_mwh: 0,
    no_capturada_total_mwh: 0,
    fraccion_capturada,
    ciclos_periodo,
    soc_max_kwh: e_kwh * 0.95,
    horas_descarga_en_punta: 0,
  };
  return { config, estrategia, kpis };
}

// ───────────────────────────────────────────────────────────────
// Producto cartesiano
// ───────────────────────────────────────────────────────────────

describe("correrBarridoConfiguraciones — producto cartesiano", () => {
  const registros = generarDiaSintetico("2025-03-15", 300, 3);

  it("evaluadas.length === potencias × horas × estrategias", () => {
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [200, 400], horas: [2, 4, 6] },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    expect(r.evaluadas).toHaveLength(2 * 3 * 2);
  });

  it("defaults producen 4 × 4 × 2 = 32 evaluadas", () => {
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    expect(r.evaluadas).toHaveLength(32);
  });

  it("orden de iteración: potencias → horas → estrategias en orden de input", () => {
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [200, 400], horas: [2, 4] },
      CATEGORIA_TODA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    // Esperado:
    //   [0] 200/2  greedy
    //   [1] 200/2  arbitraje
    //   [2] 200/4  greedy
    //   [3] 200/4  arbitraje
    //   [4] 400/2  greedy
    //   ...
    expect(r.evaluadas[0]!.config).toMatchObject({ p_kw: 200, e_kwh: 400 });
    expect(r.evaluadas[0]!.estrategia).toBe("greedy");
    expect(r.evaluadas[1]!.estrategia).toBe("arbitraje");
    expect(r.evaluadas[2]!.config).toMatchObject({ p_kw: 200, e_kwh: 800 });
    expect(r.evaluadas[4]!.config).toMatchObject({ p_kw: 400, e_kwh: 800 });
  });

  it("e_kwh se deriva como p_kw × horas y respeta los params", () => {
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [300], horas: [3] },
      CATEGORIA_TODA,
      ["greedy"],
      PARAMS
    );
    const c = r.evaluadas[0]!.config;
    expect(c.p_kw).toBe(300);
    expect(c.e_kwh).toBe(900);
    expect(c.dod).toBe(PARAMS.dod);
    expect(c.rte).toBe(PARAMS.rte);
    expect(c.soc_inicial_kwh).toBe(PARAMS.soc_inicial_kwh);
  });
});

// ───────────────────────────────────────────────────────────────
// Validación de inputs
// ───────────────────────────────────────────────────────────────

describe("correrBarridoConfiguraciones — validación de inputs", () => {
  const registros = generarDiaSintetico("2025-03-15", 300, 3);

  it("throw si potencias_kw vacío", () => {
    expect(() =>
      correrBarridoConfiguraciones(
        registros,
        { potencias_kw: [], horas: [2] },
        CATEGORIA_TODA,
        ["greedy"],
        PARAMS
      )
    ).toThrow();
  });

  it("throw si horas vacío", () => {
    expect(() =>
      correrBarridoConfiguraciones(
        registros,
        { potencias_kw: [200], horas: [] },
        CATEGORIA_TODA,
        ["greedy"],
        PARAMS
      )
    ).toThrow();
  });

  it("throw si estrategias vacío", () => {
    expect(() =>
      correrBarridoConfiguraciones(
        registros,
        { potencias_kw: [200], horas: [2] },
        CATEGORIA_TODA,
        [],
        PARAMS
      )
    ).toThrow();
  });

  it("throw si dod fuera de (0, 1]", () => {
    expect(() =>
      correrBarridoConfiguraciones(
        registros,
        { potencias_kw: [200], horas: [2] },
        CATEGORIA_TODA,
        ["greedy"],
        { ...PARAMS, dod: 0 }
      )
    ).toThrow();
    expect(() =>
      correrBarridoConfiguraciones(
        registros,
        { potencias_kw: [200], horas: [2] },
        CATEGORIA_TODA,
        ["greedy"],
        { ...PARAMS, dod: 1.5 }
      )
    ).toThrow();
  });

  it("throw si rte fuera de (0, 1]", () => {
    expect(() =>
      correrBarridoConfiguraciones(
        registros,
        { potencias_kw: [200], horas: [2] },
        CATEGORIA_TODA,
        ["greedy"],
        { ...PARAMS, rte: 0 }
      )
    ).toThrow();
  });
});

// ───────────────────────────────────────────────────────────────
// Determinismo
// ───────────────────────────────────────────────────────────────

describe("correrBarridoConfiguraciones — determinismo", () => {
  it("dos llamadas con el mismo input devuelven outputs idénticos", () => {
    const registros = generarDiaSintetico("2025-03-15", 300, 3);
    const a = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [200, 400], horas: [2, 4] },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    const b = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [200, 400], horas: [2, 4] },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    expect(a).toEqual(b);
  });
});

// ───────────────────────────────────────────────────────────────
// Frente Pareto — propiedades estructurales sobre datos reales
// ───────────────────────────────────────────────────────────────

describe("computarFrentePareto — invariantes estructurales", () => {
  it("ningún elemento del frente está dominado por otro elemento del frente", () => {
    const registros = generarDiaSintetico("2025-03-15", 300, 3);
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    for (const a of r.frentePareto) {
      for (const b of r.frentePareto) {
        if (a === b) continue;
        expect(dominaEnTest(a, b)).toBe(false);
      }
    }
  });

  it("ningún elemento fuera del frente puede dominar a uno dentro del frente", () => {
    const registros = generarDiaSintetico("2025-03-15", 300, 3);
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    const fueraDelFrente = r.evaluadas.filter(
      (e) => !r.frentePareto.includes(e)
    );
    for (const fuera of fueraDelFrente) {
      for (const dentro of r.frentePareto) {
        expect(dominaEnTest(fuera, dentro)).toBe(false);
      }
    }
  });

  it("todo elemento fuera del frente está dominado por al menos un elemento (dentro o fuera)", () => {
    const registros = generarDiaSintetico("2025-03-15", 300, 3);
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    const fueraDelFrente = r.evaluadas.filter(
      (e) => !r.frentePareto.includes(e)
    );
    for (const fuera of fueraDelFrente) {
      const algunDomina = r.evaluadas.some(
        (otro) => otro !== fuera && dominaEnTest(otro, fuera)
      );
      expect(algunDomina).toBe(true);
    }
  });
});

describe("computarFrentePareto — casos sintéticos", () => {
  it("punto trivialmente dominado por otro queda fuera del frente", () => {
    // B es peor o igual en las 3 dimensiones que A.
    const a = evaluadaSintetica(400, 4, 0.9, 200);
    const b = evaluadaSintetica(400, 4, 0.8, 150); // mismo e_kwh, peor frac y ciclos
    const frente = computarFrentePareto([a, b]);
    expect(frente).toContain(a);
    expect(frente).not.toContain(b);
  });

  it("dos puntos no comparables sobreviven ambos en el frente", () => {
    // A: pequeño + alta utilización. B: grande + alta captura.
    const a = evaluadaSintetica(200, 2, 0.6, 300);
    const b = evaluadaSintetica(500, 6, 0.95, 100);
    const frente = computarFrentePareto([a, b]);
    expect(frente).toContain(a);
    expect(frente).toContain(b);
  });

  it("KPIs idénticos: ninguno domina al otro (estricto requiere mejora)", () => {
    const a = evaluadaSintetica(300, 3, 0.85, 200);
    const b = evaluadaSintetica(300, 3, 0.85, 200, "arbitraje");
    const frente = computarFrentePareto([a, b]);
    expect(frente).toHaveLength(2);
  });
});

// ───────────────────────────────────────────────────────────────
// Monotonicidad de captura
// ───────────────────────────────────────────────────────────────

describe("correrBarridoConfiguraciones — propiedades físicas", () => {
  it("greedy: con horas fijo, mayor p_kw no disminuye fraccion_capturada", () => {
    const registros = generarDiaSintetico("2025-03-15", 400, 3);
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [100, 200, 300, 400, 500], horas: [4] },
      CATEGORIA_TODA,
      ["greedy"],
      PARAMS
    );
    const fracciones = r.evaluadas.map((e) => e.kpis.fraccion_capturada);
    for (let i = 1; i < fracciones.length; i += 1) {
      expect(fracciones[i]!).toBeGreaterThanOrEqual(fracciones[i - 1]! - 1e-9);
    }
  });

  it("greedy: con p_kw fijo, mayor horas no disminuye fraccion_capturada", () => {
    const registros = generarDiaSintetico("2025-03-15", 400, 3);
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [300], horas: [2, 3, 4, 6, 8] },
      CATEGORIA_TODA,
      ["greedy"],
      PARAMS
    );
    const fracciones = r.evaluadas.map((e) => e.kpis.fraccion_capturada);
    for (let i = 1; i < fracciones.length; i += 1) {
      expect(fracciones[i]!).toBeGreaterThanOrEqual(fracciones[i - 1]! - 1e-9);
    }
  });
});

// ───────────────────────────────────────────────────────────────
// Codo
// ───────────────────────────────────────────────────────────────

describe("encontrarCodo", () => {
  it("frente con <3 puntos → codo es null", () => {
    expect(encontrarCodo([])).toBeNull();
    expect(encontrarCodo([evaluadaSintetica(200, 2, 0.5, 100)])).toBeNull();
    expect(
      encontrarCodo([
        evaluadaSintetica(200, 2, 0.5, 100),
        evaluadaSintetica(400, 4, 0.9, 200),
      ])
    ).toBeNull();
  });

  it("frente perfectamente lineal (sin codo geométrico) → null", () => {
    const frente = [
      evaluadaSintetica(100, 1, 0.1, 50),
      evaluadaSintetica(200, 1, 0.2, 50),
      evaluadaSintetica(300, 1, 0.3, 50),
      evaluadaSintetica(400, 1, 0.4, 50),
    ];
    expect(encontrarCodo(frente)).toBeNull();
  });

  it("frente con todos los puntos en el mismo e_kwh → null", () => {
    const frente = [
      evaluadaSintetica(400, 4, 0.5, 100),
      evaluadaSintetica(400, 4, 0.7, 150),
      evaluadaSintetica(400, 4, 0.9, 200),
    ];
    expect(encontrarCodo(frente)).toBeNull();
  });

  it("frente cóncavo en L: el codo cae en el vértice del salto", () => {
    // Forma de L: plano abajo, salto, plano arriba.
    // X = e_kwh,  Y = fraccion_capturada
    //  (100, 0.05) ── primer punto
    //  (200, 0.10) ── pre-salto, casi colineal con la cuerda inicial
    //  (300, 0.85) ── vértice (máxima distancia a la cuerda)
    //  (400, 0.92)
    //  (500, 0.94)
    //  (600, 0.95) ── último punto
    //
    // Cuerda (100, 0.05) → (600, 0.95) tiene pendiente 0.0018/kWh.
    // En x=200, y_cuerda ≈ 0.23, point=0.10 → debajo (-0.13).
    // En x=300, y_cuerda ≈ 0.41, point=0.85 → arriba (+0.44, máximo).
    const frente = [
      evaluadaSintetica(100, 1, 0.05, 50),
      evaluadaSintetica(200, 1, 0.1, 60),
      evaluadaSintetica(300, 1, 0.85, 120),
      evaluadaSintetica(400, 1, 0.92, 150),
      evaluadaSintetica(500, 1, 0.94, 180),
      evaluadaSintetica(600, 1, 0.95, 210),
    ];
    const codo = encontrarCodo(frente);
    expect(codo).not.toBeNull();
    expect(codo!.config.e_kwh).toBe(300);
  });

  it("codo determinista: dos llamadas devuelven el mismo punto", () => {
    const frente = [
      evaluadaSintetica(100, 1, 0.1, 50),
      evaluadaSintetica(200, 1, 0.5, 80),
      evaluadaSintetica(300, 1, 0.8, 120),
      evaluadaSintetica(400, 1, 0.9, 150),
    ];
    const a = encontrarCodo(frente);
    const b = encontrarCodo(frente);
    expect(a).toEqual(b);
  });
});

// ───────────────────────────────────────────────────────────────
// Estanzuela marzo — validación sintético-aproximada (ALCANCE PARCIAL)
// ───────────────────────────────────────────────────────────────
//
// Referencia (sesión con Lalo): mes de marzo de Estanzuela 2:
//   MTR ≈ 108.4 MWh, MDA ≈ 73.7 MWh, excedente ≈ 37.0 MWh, pico ≈ 320 kW.
//
// IMPORTANTE: este test usa un mes SINTÉTICO cuyos agregados se
// aproximan a los reales (no son la serie horaria real). La validación
// es PARCIAL hasta tener el perfil anual 8.760h. NO declara
// "validado anualmente".

function generarMesEstanzuelaSintetico(): RegistroHorario[] {
  // Plateau diario 09:00–18:59 a 350 kW. 31 días × 350 kW × 10 h ≈ 108.5 MWh.
  // Pico horario = 350 kW (≈ 320 kW del caso real, suficiente para
  // testear "potencia ≥ pico").
  const registros: RegistroHorario[] = [];
  for (let d = 0; d < 31; d += 1) {
    const fecha = sumarDias("2025-03-01", d);
    registros.push(...generarDiaPlano(fecha, 350, 9, 18));
  }
  return registros;
}

describe("Estanzuela marzo (sintético-aproximado, alcance PARCIAL)", () => {
  const registros = generarMesEstanzuelaSintetico();

  it("agregados aproximan al caso real (sanity de la fixture)", () => {
    const totalMwh = registros.reduce((s, r) => s + r.energia_mwh, 0);
    expect(totalMwh).toBeGreaterThan(100);
    expect(totalMwh).toBeLessThan(115);
    const picoKw = Math.max(...registros.map((r) => r.potencia_kw_prom));
    expect(picoKw).toBeCloseTo(350, 0);
  });

  it("config sobre-dimensionada → fraccion_capturada → máximo físico (~1.0)", () => {
    // Con greedy y "toda_energia", la energía AC cargada se reduce por
    // sqrt(rte) al ingresar al SoC. Para capturar ~3.5 MWh/día de
    // generación con rte=0.85 y dod=0.95, el SoC útil necesita
    // alojar ~3.5 / sqrt(0.85) ≈ 3.8 MWh, lo que exige e_kwh ≳ 4000.
    // Por eso aquí usamos un sweep con configs ≥ 5000 kWh.
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [500], horas: [10, 12] },
      CATEGORIA_TODA,
      ["greedy"],
      PARAMS
    );
    for (const e of r.evaluadas) {
      expect(e.kpis.fraccion_capturada).toBeGreaterThan(0.95);
    }
  });

  it("config del barrido default ya está acotada por SoC útil (no llega a 1.0)", () => {
    // Esta es la cara complementaria: con los defaults (máx 500×6=3000),
    // ninguna config alcanza el máximo físico — exactamente lo que el
    // codo del frente debería estar señalando.
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA_TODA,
      ["greedy"],
      PARAMS
    );
    const maxFraccion = Math.max(
      ...r.evaluadas.map((e) => e.kpis.fraccion_capturada)
    );
    expect(maxFraccion).toBeLessThan(1.0);
  });

  it("configs pequeñas capturan proporcionalmente menos", () => {
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [100], horas: [2] },
      CATEGORIA_TODA,
      ["greedy"],
      PARAMS
    );
    const pequeña = r.evaluadas[0]!;
    // 100 kW × 2 h = 200 kWh contra 3500 kWh/día: fracción muy baja.
    expect(pequeña.kpis.fraccion_capturada).toBeLessThan(0.3);
  });

  it("barrido default produce frente Pareto no vacío y codo definido", () => {
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA_TODA,
      TODAS_ESTRATEGIAS,
      PARAMS
    );
    expect(r.evaluadas).toHaveLength(32);
    expect(r.frentePareto.length).toBeGreaterThan(0);
    // El codo puede ser null si la geometría no admite uno, pero con
    // este mes esperamos al menos un codo identificable.
    expect(r.codo).not.toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────
// Edge: solo 1 estrategia (no se cruzan greedy/arbitraje)
// ───────────────────────────────────────────────────────────────

describe("correrBarridoConfiguraciones — estrategia única", () => {
  it("una sola estrategia produce evaluadas correctas y frente coherente", () => {
    const registros = generarDiaSintetico("2025-03-15", 300, 3);
    const r = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [200, 400], horas: [2, 4] },
      CATEGORIA_TODA,
      ["greedy"],
      PARAMS
    );
    expect(r.evaluadas).toHaveLength(4);
    expect(r.evaluadas.every((e) => e.estrategia === "greedy")).toBe(true);
  });
});

// Reimplementación local de la dominancia para validar el frente
// independientemente de la implementación del módulo (caja-negra).
function dominaEnTest(
  a: ConfiguracionEvaluada,
  b: ConfiguracionEvaluada
): boolean {
  const EPS = 1e-6;
  const fracOk = a.kpis.fraccion_capturada >= b.kpis.fraccion_capturada - EPS;
  const ciclosOk = a.kpis.ciclos_periodo >= b.kpis.ciclos_periodo - EPS;
  const eOk = a.config.e_kwh <= b.config.e_kwh;
  if (!(fracOk && ciclosOk && eOk)) return false;
  const fracEstricto = a.kpis.fraccion_capturada > b.kpis.fraccion_capturada + EPS;
  const ciclosEstricto = a.kpis.ciclos_periodo > b.kpis.ciclos_periodo + EPS;
  const eEstricto = a.config.e_kwh < b.config.e_kwh;
  return fracEstricto || ciclosEstricto || eEstricto;
}

// Suprime "imported but not used" si vitest re-ordena módulos.
void createRegistro;
