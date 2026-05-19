import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TabFinanciero } from "@/components/tab-financiero/TabFinanciero";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
import { limpiarParametrosFinancierosPersistidos } from "@/hooks/useParametrosFinancieros";
import { limpiarTipoCambioPersistido } from "@/hooks/useTipoCambio";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { DatosSFV } from "@/types/sfv";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="chart-line" />,
  Bar: () => <div data-testid="chart-bar" />,
}));

beforeEach(() => {
  limpiarParametrosFinancierosPersistidos();
  limpiarTipoCambioPersistido();
});
afterEach(() => {
  limpiarParametrosFinancierosPersistidos();
  limpiarTipoCambioPersistido();
});

function datosFixture(): DatosSFV {
  const registros = [];
  for (let d = 0; d < 60; d += 1) {
    registros.push(...generarDiaPlano(sumarDias("2025-03-01", d), 400, 8, 17));
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
      fecha_carga: "2026-05-19T00:00:00.000Z",
      anio: 2025,
      total_horas: registros.length,
      total_energia_mwh: 0,
      horas_con_generacion: 0,
      pico_horario_kw: 400,
    },
  };
}

function rend() {
  return render(
    <MemoryRouter>
      <DatosSFVProvider>
        <TabFinanciero datos={datosFixture()} />
      </DatosSFVProvider>
    </MemoryRouter>
  );
}

describe("TabFinanciero · render integration", () => {
  it("renderiza el título principal del Tab", () => {
    rend();
    expect(
      screen.getByRole("heading", {
        name: /Análisis Financiero/i,
        level: 1,
      })
    ).toBeInTheDocument();
  });

  it("renderiza el disclaimer transversal con la mención al PAA y a la proxy Estanzuela 2", () => {
    rend();
    // El término aparece en disclaimer + metodología; ambos tienen que existir.
    expect(
      screen.getAllByText(/PAA del Manual de Mercado/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Estanzuela 2/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renderiza los 6 KPIs del hero ejecutivo", () => {
    rend();
    // Varios de estos labels reaparecen en otras secciones; usamos getAllByText.
    expect(screen.getAllByText("Payback").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Ingreso bruto año 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Ingreso acum. 20 años")).toBeInTheDocument();
    expect(screen.getByText("Δ vs SFV solo")).toBeInTheDocument();
    expect(screen.getByText("Utilización BESS")).toBeInTheDocument();
    expect(screen.getAllByText(/CAPEX/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza la tabla anual con 21 filas (año 0 al 20)", () => {
    rend();
    const filas = document.querySelectorAll(
      "table tbody tr"
    );
    // Hay 2 tablas: comparativa (sin tbody con 21 filas) y tabla anual (21 filas).
    // Filtramos por número de columnas: TablaAnual21 tiene 7 columnas.
    const filasAnual = Array.from(filas).filter(
      (tr) => tr.querySelectorAll("td").length === 7
    );
    expect(filasAnual).toHaveLength(21);
  });

  it("renderiza las 3 cards de sensibilidades (Conservador/Base/Optimista)", () => {
    rend();
    expect(screen.getByText("Conservador")).toBeInTheDocument();
    expect(screen.getByText("Base")).toBeInTheDocument();
    expect(screen.getByText("Optimista")).toBeInTheDocument();
  });
});

describe("TabFinanciero · defensa arquitectónica d44", () => {
  it("el componente importa CATALOGO_HYPERSTRONG del catálogo y NO importa CURVAS_SOH", () => {
    const filename = fileURLToPath(import.meta.url);
    const sourcePath = path.join(
      path.dirname(filename),
      "TabFinanciero.tsx"
    );
    const source = fs.readFileSync(sourcePath, "utf-8");
    const codigo = source
      .replace(/\/\/[^\n]*/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(codigo).not.toMatch(/import\s*\{[^}]*\bCURVAS_SOH\b[^}]*\}\s+from/);
    expect(codigo).not.toMatch(/from\s+["'][^"']*curvas-soh["']/);
    expect(codigo).toMatch(
      /import\s*\{[^}]*\bCATALOGO_HYPERSTRONG\b[^}]*\}\s+from\s+["']@\/data\/catalogo-hyperstrong["']/
    );
  });

  it("calculos.ts del Tab Financiero NO importa CURVAS_SOH", () => {
    const filename = fileURLToPath(import.meta.url);
    const repoRoot = path.resolve(
      path.dirname(filename),
      "..",
      "..",
      ".."
    );
    const sourcePath = path.join(
      repoRoot,
      "src",
      "lib",
      "tab-financiero",
      "calculos.ts"
    );
    const source = fs.readFileSync(sourcePath, "utf-8");
    const codigo = source
      .replace(/\/\/[^\n]*/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(codigo).not.toMatch(/import\s*\{[^}]*\bCURVAS_SOH\b[^}]*\}\s+from/);
    expect(codigo).not.toMatch(/from\s+["'][^"']*curvas-soh["']/);
  });
});
