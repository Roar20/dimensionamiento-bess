import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { TabBessCatalogo } from "@/components/bess/TabBessCatalogo";

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { datasets: { label: string }[] } }) => (
    <div data-testid="chart-line" data-series={data.datasets.length} />
  ),
}));

describe("TabBessCatalogo", () => {
  it("renderiza la sección 'Degradación del BESS a 20 años'", () => {
    render(<TabBessCatalogo />);
    expect(
      screen.getByRole("heading", { name: /Degradación del BESS a 20 años/i })
    ).toBeInTheDocument();
  });
});
