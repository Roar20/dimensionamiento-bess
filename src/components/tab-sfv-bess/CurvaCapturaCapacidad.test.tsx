import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CurvaCapturaCapacidad } from "@/components/tab-sfv-bess/CurvaCapturaCapacidad";
import {
  HORAS_DEFAULT,
  POTENCIAS_KW_DEFAULT,
  correrBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { CategoriaEnergia } from "@/types/bess";

// Capturamos las props del Line para asertarse sobre datasets sin renderizar canvas.
let lineProps: { data?: unknown; options?: unknown } = {};
vi.mock("react-chartjs-2", () => ({
  Line: (props: { data?: unknown; options?: unknown }) => {
    lineProps = props;
    return <div data-testid="chart-line-curva" />;
  },
}));

const CAT: CategoriaEnergia = {
  tipo: "toda_energia",
  etiqueta: "Toda la energía",
  descripcion: "",
};

const PARAMS = { dod: 0.95, rte: 0.85, soc_inicial_kwh: 0 } as const;

function registros60Dias() {
  const rs = [];
  for (let d = 0; d < 60; d += 1) {
    rs.push(...generarDiaPlano(sumarDias("2025-03-01", d), 600, 8, 17));
  }
  return rs;
}

function resultadoCompleto() {
  return correrBarridoConfiguraciones(
    registros60Dias(),
    { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
    CAT,
    ["greedy", "arbitraje"],
    PARAMS
  );
}

type Dataset = {
  label?: string;
  data: Array<{ x: number; y: number }>;
  pointRadius?: number;
  showLine?: boolean;
  pointStyle?: string;
};

function datasetsFromChart(): Dataset[] {
  const d = (lineProps.data as { datasets?: Dataset[] } | undefined)?.datasets;
  expect(Array.isArray(d)).toBe(true);
  return d!;
}

describe("CurvaCapturaCapacidad — datasets", () => {
  it("renderiza el chart contenedor", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    expect(screen.getByTestId("curva-captura-capacidad")).toBeInTheDocument();
    expect(screen.getByTestId("chart-line-curva")).toBeInTheDocument();
  });

  it("dataset 'Evaluadas' contiene 32 puntos {x,y}, sin línea", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const datasets = datasetsFromChart();
    const evals = datasets.find((d) => d.label === "Evaluadas");
    expect(evals).toBeDefined();
    expect(evals!.data).toHaveLength(32);
    expect(evals!.showLine).toBe(false);
    expect(evals!.pointRadius).toBe(3);
  });

  it("dataset 'Frente Pareto' tiene línea conectada y puntos más grandes que evaluadas", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const datasets = datasetsFromChart();
    const frente = datasets.find((d) => d.label === "Frente Pareto");
    expect(frente).toBeDefined();
    expect(frente!.showLine).toBe(true);
    expect(frente!.pointRadius).toBe(4);
    expect(frente!.data.length).toBeGreaterThan(0);
  });

  it("frente devuelto ordenado por x ascendente", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const frente = datasetsFromChart().find((d) => d.label === "Frente Pareto");
    for (let i = 1; i < frente!.data.length; i += 1) {
      expect(frente!.data[i]!.x).toBeGreaterThanOrEqual(
        frente!.data[i - 1]!.x
      );
    }
  });
});

describe("CurvaCapturaCapacidad — marker del codo desactivado (pendiente D-MOTOR-02)", () => {
  it("cuando codo !== null: NO se renderiza dataset del codo (marker oculto)", () => {
    const resultado = resultadoCompleto();
    if (resultado.codo === null) return;
    render(<CurvaCapturaCapacidad resultado={resultado} />);
    const datasets = datasetsFromChart();
    const codo = datasets.find((d) =>
      d.label?.toLowerCase().includes("rendimientos decrecientes")
    );
    expect(codo).toBeUndefined();
  });

  it("cuando codo === null: NO se renderiza dataset del codo (igual que arriba)", () => {
    const resultado = resultadoCompleto();
    render(<CurvaCapturaCapacidad resultado={{ ...resultado, codo: null }} />);
    const datasets = datasetsFromChart();
    const codo = datasets.find((d) =>
      d.label?.toLowerCase().includes("rendimientos decrecientes")
    );
    expect(codo).toBeUndefined();
  });

  it("la leyenda NO incluye entrada 'Punto de rendimientos decrecientes'", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    expect(
      screen.queryByText(/rendimientos decrecientes/i)
    ).toBeNull();
  });

  it("la curva tiene exactamente 2 datasets: Evaluadas + Frente Pareto", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const datasets = datasetsFromChart();
    expect(datasets).toHaveLength(2);
    expect(datasets.map((d) => d.label)).toEqual([
      "Evaluadas",
      "Frente Pareto",
    ]);
  });
});

describe("CurvaCapturaCapacidad — ejes y título", () => {
  it("título del panel y subtítulo presentes", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    expect(screen.getByText(/captura vs capacidad instalada/i)).toBeInTheDocument();
    expect(screen.getByText(/% de captura por kwh instalado/i)).toBeInTheDocument();
  });

  it("eje X es lineal y etiquetado como 'Capacidad instalada (kWh)'", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const opts = lineProps.options as {
      scales: { x: { type: string; title: { text: string } } };
    };
    expect(opts.scales.x.type).toBe("linear");
    expect(opts.scales.x.title.text).toMatch(/capacidad instalada \(kWh\)/i);
  });

  it("eje Y etiquetado como 'Captura (%)'", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const opts = lineProps.options as {
      scales: { y: { title: { text: string } } };
    };
    expect(opts.scales.y.title.text).toMatch(/captura \(%\)/i);
  });
});

describe("CurvaCapturaCapacidad — sin interpretación / sin saturación", () => {
  it("no renderiza zona/banda de saturación ni labels de saturación", () => {
    const { container } = render(
      <CurvaCapturaCapacidad resultado={resultadoCompleto()} />
    );
    // Tampoco un dataset extra de fondo.
    const datasets = datasetsFromChart();
    const saturacion = datasets.find((d) =>
      d.label?.toLowerCase().includes("saturación")
    );
    expect(saturacion).toBeUndefined();
    const txt = container.textContent ?? "";
    expect(txt).not.toMatch(/saturación/i);
  });

  it("ningún texto interpreta el codo / prescribe acción", () => {
    const { container } = render(
      <CurvaCapturaCapacidad resultado={resultadoCompleto()} />
    );
    const txt = container.textContent ?? "";
    expect(txt).not.toMatch(/mejor|óptim|recomend|ganador|ideal/i);
    expect(txt).not.toMatch(/hasta aquí|punto dulce|conviene/i);
    expect(txt).not.toMatch(/marginal|roi|inversión adicional/i);
    expect(txt).not.toMatch(/ampliación|capacidad adicional|\+pv/i);
  });

  it("ningún plugin custom registra anotaciones interpretativas", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const opts = lineProps.options as { plugins?: Record<string, unknown> };
    // Solo legend + tooltip vienen del componente (legend.display=false).
    expect(opts.plugins).toBeDefined();
    expect(Object.keys(opts.plugins!).sort()).toEqual(["legend", "tooltip"]);
  });
});

describe("CurvaCapturaCapacidad — tooltip: dedup y convergencia de estrategias", () => {
  type TooltipFilter = (
    item: { datasetIndex: number; parsed: { x: number; y: number } },
    index: number,
    items: { datasetIndex: number; parsed: { x: number; y: number } }[]
  ) => boolean;
  type TooltipLabel = (ctx: {
    dataset: { label: string };
    dataIndex: number;
    parsed: { y: number | null };
  }) => string;

  function getTooltip() {
    const opts = lineProps.options as {
      plugins: {
        tooltip: {
          filter?: TooltipFilter;
          callbacks: { label: TooltipLabel };
        };
      };
    };
    return opts.plugins.tooltip;
  }

  it("filter dedupe: dos items mismo (datasetIndex, x, y) → solo el primero pasa", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const tt = getTooltip();
    expect(tt.filter).toBeDefined();
    const items = [
      { datasetIndex: 0, parsed: { x: 600, y: 21.7 } },
      { datasetIndex: 0, parsed: { x: 600, y: 21.7 } }, // dup
      { datasetIndex: 0, parsed: { x: 800, y: 30 } },
    ];
    const keep0 = tt.filter!(items[0]!, 0, items);
    const keep1 = tt.filter!(items[1]!, 1, items);
    const keep2 = tt.filter!(items[2]!, 2, items);
    expect(keep0).toBe(true);
    expect(keep1).toBe(false); // duplicate
    expect(keep2).toBe(true);
  });

  it("filter NO dedupe entre datasets distintos en el mismo (x,y)", () => {
    render(<CurvaCapturaCapacidad resultado={resultadoCompleto()} />);
    const tt = getTooltip();
    const items = [
      { datasetIndex: 0, parsed: { x: 600, y: 21.7 } },
      { datasetIndex: 1, parsed: { x: 600, y: 21.7 } },
    ];
    expect(tt.filter!(items[0]!, 0, items)).toBe(true);
    expect(tt.filter!(items[1]!, 1, items)).toBe(true);
  });

  it("label callback: punto sin convergencia → muestra estrategia individual", () => {
    const resultado = resultadoCompleto();
    render(<CurvaCapturaCapacidad resultado={resultado} />);
    const tt = getTooltip();
    // Buscamos un índice en evaluadas donde greedy y arbitraje NO converjan.
    const evaluadas = resultado.evaluadas;
    let idxSinConvergencia = -1;
    for (let i = 0; i < evaluadas.length; i += 1) {
      const a = evaluadas[i]!;
      const tieneConv = evaluadas.some(
        (b, j) =>
          j !== i &&
          b.config.p_kw === a.config.p_kw &&
          b.config.e_kwh === a.config.e_kwh &&
          b.estrategia !== a.estrategia &&
          Math.abs(b.kpis.fraccion_capturada - a.kpis.fraccion_capturada) < 1e-6
      );
      if (!tieneConv) {
        idxSinConvergencia = i;
        break;
      }
    }
    if (idxSinConvergencia === -1) return; // suite tolerante: nada que asertar
    const ev = evaluadas[idxSinConvergencia]!;
    const label = tt.callbacks.label({
      dataset: { label: "Evaluadas" },
      dataIndex: idxSinConvergencia,
      parsed: { y: ev.kpis.fraccion_capturada * 100 },
    });
    const estrategiaEsperada =
      ev.estrategia === "greedy" ? "Greedy" : "Arbitraje";
    expect(label).toContain(estrategiaEsperada);
    expect(label).not.toContain("Ambas estrategias");
  });

  it("label callback: punto con convergencia → muestra 'Ambas estrategias'", () => {
    const resultado = resultadoCompleto();
    render(<CurvaCapturaCapacidad resultado={resultado} />);
    const tt = getTooltip();
    const evaluadas = resultado.evaluadas;
    let idxConv = -1;
    for (let i = 0; i < evaluadas.length; i += 1) {
      const a = evaluadas[i]!;
      const tieneConv = evaluadas.some(
        (b, j) =>
          j !== i &&
          b.config.p_kw === a.config.p_kw &&
          b.config.e_kwh === a.config.e_kwh &&
          b.estrategia !== a.estrategia &&
          Math.abs(b.kpis.fraccion_capturada - a.kpis.fraccion_capturada) < 1e-6
      );
      if (tieneConv) {
        idxConv = i;
        break;
      }
    }
    // Si no hay convergencia en este fixture, no podemos asertar; saltamos.
    if (idxConv === -1) return;
    const ev = evaluadas[idxConv]!;
    const label = tt.callbacks.label({
      dataset: { label: "Evaluadas" },
      dataIndex: idxConv,
      parsed: { y: ev.kpis.fraccion_capturada * 100 },
    });
    expect(label).toContain("Ambas estrategias");
    expect(label).not.toContain("Greedy");
    expect(label).not.toContain("Arbitraje");
  });

  it("label callback formatea: 'P kW × h h · X · Y.Y%'", () => {
    const resultado = resultadoCompleto();
    render(<CurvaCapturaCapacidad resultado={resultado} />);
    const tt = getTooltip();
    const ev = resultado.evaluadas[0]!;
    const label = tt.callbacks.label({
      dataset: { label: "Evaluadas" },
      dataIndex: 0,
      parsed: { y: ev.kpis.fraccion_capturada * 100 },
    });
    expect(label).toMatch(/\d+ kW × \d+ h · (Greedy|Arbitraje|Ambas estrategias) · \d+\.\d%/);
  });
});
