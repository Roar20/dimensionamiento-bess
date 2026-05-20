import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { TabSFV } from "@/components/tab-sfv/TabSFV";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
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

const META_COMUN = {
  nombre_archivo: "test.xlsx",
  fecha_carga: "2026-05-17T00:00:00.000Z",
  anio: 2025,
  total_energia_mwh: 0,
  horas_con_generacion: 0,
};

/** Fixture sin excedentes: pico 200 kW × 60 días, muy por debajo de POI 500 kW. */
function datosSinExcedentes(): DatosSFV {
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
    meta: { ...META_COMUN, total_horas: registros.length, pico_horario_kw: 200 },
  };
}

/** Fixture con excedentes: pico 650 kW × 30 días, supera POI 500 kW. */
function datosConExcedentes(): DatosSFV {
  const registros = [];
  for (let d = 0; d < 30; d += 1) {
    registros.push(...generarDiaPlano(sumarDias("2025-03-01", d), 650, 8, 17));
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
    meta: { ...META_COMUN, total_horas: registros.length, pico_horario_kw: 650 },
  };
}

function rend(datos: DatosSFV) {
  return render(
    <MemoryRouter>
      <DatosSFVProvider>
        <TabSFV datos={datos} />
      </DatosSFVProvider>
    </MemoryRouter>
  );
}

describe("TabSFV — estructura ejecutiva", () => {
  it("renderiza el header dossier con título y nombre de planta", () => {
    rend(datosSinExcedentes());
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /análisis de la curva de generación del sfv.*tequila 1/i,
      })
    ).toBeInTheDocument();
  });

  it("incluye los chips de metadata (año, registros, POI, zona LMP)", () => {
    rend(datosSinExcedentes());
    expect(screen.getByText(/^año base 2025$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/^[\d,]+ registros horarios$/)
    ).toBeInTheDocument();
    expect(screen.getByText(/^poi 500 kw$/i)).toBeInTheDocument();
    expect(screen.getByText(/zona nodal minas/i)).toBeInTheDocument();
  });

  it("muestra botón 'Cambiar planta' en el header dossier", () => {
    rend(datosSinExcedentes());
    expect(
      screen.getByRole("button", { name: /cambiar planta/i })
    ).toBeInTheDocument();
  });

  it("renderiza la banda de 4 KPIs ejecutivos", () => {
    rend(datosSinExcedentes());
    expect(screen.getAllByText(/generación anual/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/factor de capacidad/i).length).toBeGreaterThan(
      0
    );
    // Cada label aparece >= 1 vez (puede repetirse en Metodología tras
    // documentar la definición del umbral 50 kW).
    expect(
      screen.getAllByText(/horas con generación/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/potencia promedio/i).length
    ).toBeGreaterThan(0);
  });

  it("KpiCards exponen tooltips de trazabilidad (botones info-circle)", () => {
    rend(datosSinExcedentes());
    // El componente expone un botón aria-label="Trazabilidad: <label>"
    // por cada KPI con tooltip.
    expect(
      screen.getByRole("button", { name: /trazabilidad: generación anual/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: factor de capacidad/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: horas con generación/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: potencia promedio/i })
    ).toBeInTheDocument();
  });

  it("renderiza ambos charts (perfil horario line + excedentes mensuales bar) cuando hay excedente", () => {
    rend(datosConExcedentes());
    expect(screen.getByTestId("chart-line")).toBeInTheDocument();
    expect(screen.getByTestId("chart-bar")).toBeInTheDocument();
  });

  it("Metodología y supuestos siempre visible (sin toggle técnico)", () => {
    rend(datosSinExcedentes());
    expect(screen.getByText(/metodología y supuestos/i)).toBeInTheDocument();
  });

  it("no muestra estructura narrativa tipo pregunta", () => {
    rend(datosSinExcedentes());
    expect(screen.queryByText(/¿cuánto genera/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/¿cuándo genera/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/¿cómo varía/i)).not.toBeInTheDocument();
  });
});

describe("TabSFV — rama sin excedentes (excedente_anual < 1 MWh)", () => {
  it("renderiza HallazgoEjecutivo con CTA a /sfv-bess y oculta mini-KPIs", () => {
    rend(datosSinExcedentes());
    expect(
      screen.getByRole("heading", {
        name: /sin excedentes físicos en el año base/i,
      })
    ).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /ver tab sfv \+ bess/i });
    expect(cta).toHaveAttribute("href", "/sfv-bess");
    // Mini-KPIs deben estar ocultos.
    expect(screen.queryByText("Mediana")).not.toBeInTheDocument();
    expect(screen.queryByText("Día crítico")).not.toBeInTheDocument();
  });

  it("muestra placeholder en lugar del chart de excedentes mensuales", () => {
    rend(datosSinExcedentes());
    expect(
      screen.getByText(/sin excedentes mensuales sobre poi durante el año base/i)
    ).toBeInTheDocument();
    // Solo el chart-line del perfil horario debe estar; el chart-bar no.
    expect(screen.queryByTestId("chart-bar")).not.toBeInTheDocument();
  });

  it("LecturaEjecutiva usa la plantilla CNE 2026 con ventana y hora pico dinámicas", () => {
    rend(datosSinExcedentes());
    expect(
      screen.getByText(/sin excedentes físicos capturables/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/arbitraje horario y potencia firme bajo régimen cne 2026/i)
    ).toBeInTheDocument();
  });

  it("columna Excedente muestra em-dash en lugar de 0.0 MWh", () => {
    rend(datosSinExcedentes());
    const tabla = screen.getByRole("table");
    const filas = tabla.querySelectorAll("tbody tr");
    expect(filas.length).toBeGreaterThan(0);
    for (const fila of filas) {
      const celdaExcedente = fila.querySelectorAll("td")[2];
      expect(celdaExcedente?.textContent).toContain("—");
      expect(celdaExcedente?.textContent).not.toMatch(/0\.0\s*MWh/);
    }
  });

  it("columna Mejor día muestra generación en kWh, no 0", () => {
    rend(datosSinExcedentes());
    const tabla = screen.getByRole("table");
    const filas = tabla.querySelectorAll("tbody tr");
    for (const fila of filas) {
      const tds = fila.querySelectorAll("td");
      const celdaMejorDia = tds[tds.length - 1];
      const texto = celdaMejorDia?.textContent ?? "";
      // Si hay generación en ese mes, debe mostrar "DD mmm · N,NNN kWh" (no "0 kWh").
      if (!texto.includes("—")) {
        expect(texto).toMatch(/\d+\s+\w+\s*·\s*[\d,]+\s*kWh/);
        expect(texto).not.toMatch(/·\s*0\s*kWh/);
      }
    }
  });
});

describe("TabSFV — rama con excedentes (excedente_anual >= 1 MWh)", () => {
  it("renderiza fila de 4 mini-KPIs y oculta HallazgoEjecutivo", () => {
    rend(datosConExcedentes());
    expect(screen.getByText("Mediana")).toBeInTheDocument();
    expect(screen.getByText("Promedio")).toBeInTheDocument();
    expect(screen.getByText("P90")).toBeInTheDocument();
    expect(screen.getByText("Día crítico")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /sin excedentes físicos en el año base/i,
      })
    ).not.toBeInTheDocument();
  });

  it("renderiza el chart bar de excedentes (no el placeholder)", () => {
    rend(datosConExcedentes());
    expect(screen.getByTestId("chart-bar")).toBeInTheDocument();
    expect(
      screen.queryByText(/sin excedentes mensuales sobre poi/i)
    ).not.toBeInTheDocument();
  });
});

describe("TabSFV — tabla resumen mensual headers", () => {
  it("expone los 6 headers consultor en orden", () => {
    rend(datosSinExcedentes());
    const tabla = screen.getByRole("table");
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
});
