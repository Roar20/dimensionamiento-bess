import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SeccionDegradacionSOH } from "@/components/bess/SeccionDegradacionSOH";

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { datasets: { label: string }[] } }) => (
    <div data-testid="chart-line" data-series={data.datasets.length} />
  ),
}));

describe("SeccionDegradacionSOH", () => {
  it("renderiza sin crash", () => {
    render(<SeccionDegradacionSOH />);
    expect(
      screen.getByRole("heading", { name: /Degradación del BESS a 20 años/i })
    ).toBeInTheDocument();
  });

  it("renderiza los 4 KPIs con valores derivados de la curva del catálogo", () => {
    render(<SeccionDegradacionSOH />);
    expect(screen.getByText("99.4%")).toBeInTheDocument();
    expect(screen.getByText("95.0%")).toBeInTheDocument();
    expect(screen.getByText("78.7%")).toBeInTheDocument();
    expect(screen.getByText("67.1%")).toBeInTheDocument();
  });

  it("la tabla tiene exactamente 21 filas (año 0 a año 20)", () => {
    render(<SeccionDegradacionSOH />);
    const filas = document.querySelectorAll("tbody tr");
    expect(filas).toHaveLength(21);
  });

  it("consume CATALOGO_HYPERSTRONG y NO importa CURVAS_SOH directamente (d44)", () => {
    const filename = fileURLToPath(import.meta.url);
    const sourcePath = path.join(
      path.dirname(filename),
      "SeccionDegradacionSOH.tsx"
    );
    const source = fs.readFileSync(sourcePath, "utf-8");
    // El componente NO debe importar CURVAS_SOH ni el módulo curvas-soh.
    // (la prosa pedagógica de la metodología sí menciona el símbolo literal
    // como copy, por eso filtramos comentarios/strings antes de chequear)
    const codigo = source.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(codigo).not.toMatch(/import\s*\{[^}]*\bCURVAS_SOH\b[^}]*\}\s+from/);
    expect(codigo).not.toMatch(/from\s+["'][^"']*curvas-soh["']/);
    // El componente sí debe importar CATALOGO_HYPERSTRONG del catálogo.
    expect(codigo).toMatch(
      /import\s*\{[^}]*\bCATALOGO_HYPERSTRONG\b[^}]*\}\s+from\s+["']@\/data\/catalogo-hyperstrong["']/
    );
  });
});
