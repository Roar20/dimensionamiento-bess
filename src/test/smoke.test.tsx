import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { App } from "@/App";

describe("App shell — smoke", () => {
  it("renderiza el hero del onboarding cuando no hay datos", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /onboarding del proyecto/i })
    ).toBeInTheDocument();
  });

  it("Home no renderiza la tab nav (la tab nav vive por página)", () => {
    render(<App />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
