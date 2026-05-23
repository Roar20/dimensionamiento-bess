/**
 * Validador estructural del contrato JSON. Puro TS, sin dependencias nuevas.
 *
 * Estrategia: cada `validarX` recibe `unknown` + path y devuelve
 * `ResultadoValidacion<X>`. Camina la estructura recolectando errores con
 * path absoluto (e.g. `modos.fisico_medido_anual.kpis.energia_generada_anual_mwh.valor`).
 *
 * No es JSON Schema; es un validador-a-mano. La decisión deliberada de NO
 * introducir AJV/Zod/io-ts está justificada en el PR: el contrato es pequeño,
 * el validador no necesita más de lo que ya hay en el repo, y mantener cero
 * dependencias adicionales reduce superficie a mantener.
 */

import type {
  Advertencia,
  ArchivoPlanta,
  BadgeNaturaleza,
  BadgeTrazabilidad,
  BarridoConfiguraciones,
  CapturaMensualMwh,
  DefaultsEconomicos,
  ErrorValidacion,
  Estrategia,
  EvaluadaContrato,
  KpiEscalar,
  KpisContractualMensual,
  KpisFisicoMedidoAnual,
  KpisFisicoProyectadoAnual,
  Manifest,
  ModoContractualMensual,
  ModoFisicoMedidoAnual,
  ModoFisicoProyectadoAnual,
  ModoNoExtrapolableAnual,
  ModosPlanta,
  PerfilDiarioDelMesMwh,
  PerfilHorarioPromedioDiario,
  PlantaContrato,
  PlantaEnManifest,
  ResultadoValidacion,
} from "@/types/contrato";
import {
  BADGES_NATURALEZA,
  BADGES_TRAZABILIDAD,
  ESTRATEGIAS,
  WARNING_CODIGOS,
} from "@/types/contrato";

// ─── Predicados base ─────────────────────────────────────────────────────────

function esObjetoPlano(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function esString(v: unknown): v is string {
  return typeof v === "string";
}

function esNumeroFinito(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function esEnteroNoNegativo(v: unknown): v is number {
  return esNumeroFinito(v) && Number.isInteger(v) && v >= 0;
}

function esArrayDe(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function esSemver(v: unknown): v is string {
  return esString(v) && /^\d+\.\d+\.\d+(?:[-+].+)?$/.test(v);
}

function esISO(v: unknown): v is string {
  // No exigimos parsing perfecto — solo forma plausible ISO 8601.
  return esString(v) && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(v);
}

function esMiembroDe<T extends string>(v: unknown, lista: readonly T[]): v is T {
  return esString(v) && (lista as readonly string[]).includes(v);
}

// ─── Validador "objeto con campos esperados" ──────────────────────────────────

function exigirObjeto(v: unknown, path: string): ErrorValidacion[] {
  if (!esObjetoPlano(v)) {
    return [{ path, message: "se esperaba un objeto" }];
  }
  return [];
}

function exigirCampo(
  obj: Record<string, unknown>,
  campo: string,
  path: string
): ErrorValidacion[] {
  if (!(campo in obj)) {
    return [{ path: `${path}.${campo}`, message: "campo requerido ausente" }];
  }
  return [];
}

function exigirString(v: unknown, path: string): ErrorValidacion[] {
  return esString(v) ? [] : [{ path, message: "se esperaba string" }];
}

function exigirNumeroFinito(v: unknown, path: string): ErrorValidacion[] {
  return esNumeroFinito(v) ? [] : [{ path, message: "se esperaba número finito" }];
}

function exigirEnteroNoNegativo(v: unknown, path: string): ErrorValidacion[] {
  return esEnteroNoNegativo(v) ? [] : [{ path, message: "se esperaba entero ≥ 0" }];
}

function exigirArrayDeNumeros(
  v: unknown,
  longitudEsperada: number | null,
  path: string
): ErrorValidacion[] {
  if (!esArrayDe(v)) return [{ path, message: "se esperaba array" }];
  if (longitudEsperada !== null && v.length !== longitudEsperada) {
    return [{ path, message: `longitud ${v.length} ≠ ${longitudEsperada}` }];
  }
  const errores: ErrorValidacion[] = [];
  v.forEach((x, i) => {
    if (!esNumeroFinito(x)) {
      errores.push({ path: `${path}[${i}]`, message: "se esperaba número finito" });
    }
  });
  return errores;
}

function exigirMiembroDe<T extends string>(
  v: unknown,
  lista: readonly T[],
  path: string
): ErrorValidacion[] {
  if (!esMiembroDe(v, lista)) {
    return [
      {
        path,
        message: `valor no permitido; opciones: ${lista.join(", ")}`,
      },
    ];
  }
  return [];
}

// ─── Validadores compuestos ──────────────────────────────────────────────────

function validarKpiEscalar(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  return [
    ...exigirCampo(o, "valor", path),
    ...(o["valor"] !== undefined ? exigirNumeroFinito(o["valor"], `${path}.valor`) : []),
    ...exigirCampo(o, "unidad", path),
    ...(o["unidad"] !== undefined ? exigirString(o["unidad"], `${path}.unidad`) : []),
    ...exigirCampo(o, "badge_trazabilidad", path),
    ...(o["badge_trazabilidad"] !== undefined
      ? exigirMiembroDe(o["badge_trazabilidad"], BADGES_TRAZABILIDAD, `${path}.badge_trazabilidad`)
      : []),
    ...("fuente" in o && o["fuente"] !== undefined
      ? exigirString(o["fuente"], `${path}.fuente`)
      : []),
  ];
}

function validarAdvertencia(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  return [
    ...exigirCampo(o, "codigo", path),
    ...(o["codigo"] !== undefined
      ? exigirMiembroDe(o["codigo"], WARNING_CODIGOS, `${path}.codigo`)
      : []),
    ...exigirCampo(o, "mensaje", path),
    ...(o["mensaje"] !== undefined ? exigirString(o["mensaje"], `${path}.mensaje`) : []),
  ];
}

function validarArrayDeAdvertencias(v: unknown, path: string): ErrorValidacion[] {
  if (!esArrayDe(v)) return [{ path, message: "se esperaba array" }];
  return v.flatMap((x, i) => validarAdvertencia(x, `${path}[${i}]`));
}

function validarPerfilHorarioPromedioDiario(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  return [
    ...exigirCampo(o, "horas", path),
    ...(o["horas"] !== undefined ? exigirArrayDeNumeros(o["horas"], 24, `${path}.horas`) : []),
    ...exigirCampo(o, "gen_kw", path),
    ...(o["gen_kw"] !== undefined ? exigirArrayDeNumeros(o["gen_kw"], 24, `${path}.gen_kw`) : []),
    ...exigirCampo(o, "badge_trazabilidad", path),
    ...(o["badge_trazabilidad"] !== undefined
      ? exigirMiembroDe(o["badge_trazabilidad"], BADGES_TRAZABILIDAD, `${path}.badge_trazabilidad`)
      : []),
  ];
}

function validarCapturaMensualMwh(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  return [
    ...exigirCampo(o, "meses", path),
    ...(o["meses"] !== undefined ? exigirArrayDeNumeros(o["meses"], 12, `${path}.meses`) : []),
    ...exigirCampo(o, "valores_mwh", path),
    ...(o["valores_mwh"] !== undefined
      ? exigirArrayDeNumeros(o["valores_mwh"], 12, `${path}.valores_mwh`)
      : []),
    ...exigirCampo(o, "badge_trazabilidad", path),
    ...(o["badge_trazabilidad"] !== undefined
      ? exigirMiembroDe(o["badge_trazabilidad"], BADGES_TRAZABILIDAD, `${path}.badge_trazabilidad`)
      : []),
  ];
}

function validarPerfilDiarioDelMesMwh(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [
    ...exigirCampo(o, "dias", path),
    ...exigirCampo(o, "valores_mwh", path),
    ...exigirCampo(o, "badge_trazabilidad", path),
  ];
  if (o["dias"] !== undefined) {
    if (!esArrayDe(o["dias"])) {
      out.push({ path: `${path}.dias`, message: "se esperaba array" });
    } else {
      o["dias"].forEach((d, i) => {
        if (!esNumeroFinito(d)) out.push({ path: `${path}.dias[${i}]`, message: "número finito" });
      });
    }
  }
  if (o["valores_mwh"] !== undefined) {
    out.push(...exigirArrayDeNumeros(o["valores_mwh"], null, `${path}.valores_mwh`));
  }
  // Coherencia: dias.length === valores_mwh.length.
  if (
    esArrayDe(o["dias"]) &&
    esArrayDe(o["valores_mwh"]) &&
    o["dias"].length !== o["valores_mwh"].length
  ) {
    out.push({
      path,
      message: `dias.length=${o["dias"].length} ≠ valores_mwh.length=${o["valores_mwh"].length}`,
    });
  }
  if (o["badge_trazabilidad"] !== undefined) {
    out.push(
      ...exigirMiembroDe(o["badge_trazabilidad"], BADGES_TRAZABILIDAD, `${path}.badge_trazabilidad`)
    );
  }
  return out;
}

function validarEvaluadaContrato(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  return [
    ...exigirCampo(o, "p_kw", path),
    ...(o["p_kw"] !== undefined ? exigirNumeroFinito(o["p_kw"], `${path}.p_kw`) : []),
    ...exigirCampo(o, "e_kwh", path),
    ...(o["e_kwh"] !== undefined ? exigirNumeroFinito(o["e_kwh"], `${path}.e_kwh`) : []),
    ...exigirCampo(o, "horas", path),
    ...(o["horas"] !== undefined ? exigirNumeroFinito(o["horas"], `${path}.horas`) : []),
    ...exigirCampo(o, "estrategia", path),
    ...(o["estrategia"] !== undefined
      ? exigirMiembroDe(o["estrategia"], ESTRATEGIAS, `${path}.estrategia`)
      : []),
    ...exigirCampo(o, "fraccion_capturada_pct", path),
    ...(o["fraccion_capturada_pct"] !== undefined
      ? exigirNumeroFinito(o["fraccion_capturada_pct"], `${path}.fraccion_capturada_pct`)
      : []),
    ...exigirCampo(o, "ciclos_periodo", path),
    ...(o["ciclos_periodo"] !== undefined
      ? exigirNumeroFinito(o["ciclos_periodo"], `${path}.ciclos_periodo`)
      : []),
    ...exigirCampo(o, "en_frente_pareto", path),
    ...(o["en_frente_pareto"] !== undefined && typeof o["en_frente_pareto"] !== "boolean"
      ? [{ path: `${path}.en_frente_pareto`, message: "se esperaba boolean" }]
      : []),
  ];
}

function validarBarridoConfiguraciones(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [
    ...exigirCampo(o, "potencias_kw", path),
    ...exigirCampo(o, "horas", path),
    ...exigirCampo(o, "estrategias", path),
    ...exigirCampo(o, "rte_referencia_pct", path),
    ...exigirCampo(o, "dod_referencia_pct", path),
    ...exigirCampo(o, "evaluadas", path),
    ...exigirCampo(o, "codo_orientativo_index", path),
    ...exigirCampo(o, "badge_trazabilidad", path),
  ];
  if (o["potencias_kw"] !== undefined) {
    out.push(...exigirArrayDeNumeros(o["potencias_kw"], null, `${path}.potencias_kw`));
  }
  if (o["horas"] !== undefined) {
    out.push(...exigirArrayDeNumeros(o["horas"], null, `${path}.horas`));
  }
  if (o["estrategias"] !== undefined) {
    if (!esArrayDe(o["estrategias"])) {
      out.push({ path: `${path}.estrategias`, message: "se esperaba array" });
    } else {
      o["estrategias"].forEach((e, i) => {
        out.push(...exigirMiembroDe(e, ESTRATEGIAS, `${path}.estrategias[${i}]`));
      });
    }
  }
  if (o["rte_referencia_pct"] !== undefined) {
    out.push(...exigirNumeroFinito(o["rte_referencia_pct"], `${path}.rte_referencia_pct`));
  }
  if (o["dod_referencia_pct"] !== undefined) {
    out.push(...exigirNumeroFinito(o["dod_referencia_pct"], `${path}.dod_referencia_pct`));
  }
  if (o["evaluadas"] !== undefined) {
    if (!esArrayDe(o["evaluadas"])) {
      out.push({ path: `${path}.evaluadas`, message: "se esperaba array" });
    } else {
      o["evaluadas"].forEach((e, i) => {
        out.push(...validarEvaluadaContrato(e, `${path}.evaluadas[${i}]`));
      });
    }
  }
  if (o["codo_orientativo_index"] !== undefined) {
    const c = o["codo_orientativo_index"];
    if (c !== null && !esEnteroNoNegativo(c)) {
      out.push({
        path: `${path}.codo_orientativo_index`,
        message: "se esperaba entero ≥ 0 o null",
      });
    }
  }
  if (o["badge_trazabilidad"] !== undefined) {
    out.push(
      ...exigirMiembroDe(o["badge_trazabilidad"], BADGES_TRAZABILIDAD, `${path}.badge_trazabilidad`)
    );
  }
  return out;
}

function validarDefaultsEconomicos(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const CAMPOS = [
    "precio_energia_mxn_mwh",
    "precio_cel_mxn",
    "precio_potencia_firme_mxn_mw_mes",
    "capex_mxn",
    "wacc_pct",
    "opex_tasa_anual_pct",
    "lmp_mxn_mwh",
  ];
  const out: ErrorValidacion[] = [];
  for (const campo of CAMPOS) {
    out.push(...exigirCampo(o, campo, path));
    if (o[campo] !== undefined) {
      out.push(...validarKpiEscalar(o[campo], `${path}.${campo}`));
    }
  }
  return out;
}

function validarKpisFisicoMedidoAnual(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const CAMPOS = [
    "energia_generada_anual_mwh",
    "factor_capacidad_pct",
    "horas_con_generacion",
    "pico_horario_kw",
  ];
  const out: ErrorValidacion[] = [];
  for (const campo of CAMPOS) {
    out.push(...exigirCampo(o, campo, path));
    if (o[campo] !== undefined) {
      out.push(...validarKpiEscalar(o[campo], `${path}.${campo}`));
    }
  }
  return out;
}

function validarKpisFisicoProyectadoAnual(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const CAMPOS = [
    "energia_generada_p50_mwh",
    "factor_capacidad_p50_pct",
    "pico_horario_p50_kw",
  ];
  const out: ErrorValidacion[] = [];
  for (const campo of CAMPOS) {
    out.push(...exigirCampo(o, campo, path));
    if (o[campo] !== undefined) {
      out.push(...validarKpiEscalar(o[campo], `${path}.${campo}`));
    }
  }
  return out;
}

function validarKpisContractualMensual(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const CAMPOS = [
    "energia_liquidada_mwh",
    "precio_energia_promedio_mxn_mwh",
    "ingreso_mensual_mxn",
  ];
  const out: ErrorValidacion[] = [];
  for (const campo of CAMPOS) {
    out.push(...exigirCampo(o, campo, path));
    if (o[campo] !== undefined) {
      out.push(...validarKpiEscalar(o[campo], `${path}.${campo}`));
    }
  }
  return out;
}

// ─── Modos ───────────────────────────────────────────────────────────────────

function validarModoFisicoMedidoAnual(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [];
  out.push(...exigirCampo(o, "naturaleza", path));
  if (o["naturaleza"] !== "fisico_medido_anual" && "naturaleza" in o) {
    out.push({
      path: `${path}.naturaleza`,
      message: `se esperaba literal "fisico_medido_anual"`,
    });
  }
  out.push(...exigirCampo(o, "fuente", path));
  if (o["fuente"] !== undefined) out.push(...exigirString(o["fuente"], `${path}.fuente`));
  out.push(...exigirCampo(o, "periodo_inicio", path));
  if (o["periodo_inicio"] !== undefined && !esISO(o["periodo_inicio"])) {
    out.push({ path: `${path}.periodo_inicio`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "periodo_fin", path));
  if (o["periodo_fin"] !== undefined && !esISO(o["periodo_fin"])) {
    out.push({ path: `${path}.periodo_fin`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "kpis", path));
  if (o["kpis"] !== undefined) {
    out.push(...validarKpisFisicoMedidoAnual(o["kpis"], `${path}.kpis`));
  }
  out.push(...exigirCampo(o, "perfil_horario_promedio_diario", path));
  if (o["perfil_horario_promedio_diario"] !== undefined) {
    out.push(
      ...validarPerfilHorarioPromedioDiario(
        o["perfil_horario_promedio_diario"],
        `${path}.perfil_horario_promedio_diario`
      )
    );
  }
  out.push(...exigirCampo(o, "captura_mensual_mwh", path));
  if (o["captura_mensual_mwh"] !== undefined) {
    out.push(
      ...validarCapturaMensualMwh(o["captura_mensual_mwh"], `${path}.captura_mensual_mwh`)
    );
  }
  if (o["barrido_configuraciones"] !== undefined) {
    out.push(
      ...validarBarridoConfiguraciones(
        o["barrido_configuraciones"],
        `${path}.barrido_configuraciones`
      )
    );
  }
  out.push(...exigirCampo(o, "defaults_economicos", path));
  if (o["defaults_economicos"] !== undefined) {
    out.push(...validarDefaultsEconomicos(o["defaults_economicos"], `${path}.defaults_economicos`));
  }
  out.push(...exigirCampo(o, "advertencias", path));
  if (o["advertencias"] !== undefined) {
    out.push(...validarArrayDeAdvertencias(o["advertencias"], `${path}.advertencias`));
  }
  return out;
}

function validarModoFisicoProyectadoAnual(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [];
  out.push(...exigirCampo(o, "naturaleza", path));
  if (o["naturaleza"] !== "fisico_proyectado_anual" && "naturaleza" in o) {
    out.push({
      path: `${path}.naturaleza`,
      message: `se esperaba literal "fisico_proyectado_anual"`,
    });
  }
  out.push(...exigirCampo(o, "fuente", path));
  if (o["fuente"] !== undefined) out.push(...exigirString(o["fuente"], `${path}.fuente`));
  out.push(...exigirCampo(o, "periodo_inicio", path));
  if (o["periodo_inicio"] !== undefined && !esISO(o["periodo_inicio"])) {
    out.push({ path: `${path}.periodo_inicio`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "periodo_fin", path));
  if (o["periodo_fin"] !== undefined && !esISO(o["periodo_fin"])) {
    out.push({ path: `${path}.periodo_fin`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "kpis", path));
  if (o["kpis"] !== undefined) {
    out.push(...validarKpisFisicoProyectadoAnual(o["kpis"], `${path}.kpis`));
  }
  out.push(...exigirCampo(o, "perfil_horario_promedio_diario_p50", path));
  if (o["perfil_horario_promedio_diario_p50"] !== undefined) {
    out.push(
      ...validarPerfilHorarioPromedioDiario(
        o["perfil_horario_promedio_diario_p50"],
        `${path}.perfil_horario_promedio_diario_p50`
      )
    );
  }
  out.push(...exigirCampo(o, "captura_mensual_p50_mwh", path));
  if (o["captura_mensual_p50_mwh"] !== undefined) {
    out.push(
      ...validarCapturaMensualMwh(
        o["captura_mensual_p50_mwh"],
        `${path}.captura_mensual_p50_mwh`
      )
    );
  }
  out.push(...exigirCampo(o, "defaults_economicos", path));
  if (o["defaults_economicos"] !== undefined) {
    out.push(...validarDefaultsEconomicos(o["defaults_economicos"], `${path}.defaults_economicos`));
  }
  out.push(...exigirCampo(o, "advertencias", path));
  if (o["advertencias"] !== undefined) {
    out.push(...validarArrayDeAdvertencias(o["advertencias"], `${path}.advertencias`));
  }
  return out;
}

function validarModoContractualMensual(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [];
  out.push(...exigirCampo(o, "naturaleza", path));
  if (o["naturaleza"] !== "contractual_mensual" && "naturaleza" in o) {
    out.push({
      path: `${path}.naturaleza`,
      message: `se esperaba literal "contractual_mensual"`,
    });
  }
  out.push(...exigirCampo(o, "fuente", path));
  if (o["fuente"] !== undefined) out.push(...exigirString(o["fuente"], `${path}.fuente`));
  out.push(...exigirCampo(o, "periodo_inicio", path));
  if (o["periodo_inicio"] !== undefined && !esISO(o["periodo_inicio"])) {
    out.push({ path: `${path}.periodo_inicio`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "periodo_fin", path));
  if (o["periodo_fin"] !== undefined && !esISO(o["periodo_fin"])) {
    out.push({ path: `${path}.periodo_fin`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "kpis", path));
  if (o["kpis"] !== undefined) {
    out.push(...validarKpisContractualMensual(o["kpis"], `${path}.kpis`));
  }
  out.push(...exigirCampo(o, "perfil_diario_del_mes_mwh", path));
  if (o["perfil_diario_del_mes_mwh"] !== undefined) {
    out.push(
      ...validarPerfilDiarioDelMesMwh(
        o["perfil_diario_del_mes_mwh"],
        `${path}.perfil_diario_del_mes_mwh`
      )
    );
  }
  out.push(...exigirCampo(o, "defaults_economicos", path));
  if (o["defaults_economicos"] !== undefined) {
    out.push(...validarDefaultsEconomicos(o["defaults_economicos"], `${path}.defaults_economicos`));
  }
  out.push(...exigirCampo(o, "advertencias", path));
  if (o["advertencias"] !== undefined) {
    out.push(...validarArrayDeAdvertencias(o["advertencias"], `${path}.advertencias`));
  }
  return out;
}

function validarModoNoExtrapolableAnual(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [];
  out.push(...exigirCampo(o, "naturaleza", path));
  if (o["naturaleza"] !== "no_extrapolable_anual" && "naturaleza" in o) {
    out.push({
      path: `${path}.naturaleza`,
      message: `se esperaba literal "no_extrapolable_anual"`,
    });
  }
  out.push(...exigirCampo(o, "fuente", path));
  if (o["fuente"] !== undefined) out.push(...exigirString(o["fuente"], `${path}.fuente`));
  out.push(...exigirCampo(o, "periodo_inicio", path));
  if (o["periodo_inicio"] !== undefined && !esISO(o["periodo_inicio"])) {
    out.push({ path: `${path}.periodo_inicio`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "periodo_fin", path));
  if (o["periodo_fin"] !== undefined && !esISO(o["periodo_fin"])) {
    out.push({ path: `${path}.periodo_fin`, message: "se esperaba ISO 8601" });
  }
  out.push(...exigirCampo(o, "kpis", path));
  if (o["kpis"] !== undefined) {
    out.push(...validarKpisFisicoMedidoAnual(o["kpis"], `${path}.kpis`));
  }
  out.push(...exigirCampo(o, "perfil_horario_promedio_diario", path));
  if (o["perfil_horario_promedio_diario"] !== undefined) {
    out.push(
      ...validarPerfilHorarioPromedioDiario(
        o["perfil_horario_promedio_diario"],
        `${path}.perfil_horario_promedio_diario`
      )
    );
  }
  out.push(...exigirCampo(o, "captura_mensual_mwh", path));
  if (o["captura_mensual_mwh"] !== undefined) {
    out.push(
      ...validarCapturaMensualMwh(o["captura_mensual_mwh"], `${path}.captura_mensual_mwh`)
    );
  }
  out.push(...exigirCampo(o, "defaults_economicos", path));
  if (o["defaults_economicos"] !== undefined) {
    out.push(...validarDefaultsEconomicos(o["defaults_economicos"], `${path}.defaults_economicos`));
  }
  out.push(...exigirCampo(o, "advertencias", path));
  if (o["advertencias"] !== undefined) {
    out.push(...validarArrayDeAdvertencias(o["advertencias"], `${path}.advertencias`));
  }
  return out;
}

function validarModosPlanta(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [];
  // Cero modos válidos sería degenerado pero no inválido por shape; lo permitimos
  // a propósito para no acoplar el contrato a "siempre ≥1 modo".
  if (o["fisico_medido_anual"] !== undefined) {
    out.push(
      ...validarModoFisicoMedidoAnual(o["fisico_medido_anual"], `${path}.fisico_medido_anual`)
    );
  }
  if (o["fisico_proyectado_anual"] !== undefined) {
    out.push(
      ...validarModoFisicoProyectadoAnual(
        o["fisico_proyectado_anual"],
        `${path}.fisico_proyectado_anual`
      )
    );
  }
  if (o["contractual_mensual"] !== undefined) {
    out.push(
      ...validarModoContractualMensual(o["contractual_mensual"], `${path}.contractual_mensual`)
    );
  }
  if (o["no_extrapolable_anual"] !== undefined) {
    out.push(
      ...validarModoNoExtrapolableAnual(
        o["no_extrapolable_anual"],
        `${path}.no_extrapolable_anual`
      )
    );
  }
  // Llaves desconocidas: las reportamos como error suave para evitar drift.
  const VALIDAS = new Set<string>(BADGES_NATURALEZA);
  for (const k of Object.keys(o)) {
    if (!VALIDAS.has(k)) {
      out.push({ path: `${path}.${k}`, message: "llave de modo desconocida" });
    }
  }
  return out;
}

function validarPlantaContrato(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [];
  out.push(...exigirCampo(o, "planta_id", path));
  if (o["planta_id"] !== undefined) out.push(...exigirString(o["planta_id"], `${path}.planta_id`));
  out.push(...exigirCampo(o, "nombre_humano", path));
  if (o["nombre_humano"] !== undefined) {
    out.push(...exigirString(o["nombre_humano"], `${path}.nombre_humano`));
  }
  out.push(...exigirCampo(o, "capacidad_poi_kw", path));
  if (o["capacidad_poi_kw"] !== undefined) {
    out.push(...exigirNumeroFinito(o["capacidad_poi_kw"], `${path}.capacidad_poi_kw`));
  }
  out.push(...exigirCampo(o, "capacidad_instalada_kw", path));
  if (o["capacidad_instalada_kw"] !== undefined) {
    out.push(
      ...exigirNumeroFinito(o["capacidad_instalada_kw"], `${path}.capacidad_instalada_kw`)
    );
  }
  out.push(...exigirCampo(o, "zona_lmp", path));
  if (o["zona_lmp"] !== undefined && o["zona_lmp"] !== null && !esString(o["zona_lmp"])) {
    out.push({ path: `${path}.zona_lmp`, message: "se esperaba string o null" });
  }
  out.push(...exigirCampo(o, "anio_base", path));
  if (o["anio_base"] !== undefined) {
    out.push(...exigirEnteroNoNegativo(o["anio_base"], `${path}.anio_base`));
  }
  return out;
}

// ─── Entradas top-level ──────────────────────────────────────────────────────

export function validarArchivoPlanta(json: unknown): ResultadoValidacion<ArchivoPlanta> {
  const path = "$";
  const errores: ErrorValidacion[] = [];
  errores.push(...exigirObjeto(json, path));
  if (errores.length > 0) return { ok: false, errores };
  const o = json as Record<string, unknown>;
  errores.push(...exigirCampo(o, "schema_version", path));
  if (o["schema_version"] !== undefined && !esSemver(o["schema_version"])) {
    errores.push({
      path: `${path}.schema_version`,
      message: "se esperaba semver válido (e.g. 1.0.0)",
    });
  }
  errores.push(...exigirCampo(o, "planta", path));
  if (o["planta"] !== undefined) {
    errores.push(...validarPlantaContrato(o["planta"], `${path}.planta`));
  }
  errores.push(...exigirCampo(o, "modos", path));
  if (o["modos"] !== undefined) {
    errores.push(...validarModosPlanta(o["modos"], `${path}.modos`));
  }
  if (errores.length > 0) return { ok: false, errores };
  return { ok: true, data: json as ArchivoPlanta };
}

function validarPlantaEnManifest(v: unknown, path: string): ErrorValidacion[] {
  const errores = exigirObjeto(v, path);
  if (errores.length > 0) return errores;
  const o = v as Record<string, unknown>;
  const out: ErrorValidacion[] = [];
  out.push(...exigirCampo(o, "planta_id", path));
  if (o["planta_id"] !== undefined) out.push(...exigirString(o["planta_id"], `${path}.planta_id`));
  out.push(...exigirCampo(o, "nombre_humano", path));
  if (o["nombre_humano"] !== undefined) {
    out.push(...exigirString(o["nombre_humano"], `${path}.nombre_humano`));
  }
  out.push(...exigirCampo(o, "modos_disponibles", path));
  if (o["modos_disponibles"] !== undefined) {
    if (!esArrayDe(o["modos_disponibles"])) {
      out.push({ path: `${path}.modos_disponibles`, message: "se esperaba array" });
    } else {
      o["modos_disponibles"].forEach((m, i) => {
        out.push(
          ...exigirMiembroDe(m, BADGES_NATURALEZA, `${path}.modos_disponibles[${i}]`)
        );
      });
    }
  }
  out.push(...exigirCampo(o, "fuente", path));
  if (o["fuente"] !== undefined) out.push(...exigirString(o["fuente"], `${path}.fuente`));
  out.push(...exigirCampo(o, "ultima_actualizacion", path));
  if (o["ultima_actualizacion"] !== undefined && !esISO(o["ultima_actualizacion"])) {
    out.push({ path: `${path}.ultima_actualizacion`, message: "se esperaba ISO 8601" });
  }
  return out;
}

export function validarManifest(json: unknown): ResultadoValidacion<Manifest> {
  const path = "$";
  const errores: ErrorValidacion[] = [];
  errores.push(...exigirObjeto(json, path));
  if (errores.length > 0) return { ok: false, errores };
  const o = json as Record<string, unknown>;
  errores.push(...exigirCampo(o, "schema_version", path));
  if (o["schema_version"] !== undefined && !esSemver(o["schema_version"])) {
    errores.push({
      path: `${path}.schema_version`,
      message: "se esperaba semver válido (e.g. 1.0.0)",
    });
  }
  errores.push(...exigirCampo(o, "generado_at", path));
  if (o["generado_at"] !== undefined && !esISO(o["generado_at"])) {
    errores.push({ path: `${path}.generado_at`, message: "se esperaba ISO 8601" });
  }
  errores.push(...exigirCampo(o, "plantas", path));
  if (o["plantas"] !== undefined) {
    if (!esArrayDe(o["plantas"])) {
      errores.push({ path: `${path}.plantas`, message: "se esperaba array" });
    } else {
      o["plantas"].forEach((p, i) => {
        errores.push(...validarPlantaEnManifest(p, `${path}.plantas[${i}]`));
      });
    }
  }
  if (errores.length > 0) return { ok: false, errores };
  return { ok: true, data: json as Manifest };
}

// Re-export tipos para que los consumidores no tengan que tocar @/types/contrato
// si solo quieren validar. Las definiciones siguen viviendo en types/.
export type {
  Advertencia,
  ArchivoPlanta,
  BadgeNaturaleza,
  BadgeTrazabilidad,
  BarridoConfiguraciones,
  CapturaMensualMwh,
  DefaultsEconomicos,
  ErrorValidacion,
  Estrategia,
  EvaluadaContrato,
  KpiEscalar,
  KpisContractualMensual,
  KpisFisicoMedidoAnual,
  KpisFisicoProyectadoAnual,
  Manifest,
  ModoContractualMensual,
  ModoFisicoMedidoAnual,
  ModoFisicoProyectadoAnual,
  ModoNoExtrapolableAnual,
  ModosPlanta,
  PerfilDiarioDelMesMwh,
  PerfilHorarioPromedioDiario,
  PlantaContrato,
  PlantaEnManifest,
  ResultadoValidacion,
};
