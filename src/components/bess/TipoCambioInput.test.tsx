import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TabBessCatalogo } from "@/components/bess/TabBessCatalogo";
import { limpiarTipoCambioPersistido } from "@/hooks/useTipoCambio";

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { datasets: { label: string }[] } }) => (
    <div data-testid="chart-line" data-series={data.datasets.length} />
  ),
}));

beforeEach(() => {
  limpiarTipoCambioPersistido();
});

afterEach(() => {
  limpiarTipoCambioPersistido();
});

function inputTc(): HTMLInputElement {
  return screen.getByLabelText(/tipo de cambio mxn por usd/i) as HTMLInputElement;
}

describe("TipoCambioInput integrado en TabBessCatalogo", () => {
  it("renderiza con valor inicial '20.00' en el input", () => {
    render(<TabBessCatalogo />);
    expect(inputTc().value).toBe("20.00");
  });

  it("al cambiar el input a 22.00 y desenfocar, los chips MXN de las 3 cards se recalculan", async () => {
    const user = userEvent.setup();
    render(<TabBessCatalogo />);

    // Valores iniciales (TC = 20).
    expect(screen.getByText(/\$1,119,940/)).toBeInTheDocument(); // Cube Plus precio total
    expect(screen.getByText(/\$2,954,520/)).toBeInTheDocument(); // Cube Max precio total
    expect(screen.getByText(/\$11,300,160/)).toBeInTheDocument(); // Block III precio total

    const input = inputTc();
    await user.clear(input);
    await user.type(input, "22");
    await user.tab(); // dispara onBlur

    // Valores recalculados (TC = 22).
    expect(screen.getByText(/\$1,231,934/)).toBeInTheDocument(); // 55,997 × 22
    expect(screen.getByText(/\$3,249,972/)).toBeInTheDocument(); // 147,726 × 22
    expect(screen.getByText(/\$12,430,176/)).toBeInTheDocument(); // 565,008 × 22

    // Y los valores anteriores ya no aparecen.
    expect(screen.queryByText(/\$1,119,940/)).not.toBeInTheDocument();
  });

  it("al escribir un valor inválido (-5) y desenfocar, el buffer revierte al último válido", async () => {
    const user = userEvent.setup();
    render(<TabBessCatalogo />);

    const input = inputTc();
    await user.clear(input);
    await user.type(input, "-5");
    await user.tab();

    // Buffer revierte a "20.00" (valor previo válido).
    expect(input.value).toBe("20.00");
    // Y los chips MXN permanecen en los valores con TC=20.
    expect(screen.getByText(/\$1,119,940/)).toBeInTheDocument();
  });

});
