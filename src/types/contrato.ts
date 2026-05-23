/**
 * Tipos del contrato JSON consumido por la app multi-planta.
 *
 * Convenciones (cerradas, NO reabrir, solo materializar):
 *  - Llaves snake_case con sufijo de unidad (`_mwh`, `_kw`, `_kwh`, `_pct`,
 *    `_anios`, `_mxn`, `_usd`, `_mxn_mwh`, `_mxn_mw_mes`).
 *  - `schema_version` semver en raíz de cada archivo.
 *  - Manifest global lista plantas + modos disponibles.
 *  - Badges en DOS ejes ortogonales (D-PROD-03):
 *     · `BadgeNaturaleza`  → tipo de verdad, a nivel de modo de dataset.
 *     · `BadgeTrazabilidad` → origen, a nivel de KPI individual.
 *    Nunca se colapsan en un solo campo. Las dos viajan por separado.
 *  - Payload base = agregados (D-CONTRATO-02): perfil horario promedio diario
 *    (24 puntos), captura mensual (12 puntos), KPIs escalares, barrido
 *    pre-calculado. Sin 8760 puntos en el payload base.
 *  - Modo proyectado reserva solo `p50` (D-CONTRATO-09). No p75/p90/p99.
 *  - Advertencias híbrido `{ codigo, mensaje }` (D-CONTRATO-10) reutilizando
 *    `WarningCodigo` ya definido en `@/types/sfv`.
 *  - Defaults económicos (D-CONTRATO-04). Sin escenarios pre-calculados, sin
 *    multiplicadores en el JSON. La app aplica sensibilidades en código.
 *
 * Este archivo SOLO define tipos. NO importa runtime de la app; NO es importado
 * por ningún componente/hook todavía (eso entra en PR-Arq-2a).
 */

import type { WarningCodigo } from "@/types/sfv";

// ─── Ejes de badge ────────────────────────────────────────────────────────────

/**
 * Eje 1 — Naturaleza (tipo de verdad). A nivel de modo de dataset.
 * `fisico_proyectado_anual` se reserva pero NO se emite todavía (sin dataset).
 */
export type BadgeNaturaleza =
  | "fisico_medido_anual"
  | "fisico_proyectado_anual"
  | "contractual_mensual"
  | "no_extrapolable_anual";

/**
 * Eje 2 — Trazabilidad (origen). A nivel de cada KPI.
 */
export type BadgeTrazabilidad =
  | "default_interno"
  | "datasheet_cotizacion"
  | "validado_cliente"
  | "proxy_externo";

// ─── Átomos ───────────────────────────────────────────────────────────────────

/**
 * KPI autodescriptivo. Cada número que viaja en el JSON lo hace dentro de
 * este wrapper: imposible consumirlo sin unidad y origen.
 */
export type KpiEscalar = {
  valor: number;
  unidad: string;
  badge_trazabilidad: BadgeTrazabilidad;
  /** Texto opcional con la fuente concreta (e.g. "reporte horario operador 2025"). */
  fuente?: string;
};

export type Advertencia = {
  codigo: WarningCodigo;
  mensaje: string;
};

export type Estrategia = "greedy" | "arbitraje";

// ─── Perfiles agregados (payload base, sin 8760) ──────────────────────────────

/**
 * Perfil promedio del día tipo. 24 puntos.
 *
 * Convención de horas **hora-ending 1..24** (D-CONTRATO-HORAS):
 *  - `horas` DEBE ser exactamente `[1, 2, 3, ..., 24]`.
 *  - La hora `h` representa el intervalo que TERMINA en `h` (e.g. hora 13
 *    = intervalo 12:00–13:00, mediodía).
 *  - `gen_kw[i]` es el promedio del intervalo etiquetado `horas[i]`. El
 *    primer elemento del array es siempre el primer intervalo del día
 *    (00:00–01:00 = hora-ending 1); el último es 23:00–00:00 = hora-ending 24.
 *
 * Misma convención que el motor SFV del repo (`caracterizarRecurso`,
 * `calcularPerfilHorario`) y el Colab fuente. NO se introduce traducción
 * entre contrato y motor.
 */
export type PerfilHorarioPromedioDiario = {
  horas: readonly number[];   // exactamente [1..24]
  gen_kw: readonly number[];  // longitud 24, cronológico (00:00–01:00 primero)
  badge_trazabilidad: BadgeTrazabilidad;
};

/** Captura BESS agregada por mes. 12 puntos. */
export type CapturaMensualMwh = {
  meses: readonly number[];          // 1..12
  valores_mwh: readonly number[];    // longitud 12
  badge_trazabilidad: BadgeTrazabilidad;
};

/** Perfil diario de un mes específico (modo contractual). */
export type PerfilDiarioDelMesMwh = {
  dias: readonly number[];           // 1..28-31 según mes
  valores_mwh: readonly number[];
  badge_trazabilidad: BadgeTrazabilidad;
};

// ─── Barrido de configuraciones (Pareto + codo orientativo) ───────────────────

export type EvaluadaContrato = {
  p_kw: number;
  e_kwh: number;
  horas: number;
  estrategia: Estrategia;
  fraccion_capturada_pct: number;
  ciclos_periodo: number;
  en_frente_pareto: boolean;
};

export type BarridoConfiguraciones = {
  potencias_kw: readonly number[];
  horas: readonly number[];
  estrategias: readonly Estrategia[];
  rte_referencia_pct: number;
  dod_referencia_pct: number;
  evaluadas: readonly EvaluadaContrato[];
  /** Índice en `evaluadas` del codo orientativo; null si la geometría no lo admite. */
  codo_orientativo_index: number | null;
  badge_trazabilidad: BadgeTrazabilidad;
};

// ─── Defaults económicos (sin escenarios, sin multiplicadores) ────────────────

export type DefaultsEconomicos = {
  precio_energia_mxn_mwh: KpiEscalar;
  precio_cel_mxn: KpiEscalar;
  precio_potencia_firme_mxn_mw_mes: KpiEscalar;
  capex_mxn: KpiEscalar;
  wacc_pct: KpiEscalar;
  opex_tasa_anual_pct: KpiEscalar;
  lmp_mxn_mwh: KpiEscalar;
};

// ─── KPIs por modo ────────────────────────────────────────────────────────────

export type KpisFisicoMedidoAnual = {
  energia_generada_anual_mwh: KpiEscalar;
  factor_capacidad_pct: KpiEscalar;
  horas_con_generacion: KpiEscalar;
  pico_horario_kw: KpiEscalar;
};

export type KpisFisicoProyectadoAnual = {
  /** Solo P50; D-CONTRATO-09 reserva exclusivamente el central. */
  energia_generada_p50_mwh: KpiEscalar;
  factor_capacidad_p50_pct: KpiEscalar;
  pico_horario_p50_kw: KpiEscalar;
};

export type KpisContractualMensual = {
  energia_liquidada_mwh: KpiEscalar;
  precio_energia_promedio_mxn_mwh: KpiEscalar;
  ingreso_mensual_mxn: KpiEscalar;
};

// ─── Modos (cada uno con su naturaleza redundante para hacer el discriminado explícito) ───

export type ModoFisicoMedidoAnual = {
  naturaleza: "fisico_medido_anual";
  fuente: string;
  periodo_inicio: string;   // ISO 8601
  periodo_fin: string;      // ISO 8601
  kpis: KpisFisicoMedidoAnual;
  perfil_horario_promedio_diario: PerfilHorarioPromedioDiario;
  captura_mensual_mwh: CapturaMensualMwh;
  /** Opcional. Si no se incluye, el barrido se calcula en runtime en PR-2a. */
  barrido_configuraciones?: BarridoConfiguraciones;
  defaults_economicos: DefaultsEconomicos;
  advertencias: readonly Advertencia[];
};

export type ModoFisicoProyectadoAnual = {
  naturaleza: "fisico_proyectado_anual";
  fuente: string;
  periodo_inicio: string;
  periodo_fin: string;
  kpis: KpisFisicoProyectadoAnual;
  /** Perfil promedio P50; nombre del campo lleva _p50 para distinguir del medido. */
  perfil_horario_promedio_diario_p50: PerfilHorarioPromedioDiario;
  captura_mensual_p50_mwh: CapturaMensualMwh;
  defaults_economicos: DefaultsEconomicos;
  advertencias: readonly Advertencia[];
};

export type ModoContractualMensual = {
  naturaleza: "contractual_mensual";
  fuente: string;
  periodo_inicio: string;
  periodo_fin: string;
  kpis: KpisContractualMensual;
  perfil_diario_del_mes_mwh: PerfilDiarioDelMesMwh;
  defaults_economicos: DefaultsEconomicos;
  advertencias: readonly Advertencia[];
};

export type ModoNoExtrapolableAnual = {
  naturaleza: "no_extrapolable_anual";
  fuente: string;
  periodo_inicio: string;
  periodo_fin: string;
  kpis: KpisFisicoMedidoAnual;
  perfil_horario_promedio_diario: PerfilHorarioPromedioDiario;
  /** Puede tener huecos / cobertura parcial. */
  captura_mensual_mwh: CapturaMensualMwh;
  defaults_economicos: DefaultsEconomicos;
  advertencias: readonly Advertencia[];
};

/**
 * Mapa de modos por naturaleza. Todos opcionales — una planta puede tener
 * uno, varios o todos. La presencia de cada clave coincide con la naturaleza
 * declarada adentro.
 */
export type ModosPlanta = {
  fisico_medido_anual?: ModoFisicoMedidoAnual;
  fisico_proyectado_anual?: ModoFisicoProyectadoAnual;
  contractual_mensual?: ModoContractualMensual;
  no_extrapolable_anual?: ModoNoExtrapolableAnual;
};

// ─── Identificación de planta ─────────────────────────────────────────────────

export type PlantaContrato = {
  planta_id: string;
  nombre_humano: string;
  capacidad_poi_kw: number;
  capacidad_instalada_kw: number;
  zona_lmp: string | null;
  anio_base: number;
};

// ─── Archivo raíz por planta ──────────────────────────────────────────────────

export type ArchivoPlanta = {
  schema_version: string;
  planta: PlantaContrato;
  modos: ModosPlanta;
};

// ─── Manifest ─────────────────────────────────────────────────────────────────

export type PlantaEnManifest = {
  planta_id: string;
  nombre_humano: string;
  modos_disponibles: readonly BadgeNaturaleza[];
  fuente: string;
  ultima_actualizacion: string;  // ISO 8601
};

export type Manifest = {
  schema_version: string;
  generado_at: string;            // ISO 8601
  plantas: readonly PlantaEnManifest[];
};

// ─── Resultado de validación ─────────────────────────────────────────────────

export type ErrorValidacion = {
  path: string;
  message: string;
};

export type ResultadoValidacion<T> =
  | { ok: true; data: T }
  | { ok: false; errores: ErrorValidacion[] };

// ─── Listas cerradas (para el validador) ─────────────────────────────────────

export const BADGES_NATURALEZA: readonly BadgeNaturaleza[] = [
  "fisico_medido_anual",
  "fisico_proyectado_anual",
  "contractual_mensual",
  "no_extrapolable_anual",
];

export const BADGES_TRAZABILIDAD: readonly BadgeTrazabilidad[] = [
  "default_interno",
  "datasheet_cotizacion",
  "validado_cliente",
  "proxy_externo",
];

export const WARNING_CODIGOS: readonly WarningCodigo[] = [
  "HORAS_INCOMPLETAS",
  "PICO_EXCEDE_INSTALADA",
  "PICO_EXCEDE_POI",
  "ANIO_NO_COMPLETO",
  "GRANULARIDAD_SUB_HORARIA",
  "GRANULARIDAD_SUPRA_HORARIA",
  "GRANULARIDAD_DESCONOCIDA",
];

export const ESTRATEGIAS: readonly Estrategia[] = ["greedy", "arbitraje"];
