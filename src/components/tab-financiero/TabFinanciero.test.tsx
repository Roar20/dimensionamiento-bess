import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TabFinanciero } from "@/components/tab-financiero/TabFinanciero";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
import { limpiarTipoCambioPersistido } from "@/hooks/useTipoCambio";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { DatosSFV } from "@/types/sfv";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="chart-line" />,
  Bar: () => <div data-testid="chart-bar" />,
}));

// tipo-cambio sigue persistido (preferencia macro del usuario);
// las demás claves son stateless y no requieren limpieza entre tests.
beforeEach(() => limpiarTipoCambioPersistido());
afterEach(() => limpiarTipoCambioPersistido());

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
      periodo_inicio: registros[0]?.timestamp ?? null,
      periodo_fin: registros[registros.length - 1]?.timestamp ?? null,
      granularidad_detectada: "horaria",
      minutos_mediana_delta: 60,
      cobertura: "parcial",
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
        name: /Valor incremental del BESS sobre un SFV existente/i,
        level: 1,
      })
    ).toBeInTheDocument();
  });

  it("comunica el modelo proxy de potencia firme + Estanzuela 2 como referencia de precios", () => {
    rend();
    // El badge "incluye potencia firme proxy" del Hero está siempre
    // visible y es el indicador canónico del proxy tras el cambio F
    // (el disclaimer rojo separado se removió; el texto detallado vive
    // ahora en tooltips contextuales).
    expect(
      screen.getAllByText(/incluye potencia firme proxy/i).length
    ).toBeGreaterThanOrEqual(1);
    // El disclaimer ámbar superior mantiene la mención a Estanzuela 2.
    expect(
      screen.getAllByText(/Estanzuela 2/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renderiza los 6 KPIs del hero ejecutivo", () => {
    rend();
    // Varios de estos labels reaparecen en otras secciones; usamos getAllByText.
    expect(screen.getAllByText("Payback BESS").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Incremental BESS · año 1/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Acumulado BESS · 20 años/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Proyecto total · año 1/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Utilización BESS")).toBeInTheDocument();
    expect(screen.getAllByText(/CAPEX/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza la tabla anual con 21 filas (año 0 al 20)", () => {
    rend();
    const filas = document.querySelectorAll(
      "table tbody tr"
    );
    // TablaAnual21 ahora tiene 9 columnas (PPA SFV, CELs SFV separados +
    // Incremental BESS + OPEX + Flujo neto + Flujo acumulado).
    const filasAnual = Array.from(filas).filter(
      (tr) => tr.querySelectorAll("td").length === 9
    );
    expect(filasAnual).toHaveLength(21);
  });

  it("renderiza la sección 'Evolución económica' (master chart) sin crash", () => {
    rend();
    expect(
      screen.getByRole("heading", {
        name: /Aporte incremental BESS · 20 años con SOH/i,
      })
    ).toBeInTheDocument();
  });

  it("renderiza las 3 cards de sensibilidades (Conservador/Base/Optimista)", () => {
    rend();
    expect(screen.getAllByText("Conservador").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Base").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Optimista").length).toBeGreaterThanOrEqual(1);
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
