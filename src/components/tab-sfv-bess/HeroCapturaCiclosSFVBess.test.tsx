import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { HeroCapturaCiclosSFVBess } from "@/components/tab-sfv-bess/HeroCapturaCiclosSFVBess";
import type { CategoriaEnergia } from "@/types/bess";

const CAT_TODA: CategoriaEnergia = {
  tipo: "toda_energia",
  etiqueta: "Toda la energía es candidata",
  descripcion: "Techo técnico.",
};
const CAT_FUERA_PUNTA: CategoriaEnergia = {
  tipo: "fuera_hora_punta_cfe",
  ventana_punta: [18, 22],
  etiqueta: "Energía fuera de hora-punta CFE",
  descripcion: "Fuera de la ventana 18-22h.",
};
const CAT_COMPROMISO: CategoriaEnergia = {
  tipo: "compromiso_ppa_mensual_mwh",
  mwh_mes: 40,
  etiqueta: "Energía arriba del compromiso PPA",
  descripcion: "Por encima del compromiso.",
};
const CAT_EXCESO_CFE: CategoriaEnergia = {
  tipo: "exceso_capacidad_cfe_kw",
  techo_kw: 500,
  etiqueta: "Energía que excede capacidad CFE",
  descripcion: "Generación instantánea por encima del POI.",
};

function rend(
  overrides: Partial<React.ComponentProps<typeof HeroCapturaCiclosSFVBess>> = {}
) {
  return render(
    <HeroCapturaCiclosSFVBess
      configNombre="Cube Plus"
      fraccionCapturada={0.1}
      ciclosAnuales={385}
      categoria={CAT_TODA}
      {...overrides}
    />
  );
}

describe("HeroCapturaCiclosSFVBess — render base", () => {
  it("renderiza el label 'Interpretación del sistema'", () => {
    rend();
    expect(
      screen.getByText(/interpretación del sistema/i)
    ).toBeInTheDocument();
  });

  it("micro-métricas con label 'energía elegible capturada' y formato es-MX", () => {
    rend({ fraccionCapturada: 0.88, ciclosAnuales: 1234 });
    expect(screen.getByText(/^aprovechamiento$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/^88% de energía elegible capturada$/)
    ).toBeInTheDocument();
    expect(screen.getByText(/^utilización del activo$/i)).toBeInTheDocument();
    expect(screen.getByText(/^1,234 ciclos\/año$/)).toBeInTheDocument();
  });
});

describe("HeroCapturaCiclosSFVBess — umbrales del titular y apoyo", () => {
  it("alta (pct ≥ 80): aprovecha prácticamente toda + apoyo simétrico", () => {
    rend({ fraccionCapturada: 0.95, categoria: CAT_TODA });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(
      /la configuración de Cube Plus aprovecha prácticamente toda la energía elegible bajo la operación con toda la energía con una alta utilización anual del BESS/i
    );
    expect(
      screen.getByText(
        /La estrategia actual aprovecha prácticamente toda la energía elegible de esta categoría\./i
      )
    ).toBeInTheDocument();
  });

  it("media (30 ≤ pct < 80): captura una parte significativa + apoyo 'porción relevante'", () => {
    rend({ fraccionCapturada: 0.65, categoria: CAT_COMPROMISO });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(
      /captura una parte significativa de la energía elegible bajo energía por encima del compromiso PPA, operando con alta utilización anual/i
    );
    expect(
      screen.getByText(
        /La estrategia actual captura una porción relevante de la energía elegible bajo esta categoría\./i
      )
    ).toBeInTheDocument();
  });

  it("baja (0 < pct < 30): opera con alta utilización aunque solo fracción + apoyo 'factor limitante'", () => {
    rend({ fraccionCapturada: 0.1, categoria: CAT_TODA });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(
      /opera con alta utilización anual, aunque captura solo una fracción de la energía elegible bajo la operación con toda la energía/i
    );
    expect(
      screen.getByText(
        /La capacidad del BESS es el factor limitante frente al volumen anual de energía elegible\./i
      )
    ).toBeInTheDocument();
  });

  it("nula (pct = 0): titular dice prácticamente no presenta + apoyo simétrico", () => {
    rend({ fraccionCapturada: 0, categoria: CAT_EXCESO_CFE });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(
      /Bajo energía que excede capacidad CFE, la planta prácticamente no presenta energía disponible para almacenamiento con la configuración actual/i
    );
    expect(
      screen.getByText(
        /Bajo esta categoría, la planta prácticamente no presenta energía disponible para almacenamiento\./i
      )
    ).toBeInTheDocument();
  });

  it("redondea al elegir umbral: pct=29.9 cae en baja, pct=30 cae en media", () => {
    // 0.295 → Math.round(29.5) = 30 → media
    rend({ fraccionCapturada: 0.295, categoria: CAT_TODA });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(/captura una parte significativa/i);
    // 0.294 → Math.round(29.4) = 29 → baja
    rend({ fraccionCapturada: 0.294, categoria: CAT_TODA });
    expect(
      screen.getAllByRole("heading", { level: 2 })[1]!.textContent
    ).toMatch(/solo una fracción/i);
  });
});

describe("HeroCapturaCiclosSFVBess — natural por categoría", () => {
  it("toda_energia → 'la operación con toda la energía'", () => {
    rend({ fraccionCapturada: 0.5, categoria: CAT_TODA });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(/la operación con toda la energía/i);
  });

  it("fuera_hora_punta_cfe → 'energía fuera de hora-punta CFE'", () => {
    rend({ fraccionCapturada: 0.5, categoria: CAT_FUERA_PUNTA });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(/energía fuera de hora-punta CFE/i);
  });

  it("compromiso_ppa_mensual_mwh → 'energía por encima del compromiso PPA'", () => {
    rend({ fraccionCapturada: 0.5, categoria: CAT_COMPROMISO });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(/energía por encima del compromiso PPA/i);
  });

  it("exceso_capacidad_cfe_kw → 'energía que excede capacidad CFE'", () => {
    rend({ fraccionCapturada: 0.5, categoria: CAT_EXCESO_CFE });
    expect(
      screen.getByRole("heading", { level: 2 }).textContent
    ).toMatch(/energía que excede capacidad CFE/i);
  });
});

describe("HeroCapturaCiclosSFVBess — reglas de honestidad", () => {
  it("'prácticamente toda' NO aparece en baja", () => {
    const { container } = rend({ fraccionCapturada: 0.1, categoria: CAT_TODA });
    expect(container.textContent ?? "").not.toMatch(/prácticamente toda/i);
  });

  it("'factor limitante' NO aparece en alta", () => {
    const { container } = rend({ fraccionCapturada: 0.95, categoria: CAT_TODA });
    expect(container.textContent ?? "").not.toMatch(/factor limitante/i);
  });

  it("'factor limitante' NO aparece en media", () => {
    const { container } = rend({
      fraccionCapturada: 0.65,
      categoria: CAT_COMPROMISO,
    });
    expect(container.textContent ?? "").not.toMatch(/factor limitante/i);
  });

  it("titular NO contiene porcentaje absoluto", () => {
    for (const f of [0.1, 0.45, 0.95]) {
      const { unmount } = rend({ fraccionCapturada: f, categoria: CAT_TODA });
      const titular = screen.getByRole("heading", { level: 2 });
      expect(titular.textContent ?? "").not.toMatch(/\d+\s?%/);
      unmount();
    }
  });

  it("el copy completo NO menciona config recomendada, equilibrio, trade-off, duraciones mayores ni alternativas", () => {
    // Probamos los 4 umbrales para cubrir todo el copy condicional.
    const fracciones: number[] = [0.95, 0.65, 0.1, 0];
    for (const f of fracciones) {
      const { container, unmount } = rend({
        fraccionCapturada: f,
        categoria: CAT_TODA,
      });
      const texto = container.textContent ?? "";
      expect(texto).not.toMatch(/recomendada/i);
      expect(texto).not.toMatch(/mejor configuración/i);
      expect(texto).not.toMatch(/equilibrio/i);
      expect(texto).not.toMatch(/trade-?off/i);
      expect(texto).not.toMatch(/extender la duración/i);
      expect(texto).not.toMatch(/duración mayor/i);
      expect(texto).not.toMatch(/configs?\s+alternativas?/i);
      expect(texto).not.toMatch(/alternativa/i);
      unmount();
    }
  });
});
