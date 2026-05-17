import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

import { TabSFV } from "@/components/tab-sfv/TabSFV";
import { ViewModeProvider, useViewMode } from "@/context/ViewModeContext";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { DatosSFV } from "@/types/sfv";

function TestToggleTecnico() {
  const { setMode } = useViewMode();
  return (
    <button
      type="button"
      data-testid="test-toggle-tecnico"
      onClick={() => setMode("tecnico")}
    />
  );
}

function construirDatos(): DatosSFV {
  const registros = [];
  for (let d = 0; d < 30; d += 1) {
    registros.push(
      ...generarDiaPlano(sumarDias("2025-03-01", d), 200, 8, 17)
    );
  }
  return {
    config: {
      nombre: "Test Plant",
      cliente: null,
      ubicacion: null,
      capacidad_poi_kw: 500,
      capacidad_instalada_kw: 500,
      zona_lmp: null,
      precio_ppa_mxn_mwh: null,
    },
    registros,
    meta: {
      nombre_archivo: "test.xlsx",
      fecha_carga: "2026-05-17T00:00:00.000Z",
      anio: 2025,
      total_horas: registros.length,
      total_energia_mwh: 0,
      horas_con_generacion: 0,
      pico_horario_kw: 200,
    },
  };
}

function renderTab({ withToggle }: { withToggle?: boolean } = {}) {
  const tree: ReactNode = (
    <ViewModeProvider>
      <MemoryRouter initialEntries={["/sfv"]}>
        {withToggle ? <TestToggleTecnico /> : null}
        <TabSFV datos={construirDatos()} />
      </MemoryRouter>
    </ViewModeProvider>
  );
  return render(tree);
}

describe("TabSFV", () => {
  it("renderiza las 5 secciones del Tab SFV en granularidad anual", () => {
    renderTab();

    expect(
      screen.getByRole("heading", { name: /¿cuánto genera tu sfv/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /¿cuándo genera durante el día/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /¿cómo varía día a día/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /¿cuándo genera más, hora por hora/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /resumen mensual/i })
    ).toBeInTheDocument();
  });

  it("ocultar la Sección 5 al cambiar a granularidad mensual", async () => {
    const user = userEvent.setup();
    renderTab();

    expect(
      screen.getByRole("heading", { name: /resumen mensual/i })
    ).toBeInTheDocument();

    const radioMensual = screen.getByLabelText(/^mensual$/i);
    await user.click(radioMensual);

    expect(
      screen.queryByRole("heading", { name: /resumen mensual/i })
    ).not.toBeInTheDocument();
  });

  it("Vista técnica muestra bloques colapsables adicionales", async () => {
    const user = userEvent.setup();
    renderTab({ withToggle: true });

    expect(screen.queryByText(/detalle técnico/i)).not.toBeInTheDocument();

    await user.click(screen.getByTestId("test-toggle-tecnico"));

    expect(screen.getAllByText(/detalle técnico/i).length).toBeGreaterThan(0);
  });

  it("KPI Energía generada muestra MWh con número tabular", () => {
    renderTab();
    const seccion1 = screen
      .getByRole("heading", { name: /¿cuánto genera tu sfv/i })
      .closest("section");
    expect(seccion1).not.toBeNull();
    const dentro = within(seccion1 as HTMLElement);
    expect(dentro.getByText(/energía generada/i)).toBeInTheDocument();
    expect(dentro.getAllByText(/MWh/).length).toBeGreaterThan(0);
  });
});
