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

describe("CurvaCapturaCapacidad — codo orientativo", () => {
  it("cuando codo !== null: dataset extra con 1 punto y leyenda visible", () => {
    const resultado = resultadoCompleto();
    if (resultado.codo === null) return;
    render(<CurvaCapturaCapacidad resultado={resultado} />);
    const datasets = datasetsFromChart();
    const codo = datasets.find((d) =>
      d.label?.toLowerCase().includes("rendimientos decrecientes")
    );
    expect(codo).toBeDefined();
    expect(codo!.data).toHaveLength(1);
    expect(codo!.pointStyle).toBe("rectRot");
    expect(screen.getByTestId("leyenda-codo")).toBeInTheDocument();
  });

  it("cuando codo === null: NO se renderiza dataset del codo ni leyenda", () => {
    const resultado = resultadoCompleto();
    render(
      <CurvaCapturaCapacidad resultado={{ ...resultado, codo: null }} />
    );
    const datasets = datasetsFromChart();
    const codo = datasets.find((d) =>
      d.label?.toLowerCase().includes("rendimientos decrecientes")
    );
    expect(codo).toBeUndefined();
    expect(screen.queryByTestId("leyenda-codo")).toBeNull();
  });

  it("label del codo es literalmente 'Punto de rendimientos decrecientes (orientativo)'", () => {
    const resultado = resultadoCompleto();
    if (resultado.codo === null) return;
    render(<CurvaCapturaCapacidad resultado={resultado} />);
    expect(
      screen.getByText(/Punto de rendimientos decrecientes \(orientativo\)/i)
    ).toBeInTheDocument();
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
