import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SeccionComparacionConfiguraciones } from "./SeccionComparacionConfiguraciones";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
import { limpiarTipoCambioPersistido } from "@/hooks/useTipoCambio";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { CategoriaEnergia } from "@/types/bess";

// Chart.js no se monta aquí, pero por consistencia con TabSFVBess.test.tsx.
vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="chart-line" />,
  Bar: () => <div data-testid="chart-bar" />,
}));

beforeEach(() => limpiarTipoCambioPersistido());
afterEach(() => limpiarTipoCambioPersistido());

const CAT: CategoriaEnergia = {
  tipo: "toda_energia",
  etiqueta: "Toda la energía es candidata",
  descripcion: "",
};

function registros60Dias() {
  const rs = [];
  for (let d = 0; d < 60; d += 1) {
    rs.push(...generarDiaPlano(sumarDias("2025-03-01", d), 600, 8, 17));
  }
  return rs;
}

function rend() {
  return render(
    <DatosSFVProvider>
      <SeccionComparacionConfiguraciones
        registros={registros60Dias()}
        categoriaActiva={CAT}
      />
    </DatosSFVProvider>
  );
}

describe("SeccionComparacionConfiguraciones — colapsabilidad", () => {
  it("por DEFAULT la tabla está colapsada (resumen visible, tabla oculta)", () => {
    rend();
    expect(screen.getByTestId("resumen-colapsado")).toBeInTheDocument();
    expect(screen.queryAllByTestId("fila-config")).toHaveLength(0);
  });

  it("resumen colapsado muestra '32 configuraciones' y rango de captura", () => {
    rend();
    const resumen = screen.getByTestId("resumen-colapsado");
    expect(resumen.textContent ?? "").toMatch(/se evaluaron 32 configuraciones/i);
    expect(resumen.textContent ?? "").toMatch(
      /captura entre \d+% y \d+%/i
    );
  });

  it("CTA inicial dice 'Ver las 32 configuraciones evaluadas' con aria-expanded=false", () => {
    rend();
    const cta = screen.getByTestId("cta-toggle-tabla");
    expect(cta.textContent).toMatch(/ver las 32 configuraciones evaluadas/i);
    expect(cta.getAttribute("aria-expanded")).toBe("false");
  });

  it("click en CTA expande la tabla, oculta el resumen, y cambia el texto del CTA", async () => {
    const user = userEvent.setup();
    rend();
    await user.click(screen.getByTestId("cta-toggle-tabla"));

    expect(screen.queryByTestId("resumen-colapsado")).toBeNull();
    expect(screen.getAllByTestId("fila-config")).toHaveLength(32);
    const cta = screen.getByTestId("cta-toggle-tabla");
    expect(cta.textContent).toMatch(/ocultar configuraciones/i);
    expect(cta.getAttribute("aria-expanded")).toBe("true");
  });

  it("segundo click colapsa de nuevo", async () => {
    const user = userEvent.setup();
    rend();
    const cta = screen.getByTestId("cta-toggle-tabla");
    await user.click(cta);
    await user.click(cta);
    expect(screen.getByTestId("resumen-colapsado")).toBeInTheDocument();
    expect(screen.queryAllByTestId("fila-config")).toHaveLength(0);
  });

  it("línea metodológica visible en estado colapsado, descriptiva no programática", () => {
    rend();
    const resumen = screen.getByTestId("resumen-colapsado");
    expect(
      within(resumen).getByText(
        /El análisis distingue configuraciones técnicamente defendibles según su relación entre captura y capacidad\./i
      )
    ).toBeInTheDocument();
  });

  it("notas metodológicas al pie SIEMPRE visibles (colapsada y expandida)", async () => {
    const user = userEvent.setup();
    rend();
    // Colapsada
    expect(
      screen.getByText(/no define por sí sola la estrategia/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/eficiencia de referencia conservadora del sector/i)
    ).toBeInTheDocument();
    // Expandida
    await user.click(screen.getByTestId("cta-toggle-tabla"));
    expect(
      screen.getByText(/no define por sí sola la estrategia/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/eficiencia de referencia conservadora del sector/i)
    ).toBeInTheDocument();
  });

  it("línea metodológica del modo colapsado NO menciona 'frente' como objeto visible ni términos prohibidos", () => {
    rend();
    const resumen = screen.getByTestId("resumen-colapsado");
    const texto = resumen.textContent ?? "";
    expect(texto).not.toMatch(/\bfrente\b/i);
    expect(texto).not.toMatch(/selección automática/i);
    expect(texto).not.toMatch(/mejor|óptim|recomend|ganador|ideal/i);
  });
});
