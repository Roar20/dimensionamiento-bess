/**
 * Adapter inverso: `DatosSFV → ArchivoPlanta` (forma del contrato).
 *
 * Toma el resultado actual del loader del Excel (`cargarArchivoSFV`) y lo
 * reempaqueta a la forma del contrato JSON, aplicando las MISMAS funciones
 * puras que la app usa hoy en runtime. Sirve para:
 *
 *  - Comparación de paridad: ruta vieja (este adapter) vs ruta nueva (loader
 *    del JSON). Mismo shape → comparable campo-a-campo.
 *  - Generación de fixtures: dado un `DatosSFV` cualquiera, producir un
 *    `ArchivoPlanta` válido para tests/desarrollo.
 *
 * NO se conecta a runtime. NO modifica las funciones puras — solo las
 * consume. Aislado, exactamente como el contrato (PR-Arq-1) y el loader.
 *
 * Convención de horas: hora-ending 1..24 (D-CONTRATO-HORAS). El motor SFV
 * (`calcularPerfilHorario`) usa la misma convención, así que el mapeo es
 * directo: `perfil.perfil_por_hora[h].kW_promedio` con `h ∈ [1..24]` →
 * `gen_kw[h-1]`. Sin off-by-one.
 *
 * `barrido_configuraciones` queda fuera de este adapter por decisión
 * (D-CONTRATO-BARRIDO pendiente). Quien necesite el barrido lo calcula
 * llamando a `correrBarridoConfiguraciones` separadamente y lo une al
 * `ArchivoPlanta` resultante.
 */

import type { DatosSFV, Warning } from "@/types/sfv";
import { caracterizarRecurso } from "@/lib/core/sfv/caracterizar";
import { calcularPerfilHorario } from "@/lib/core/sfv/perfil-horario";
import { agregarPorMes } from "@/lib/tab-sfv/agregaciones-mensuales";

import type {
  Advertencia,
  ArchivoPlanta,
  BadgeTrazabilidad,
  CapturaMensualMwh,
  DefaultsEconomicos,
  KpiEscalar,
  KpisFisicoMedidoAnual,
  ModoFisicoMedidoAnual,
  PerfilHorarioPromedioDiario,
  PlantaContrato,
} from "@/types/contrato";

/**
 * Defaults económicos que el adapter usa cuando el caller no provee uno
 * propio. Tomados textualmente de `PARAMETROS_FINANCIEROS_DEFAULT` del Tab
 * Financiero, con badge `proxy_externo`. El CAPEX placeholder usa
 * `default_interno` porque no proviene de ningún catálogo cotizado.
 *
 * Sin acoplar a `useParametrosFinancieros` (que vive en hooks de React);
 * los números viven aquí como constantes para mantener el adapter puro.
 */
const DEFAULTS_ECONOMICOS_FALLBACK: DefaultsEconomicos = {
  precio_energia_mxn_mwh: {
    valor: 1010.8,
    unidad: "MXN/MWh",
    badge_trazabilidad: "proxy_externo",
  },
  precio_cel_mxn: {
    valor: 190,
    unidad: "MXN/MWh",
    badge_trazabilidad: "proxy_externo",
  },
  precio_potencia_firme_mxn_mw_mes: {
    valor: 333_334,
    unidad: "MXN/MW-mes",
    badge_trazabilidad: "proxy_externo",
  },
  capex_mxn: {
    valor: 1_120_000,
    unidad: "MXN",
    badge_trazabilidad: "default_interno",
  },
  wacc_pct: {
    valor: 10,
    unidad: "%",
    badge_trazabilidad: "default_interno",
  },
  opex_tasa_anual_pct: {
    valor: 2,
    unidad: "%",
    badge_trazabilidad: "default_interno",
  },
  lmp_mxn_mwh: {
    valor: 360,
    unidad: "MXN/MWh",
    badge_trazabilidad: "proxy_externo",
  },
};

const HORAS_1_A_24: readonly number[] = Array.from(
  { length: 24 },
  (_, i) => i + 1
);

const MESES_1_A_12: readonly number[] = Array.from(
  { length: 12 },
  (_, i) => i + 1
);

export type ParamsDerivar = {
  /** Semver para `schema_version`. Si no se pasa, "1.0.0". */
  schema_version?: string;
  /** Identificador slug de la planta. Si no, derivado de `config.nombre`. */
  planta_id?: string;
  /** Texto libre de `fuente` para el modo. */
  fuente_modo?: string;
  /**
   * Badge de trazabilidad uniforme para los KPIs derivados de los datos
   * cargados. Default: `validado_cliente` (asume que el Excel del operador
   * es la fuente de verdad).
   */
  badge_trazabilidad_kpis?: BadgeTrazabilidad;
  /**
   * Badge para los perfiles agregados (perfil 24h, captura mensual).
   * Default: `validado_cliente`.
   */
  badge_trazabilidad_perfiles?: BadgeTrazabilidad;
  /**
   * Defaults económicos override. Si no se pasa, usa
   * `DEFAULTS_ECONOMICOS_FALLBACK`.
   */
  defaults_economicos?: DefaultsEconomicos;
};

/**
 * Convierte un nombre humano de planta en slug `kebab-case` ASCII.
 * No es la fuente de verdad de IDs en producción; sirve cuando el caller
 * no provee `planta_id` explícito (e.g. tests con fixture sintético) o
 * cuando se necesita una clave estable derivada del texto libre del
 * onboarding (tab Resumen Ejecutivo, mientras DatosSFV no exponga
 * planta_id real).
 */
export function slugDePlanta(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isoSinTZ(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${dd}T${hh}:${mm}:${ss}`;
}

function kpiEscalar(
  valor: number,
  unidad: string,
  badge: BadgeTrazabilidad,
  fuente?: string
): KpiEscalar {
  return fuente !== undefined
    ? { valor, unidad, badge_trazabilidad: badge, fuente }
    : { valor, unidad, badge_trazabilidad: badge };
}

function advertenciasDesdeWarnings(
  warnings: readonly Warning[]
): Advertencia[] {
  return warnings.map((w) => ({ codigo: w.codigo, mensaje: w.mensaje }));
}

function planta(datos: DatosSFV, plantaIdOverride?: string): PlantaContrato {
  return {
    planta_id: plantaIdOverride ?? slugDePlanta(datos.config.nombre || "planta"),
    nombre_humano: datos.config.nombre,
    capacidad_poi_kw: datos.config.capacidad_poi_kw,
    capacidad_instalada_kw: datos.config.capacidad_instalada_kw,
    zona_lmp: datos.config.zona_lmp,
    anio_base: datos.meta.anio,
  };
}

function kpis(
  datos: DatosSFV,
  badge: BadgeTrazabilidad
): KpisFisicoMedidoAnual {
  const caract = caracterizarRecurso(
    datos.registros,
    datos.config.capacidad_poi_kw,
    datos.config.capacidad_instalada_kw
  );
  return {
    energia_generada_anual_mwh: kpiEscalar(
      datos.meta.total_energia_mwh,
      "MWh",
      badge
    ),
    factor_capacidad_pct: kpiEscalar(caract.factor_capacidad_pct, "%", badge),
    horas_con_generacion: kpiEscalar(
      datos.meta.horas_con_generacion,
      "h",
      badge
    ),
    pico_horario_kw: kpiEscalar(datos.meta.pico_horario_kw, "kW", badge),
  };
}

function perfilHorarioPromedioDiario(
  datos: DatosSFV,
  badge: BadgeTrazabilidad
): PerfilHorarioPromedioDiario {
  const perfil = calcularPerfilHorario(datos.registros);
  // perfil.perfil_por_hora es Record<hora-ending 1..24, { kW_promedio, ... }>.
  // El array gen_kw resultante tiene gen_kw[i] = promedio de la hora-ending (i+1).
  const gen_kw = HORAS_1_A_24.map(
    (h) => perfil.perfil_por_hora[h]?.kW_promedio ?? 0
  );
  return {
    horas: HORAS_1_A_24,
    gen_kw,
    badge_trazabilidad: badge,
  };
}

function capturaMensualMwh(
  datos: DatosSFV,
  badge: BadgeTrazabilidad
): CapturaMensualMwh {
  // agregarPorMes devuelve ResumenMes[] con `mes` en 0..11 (del
  // getMonth() de JavaScript). El contrato usa 1..12 (convención
  // calendar humana), así que mapeamos sumando 1. Si faltan meses
  // (cobertura parcial), se rellenan con 0 para mantener longitud 12 —
  // la advertencia ANIO_NO_COMPLETO ya comunica la cobertura parcial.
  const resumenes = agregarPorMes(datos.registros);
  const porMes = new Map<number, number>();
  for (const r of resumenes) {
    const mesCalendar = r.mes + 1; // 0..11 → 1..12
    porMes.set(mesCalendar, (porMes.get(mesCalendar) ?? 0) + r.energia_mwh);
  }
  const valores_mwh = MESES_1_A_12.map((m) => porMes.get(m) ?? 0);
  return {
    meses: MESES_1_A_12,
    valores_mwh,
    badge_trazabilidad: badge,
  };
}

/**
 * Función principal. Construye un `ArchivoPlanta` válido a partir de un
 * `DatosSFV` cargado (típicamente del Excel del operador) y un set
 * opcional de parámetros para metadatos y badges.
 *
 * Garantías:
 *  - El resultado pasa `validarArchivoPlanta(...)` (mismo PR del contrato).
 *  - `perfil_horario_promedio_diario.horas` es exactamente `[1..24]`
 *    (D-CONTRATO-HORAS).
 *  - `captura_mensual_mwh.meses` es exactamente `[1..12]`, longitud 12.
 *  - `advertencias` preserva los códigos y mensajes ya emitidos por el
 *    loader del Excel (sin reformatear ni traducir).
 *  - Cero traducción de convenciones: el motor SFV ya emite hora-ending
 *    1..24; el adapter solo extrae el array indexado por esa convención.
 *
 * Lo que el adapter NO incluye (decisión consciente):
 *  - `barrido_configuraciones`: requiere parámetros del barrido + categoría
 *    + estrategias. Pendiente D-CONTRATO-BARRIDO. Si el caller lo necesita
 *    en el resultado, lo agrega después con merge.
 *  - Modos `fisico_proyectado_anual` y `contractual_mensual`: este adapter
 *    sólo emite el modo `fisico_medido_anual` porque eso es lo que la app
 *    sabe calcular hoy. Otros modos vendrán pre-emitidos por el motor Python
 *    en su momento.
 */
export function derivarArchivoPlantaDesdeDatosSFV(
  datos: DatosSFV,
  warnings: readonly Warning[] = [],
  params: ParamsDerivar = {}
): ArchivoPlanta {
  const schema_version = params.schema_version ?? "1.0.0";
  const badge_kpis = params.badge_trazabilidad_kpis ?? "validado_cliente";
  const badge_perfiles =
    params.badge_trazabilidad_perfiles ?? "validado_cliente";
  const fuente_modo =
    params.fuente_modo ?? "derivado vía derivarArchivoPlantaDesdeDatosSFV";

  const periodo_inicio = datos.meta.periodo_inicio
    ? isoSinTZ(datos.meta.periodo_inicio)
    : "1970-01-01T00:00:00";
  const periodo_fin = datos.meta.periodo_fin
    ? isoSinTZ(datos.meta.periodo_fin)
    : "1970-01-01T00:00:00";

  const modo: ModoFisicoMedidoAnual = {
    naturaleza: "fisico_medido_anual",
    fuente: fuente_modo,
    periodo_inicio,
    periodo_fin,
    kpis: kpis(datos, badge_kpis),
    perfil_horario_promedio_diario: perfilHorarioPromedioDiario(
      datos,
      badge_perfiles
    ),
    captura_mensual_mwh: capturaMensualMwh(datos, badge_perfiles),
    defaults_economicos:
      params.defaults_economicos ?? DEFAULTS_ECONOMICOS_FALLBACK,
    advertencias: advertenciasDesdeWarnings(warnings),
  };

  return {
    schema_version,
    planta: planta(datos, params.planta_id),
    modos: { fisico_medido_anual: modo },
  };
}

/** Re-export del fallback para que tests puedan asertar contra él sin re-declararlo. */
export { DEFAULTS_ECONOMICOS_FALLBACK };
