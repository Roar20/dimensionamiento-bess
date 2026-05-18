/**
 * Tooltips de trazabilidad para las métricas del catálogo BESS.
 * Filosofía: qué es y de dónde viene. Sin pedagogía, sin nombrar
 * consultores. Una oración por concepto.
 */
export const TOOLTIPS_BESS = {
  capacidad_nominal:
    "Energía almacenable del banco a plena carga. Dato de placa del fabricante. " +
    "No degrada como número de placa; la energía útil real se reduce con SOH y DoD.",

  potencia_ac_pcs:
    "Potencia máxima que el inversor de potencia (PCS) puede entregar al lado AC. " +
    "Cota física instantánea del equipo, independiente del estado de carga del banco.",

  dod:
    "Fracción de la capacidad nominal utilizable en operación normal. " +
    "DoD 95% significa que se usa de SOC 5% a SOC 100%, dejando reserva de seguridad.",

  rte:
    "Eficiencia round-trip: energía entregada al AC dividida entre energía tomada " +
    "del AC en un ciclo completo. RTE 85% implica 15% de pérdidas térmicas y de conversión.",

  vida_util:
    "Estimación del fabricante para mantener SOH dentro de curva contractual. " +
    "El despacho real puede acortar o extender este horizonte.",

  precio_mxn:
    "Conversión del precio USD del datasheet al tipo de cambio configurado arriba. " +
    "Recalcula al cambiar el input.",

  precio_por_kwh:
    "Precio total dividido entre capacidad nominal del banco. " +
    "Métrica de comparación entre equipos del catálogo.",
} as const;

export type TooltipKey = keyof typeof TOOLTIPS_BESS;
