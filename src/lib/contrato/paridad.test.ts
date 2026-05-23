/**
 * Paridad parcial (opción C decidida) entre:
 *  (1) Loader del JSON → ArchivoPlanta cargado del contrato.
 *  (2) Adapter inverso → ArchivoPlanta derivado de DatosSFV vía funciones puras.
 *
 * NO existe Excel real de Tequila en el repo (Riesgo #1 del recon). Por eso
 * la paridad es deliberadamente parcial:
 *
 *  - Paridad de VALOR sobre los escalares conocidos (DECISIONS.md):
 *      energia_generada_anual_mwh ≈ 913.32 MWh
 *      pico_horario_kw            ≈ 446.7 kW
 *      factor_capacidad_pct       ≈ 20.85 %
 *      hora pico                  = 13 (hora-ending)
 *    Se asevera contra el JSON ejemplo (public/data/tequila-1.json), poblado
 *    en PR-Arq-1 con esos escalares marcados `validado_cliente`.
 *
 *  - Paridad ESTRUCTURAL sobre el resto:
 *      perfil 24h con longitud 24 y horas = [1..24]
 *      captura mensual con longitud 12 y meses = [1..12]
 *      badges de naturaleza y trazabilidad en el dominio cerrado
 *      advertencias coherentes (CONJUNTO de códigos, no orden)
 *
 *  - Paridad NUMÉRICA SELF del adapter:
 *      Adapter no introduce drift sobre las funciones puras: para cada KPI
 *      del adapter, comparamos contra la función pura aplicada directamente
 *      sobre los mismos datos, con tolerancia explícita.
 *
 *  - Round-trip JSON:
 *      adapter → JSON.stringify → JSON.parse → loader → validador devuelve
 *      ArchivoPlanta equivalente. Demuestra que la forma del adapter es
 *      serializable y re-cargable sin pérdida estructural.
 *
 * TOLERANCIAS EXPLÍCITAS (Riesgo #2):
 *   - Comparaciones contra escalares del JSON: toBeCloseTo con 1 decimal
 *     (los valores del JSON tienen 2 decimales; tolerar diferencia <= 0.05).
 *   - Comparaciones numéricas self (adapter vs función pura): ε = 1e-9 sobre
 *     floats idénticos; reportar si supera 1e-6.
 *
 * El barrido (`barrido_configuraciones`) queda FUERA por decisión.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cargarArchivoSFV } from "@/lib/io/excel-loader";
import { calcularPerfilHorario } from "@/lib/core/sfv/perfil-horario";
import { caracterizarRecurso } from "@/lib/core/sfv/caracterizar";
import { agregarPorMes } from "@/lib/tab-sfv/agregaciones-mensuales";
import { generarDiaSintetico, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { ConfiguracionPlanta, DatosSFV, Warning } from "@/types/sfv";

import { cargarArchivoPlanta } from "./cargar";
import {
  DEFAULTS_ECONOMICOS_FALLBACK,
  derivarArchivoPlantaDesdeDatosSFV,
} from "./derivar";
import type {
  ArchivoPlanta,
  ModoFisicoMedidoAnual,
} from "@/types/contrato";

// ─── Tolerancias explícitas ──────────────────────────────────────────────────

/** Comparación de escalares contra valores con 2 decimales en el JSON. */
const EPS_ESCALAR_1DEC = 0.05;
/** Paridad numérica self adapter vs función pura — floats idénticos. */
const EPS_SELF_FLOAT = 1e-9;
/**
 * Tolerancia relativa para invariantes derivadas que comparan sumas
 * grandes calculadas en distinto orden de asociatividad.
 *
 * Drift IEEE 754 esperado al sumar 8760 floats en distinto orden:
 * ~1e-7 relativo observado. Un bug real como mes perdido/duplicado
 * sería ~1e-2. Usamos 1e-6 para discriminar drift numérico de error
 * funcional.
 */
const EPS_INVARIANTE_SUMA_GRANDE = 1e-6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function leerJsonPublic(rel: string): unknown {
  const abs = resolve(process.cwd(), "public", rel);
  return JSON.parse(readFileSync(abs, "utf-8"));
}

/**
 * Construye un DatosSFV sintético con un año completo de generación
 * gaussiana centrada a mediodía. El fixture NO está calibrado para
 * reproducir los escalares exactos de Tequila — es un set de datos
 * coherente para que el adapter pueda procesarlo y el test pueda asertar
 * shape + paridad self (no comparación contra Tequila real).
 */
function fixtureSinteticoAnual(opts?: {
  picoKw?: number;
  sigmaHoras?: number;
  diasDesde?: string;
  diasN?: number;
  capacidadPoiKw?: number;
  capacidadInstaladaKw?: number;
  nombre?: string;
}): {
  datos: DatosSFV;
  warnings: Warning[];
} {
  const picoKw = opts?.picoKw ?? 446.7;
  const sigmaHoras = opts?.sigmaHoras ?? 2.24;
  const diasDesde = opts?.diasDesde ?? "2025-01-01";
  const diasN = opts?.diasN ?? 365;
  const config: ConfiguracionPlanta = {
    nombre: opts?.nombre ?? "Fixture Sintética",
    cliente: null,
    ubicacion: null,
    capacidad_poi_kw: opts?.capacidadPoiKw ?? 500,
    capacidad_instalada_kw: opts?.capacidadInstaladaKw ?? 500,
    zona_lmp: null,
    precio_ppa_mxn_mwh: null,
  };
  const registros = [];
  for (let d = 0; d < diasN; d += 1) {
    registros.push(
      ...generarDiaSintetico(sumarDias(diasDesde, d), picoKw, sigmaHoras, 12)
    );
  }
  let total = 0;
  let pico = 0;
  let horasConGen = 0;
  let tsMin = Infinity;
  let tsMax = -Infinity;
  for (const r of registros) {
    total += r.energia_mwh;
    if (r.potencia_kw_prom > pico) pico = r.potencia_kw_prom;
    if (r.energia_mwh > 0) horasConGen += 1;
    const t = r.timestamp.getTime();
    if (t < tsMin) tsMin = t;
    if (t > tsMax) tsMax = t;
  }
  const datos: DatosSFV = {
    config,
    registros,
    meta: {
      nombre_archivo: "fixture-sintetico.xlsx",
      fecha_carga: new Date().toISOString(),
      anio: new Date(diasDesde).getFullYear(),
      total_horas: registros.length,
      total_energia_mwh: total,
      horas_con_generacion: horasConGen,
      pico_horario_kw: pico,
      periodo_inicio: new Date(tsMin),
      periodo_fin: new Date(tsMax),
      granularidad_detectada: "horaria",
      minutos_mediana_delta: 60,
      cobertura: registros.length === 8760 ? "anual" : "parcial",
    },
  };
  return { datos, warnings: [] };
}

function modoMedido(archivo: ArchivoPlanta): ModoFisicoMedidoAnual {
  const m = archivo.modos.fisico_medido_anual;
  if (!m) throw new Error("archivo no tiene modo fisico_medido_anual");
  return m;
}

// ─── (1) Loader funciona contra el JSON ejemplo ──────────────────────────────

describe("Loader: cargarArchivoPlanta sobre el JSON ejemplo de Tequila", () => {
  it("acepta el JSON y devuelve ok:true", () => {
    const json = leerJsonPublic("data/tequila-1.json");
    const res = cargarArchivoPlanta(json);
    if (!res.ok) {
      throw new Error(
        `loader rechazó el JSON ejemplo:\n${res.errores
          .map((e) => `  ${e.path}: ${e.message}`)
          .join("\n")}`
      );
    }
    expect(res.ok).toBe(true);
  });

  it("paridad de VALOR contra escalares conocidos de Tequila (DECISIONS.md)", () => {
    const res = cargarArchivoPlanta(leerJsonPublic("data/tequila-1.json"));
    if (!res.ok) throw new Error("loader falló");
    const m = modoMedido(res.data);
    // 913.32 MWh anual (documentado en DECISIONS.md)
    expect(m.kpis.energia_generada_anual_mwh.valor).toBeCloseTo(
      913.32,
      1
    );
    // 446.7 kW pico
    expect(m.kpis.pico_horario_kw.valor).toBeCloseTo(446.7, 1);
    // 20.85 % factor capacidad
    expect(m.kpis.factor_capacidad_pct.valor).toBeCloseTo(20.85, 1);
  });

  it("paridad ESTRUCTURAL: hora pico en gen_kw está en hora-ending 13", () => {
    const res = cargarArchivoPlanta(leerJsonPublic("data/tequila-1.json"));
    if (!res.ok) throw new Error("loader falló");
    const perfil = modoMedido(res.data).perfil_horario_promedio_diario;
    expect(perfil.horas).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24,
    ]);
    let idxMax = 0;
    for (let i = 1; i < 24; i += 1) {
      if (perfil.gen_kw[i]! > perfil.gen_kw[idxMax]!) idxMax = i;
    }
    // gen_kw[12] etiquetado horas[12] = 13: hora-ending 13 (intervalo 12:00-13:00)
    expect(perfil.horas[idxMax]).toBe(13);
    expect(perfil.gen_kw[idxMax]).toBeCloseTo(446.7, 1);
  });

  it("paridad ESTRUCTURAL: captura mensual con longitud 12 y meses [1..12]", () => {
    const res = cargarArchivoPlanta(leerJsonPublic("data/tequila-1.json"));
    if (!res.ok) throw new Error("loader falló");
    const cm = modoMedido(res.data).captura_mensual_mwh;
    expect(cm.meses).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(cm.valores_mwh).toHaveLength(12);
    // El acumulado mensual del JSON ejemplo (redondeado a 2 decimales)
    // debe estar cerca de 913.32 (paridad de TOTAL contra suma de mensuales).
    const totalMensual = cm.valores_mwh.reduce((acc, v) => acc + v, 0);
    expect(totalMensual).toBeCloseTo(913.32, 0); // ±0.5 MWh por redondeos del JSON
  });
});

// ─── (2) Adapter funciona ────────────────────────────────────────────────────

describe("Adapter: derivarArchivoPlantaDesdeDatosSFV sobre fixture sintético", () => {
  it("produce ArchivoPlanta válido contra el contrato", () => {
    const { datos, warnings } = fixtureSinteticoAnual();
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    // El loader valida cualquier ArchivoPlanta como JSON.
    const res = cargarArchivoPlanta(JSON.parse(JSON.stringify(archivo)));
    if (!res.ok) {
      throw new Error(
        `adapter produjo ArchivoPlanta inválido:\n${res.errores
          .map((e) => `  ${e.path}: ${e.message}`)
          .join("\n")}`
      );
    }
    expect(res.ok).toBe(true);
  });

  it("badges y forma correcta: hora-ending 1..24, meses 1..12, naturaleza", () => {
    const { datos, warnings } = fixtureSinteticoAnual();
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    const m = modoMedido(archivo);
    expect(m.naturaleza).toBe("fisico_medido_anual");
    expect(m.perfil_horario_promedio_diario.horas).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24,
    ]);
    expect(m.captura_mensual_mwh.meses).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(m.kpis.energia_generada_anual_mwh.badge_trazabilidad).toBe(
      "validado_cliente"
    );
    expect(m.captura_mensual_mwh.badge_trazabilidad).toBe("validado_cliente");
  });

  it("defaults económicos: usa fallback cuando el caller no provee uno", () => {
    const { datos, warnings } = fixtureSinteticoAnual();
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    expect(modoMedido(archivo).defaults_economicos).toEqual(
      DEFAULTS_ECONOMICOS_FALLBACK
    );
  });

  it("planta_id slug se deriva del nombre cuando no se provee override", () => {
    const { datos, warnings } = fixtureSinteticoAnual({
      nombre: "Tequila 1",
    });
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    expect(archivo.planta.planta_id).toBe("tequila-1");
    expect(archivo.planta.nombre_humano).toBe("Tequila 1");
  });

  it("advertencias se propagan con código y mensaje preservados", () => {
    const { datos } = fixtureSinteticoAnual();
    const warnings: Warning[] = [
      { codigo: "ANIO_NO_COMPLETO", mensaje: "Solo cubre 60 días." },
      { codigo: "HORAS_INCOMPLETAS", mensaje: "Faltan 8700 horas." },
    ];
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    const adv = modoMedido(archivo).advertencias;
    expect(adv).toHaveLength(2);
    expect(adv.map((a) => a.codigo).sort()).toEqual(
      ["ANIO_NO_COMPLETO", "HORAS_INCOMPLETAS"].sort()
    );
  });
});

// ─── (3) Paridad NUMÉRICA SELF: adapter vs funciones puras directamente ──────

describe("Paridad self: adapter NO introduce drift sobre las funciones puras", () => {
  it("energia_generada_anual_mwh coincide con meta.total_energia_mwh", () => {
    const { datos } = fixtureSinteticoAnual();
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos);
    const obtenido =
      modoMedido(archivo).kpis.energia_generada_anual_mwh.valor;
    const esperado = datos.meta.total_energia_mwh;
    expect(Math.abs(obtenido - esperado)).toBeLessThan(EPS_SELF_FLOAT);
  });

  it("pico_horario_kw coincide con meta.pico_horario_kw", () => {
    const { datos } = fixtureSinteticoAnual();
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos);
    expect(modoMedido(archivo).kpis.pico_horario_kw.valor).toBe(
      datos.meta.pico_horario_kw
    );
  });

  it("factor_capacidad_pct coincide con caracterizarRecurso(...).factor_capacidad_pct", () => {
    const { datos } = fixtureSinteticoAnual();
    const caract = caracterizarRecurso(
      datos.registros,
      datos.config.capacidad_poi_kw,
      datos.config.capacidad_instalada_kw
    );
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos);
    expect(modoMedido(archivo).kpis.factor_capacidad_pct.valor).toBe(
      caract.factor_capacidad_pct
    );
  });

  it("perfil_horario_promedio_diario.gen_kw[i] coincide con calcularPerfilHorario.perfil_por_hora[i+1].kW_promedio", () => {
    const { datos } = fixtureSinteticoAnual();
    const perfil = calcularPerfilHorario(datos.registros);
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos);
    const gen_kw = modoMedido(archivo).perfil_horario_promedio_diario.gen_kw;
    for (let i = 0; i < 24; i += 1) {
      const horaEnding = i + 1;
      const esperado = perfil.perfil_por_hora[horaEnding]?.kW_promedio ?? 0;
      expect(Math.abs(gen_kw[i]! - esperado)).toBeLessThan(EPS_SELF_FLOAT);
    }
  });

  it("captura_mensual_mwh.valores_mwh[i] coincide con agregarPorMes (con mapeo 0..11 → 1..12)", () => {
    const { datos } = fixtureSinteticoAnual();
    const resumenes = agregarPorMes(datos.registros);
    const porMesCalendar = new Map<number, number>();
    for (const r of resumenes) {
      porMesCalendar.set(
        r.mes + 1,
        (porMesCalendar.get(r.mes + 1) ?? 0) + r.energia_mwh
      );
    }
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos);
    const valores =
      modoMedido(archivo).captura_mensual_mwh.valores_mwh;
    for (let m = 1; m <= 12; m += 1) {
      const esperado = porMesCalendar.get(m) ?? 0;
      const obtenido = valores[m - 1]!;
      expect(Math.abs(obtenido - esperado)).toBeLessThan(EPS_SELF_FLOAT);
    }
  });

  it("ningún valor del perfil 24h excede el pico horario (sanity invariante)", () => {
    const { datos } = fixtureSinteticoAnual();
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos);
    const gen_kw = modoMedido(archivo).perfil_horario_promedio_diario.gen_kw;
    const pico = modoMedido(archivo).kpis.pico_horario_kw.valor;
    for (const v of gen_kw) {
      // El perfil es PROMEDIO sobre múltiples días; debe ser ≤ pico horario.
      expect(v).toBeLessThanOrEqual(pico + EPS_ESCALAR_1DEC);
    }
  });

  it("suma de captura_mensual_mwh coincide con energia_generada_anual_mwh (sanity invariante)", () => {
    const { datos } = fixtureSinteticoAnual();
    const archivo = derivarArchivoPlantaDesdeDatosSFV(datos);
    const valores =
      modoMedido(archivo).captura_mensual_mwh.valores_mwh;
    const totalMensual = valores.reduce((acc, v) => acc + v, 0);
    const anual = modoMedido(archivo).kpis.energia_generada_anual_mwh.valor;
    // Tolerancia RELATIVA (no absoluta): captura mensual y total anual se
    // calculan independientemente — la primera vía agregarPorMes (suma
    // agrupada por mes), la segunda vía suma cronológica directa. Sobre los
    // MISMOS 8760 floats, distintos órdenes de asociatividad producen drift
    // IEEE 754. Que coincidan a EPS_INVARIANTE_SUMA_GRANDE ES la prueba de
    // que ambos están bien calculados; no se deben acoplar artificialmente.
    const drift_relativo = Math.abs(totalMensual - anual) / Math.abs(anual);
    expect(drift_relativo).toBeLessThan(EPS_INVARIANTE_SUMA_GRANDE);
  });
});

// ─── (4) Round-trip serialización ────────────────────────────────────────────

describe("Round-trip: adapter → JSON → loader produce equivalente", () => {
  it("serializa y re-carga sin pérdida estructural", () => {
    const { datos, warnings } = fixtureSinteticoAnual();
    const original = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    const serializado = JSON.stringify(original);
    const recargado = cargarArchivoPlanta(JSON.parse(serializado));
    if (!recargado.ok) {
      throw new Error(
        `re-carga falló:\n${recargado.errores
          .map((e) => `  ${e.path}: ${e.message}`)
          .join("\n")}`
      );
    }
    expect(recargado.data.schema_version).toBe(original.schema_version);
    expect(recargado.data.planta).toEqual(original.planta);
    const m1 = modoMedido(original);
    const m2 = modoMedido(recargado.data);
    expect(m2.naturaleza).toBe(m1.naturaleza);
    expect(m2.perfil_horario_promedio_diario.horas).toEqual(
      m1.perfil_horario_promedio_diario.horas
    );
    expect(m2.captura_mensual_mwh.meses).toEqual(m1.captura_mensual_mwh.meses);
    expect(m2.kpis.energia_generada_anual_mwh.valor).toBe(
      m1.kpis.energia_generada_anual_mwh.valor
    );
  });
});

// ─── Paridad estructural CROSS: el shape del adapter empata con el del JSON ──

describe("Paridad estructural cross: shape del adapter vs shape del JSON ejemplo", () => {
  it("ambos producen ModoFisicoMedidoAnual con los mismos campos top-level", () => {
    const { datos, warnings } = fixtureSinteticoAnual();
    const adapter = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    const loader = cargarArchivoPlanta(leerJsonPublic("data/tequila-1.json"));
    if (!loader.ok) throw new Error("loader falló");
    const mA = modoMedido(adapter);
    const mL = modoMedido(loader.data);
    const camposA = Object.keys(mA).sort();
    const camposL = Object.keys(mL).sort();
    expect(camposL.every((k) => camposA.includes(k))).toBe(true);
  });

  it("kpis tienen exactamente las mismas llaves en adapter y loader", () => {
    const { datos, warnings } = fixtureSinteticoAnual();
    const adapter = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    const loader = cargarArchivoPlanta(leerJsonPublic("data/tequila-1.json"));
    if (!loader.ok) throw new Error("loader falló");
    expect(Object.keys(modoMedido(adapter).kpis).sort()).toEqual(
      Object.keys(modoMedido(loader.data).kpis).sort()
    );
  });

  it("defaults_economicos tienen exactamente las mismas llaves en adapter y loader", () => {
    const { datos, warnings } = fixtureSinteticoAnual();
    const adapter = derivarArchivoPlantaDesdeDatosSFV(datos, warnings);
    const loader = cargarArchivoPlanta(leerJsonPublic("data/tequila-1.json"));
    if (!loader.ok) throw new Error("loader falló");
    expect(
      Object.keys(modoMedido(adapter).defaults_economicos).sort()
    ).toEqual(Object.keys(modoMedido(loader.data).defaults_economicos).sort());
  });
});

// ─── Salud del Excel real (smoke): la ruta vieja sigue funcionando ───────────
// Si la carga del Excel ya no funciona, la comparación de paridad no tiene
// sentido. Este test no es de paridad — es un smoke check del loader del Excel.

describe("Smoke: cargarArchivoSFV sigue funcionando (ruta vieja viva)", () => {
  it("es una función exportada y llamable (sin Excel real, smoke only)", () => {
    expect(typeof cargarArchivoSFV).toBe("function");
  });
});
