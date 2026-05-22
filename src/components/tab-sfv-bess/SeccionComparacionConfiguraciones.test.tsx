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

// La sección monta también CurvaCapturaCapacidad, que renderiza un <Line>
// adicional. El testid "chart-line" se vuelve común a despacho diario y curva.
// Para asegurarnos de no romper otros asserts, usamos getAllByTestId
// donde aplique.

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

describe("SeccionComparacionConfiguraciones — orden DOM del panel de evidencia", () => {
  it("orden: narrativa → resumen → curva → CTA (panel de evidencia, no respuesta central)", () => {
    rend();
    // En el test del componente, DatosSFVProvider está vacío → metadataArchivo
    // es null → BandaContextoArchivo no renderiza. Verificamos los anchors
    // que SÍ son independientes de los datos cargados.
    const narrativa = screen.getByTestId("narrativa-segura");
    const resumen = screen.getByTestId("resumen-colapsado");
    const curva = screen.getByTestId("curva-captura-capacidad");
    const cta = screen.getByTestId("cta-toggle-tabla");
    const posiciones = [
      narrativa.compareDocumentPosition(resumen),
      resumen.compareDocumentPosition(curva),
      curva.compareDocumentPosition(cta),
    ];
    for (const pos of posiciones) {
      expect(pos & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    }
  });

  it("narrativa segura visible siempre, con cifras verificables (200, 500, 32)", () => {
    rend();
    const n = screen.getByTestId("narrativa-segura");
    expect(n.textContent).toMatch(/32 configuraciones/i);
    expect(n.textContent).toMatch(/200 a 500 kW/i);
    expect(n.textContent).toMatch(/2 a 6 horas/i);
    expect(n.textContent).toMatch(/categorías operativas/i);
  });

  it("curva visible TANTO en estado colapsado como expandido", async () => {
    const user = userEvent.setup();
    rend();
    expect(screen.getByTestId("curva-captura-capacidad")).toBeInTheDocument();
    await user.click(screen.getByTestId("cta-toggle-tabla"));
    expect(screen.getByTestId("curva-captura-capacidad")).toBeInTheDocument();
  });

  it("recompute por categoría: cambiar categoriaActiva re-monta el chart con nuevos datos", () => {
    const otraCat = {
      tipo: "fuera_hora_punta_cfe" as const,
      ventana_punta: [18, 22] as [number, number],
      etiqueta: "Energía fuera de hora-punta CFE",
      descripcion: "",
    };
    const { rerender } = render(
      <DatosSFVProvider>
        <SeccionComparacionConfiguraciones
          registros={registros60Dias()}
          categoriaActiva={CAT}
        />
      </DatosSFVProvider>
    );
    const curvaA = screen.getByTestId("curva-captura-capacidad");
    expect(curvaA).toBeInTheDocument();
    rerender(
      <DatosSFVProvider>
        <SeccionComparacionConfiguraciones
          registros={registros60Dias()}
          categoriaActiva={otraCat}
        />
      </DatosSFVProvider>
    );
    expect(screen.getByTestId("curva-captura-capacidad")).toBeInTheDocument();
  });
});

describe("SeccionComparacionConfiguraciones — notas al pie integradas", () => {
  it("tres párrafos al pie (P1 modelo, P2 modelo+curva, P3 eficiencia)", () => {
    rend();
    // P1: validación bajo revisión metodológica.
    expect(
      screen.getByText(/no define por sí sola la estrategia/i)
    ).toBeInTheDocument();
    // P2: nueva, nombra la curva y "punto de inflexión".
    expect(
      screen.getByText(
        /la curva refleja el comportamiento del modelo actual.*definición vigente de energía elegible.*interpretación operativa y financiera del punto de inflexión.*sigue en definición metodológica/i
      )
    ).toBeInTheDocument();
    // P3: eficiencia conservadora 85%.
    expect(
      screen.getByText(/eficiencia de referencia conservadora del sector/i)
    ).toBeInTheDocument();
  });

  it("la nota de eficiencia aparece UNA SOLA VEZ en el DOM (no duplicada)", () => {
    rend();
    const matches = screen.getAllByText(
      /eficiencia de referencia conservadora del sector/i
    );
    expect(matches).toHaveLength(1);
  });

  it("nota P2 NO interpreta el codo (solo lo nombra como punto fuera de alcance)", () => {
    rend();
    const p2 = screen.getByText(
      /la curva refleja el comportamiento del modelo actual/i
    );
    const txt = p2.textContent ?? "";
    expect(txt).not.toMatch(/mejor|óptim|recomend|ganador|ideal/i);
    expect(txt).not.toMatch(/hasta aquí|punto dulce|conviene/i);
    expect(txt).not.toMatch(/inversión|ROI|marginal/i);
  });
});
