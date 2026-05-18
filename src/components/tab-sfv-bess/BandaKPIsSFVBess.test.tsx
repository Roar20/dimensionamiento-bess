import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BandaKPIsSFVBess } from "@/components/tab-sfv-bess/BandaKPIsSFVBess";

describe("BandaKPIsSFVBess", () => {
  it("renderiza los 4 KPIs ejecutivos con valores formateados", () => {
    render(
      <BandaKPIsSFVBess
        cargadoMwh={345.6}
        descargadoMwh={293.7}
        fraccionCapturada={0.82}
        ciclosAnuales={420}
      />
    );
    expect(screen.getByText(/energía capturada/i)).toBeInTheDocument();
    expect(screen.getByText(/energía despachada/i)).toBeInTheDocument();
    expect(screen.getByText(/fracción capturada/i)).toBeInTheDocument();
    expect(screen.getByText(/ciclos anuales/i)).toBeInTheDocument();
    expect(screen.getByText(/345\.6/)).toBeInTheDocument();
    expect(screen.getByText(/293\.7/)).toBeInTheDocument();
    expect(screen.getByText(/82\.0/)).toBeInTheDocument();
    expect(screen.getByText(/^420$/)).toBeInTheDocument();
  });

  it("expone un botón de trazabilidad por KPI (info-circle Radix)", () => {
    render(
      <BandaKPIsSFVBess
        cargadoMwh={100}
        descargadoMwh={85}
        fraccionCapturada={0.5}
        ciclosAnuales={150}
      />
    );
    expect(
      screen.getByRole("button", { name: /trazabilidad: energía capturada/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: energía despachada/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: fracción capturada/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: ciclos anuales/i })
    ).toBeInTheDocument();
  });
});
