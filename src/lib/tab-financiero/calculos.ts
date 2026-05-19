/**
 * Cálculos puros del Tab Análisis Financiero.
 *
 * Capa 1: pre-procesado del perfil horario (factor de producción).
 * Capa 2: dispatch año 1 (se delega a `simularUna` desde el componente).
 * Capa 3: potencia firme proxy (percentil 80 en ventana hora-punta CFE).
 * Capa 4: proyección 20 años aplicando SOH del catálogo.
 * Capa 5: payback consistente con el flujo acumulado (interpolación lineal).
 *
 * Importante:
 *  - La curva SOH se recibe por argumento; este módulo NO importa CURVAS_SOH.
 *  - Las pendientes/ratios se derivan en runtime; sin valores SOH hardcoded.
 */

import type { EstadoHorario } from "@/types/bess";
import type { RegistroHorario } from "@/types/sfv";

export type FlujoAnual = {
  anio: number;
  factor_soh: number;
  energia_descargada_punta_mwh: number;
  /**
   * INFORMATIVO. Ingreso por venta de la generación SFV (acotada al POI) al
   * precio PPA. Constante año a año. NO entra al flujo neto del BESS porque
   * el SFV ya lo cobra sin BESS.
   */
  ingreso_ppa_generacion_mxn: number;
  /**
   * INFORMATIVO. CELs sobre la generación SFV (acotada al POI). Constante
   * año a año. NO entra al flujo neto del BESS.
   */
  ingreso_cels_mxn: number;
  /**
   * Incremental BESS. Energía que excede POI capturada por el BESS y luego
   * monetizada al precio PPA. Escala con SOH.
   */
  ingreso_captura_excedentes_mxn: number;
  /**
   * Incremental BESS. Uplift de arbitraje hora-punta: diferencial LMP
   * punta-valle por la energía descargada en ventana CFE 18-22h. Escala con SOH.
   */
  ingreso_arbitraje_mxn: number;
  /**
   * Incremental BESS. Capacidad firme proxy × precio × 12 meses. Escala con SOH.
   */
  ingreso_potencia_firme_mxn: number;
  /**
   * Suma de los 3 componentes incrementales del BESS. Es lo que paga el CAPEX.
   */
  ingreso_incremental_bess_mxn: number;
  /**
   * INFORMATIVO. Suma del ingreso del SFV existente + el incremental del BESS.
   * Útil para narrativa "ingreso del proyecto"; NO se usa para payback.
   */
  ingreso_proyecto_total_mxn: number;
  opex_mxn: number;
  /**
   * Flujo neto SOLO del BESS = ingreso_incremental_bess − opex.
   * Año 0 = −CAPEX_BESS.
   */
  flujo_neto_mxn: number;
  flujo_acumulado_mxn: number;
};

export type EntradasProyeccion = {
  /**
   * Energía capturada por el BESS proveniente de excedentes SFV
   * (gen_kw > POI), año 1, MWh. Es el "valor adicional" del BESS sobre
   * lo que el SFV ya cobra al PPA.
   */
  captura_excedentes_anio1_mwh: number;
  /** Energía descargada en ventana hora-punta CFE año 1, MWh. */
  descargado_anio1_punta_mwh: number;
  /** Generación anual del SFV. Base PPA y CELs. MWh. */
  generacion_anual_mwh: number;
  /** Potencia firme proxy año 1 (percentil 80 en hora-punta), kW. */
  potencia_firme_kw: number;
  /** Curva SOH (21 valores año 0..20) procedente del catálogo. */
  curva_soh: readonly number[];
  /** CAPEX único año 0, MXN. */
  capex_mxn: number;
  /** Tasa OPEX anual sobre CAPEX (ej. 0.02). */
  opex_tasa_anual: number;
  /** Precio energía PPA, MXN/MWh. */
  precio_energia_mxn_mwh: number;
  /** Precio CEL, MXN/CEL (= MXN/MWh CEL emitido). */
  precio_cel_mxn: number;
  /** Precio potencia firme, MXN/MW-mes. */
  precio_potencia_firme_mxn_mw_mes: number;
  /** LMP zona, MXN/MWh (base del diferencial de arbitraje). */
  lmp_mxn_mwh: number;
  /** Diferencial LMP punta-valle como fracción del LMP (default 0.30). */
  diferencial_lmp_pct: number;
};

/**
 * Aplica factor de producción multiplicativo al perfil horario antes del
 * dispatch. NO acota a capacidad POI: los excedentes resultantes son
 * candidatos de captura para el BESS.
 */
export function aplicarFactorProduccion(
  registros: readonly RegistroHorario[],
  factor: number
): RegistroHorario[] {
  if (factor === 1) return registros.slice();
  return registros.map((r) => ({
    timestamp: r.timestamp,
    energia_mwh: r.energia_mwh * factor,
    potencia_kw_prom: r.potencia_kw_prom * factor,
  }));
}

/**
 * Percentil aproximado por interpolación lineal sobre la lista ordenada.
 * `p` ∈ [0, 1]. Devuelve 0 si la lista está vacía.
 */
export function calcularPercentil(
  valores: readonly number[],
  p: number
): number {
  if (valores.length === 0) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const idx = (ordenados.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  const vLo = ordenados[lo] as number;
  const vHi = ordenados[hi] as number;
  return vLo + (vHi - vLo) * frac;
}

/**
 * Filtra horas que caen dentro de la ventana hora-punta CFE en
 * convención hora-ending (e.g. [18, 22] inclusive). El `timestamp` del
 * `EstadoHorario` representa inicio de intervalo, por lo que la hora
 * ending = `timestamp.getHours() + 1`.
 */
export function filtrarHoraPunta<T extends { timestamp: Date }>(
  estados: readonly T[],
  ventana_hora_ending: readonly [number, number]
): T[] {
  const [inicio, fin] = ventana_hora_ending;
  return estados.filter((e) => {
    const horaEnding = e.timestamp.getHours() + 1;
    return horaEnding >= inicio && horaEnding <= fin;
  });
}

/**
 * Potencia firme proxy: mediana (percentil 50) de la potencia entregada por
 * el BESS en horas de la ventana hora-punta CFE donde efectivamente hay
 * descarga (filtra las horas con descarga = 0 para no penalizar la mediana
 * cuando el BESS no opera todas las horas de la ventana). El resultado se
 * multiplica por `factor_credibilidad`, descuento regulatorio editable que
 * refleja qué fracción del proxy es aceptable como capacidad firme.
 *
 * Esta NO es la fórmula PAA regulatoria. Es un proxy preliminar pendiente
 * de validar con la DACG DOF 3-abr-2026. El default 0.40 es conservador:
 * el cliente puede subirlo o bajarlo desde el panel.
 */
export function calcularPotenciaFirmeProxy(
  detalle: readonly EstadoHorario[],
  ventana_hora_ending: readonly [number, number],
  factor_credibilidad: number
): number {
  const enPunta = filtrarHoraPunta(detalle, ventana_hora_ending);
  // `descargado_kwh` ≡ potencia promedio en kW (bin de 1 h). Filtramos
  // horas sin descarga para que la mediana refleje la potencia típica
  // entregada cuando el BESS está activo en ventana punta.
  const descargas_activas = enPunta
    .map((e) => e.descargado_kwh)
    .filter((kw) => kw > 0);
  if (descargas_activas.length === 0) return 0;
  const p50 = calcularPercentil(descargas_activas, 0.5);
  return p50 * factor_credibilidad;
}

/**
 * Suma energía descargada (MWh) dentro de la ventana hora-punta del año.
 */
export function sumarDescargadoEnPunta(
  detalle: readonly EstadoHorario[],
  ventana_hora_ending: readonly [number, number]
): number {
  const enPunta = filtrarHoraPunta(detalle, ventana_hora_ending);
  let totalKwh = 0;
  for (const e of enPunta) totalKwh += e.descargado_kwh;
  return totalKwh / 1000;
}

/**
 * Proyección 20 años aplicando SOH del catálogo año por año.
 *
 * - Año 0: flujo_neto = -CAPEX (no hay ingresos ni opex).
 * - Año i (1..20): ratio_soh = curva[i] / curva[1]; los ingresos
 *   energéticos del BESS se escalan por ratio_soh; CELs no degradan
 *   (dependen de la generación del SFV, no del SOH).
 *
 * Devuelve un array de 21 elementos (año 0 al 20).
 */
export function proyectar20Anios(e: EntradasProyeccion): FlujoAnual[] {
  if (e.curva_soh.length < 21) {
    throw new Error(
      `curva_soh debe tener al menos 21 valores (recibió ${e.curva_soh.length})`
    );
  }
  const opex_anual = e.capex_mxn * e.opex_tasa_anual;
  const potencia_firme_mw = e.potencia_firme_kw / 1000;
  const ingreso_pfirme_anio1 =
    potencia_firme_mw * e.precio_potencia_firme_mxn_mw_mes * 12;
  // INFORMATIVOS (SFV solo, constantes año a año, NO entran a flujo neto BESS).
  const ingreso_ppa_sfv = e.generacion_anual_mwh * e.precio_energia_mxn_mwh;
  const ingreso_cels_sfv = e.generacion_anual_mwh * e.precio_cel_mxn;
  // INCREMENTAL BESS año 1.
  const ingreso_captura_anio1 =
    e.captura_excedentes_anio1_mwh * e.precio_energia_mxn_mwh;
  const diferencial_lmp_mxn_mwh = e.lmp_mxn_mwh * e.diferencial_lmp_pct;

  const flujos: FlujoAnual[] = [];

  // Año 0: CAPEX único del BESS, sin ingresos ni opex.
  flujos.push({
    anio: 0,
    factor_soh: e.curva_soh[0] as number,
    energia_descargada_punta_mwh: 0,
    ingreso_ppa_generacion_mxn: 0,
    ingreso_cels_mxn: 0,
    ingreso_captura_excedentes_mxn: 0,
    ingreso_arbitraje_mxn: 0,
    ingreso_potencia_firme_mxn: 0,
    ingreso_incremental_bess_mxn: 0,
    ingreso_proyecto_total_mxn: 0,
    opex_mxn: 0,
    flujo_neto_mxn: -e.capex_mxn,
    flujo_acumulado_mxn: -e.capex_mxn,
  });

  const soh_ref = e.curva_soh[1] as number;

  for (let i = 1; i <= 20; i += 1) {
    const soh_i = e.curva_soh[i] as number;
    const ratio_soh = soh_i / soh_ref;
    const e_desc_punta = e.descargado_anio1_punta_mwh * ratio_soh;
    const ingreso_captura = ingreso_captura_anio1 * ratio_soh;
    const ingreso_arbitraje = e_desc_punta * diferencial_lmp_mxn_mwh;
    const ingreso_pfirme = ingreso_pfirme_anio1 * ratio_soh;
    const ingreso_incremental =
      ingreso_captura + ingreso_arbitraje + ingreso_pfirme;
    const ingreso_proyecto =
      ingreso_ppa_sfv + ingreso_cels_sfv + ingreso_incremental;
    // FLUJO NETO BESS: solo el incremental menos OPEX BESS. El PPA y CELs
    // del SFV existente no entran porque el SFV los cobraba sin BESS.
    const flujo_neto = ingreso_incremental - opex_anual;
    const prev = flujos[i - 1] as FlujoAnual;
    flujos.push({
      anio: i,
      factor_soh: soh_i,
      energia_descargada_punta_mwh: e_desc_punta,
      ingreso_ppa_generacion_mxn: ingreso_ppa_sfv,
      ingreso_cels_mxn: ingreso_cels_sfv,
      ingreso_captura_excedentes_mxn: ingreso_captura,
      ingreso_arbitraje_mxn: ingreso_arbitraje,
      ingreso_potencia_firme_mxn: ingreso_pfirme,
      ingreso_incremental_bess_mxn: ingreso_incremental,
      ingreso_proyecto_total_mxn: ingreso_proyecto,
      opex_mxn: opex_anual,
      flujo_neto_mxn: flujo_neto,
      flujo_acumulado_mxn: prev.flujo_acumulado_mxn + flujo_neto,
    });
  }

  return flujos;
}

/**
 * Calcula la energía anual capturable de excedentes SFV (gen_kw > POI).
 * Limita por la capacidad de carga horaria del BESS y aplica una
 * eficiencia round-trip aproximada (RTE). Modelo proxy: sin BESS, estos
 * MWh se perderían por curtailment al POI.
 */
export function calcularCapturaExcedentesAnio(
  registros: readonly RegistroHorario[],
  capacidad_poi_kw: number,
  capacidad_carga_kw: number,
  rte: number
): number {
  const sqrtRte = Math.sqrt(rte);
  let totalKwh = 0;
  for (const r of registros) {
    const excedente_kw = Math.max(0, r.potencia_kw_prom - capacidad_poi_kw);
    const capturable_kw = Math.min(excedente_kw, capacidad_carga_kw);
    // Pérdidas simétricas: √RTE en carga × √RTE en descarga = RTE total.
    totalKwh += capturable_kw * 1 * sqrtRte * sqrtRte;
  }
  return totalKwh / 1000;
}

/**
 * Payback con interpolación lineal sobre el flujo acumulado. Devuelve el
 * año fraccionario donde el flujo cruza cero, o null si no cruza en el
 * horizonte.
 *
 * La curva del flujo acumulado y este KPI deben coincidir por construcción:
 * el punto (payback, 0) cae sobre la línea entre (i-1, flujo_{i-1}) y
 * (i, flujo_i).
 */
export function calcularPaybackInterpolado(
  flujos: readonly FlujoAnual[]
): number | null {
  for (let i = 1; i < flujos.length; i += 1) {
    const prev = flujos[i - 1] as FlujoAnual;
    const curr = flujos[i] as FlujoAnual;
    if (prev.flujo_acumulado_mxn < 0 && curr.flujo_acumulado_mxn >= 0) {
      const delta = curr.flujo_acumulado_mxn - prev.flujo_acumulado_mxn;
      if (delta <= 0) return curr.anio;
      const frac = -prev.flujo_acumulado_mxn / delta;
      return prev.anio + frac;
    }
  }
  return null;
}

/**
 * TIR aproximada por bisección sobre VPN(tir) = 0.
 * `flujos[i].flujo_neto_mxn` es el flujo del año i (año 0 = -CAPEX).
 * Devuelve null si no se encuentra raíz en [-99%, 100%].
 */
export function calcularTIR(
  flujos: readonly FlujoAnual[]
): number | null {
  function vpn(tasa: number): number {
    let v = 0;
    for (const f of flujos) {
      v += f.flujo_neto_mxn / Math.pow(1 + tasa, f.anio);
    }
    return v;
  }
  let lo = -0.99;
  let hi = 1.0;
  const vpnLo = vpn(lo);
  const vpnHi = vpn(hi);
  if (vpnLo * vpnHi > 0) return null;
  for (let iter = 0; iter < 100; iter += 1) {
    const mid = (lo + hi) / 2;
    const vmid = vpn(mid);
    if (Math.abs(vmid) < 1) return mid;
    if (vpnLo * vmid < 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/**
 * VPN con tasa de descuento (WACC). `flujos[0]` debe ser -CAPEX.
 */
export function calcularVPN(
  flujos: readonly FlujoAnual[],
  wacc: number
): number {
  let v = 0;
  for (const f of flujos) {
    v += f.flujo_neto_mxn / Math.pow(1 + wacc, f.anio);
  }
  return v;
}
