import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FiltrosAnalisisSFVBess } from "./FiltrosAnalisisSFVBess";
import type { CategoriaEnergia } from "@/types/bess";

const CATEGORIAS: readonly CategoriaEnergia[] = [
  {
    tipo: "toda_energia",
    etiqueta: "Toda la energía es candidata",
    descripcion: "",
  },
  {
    tipo: "fuera_hora_punta_cfe",
    ventana_punta: [18, 22],
    etiqueta: "Energía fuera de hora-punta CFE",
    descripcion: "",
  },
  {
    tipo: "compromiso_ppa_mensual_mwh",
    mwh_mes: 40,
    etiqueta: "Energía arriba del compromiso PPA",
    descripcion: "",
  },
];

describe("FiltrosAnalisisSFVBess", () => {
  it("renderiza prefacio 'Análisis configurado por' y label 'Categoría'", () => {
    render(
      <FiltrosAnalisisSFVBess
        categorias={CATEGORIAS}
        categoriaTipo="toda_energia"
        onCambiarCategoria={() => {}}
      />
    );
    expect(screen.getByText(/análisis configurado por/i)).toBeInTheDocument();
    expect(screen.getByText(/categoría:/i)).toBeInTheDocument();
  });

  it("muestra todas las categorías como opciones del select", () => {
    render(
      <FiltrosAnalisisSFVBess
        categorias={CATEGORIAS}
        categoriaTipo="toda_energia"
        onCambiarCategoria={() => {}}
      />
    );
    const select = screen.getByRole("combobox");
    const options = Array.from(select.querySelectorAll("option"));
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.textContent)).toEqual([
      "Toda la energía es candidata",
      "Energía fuera de hora-punta CFE",
      "Energía arriba del compromiso PPA",
    ]);
  });

  it("select tiene como valor la categoría activa", () => {
    render(
      <FiltrosAnalisisSFVBess
        categorias={CATEGORIAS}
        categoriaTipo="fuera_hora_punta_cfe"
        onCambiarCategoria={() => {}}
      />
    );
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
      "fuera_hora_punta_cfe"
    );
  });

  it("cambiar el select dispara onCambiarCategoria con el nuevo tipo", async () => {
    const user = userEvent.setup();
    const onCambiar = vi.fn();
    render(
      <FiltrosAnalisisSFVBess
        categorias={CATEGORIAS}
        categoriaTipo="toda_energia"
        onCambiarCategoria={onCambiar}
      />
    );
    await user.selectOptions(
      screen.getByRole("combobox"),
      "compromiso_ppa_mensual_mwh"
    );
    expect(onCambiar).toHaveBeenCalledWith("compromiso_ppa_mensual_mwh");
  });

  it("NO renderiza ningún control de Estrategia (solo gobierna Categoría)", () => {
    render(
      <FiltrosAnalisisSFVBess
        categorias={CATEGORIAS}
        categoriaTipo="toda_energia"
        onCambiarCategoria={() => {}}
      />
    );
    expect(screen.queryByText(/estrategia/i)).toBeNull();
    expect(screen.queryAllByRole("combobox")).toHaveLength(1);
  });
});
