import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SeccionDegradacionSOH } from "@/components/bess/SeccionDegradacionSOH";

// Recharts usa ResponsiveContainer + ResizeObserver, ausente en jsdom.
// Lo bypaseamos forzando dimensiones explícitas; el resto del módulo se
// importa real para que ReferenceLine/Dot/Area/Tooltip rindan en el DOM.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }} data-testid="recharts-wrap">
        {children}
      </div>
    ),
  };
});

describe("SeccionDegradacionSOH — migración P5", () => {
  it("renderiza sin crash y muestra el título de la sección", () => {
    render(<SeccionDegradacionSOH />);
    expect(
      screen.getByRole("heading", { name: /Degradación del BESS a 20 años/i })
    ).toBeInTheDocument();
  });

  it("muestra el headline ejecutivo dominante", () => {
    render(<SeccionDegradacionSOH />);
    expect(
      screen.getByText(
        /la batería mantiene más del 80% de su capacidad hasta cerca del año 9/i
      )
    ).toBeInTheDocument();
  });

  it("incluye la línea de asimetría sin números crudos", () => {
    render(<SeccionDegradacionSOH />);
    expect(
      screen.getByText(
        /la pérdida se concentra en los primeros años y se atenúa después/i
      )
    ).toBeInTheDocument();
  });

  it("expone SOLO dos KPI cards de ancla (año 0 y año 20)", () => {
    render(<SeccionDegradacionSOH />);
    expect(screen.getByText("99.4%")).toBeInTheDocument();
    expect(screen.getByText("67.1%")).toBeInTheDocument();
    // Las cards de año 1 (95.0%) y año 10 (78.7%) deben estar eliminadas
    // como KPI dedicado. Siguen existiendo como valores en la TABLA, pero
    // no como card protagonista. Verificamos su no-presencia con queries
    // específicos del label de la card eliminada.
    expect(screen.queryByText("SOH año 1")).not.toBeInTheDocument();
    expect(screen.queryByText("SOH año 10")).not.toBeInTheDocument();
  });

  it("la tabla tiene exactamente 21 filas (año 0 a año 20)", () => {
    render(<SeccionDegradacionSOH />);
    const tabla = screen.getByRole("table");
    const filas = tabla.querySelectorAll("tbody tr");
    expect(filas).toHaveLength(21);
  });

  it("la tabla expone exactamente los 6 hitos aprobados", () => {
    render(<SeccionDegradacionSOH />);
    const tabla = screen.getByRole("table");
    const textoTabla = tabla.textContent ?? "";
    // Hitos permitidos
    expect(textoTabla).toMatch(/Entrega/);
    expect(textoTabla).toMatch(/Fin de vida útil de referencia \(80%\)/);
    expect(textoTabla).toMatch(/Vida útil declarada Cube Max \(>12 años\)/);
    expect(textoTabla).toMatch(/Vida útil declarada Cube Plus \(>15 años\)/);
    expect(textoTabla).toMatch(/Umbral de garantía contractual \(70%\)/);
    expect(textoTabla).toMatch(/Fin del horizonte modelado/);
    // Hitos prohibidos (decorativos del componente previo)
    expect(textoTabla).not.toMatch(/Cierre asentamiento/);
    expect(textoTabla).not.toMatch(/Primer lustro/);
    expect(textoTabla).not.toMatch(/Punto contractual garantía/);
  });

  it("no afirma valores específicos de C-rate en ningún lugar de la sección", () => {
    const { container } = render(<SeccionDegradacionSOH />);
    const texto = container.textContent ?? "";
    // No debe afirmar "1C", "0.5C", "operación 1C", "régimen 0.5C" etc.
    expect(texto).not.toMatch(/\b1C\b/);
    expect(texto).not.toMatch(/\b0\.5C\b/);
    expect(texto).not.toMatch(/operación 1C/i);
    expect(texto).not.toMatch(/régimen 0\.5C/i);
  });

  it("expone las dos leyendas de umbral con etiquetas distintas (80% vs 70%)", () => {
    render(<SeccionDegradacionSOH />);
    // "Fin de vida útil de referencia (80%)" aparece también como hito
    // en la tabla del año 9 — basta con verificar ≥1 ocurrencia visible.
    expect(
      screen.getAllByText(/fin de vida útil de referencia \(80%\)/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/umbral de garantía contractual típico \(70%\)/i).length
    ).toBeGreaterThan(0);
  });

  it("consume CATALOGO_HYPERSTRONG y NO importa CURVAS_SOH directamente (d44)", () => {
    const filename = fileURLToPath(import.meta.url);
    const sourcePath = path.join(
      path.dirname(filename),
      "SeccionDegradacionSOH.tsx"
    );
    const source = fs.readFileSync(sourcePath, "utf-8");
    const codigo = source.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(codigo).not.toMatch(/import\s*\{[^}]*\bCURVAS_SOH\b[^}]*\}\s+from/);
    expect(codigo).not.toMatch(/from\s+["'][^"']*curvas-soh["']/);
    expect(codigo).toMatch(
      /import\s*\{[^}]*\bCATALOGO_HYPERSTRONG\b[^}]*\}\s+from\s+["']@\/data\/catalogo-hyperstrong["']/
    );
  });
});
