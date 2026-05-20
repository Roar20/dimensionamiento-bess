import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CostoUnitarioBess } from "@/components/bess/CostoUnitarioBess";

// Bypass de ResponsiveContainer para que el chart renderice en jsdom.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 600, height: 260 }} data-testid="recharts-wrap">
        {children}
      </div>
    ),
  };
});

describe("CostoUnitarioBess", () => {
  it("renderiza el headline ejecutivo con la frase aprobada", () => {
    render(<CostoUnitarioBess />);
    // El headline se construye en runtime: 17% (= (214-177)/214 redondeado).
    expect(
      screen.getByText(/El Cube Max cuesta 17% menos por kWh que el Cube Plus\./)
    ).toBeInTheDocument();
  });

  it("muestra los chips base + sensibilidad (NO label flotante de DoD sobre la barra)", () => {
    render(<CostoUnitarioBess />);
    expect(screen.getByText(/^Base: capacidad nominal$/)).toBeInTheDocument();
    expect(
      screen.getByText(/sensibilidad dod 95% en tooltip y metodología/i)
    ).toBeInTheDocument();
  });

  it("renderiza la tira Block III separada con tag 'Fuera de escala'", () => {
    render(<CostoUnitarioBess />);
    const tira = screen.getByTestId("tira-block-iii");
    expect(tira).toBeInTheDocument();
    expect(tira.textContent).toMatch(/\$113 USD\/kWh/);
    expect(tira.textContent).toMatch(/escala utility/i);
    expect(tira.textContent).toMatch(/no compite para POI 500 kW/i);
    expect(tira.textContent).toMatch(/fuera de escala/i);
  });

  it("Block III NO aparece como categoría dentro del gráfico de barras", () => {
    const { container } = render(<CostoUnitarioBess />);
    // Recharts renderiza los labels del eje X como SVG <text>. Block III
    // NO debe estar en el chart (solo en la tira inferior).
    const xLabels = Array.from(
      container.querySelectorAll("svg .recharts-cartesian-axis-tick text")
    ).map((t) => t.textContent ?? "");
    expect(xLabels.some((t) => /block iii/i.test(t))).toBe(false);
  });

  it("renderiza las dos etiquetas de barra ($214 y $177) como LabelList encima", () => {
    const { container } = render(<CostoUnitarioBess />);
    const textos = container.textContent ?? "";
    expect(textos).toContain("$214");
    expect(textos).toContain("$177");
  });

  it("metodología incluye los tres párrafos (base, sensibilidad, Block III)", () => {
    render(<CostoUnitarioBess />);
    // El bloque vive dentro de un <details> con summary — no expone role=heading.
    expect(
      screen.getByText(/metodología del costo unitario/i)
    ).toBeInTheDocument();
    // El texto detallado vive en docs/COPY.md y modulo-3.ts; verificamos
    // anclas mínimas.
    expect(
      screen.getByText(/USD ÷ capacidad nominal/i)
    ).toBeInTheDocument();
    // "DoD 95%" aparece como ancla en chip + tooltip + metodología.
    expect(screen.getAllByText(/DoD 95%/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/queda fuera de la comparación por escala/i)).toBeInTheDocument();
  });
});
