import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Onboarding } from "@/components/onboarding/Onboarding";

type MockProps = Parameters<typeof Onboarding>[0];

function renderOnboarding(overrides: Partial<MockProps> = {}) {
  const cargar = vi.fn().mockResolvedValue(undefined);
  const onRehidratar = vi.fn();
  const onBorrar = vi.fn();
  const props: MockProps = {
    hayDatosPersistidos: false,
    cargando: false,
    error: null,
    cargar,
    onRehidratar,
    onBorrar,
    ...overrides,
  };
  const utils = render(<Onboarding {...props} />);
  return { ...utils, cargar, onRehidratar, onBorrar };
}

function fakeXlsx(name = "test.xlsx") {
  return new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(
    'input[type="file"]'
  );
  if (!input) throw new Error("File input no encontrado");
  return input;
}

function botonProcesar() {
  return screen.getByRole("button", { name: /procesar y ver reporte/i });
}

describe("Onboarding — validación del formulario", () => {
  it("el botón Procesar está deshabilitado al inicio", () => {
    renderOnboarding();
    expect(botonProcesar()).toBeDisabled();
  });

  it("el botón se habilita cuando los 3 requeridos están llenos y hay archivo", async () => {
    const user = userEvent.setup();
    const { container } = renderOnboarding();

    await user.type(screen.getByLabelText(/nombre de la planta/i), "Tequila 1");
    await user.type(screen.getByLabelText(/capacidad cfe/i), "500");
    await user.type(screen.getByLabelText(/capacidad sfv instalada/i), "500");
    await user.upload(getFileInput(container), fakeXlsx());

    expect(botonProcesar()).toBeEnabled();
  });

  it("el botón se deshabilita si el usuario borra un campo requerido", async () => {
    const user = userEvent.setup();
    const { container } = renderOnboarding();

    const nombre = screen.getByLabelText(/nombre de la planta/i);
    await user.type(nombre, "Tequila 1");
    await user.type(screen.getByLabelText(/capacidad cfe/i), "500");
    await user.type(screen.getByLabelText(/capacidad sfv instalada/i), "500");
    await user.upload(getFileInput(container), fakeXlsx());
    expect(botonProcesar()).toBeEnabled();

    await user.clear(nombre);
    expect(botonProcesar()).toBeDisabled();
  });
});

describe("Onboarding — Precio PPA opcional", () => {
  it("el campo Precio PPA empieza vacío, no en 0", () => {
    renderOnboarding();
    const ppa = screen.getByLabelText(/precio ppa/i) as HTMLInputElement;
    expect(ppa.value).toBe("");
  });

  it("al procesar con PPA vacío, llama a cargar con precio_ppa_mxn_mwh === null", async () => {
    const user = userEvent.setup();
    const { container, cargar } = renderOnboarding();

    await user.type(screen.getByLabelText(/nombre de la planta/i), "Tequila 1");
    await user.type(screen.getByLabelText(/capacidad cfe/i), "500");
    await user.type(screen.getByLabelText(/capacidad sfv instalada/i), "500");
    await user.upload(getFileInput(container), fakeXlsx());

    await user.click(botonProcesar());

    expect(cargar).toHaveBeenCalledTimes(1);
    const [, config] = cargar.mock.calls[0]!;
    expect(config.precio_ppa_mxn_mwh).toBeNull();
    expect(config.nombre).toBe("Tequila 1");
    expect(config.capacidad_poi_kw).toBe(500);
    expect(config.capacidad_instalada_kw).toBe(500);
  });

  it("PPA con valor 0 muestra error inline y deshabilita el botón", async () => {
    const user = userEvent.setup();
    const { container } = renderOnboarding();

    await user.type(screen.getByLabelText(/nombre de la planta/i), "Tequila 1");
    await user.type(screen.getByLabelText(/capacidad cfe/i), "500");
    await user.type(screen.getByLabelText(/capacidad sfv instalada/i), "500");
    await user.upload(getFileInput(container), fakeXlsx());
    expect(botonProcesar()).toBeEnabled();

    await user.type(screen.getByLabelText(/precio ppa/i), "0");

    expect(
      screen.getByText(/el precio debe ser mayor a cero/i)
    ).toBeInTheDocument();
    expect(botonProcesar()).toBeDisabled();
  });

  it("PPA con valor válido pasa a config correctamente", async () => {
    const user = userEvent.setup();
    const { container, cargar } = renderOnboarding();

    await user.type(screen.getByLabelText(/nombre de la planta/i), "Tequila 1");
    await user.type(screen.getByLabelText(/capacidad cfe/i), "500");
    await user.type(screen.getByLabelText(/capacidad sfv instalada/i), "500");
    await user.type(screen.getByLabelText(/precio ppa/i), "1010.80");
    await user.upload(getFileInput(container), fakeXlsx());

    await user.click(botonProcesar());

    expect(cargar).toHaveBeenCalledTimes(1);
    const [, config] = cargar.mock.calls[0]!;
    expect(config.precio_ppa_mxn_mwh).toBeCloseTo(1010.8, 2);
  });
});
