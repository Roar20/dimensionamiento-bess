import { describe, expect, it } from "vitest";

import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";
import {
  esFueraDeEscala,
  razonFueraDeEscala,
} from "./comparativa-equipos";

const byId = new Map(CATALOGO_HYPERSTRONG.map((e) => [e.id, e]));

describe("esFueraDeEscala", () => {
  it("Cube Plus (AC, 125 kVA) NO está fuera de escala", () => {
    expect(esFueraDeEscala(byId.get("cube-plus")!)).toBe(false);
  });

  it("Cube Max (AC+DC, 250 kVA) NO está fuera de escala", () => {
    expect(esFueraDeEscala(byId.get("cube-max")!)).toBe(false);
  });

  it("Block III (DC, sin lado AC) ESTÁ fuera de escala con razón canónica", () => {
    const block = byId.get("block-iii")!;
    expect(esFueraDeEscala(block)).toBe(true);
    expect(razonFueraDeEscala(block)).toMatch(/escala utility/i);
  });
});
