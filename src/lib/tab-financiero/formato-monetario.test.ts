import { describe, expect, it } from "vitest";

import {
  formatoCompacto,
  formatoCompleto,
  formatoEje,
} from "./formato-monetario";

describe("formatoCompacto", () => {
  it("valor < 1M usa formato k con símbolo $", () => {
    expect(formatoCompacto(350_054)).toBe("$350k");
  });

  it("valor >= 1M usa formato M con 2 decimales", () => {
    expect(formatoCompacto(2_239_880)).toBe("$2.24M");
  });

  it("negativo usa signo U+2212 (no guion ASCII)", () => {
    expect(formatoCompacto(-44_798)).toBe("−$45k");
    // Verificar literal U+2212 explícitamente
    expect(formatoCompacto(-44_798)).toMatch(/^−/);
  });

  it("redondea correctamente valores en k", () => {
    expect(formatoCompacto(18_500)).toBe("$19k");
    expect(formatoCompacto(305_256)).toBe("$305k");
  });

  it("promoción crítica: $999,500 → $1.00M (no $1000k)", () => {
    expect(formatoCompacto(999_500)).toBe("$1.00M");
  });

  it("promoción crítica: $999,950 → $1.00M", () => {
    expect(formatoCompacto(999_950)).toBe("$1.00M");
  });

  it("no promociona cuando redondea hacia abajo: $999,400 → $999k", () => {
    expect(formatoCompacto(999_400)).toBe("$999k");
  });

  it("1M exacto", () => {
    expect(formatoCompacto(1_000_000)).toBe("$1.00M");
  });

  it("$1.5M", () => {
    expect(formatoCompacto(1_499_999)).toBe("$1.50M");
  });

  it("valor muy pequeño redondea a $0k", () => {
    expect(formatoCompacto(50)).toBe("$0k");
  });

  it("cero exacto: $0 sin sufijo", () => {
    expect(formatoCompacto(0)).toBe("$0");
  });

  it("robustez: NaN e Infinity caen a $0", () => {
    expect(formatoCompacto(NaN)).toBe("$0");
    expect(formatoCompacto(Infinity)).toBe("$0");
    expect(formatoCompacto(-Infinity)).toBe("$0");
  });
});

describe("formatoCompleto", () => {
  it("entero con separador de miles y símbolo $", () => {
    expect(formatoCompleto(2_239_880)).toBe("$2,239,880");
  });

  it("seis cifras", () => {
    expect(formatoCompleto(923_182)).toBe("$923,182");
  });

  it("negativo con signo U+2212 antes del $", () => {
    expect(formatoCompleto(-2_239_880)).toBe("−$2,239,880");
  });

  it("decimales se muestran con 2 dígitos cuando existen", () => {
    expect(formatoCompleto(1010.8)).toBe("$1,010.80");
  });

  it("cero exacto: $0 sin coma", () => {
    expect(formatoCompleto(0)).toBe("$0");
  });
});

describe("formatoEje", () => {
  it("valor en cientos de miles sin símbolo monetario", () => {
    expect(formatoEje(400_000)).toBe("400k");
  });

  it("valor en millones sin símbolo monetario", () => {
    expect(formatoEje(5_000_000)).toBe("5.00M");
  });

  it("negativo con signo U+2212 (sin $)", () => {
    expect(formatoEje(-2_500_000)).toBe("−2.50M");
  });

  it("promoción crítica eje: 999500 → 1.00M (no 1000k)", () => {
    expect(formatoEje(999_500)).toBe("1.00M");
  });

  it("cero exacto: 0 sin sufijo ni símbolo", () => {
    expect(formatoEje(0)).toBe("0");
  });
});
