import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { TabSFV } from "@/components/tab-sfv/TabSFV";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { DatosSFV } from "@/types/sfv";

// Chart.js usa canvas, no soportado por jsdom. Stub: render mínimo que
// exponga el tipo de chart sin tocar el DOM real.
vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { datasets: { label: string }[] } }) => (
    <div data-testid="chart-line" data-series={data.datasets.length} />
  ),
  Bar: ({ data }: { data: { datasets: { label: string }[] } }) => (
    <div data-testid="chart-bar" data-series={data.datasets.length} />
  ),
}));

function construirDatos(): DatosSFV {
  const registros = [];
  for (let d = 0; d < 60; d += 1) {
    registros.push(...generarDiaPlano(sumarDias("2025-03-01", d), 200, 8, 17));
  }
  return {
    config: {
      nombre: "Tequila 1",
      cliente: null,
      ubicacion: null,
      capacidad_poi_kw: 500,
      capacidad_instalada_kw: 500,
      zona_lmp: "MINAS",
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

function renderTab() {
  return render(<TabSFV datos={construirDatos()} />);
}

describe("TabSFV — estructura ejecutiva", () => {
  it("renderiza el header dossier con título y nombre de planta", () => {
    renderTab();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /análisis de la curva de generación del sfv.*tequila 1/i,
      })
    ).toBeInTheDocument();
  });

  it("incluye los chips de metadata (año, registros, POI, zona LMP)", () => {
    renderTab();
    expect(screen.getByText(/^año base 2025$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/^[\d,]+ registros horarios$/)
    ).toBeInTheDocument();
    expect(screen.getByText(/^poi 500 kw$/i)).toBeInTheDocument();
    expect(screen.getByText(/zona lmp minas/i)).toBeInTheDocument();
  });

  it("renderiza la banda de 4 KPIs ejecutivos", () => {
    renderTab();
    // Estos textos también aparecen en MetodologiaSFV; con getAllByText
    // verificamos que al menos exista la versión KPI (label uppercase).
    expect(screen.getAllByText(/generación anual/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/factor de capacidad/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getByText(/horas con generación/i)).toBeInTheDocument();
    expect(screen.getByText(/potencia promedio/i)).toBeInTheDocument();
  });

  it("renderiza una Lectura ejecutiva con texto dinámico", () => {
    renderTab();
    // 200 kW pico ≤ 500 POI → primera frase variante "consistentemente por debajo".
    expect(
      screen.getByText(/consistentemente por debajo del poi/i)
    ).toBeInTheDocument();
    // Label de la banda.
    expect(screen.getByText(/lectura ejecutiva/i)).toBeInTheDocument();
  });

  it("renderiza ambos charts (perfil horario line + excedentes mensuales bar)", () => {
    renderTab();
    expect(screen.getByTestId("chart-line")).toBeInTheDocument();
    expect(screen.getByTestId("chart-bar")).toBeInTheDocument();
  });

  it("renderiza los 4 mini-KPIs de distribución de excedentes diarios", () => {
    renderTab();
    expect(screen.getByText("Mediana")).toBeInTheDocument();
    expect(screen.getByText("Promedio")).toBeInTheDocument();
    expect(screen.getByText("P90")).toBeInTheDocument();
    expect(screen.getByText("Día crítico")).toBeInTheDocument();
  });

  it("renderiza la tabla resumen mensual con headers consultor", () => {
    renderTab();
    const tabla = screen.getByRole("table");
    expect(tabla).toBeInTheDocument();
    const headers = Array.from(tabla.querySelectorAll("th")).map(
      (h) => h.textContent
    );
    expect(headers).toEqual([
      "Mes",
      "Generación",
      "Excedente",
      "Pico",
      "Días activos",
      "Mejor día",
    ]);
  });

  it("Metodología y supuestos siempre visible (sin toggle técnico)", () => {
    renderTab();
    expect(screen.getByText(/metodología y supuestos/i)).toBeInTheDocument();
  });

  it("no muestra estructura narrativa tipo pregunta", () => {
    renderTab();
    expect(screen.queryByText(/¿cuánto genera/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/¿cuándo genera/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/¿cómo varía/i)).not.toBeInTheDocument();
  });
});
