import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { TabSFVBess } from "@/components/tab-sfv-bess/TabSFVBess";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
import { limpiarTipoCambioPersistido } from "@/hooks/useTipoCambio";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { DatosSFV } from "@/types/sfv";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="chart-line" />,
  Bar: () => <div data-testid="chart-bar" />,
}));

// Solo tipo-cambio persiste; las demás claves son stateless.
beforeEach(() => limpiarTipoCambioPersistido());
afterEach(() => limpiarTipoCambioPersistido());

function datosFixture(): DatosSFV {
  const registros = [];
  for (let d = 0; d < 60; d += 1) {
    registros.push(...generarDiaPlano(sumarDias("2025-03-01", d), 600, 8, 17));
  }
  return {
    config: {
      nombre: "Tequila 1",
      cliente: null,
      ubicacion: null,
      capacidad_poi_kw: 500,
      capacidad_instalada_kw: 500,
      zona_lmp: "MINAS",
      precio_ppa_mxn_mwh: 1010.8,
    },
    registros,
    meta: {
      nombre_archivo: "test.xlsx",
      fecha_carga: "2026-05-18T00:00:00.000Z",
      anio: 2025,
      total_horas: registros.length,
      total_energia_mwh: 0,
      horas_con_generacion: 0,
      pico_horario_kw: 600,
    },
  };
}

function rend() {
  return render(
    <MemoryRouter>
      <DatosSFVProvider>
        <TabSFVBess datos={datosFixture()} />
      </DatosSFVProvider>
    </MemoryRouter>
  );
}

describe("TabSFVBess — integración", () => {
  it("renderiza header dossier SFV+BESS, panel precios, banda KPIs, charts, comparativas y metodología", () => {
    rend();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /análisis del sfv \+ bess.*tequila 1/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/precios proxy editables/i)).toBeInTheDocument();
    expect(screen.getAllByText(/energía capturada/i).length).toBeGreaterThan(0);
    // Chart de despacho siempre presente; el de captura mensual puede
    // sustituirse por HallazgoEjecutivo cuando la captura agregada = 0.
    expect(screen.getByTestId("chart-line")).toBeInTheDocument();
    expect(
      screen.getByTestId("chart-bar") ??
        screen.getByText(/sin captura mensual bajo/i)
    ).toBeInTheDocument();
    // Comparativas presentes.
    expect(
      screen.getByText(/comparativa de estrategias/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/comparativa de equipos/i)).toBeInTheDocument();
    expect(screen.getByText(/metodología y supuestos/i)).toBeInTheDocument();
  });

  it("NUNCA muestra strings prohibidos del lenguaje viejo de recomendación", () => {
    const { container } = rend();
    const PROHIBIDAS =
      /\bRECOMENDADO\b|equipo recomendado|mejor opción|óptimo|estrategia lalo/i;
    expect(container.textContent ?? "").not.toMatch(PROHIBIDAS);
  });
});
