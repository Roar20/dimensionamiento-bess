import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { validarArchivoPlanta, validarManifest } from "./validar";

function leerJsonPublic(path: string): unknown {
  const abs = resolve(process.cwd(), "public", path);
  return JSON.parse(readFileSync(abs, "utf-8"));
}

describe("validarManifest", () => {
  it("acepta el manifest de /public/data/manifest.json", () => {
    const json = leerJsonPublic("data/manifest.json");
    const res = validarManifest(json);
    if (!res.ok) {
      throw new Error(
        `manifest no valida:\n${res.errores.map((e) => `  ${e.path}: ${e.message}`).join("\n")}`
      );
    }
    expect(res.ok).toBe(true);
    expect(res.data.schema_version).toBe("1.0.0");
    expect(res.data.plantas.length).toBeGreaterThanOrEqual(1);
  });

  it("rechaza schema_version inválida", () => {
    const res = validarManifest({
      schema_version: "uno-punto-cero",
      generado_at: "2026-05-23T00:00:00Z",
      plantas: [],
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errores.some((e) => e.path.endsWith("schema_version"))).toBe(true);
    }
  });

  it("rechaza modo desconocido en modos_disponibles", () => {
    const res = validarManifest({
      schema_version: "1.0.0",
      generado_at: "2026-05-23T00:00:00Z",
      plantas: [
        {
          planta_id: "x",
          nombre_humano: "X",
          modos_disponibles: ["modo_inventado"],
          fuente: "test",
          ultima_actualizacion: "2026-05-23T00:00:00Z",
        },
      ],
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.errores.some((e) => e.path.includes("modos_disponibles[0]"))
      ).toBe(true);
    }
  });

  it("rechaza objeto que no es objeto plano", () => {
    expect(validarManifest(null).ok).toBe(false);
    expect(validarManifest("foo").ok).toBe(false);
    expect(validarManifest(42).ok).toBe(false);
    expect(validarManifest([]).ok).toBe(false);
  });

  it("reporta campos requeridos ausentes con path explícito", () => {
    const res = validarManifest({ schema_version: "1.0.0" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      const paths = res.errores.map((e) => e.path);
      expect(paths).toContain("$.generado_at");
      expect(paths).toContain("$.plantas");
    }
  });
});

describe("validarArchivoPlanta", () => {
  it("acepta /public/data/tequila-1.json contra el schema", () => {
    const json = leerJsonPublic("data/tequila-1.json");
    const res = validarArchivoPlanta(json);
    if (!res.ok) {
      throw new Error(
        `tequila-1.json no valida:\n${res.errores
          .map((e) => `  ${e.path}: ${e.message}`)
          .join("\n")}`
      );
    }
    expect(res.ok).toBe(true);
    expect(res.data.planta.planta_id).toBe("tequila-1");
    expect(res.data.modos.fisico_medido_anual).toBeDefined();
  });

  it("rechaza naturaleza que no corresponde al modo declarado", () => {
    const json = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const corrupto = JSON.parse(JSON.stringify(json));
    corrupto.modos.fisico_medido_anual.naturaleza = "contractual_mensual";
    const res = validarArchivoPlanta(corrupto);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.errores.some((e) => e.path.endsWith("naturaleza"))
      ).toBe(true);
    }
  });

  it("rechaza badge_trazabilidad fuera del enum cerrado", () => {
    const json = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const corrupto = JSON.parse(JSON.stringify(json));
    corrupto.modos.fisico_medido_anual.kpis.energia_generada_anual_mwh
      .badge_trazabilidad = "validado_super_recomendado";
    const res = validarArchivoPlanta(corrupto);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.errores.some((e) => e.path.endsWith("badge_trazabilidad"))
      ).toBe(true);
    }
  });

  it("rechaza perfil 24h con longitud distinta de 24", () => {
    const json = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const corrupto = JSON.parse(JSON.stringify(json));
    corrupto.modos.fisico_medido_anual.perfil_horario_promedio_diario.gen_kw =
      [0, 1, 2];
    const res = validarArchivoPlanta(corrupto);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errores.some((e) => e.path.endsWith("gen_kw"))).toBe(true);
    }
  });

  it("rechaza captura mensual con longitud distinta de 12", () => {
    const json = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const corrupto = JSON.parse(JSON.stringify(json));
    corrupto.modos.fisico_medido_anual.captura_mensual_mwh.valores_mwh =
      [10, 20, 30];
    const res = validarArchivoPlanta(corrupto);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.errores.some((e) => e.path.endsWith("valores_mwh"))
      ).toBe(true);
    }
  });

  it("rechaza advertencia con código no en WarningCodigo", () => {
    const json = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const corrupto = JSON.parse(JSON.stringify(json));
    corrupto.modos.fisico_medido_anual.advertencias = [
      { codigo: "CODIGO_NO_EXISTE", mensaje: "test" },
    ];
    const res = validarArchivoPlanta(corrupto);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.errores.some((e) => e.path.includes("codigo"))
      ).toBe(true);
    }
  });

  it("rechaza llave de modo desconocida en `modos`", () => {
    const json = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const corrupto = JSON.parse(JSON.stringify(json));
    corrupto.modos.modo_inventado = { naturaleza: "modo_inventado" };
    const res = validarArchivoPlanta(corrupto);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.errores.some((e) => e.path.endsWith("modo_inventado"))
      ).toBe(true);
    }
  });

  it("rechaza KPI sin unidad", () => {
    const corrupto = {
      schema_version: "1.0.0",
      planta: {
        planta_id: "x",
        nombre_humano: "X",
        capacidad_poi_kw: 500,
        capacidad_instalada_kw: 500,
        zona_lmp: null,
        anio_base: 2025,
      },
      modos: {
        fisico_medido_anual: {
          naturaleza: "fisico_medido_anual",
          fuente: "test",
          periodo_inicio: "2025-01-01",
          periodo_fin: "2025-12-31",
          kpis: {
            energia_generada_anual_mwh: {
              valor: 913.32,
              // unidad ausente
              badge_trazabilidad: "validado_cliente",
            },
            factor_capacidad_pct: { valor: 20.85, unidad: "%", badge_trazabilidad: "validado_cliente" },
            horas_con_generacion: { valor: 4380, unidad: "h", badge_trazabilidad: "default_interno" },
            pico_horario_kw: { valor: 446.7, unidad: "kW", badge_trazabilidad: "validado_cliente" },
          },
          perfil_horario_promedio_diario: {
            horas: Array.from({ length: 24 }, (_, i) => i),
            gen_kw: Array.from({ length: 24 }, () => 0),
            badge_trazabilidad: "default_interno",
          },
          captura_mensual_mwh: {
            meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            valores_mwh: Array.from({ length: 12 }, () => 0),
            badge_trazabilidad: "default_interno",
          },
          defaults_economicos: {
            precio_energia_mxn_mwh: { valor: 1, unidad: "MXN/MWh", badge_trazabilidad: "proxy_externo" },
            precio_cel_mxn: { valor: 1, unidad: "MXN/MWh", badge_trazabilidad: "proxy_externo" },
            precio_potencia_firme_mxn_mw_mes: { valor: 1, unidad: "MXN/MW-mes", badge_trazabilidad: "proxy_externo" },
            capex_mxn: { valor: 1, unidad: "MXN", badge_trazabilidad: "default_interno" },
            wacc_pct: { valor: 10, unidad: "%", badge_trazabilidad: "default_interno" },
            opex_tasa_anual_pct: { valor: 2, unidad: "%", badge_trazabilidad: "default_interno" },
            lmp_mxn_mwh: { valor: 360, unidad: "MXN/MWh", badge_trazabilidad: "proxy_externo" },
          },
          advertencias: [],
        },
      },
    };
    const res = validarArchivoPlanta(corrupto);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.errores.some((e) => e.path.endsWith("energia_generada_anual_mwh.unidad"))
      ).toBe(true);
    }
  });
});

describe("validador — coherencia general", () => {
  it("el JSON ejemplo es internamente consistente: meses=12 y horas=24", () => {
    const json = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const modo = (
      (json["modos"] as Record<string, unknown>)["fisico_medido_anual"] as Record<string, unknown>
    );
    const perfil = modo["perfil_horario_promedio_diario"] as Record<string, unknown>;
    const captura = modo["captura_mensual_mwh"] as Record<string, unknown>;
    expect((perfil["horas"] as number[]).length).toBe(24);
    expect((perfil["gen_kw"] as number[]).length).toBe(24);
    expect((captura["meses"] as number[]).length).toBe(12);
    expect((captura["valores_mwh"] as number[]).length).toBe(12);
  });

  it("el manifest declara los mismos modos que están emitidos en el archivo de planta", () => {
    const manifest = leerJsonPublic("data/manifest.json") as Record<string, unknown>;
    const archivo = leerJsonPublic("data/tequila-1.json") as Record<string, unknown>;
    const plantaManifest = (manifest["plantas"] as Array<Record<string, unknown>>)[0]!;
    const modosDeclarados = plantaManifest["modos_disponibles"] as string[];
    const modosEmitidos = Object.keys(archivo["modos"] as Record<string, unknown>);
    for (const m of modosDeclarados) {
      expect(modosEmitidos).toContain(m);
    }
  });
});
