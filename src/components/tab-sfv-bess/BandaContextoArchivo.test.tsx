import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BandaContextoArchivo } from "./BandaContextoArchivo";
import type { MetadataArchivoUI } from "@/types/sfv";

function baseAnualHoraria(overrides?: Partial<MetadataArchivoUI>): MetadataArchivoUI {
  return {
    nombrePlanta: "Planta Test",
    periodoInicio: new Date("2025-01-01"),
    periodoFin: new Date("2025-12-31"),
    numRegistros: 8760,
    granularidadDetectada: "horaria",
    minutosMedianaDelta: 60,
    cobertura: "anual",
    advertencias: [],
    ...overrides,
  };
}

describe("BandaContextoArchivo", () => {
  it("renderiza nada cuando metadataArchivo es null", () => {
    const { container } = render(
      <BandaContextoArchivo metadataArchivo={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("estado limpio: anual + horaria + sin advertencias → banda azul, no ámbar", () => {
    render(<BandaContextoArchivo metadataArchivo={baseAnualHoraria()} />);
    expect(screen.getByTestId("banda-limpia")).toBeInTheDocument();
    expect(screen.queryByTestId("banda-advertencia")).toBeNull();
  });

  it("estado limpio muestra granularidad horaria y cobertura anual", () => {
    render(<BandaContextoArchivo metadataArchivo={baseAnualHoraria()} />);
    expect(screen.getByText(/granularidad horaria/i)).toBeInTheDocument();
    expect(screen.getByText(/cobertura anual/i)).toBeInTheDocument();
  });

  it("estado limpio muestra el número de registros", () => {
    render(<BandaContextoArchivo metadataArchivo={baseAnualHoraria({ numRegistros: 8760 })} />);
    expect(screen.getByText(/8.760/)).toBeInTheDocument();
  });

  it("cobertura parcial → banda ámbar, no limpia", () => {
    render(
      <BandaContextoArchivo
        metadataArchivo={baseAnualHoraria({
          cobertura: "parcial",
          advertencias: ["Los datos cubren solo un período parcial del año."],
        })}
      />
    );
    expect(screen.getByTestId("banda-advertencia")).toBeInTheDocument();
    expect(screen.queryByTestId("banda-limpia")).toBeNull();
  });

  it("cobertura parcial muestra el mensaje de advertencia", () => {
    const msg = "Los datos cubren solo un período parcial del año.";
    render(
      <BandaContextoArchivo
        metadataArchivo={baseAnualHoraria({
          cobertura: "parcial",
          advertencias: [msg],
        })}
      />
    );
    expect(screen.getByText(msg)).toBeInTheDocument();
  });

  it("granularidad sub-horaria → banda ámbar + minutos visibles", () => {
    render(
      <BandaContextoArchivo
        metadataArchivo={baseAnualHoraria({
          granularidadDetectada: "sub_horaria",
          minutosMedianaDelta: 15,
          cobertura: "desconocida",
          advertencias: [],
        })}
      />
    );
    expect(screen.getByTestId("banda-advertencia")).toBeInTheDocument();
    const itemGran = screen.getByTestId("item-granularidad");
    expect(itemGran).toBeInTheDocument();
    expect(itemGran.textContent).toContain("15");
  });

  it("granularidad sub-horaria muestra tipo de granularidad", () => {
    render(
      <BandaContextoArchivo
        metadataArchivo={baseAnualHoraria({
          granularidadDetectada: "sub_horaria",
          minutosMedianaDelta: 15,
          cobertura: "desconocida",
          advertencias: [],
        })}
      />
    );
    expect(screen.getByTestId("item-granularidad").textContent).toContain(
      "sub_horaria"
    );
  });

  it("múltiples advertencias → todas se listan", () => {
    const advertencias = [
      "El pico de generación supera la capacidad instalada declarada.",
      "Los datos cubren solo un período parcial del año.",
      "El período no comienza en enero.",
    ];
    render(
      <BandaContextoArchivo
        metadataArchivo={baseAnualHoraria({
          cobertura: "parcial",
          advertencias,
        })}
      />
    );
    for (const adv of advertencias) {
      expect(screen.getByText(adv)).toBeInTheDocument();
    }
  });

  it("advertencia única con texto exacto → visible", () => {
    const msg = "Advertencia única de prueba.";
    render(
      <BandaContextoArchivo
        metadataArchivo={baseAnualHoraria({
          advertencias: [msg],
        })}
      />
    );
    expect(screen.getByText(msg)).toBeInTheDocument();
  });

  it("sin advertencias pero cobertura parcial → item-cobertura visible", () => {
    render(
      <BandaContextoArchivo
        metadataArchivo={baseAnualHoraria({
          cobertura: "parcial",
          advertencias: [],
        })}
      />
    );
    expect(screen.getByTestId("banda-advertencia")).toBeInTheDocument();
    expect(screen.getByTestId("item-cobertura")).toBeInTheDocument();
  });
});
