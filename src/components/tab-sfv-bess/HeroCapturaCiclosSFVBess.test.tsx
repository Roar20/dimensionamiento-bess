import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { HeroCapturaCiclosSFVBess } from "@/components/tab-sfv-bess/HeroCapturaCiclosSFVBess";

function rend(overrides: Partial<React.ComponentProps<typeof HeroCapturaCiclosSFVBess>> = {}) {
  return render(
    <HeroCapturaCiclosSFVBess
      configNombre="Cube Plus"
      fraccionCapturada={0.98}
      ciclosAnuales={369}
      {...overrides}
    />
  );
}

describe("HeroCapturaCiclosSFVBess — render y dinamismo", () => {
  it("renderiza el label 'Interpretación del sistema'", () => {
    rend();
    expect(
      screen.getByText(/interpretación del sistema/i)
    ).toBeInTheDocument();
  });

  it("interpola el nombre de la configuración en el titular", () => {
    rend({ configNombre: "Cube Plus" });
    expect(
      screen.getByText(/la configuración de cube plus/i)
    ).toBeInTheDocument();
  });

  it("refleja un configNombre distinto en runtime (props, no hardcoded)", () => {
    rend({ configNombre: "Cube Max" });
    expect(
      screen.getByText(/la configuración de cube max/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/la configuración de cube plus/i)
    ).not.toBeInTheDocument();
  });

  it("renderiza las dos micro-métricas con valores derivados de props", () => {
    rend({ fraccionCapturada: 0.98, ciclosAnuales: 369 });
    expect(screen.getByText(/^aprovechamiento$/i)).toBeInTheDocument();
    expect(screen.getByText(/^98% de excedentes capturados$/)).toBeInTheDocument();
    expect(screen.getByText(/^utilización del activo$/i)).toBeInTheDocument();
    expect(screen.getByText(/^369 ciclos\/año$/)).toBeInTheDocument();
  });

  it("redondea el porcentaje y formatea miles del conteo de ciclos", () => {
    rend({ fraccionCapturada: 0.876, ciclosAnuales: 1234 });
    expect(screen.getByText(/^88% de excedentes capturados$/)).toBeInTheDocument();
    expect(screen.getByText(/^1,234 ciclos\/año$/)).toBeInTheDocument();
  });

  it("renderiza el apoyo descriptivo", () => {
    rend();
    expect(
      screen.getByText(
        /la estrategia actual prioriza el aprovechamiento continuo del sistema/i
      )
    ).toBeInTheDocument();
  });
});

describe("HeroCapturaCiclosSFVBess — reglas de honestidad (copy)", () => {
  it("el titular NO incluye el valor porcentual absoluto", () => {
    rend({ fraccionCapturada: 0.98 });
    const titular = screen.getByRole("heading", { level: 2 });
    expect(titular.textContent ?? "").not.toMatch(/98\s?%/);
    expect(titular.textContent ?? "").not.toMatch(/100\s?%/);
  });

  it("el copy NO menciona configuración recomendada ni 'la mejor'", () => {
    const { container } = rend();
    const texto = container.textContent ?? "";
    expect(texto).not.toMatch(/recomendada/i);
    expect(texto).not.toMatch(/mejor configuración/i);
  });

  it("el copy NO afirma trade-off, equilibrio ni comparación entre alternativas", () => {
    const { container } = rend();
    const texto = container.textContent ?? "";
    expect(texto).not.toMatch(/equilibrio/i);
    expect(texto).not.toMatch(/trade-?off/i);
    expect(texto).not.toMatch(/punto de equilibrio/i);
    expect(texto).not.toMatch(/extender la duración/i);
    expect(texto).not.toMatch(/duración mayor/i);
    expect(texto).not.toMatch(/configs?\s+alternativas?/i);
    expect(texto).not.toMatch(/alternativa/i);
  });
});
