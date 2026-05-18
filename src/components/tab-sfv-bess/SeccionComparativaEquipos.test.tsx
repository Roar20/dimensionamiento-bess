import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { SeccionComparativaEquipos } from "@/components/tab-sfv-bess/SeccionComparativaEquipos";
import { PRECIOS_DEFAULT } from "@/hooks/usePreciosProxy";
import { construirCategoriasDefault } from "@/lib/core/bess";
import type { ParametrosPPA } from "@/types/bess";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="chart-line" />,
  Bar: () => <div data-testid="chart-bar" />,
}));

beforeEach(() => {
  // Limpieza estable entre tests.
});
afterEach(() => {
  // No-op.
});

const params: ParametrosPPA = {
  compromiso_mensual_mwh: 40,
  capacidad_poi_kw: 500,
  ventana_punta_cfe: [18, 22],
};

function registrosFixture() {
  const out = [];
  for (let d = 0; d < 30; d += 1) {
    out.push(...generarDiaPlano(sumarDias("2025-03-01", d), 600, 8, 17));
  }
  return out;
}

function rend(overrides: Partial<Parameters<typeof SeccionComparativaEquipos>[0]> = {}) {
  const categorias = construirCategoriasDefault(params);
  const props = {
    registros: registrosFixture(),
    categorias,
    categoriaTipo: categorias[0]!.tipo,
    onCambiarCategoria: vi.fn(),
    estrategia: "greedy" as const,
    onCambiarEstrategia: vi.fn(),
    precios: PRECIOS_DEFAULT,
    tipoCambio: 20,
    ...overrides,
  };
  return render(<SeccionComparativaEquipos {...props} />);
}

describe("SeccionComparativaEquipos", () => {
  it("renderiza las 3 cards del catálogo (Cube Plus, Cube Max, Block III)", () => {
    rend();
    expect(
      screen.getByText(/hypercube c&i ii plus/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/hypercube c&i ii max/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/hyperblock iii/i)).toBeInTheDocument();
  });

  it("Block III muestra badge 'Fuera de escala' y razón canónica", () => {
    rend();
    const card = document.querySelector(
      '[data-equipo-id="block-iii"]'
    ) as HTMLElement | null;
    expect(card).not.toBeNull();
    expect(within(card!).getByText(/fuera de escala/i)).toBeInTheDocument();
    expect(
      within(card!).getByText(/escala utility.*portafolios con poi > 1 mw/i)
    ).toBeInTheDocument();
  });

  it("Block III muestra em-dashes en filas de Simulación y Economía", () => {
    rend();
    const card = document.querySelector(
      '[data-equipo-id="block-iii"]'
    ) as HTMLElement | null;
    expect(card).not.toBeNull();
    // Buscar las dd marcadas con em-dash "—".
    const dashes = Array.from(card!.querySelectorAll("dd")).filter(
      (dd) => dd.textContent?.trim() === "—"
    );
    // Esperamos al menos: descargado, ciclos, fracción, RTE, ingreso, payback = 6.
    expect(dashes.length).toBeGreaterThanOrEqual(6);
  });

  it("Cube Plus y Cube Max simulan (cuentan menos em-dashes que Block III)", () => {
    rend();
    const dashesPorEquipo = (id: string) => {
      const card = document.querySelector(
        `[data-equipo-id="${id}"]`
      ) as HTMLElement | null;
      expect(card).not.toBeNull();
      return Array.from(card!.querySelectorAll("dd")).filter(
        (dd) => dd.textContent?.trim() === "—"
      ).length;
    };
    const cubePlus = dashesPorEquipo("cube-plus");
    const cubeMax = dashesPorEquipo("cube-max");
    const block = dashesPorEquipo("block-iii");
    // Block III rellena Simulación + Economía con em-dashes (>= 6).
    expect(block).toBeGreaterThanOrEqual(6);
    // Cube Plus y Cube Max simulan: tienen estrictamente menos em-dashes.
    expect(cubePlus).toBeLessThan(block);
    expect(cubeMax).toBeLessThan(block);
  });
});
